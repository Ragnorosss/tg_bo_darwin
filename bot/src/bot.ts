import { Markup, Telegraf, session } from 'telegraf';
import dotenv from 'dotenv';
import { adminMenu } from './components/adminMenu';
import { handleCallbackQuery } from './utils/callback_interceptor';
import { MyContext } from './types/CstContext';
import { currencyPairs, otcPairs } from './components/curremcuPair';
import { pages } from './components/what_bot_can';
dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN!;
const bot = new Telegraf<MyContext>(BOT_TOKEN);

bot.use(session());

bot.launch();

function getPaginationKeyboard(page: number) {
  const buttons = [];
  const totalPages = pages.length;

  if (page > 0) {
    buttons.push({ text: '⬅️ Назад', callback_data: `page_${page - 1}` });
  }
 buttons.push({
    text: `Страница ${page + 1} из ${totalPages}`,
    callback_data: 'page_counter',
  });

  if (page < pages.length - 1) {
    buttons.push({ text: 'Вперёд ➡️', callback_data: `page_${page + 1}` });
  }
 
  // Кнопка "В меню"
  const mainMenuButton = [
    { text: '🏠 В меню', callback_data: 'show_main_menu' },
  ];
  return {
    reply_markup: {
      inline_keyboard: [
        buttons, // Строка с навигацией назад/вперёд
        mainMenuButton, // Отдельная строка с кнопкой "В меню"
      ],
    },
  };
}

bot.start(async (ctx) => {
  const telegramId = String(ctx.from.id);

  const res = await fetch(`http://localhost:3000/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      telegramId,
      username: ctx.from.username,
      firstName: ctx.from.first_name,
    }),
  });
  const user = await res.json();
  console.log(user);

  if (user?.role.includes('admin')) {
    await ctx.reply('Вы в роли администратора');
    await ctx.reply('Админское меню:', adminMenu);
  }

  await ctx.replyWithPhoto(
    { source: './src/assets/welcome.jpg' },
    {
      caption: `📈 Добро пожаловать!

     🔥 Твой личный помощник в мире бинарных опционов!
Наш бот проводит глубокий технический анализ рынка и предоставляет точные сигналы, которые помогут увеличить вероятность успешных сделок.
Торгуй разумнее, управляй рисками эффективно и полагайся на проверенные алгоритмы!

💡 Наш бот использует передовые стратегии и инструменты анализа рынка, такие как уровни поддержки и сопротивления, трендовые индикаторы и свечной анализ, чтобы определить оптимальные моменты входа в сделку.
Ты всегда будешь знать, когда наступает лучшее время открыть опцион!

💰 Торгуй с умом — зарабатывай больше! 🚀`,
      parse_mode: 'Markdown',
      reply_markup: Markup.inlineKeyboard([
        [Markup.button.callback('Далее', 'show_main_menu')],
      ]).reply_markup,
    }
  );

  if (!user) {
    await fetch(`http://localhost:3000/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        telegramId,
        username: ctx.from.username,
        firstName: ctx.from.first_name,
      }),
    });
  }
});
bot.action('btn_2', async (ctx) => {
  const page = 0;
  await ctx.replyWithPhoto(
    { source: pages[page].photo },
    {
      caption: pages[page].text,
      parse_mode: 'Markdown',
      ...getPaginationKeyboard(page),
    }
  );
  await ctx.answerCbQuery();
});

bot.action(/page_(\d+)/, async (ctx) => {
  const page = parseInt(ctx.match[1]);

  if (page < 0 || page >= pages.length) {
    return ctx.answerCbQuery();
  }

  await ctx.editMessageMedia(
    {
      type: 'photo',
      media: { source: pages[page].photo }, // <-- здесь
      caption: pages[page].text,
      parse_mode: 'Markdown',
    },
    getPaginationKeyboard(page)
  );

  await ctx.answerCbQuery();
});

bot.action(/^select_pair_(.+)$/, async (ctx) => {
  const selectedPair = ctx.match[1].replace('_', '/'); // например EUR/USD
  const { selectedTimeframe, selectedType } = ctx.session;

  if (!selectedTimeframe || !selectedType) {
    await ctx.answerCbQuery('Сначала выберите таймфрейм и тип.');
    return;
  }

  // Рандомный выбор направления
  const directions = ['Пойдет вверх 📈', 'Пойдет вниз 📉'];
  const randomDirection =
    directions[Math.floor(Math.random() * directions.length)];

  await ctx.answerCbQuery(`Вы выбрали пару: ${selectedPair}`);

  await ctx.editMessageText(
    `📊 Сигнал для пары ${selectedPair}\n` +
      `Таймфрейм: ${selectedTimeframe.toUpperCase()}\n` +
      `Тип: ${selectedType.toUpperCase()}\n\n` +
      `${randomDirection}`,
    Markup.inlineKeyboard([
      [Markup.button.callback('🏠 В главное меню', 'show_main_menu')],
    ])
  );
});

bot.on('callback_query', async (ctx) => {
  const callbackQuery = ctx.callbackQuery;
  if (!callbackQuery || !('data' in callbackQuery)) {
    return;
  }

  const data = callbackQuery.data;

  await handleCallbackQuery(ctx, data);

  if (/^timeframe_([a-z0-9]+)_([a-z]+)$/.test(data)) {
    const match = data.match(/^timeframe_([a-z0-9]+)_([a-z]+)$/);
    if (!match) return;

    const timeframe = match[1];
    const type = match[2]; // stok или oct

    ctx.session.selectedTimeframe = timeframe;
    ctx.session.selectedType = type;
    ctx.session.waitingForAdminId = false;
    ctx.session.action = undefined;

    await ctx.answerCbQuery(
      `Выбран таймфрейм: ${timeframe.toUpperCase()} (${type.toUpperCase()})`
    );
    function generatePairButtons(type: string) {
      if (type === 'stok') {
        return currencyPairs.map((pair) => [
          Markup.button.callback(pair.label, `select_pair_${pair.code}`),
        ]);
      }

      if (type === 'oct') {
        const forexButtons = otcPairs.forex.map((pair) => {
          const code = pair.replace(/[^\w]/g, '_').toLowerCase();
          return [Markup.button.callback(pair, `select_pair_${code}`)];
        });

        const cryptoButtons = otcPairs.crypto.map((pair) => {
          const code = pair.replace(/\s|\(|\)/g, '').toLowerCase();
          return [Markup.button.callback(pair, `select_pair_${code}`)];
        });

        return [...forexButtons, ...cryptoButtons];
      }

      return [];
    }

    const pairButtons = generatePairButtons(type);

    const navigationButtons = [
      [Markup.button.callback('⬅️ Назад', `show_time_menu_${type}`)],
      [Markup.button.callback('🏠 В меню', 'show_main_menu')],
    ];

    // Отправляем/редактируем сообщение с кнопками
    await ctx.editMessageText(
      `📈 Выберите валютную пару\nТаймфрейм: ${timeframe.toUpperCase()} | Тип: ${type.toUpperCase()}`,
      Markup.inlineKeyboard([...pairButtons, ...navigationButtons])
    );

    return;
  }

  if (/^pair_(.+)$/.test(data)) {
    //@ts-ignore
    const pairCode = data.match(/^pair_(.+)$/)[1];
    const timeframe = ctx.session.selectedTimeframe;

    if (!timeframe) {
      await ctx.answerCbQuery('Сначала выберите таймфрейм.');
      return;
    }

    // Рандомный сигнал (для примера)
    const signals = ['возрастет 📈', 'упадет 📉'];
    const signal = signals[Math.floor(Math.random() * signals.length)];

    await ctx.answerCbQuery();

    await ctx.editMessageText(
      `Сигнал для пары ${pairCode} на таймфрейме ${timeframe.toUpperCase()}:\n\n` +
        `➡️ Валюта ${signal}`,
      Markup.inlineKeyboard([
        [
          Markup.button.callback(
            'Выбрать другую пару',
            `timeframe_${timeframe}`
          ),
        ],
        [Markup.button.callback('Выбрать другой таймфрейм', 'show_time_menu')],
        [Markup.button.callback('В главное меню', 'show_main_menu')],
      ])
    );

    ctx.session.selectedPair = pairCode;
    return;
  }
});

bot.on('text', async (ctx) => {
  if (!ctx.session.waitingForAdminId || !ctx.session.action) return;

  const inputId = ctx?.message?.text?.trim();

  if (!/^\d+$/.test(inputId)) {
    return ctx.reply('Пожалуйста, введите корректный числовой Telegram ID.');
  }

  const telegramId = inputId;

  // Получаем пользователя
  const res = await fetch(`http://localhost:3000/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      telegramId,
      username: ctx.from.username,
      firstName: ctx.from.first_name,
    }),
  });

  const user = await res.json();

  if (!user) {
    ctx.session.waitingForAdminId = false;
    ctx.session.action = undefined;
    return ctx.reply(`Пользователь с ID ${inputId} не найден.`);
  }

  if (
    ctx.session.action === 'get_signal' &&
    ctx.session.authorizedInQountex === false &&
    user?.qountexId === null
  ) {
    return await ctx.reply(
      '❌ Вы не зарегистрированы. Пожалуйста, зарегистрируйтесь.',
      Markup.inlineKeyboard([
        [Markup.button.callback('📝 Регистрация', 'start_registration')],
        [Markup.button.callback('🏠 В меню', 'show_main_menu')],
      ])
    );
  }

  if (ctx.session.action === 'give_admin') {
    if (user.role !== 'admin') {
      await fetch(`http://localhost:3000/users/${telegramId}/admin`, {
        method: 'PATCH',
      });
      await ctx.reply(`✅ Админка выдана пользователю с ID ${inputId}.`);
    } else {
      await ctx.reply(`ℹ️ Пользователь с ID ${inputId} уже админ.`);
    }
  } else if (ctx.session.action === 'revoke_admin') {
    if (user.role === 'admin') {
      await fetch(`http://localhost:3000/users/${telegramId}/revoke-admin`, {
        method: 'PATCH',
      });
      await ctx.reply(`✅ Админка удалена у пользователя с ID ${inputId}.`);
    } else {
      await ctx.reply(`ℹ️ Пользователь с ID ${inputId} не является админом.`);
    }
  }

  ctx.session.waitingForAdminId = false;
  ctx.session.action = undefined;
});

// Корректная остановка
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
