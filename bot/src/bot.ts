import { Markup, Telegraf, session } from 'telegraf';
import dotenv from 'dotenv';
import { adminMenu } from './components/adminMenu';
import { handleCallbackQuery } from './utils/callback_interceptor';
import { MyContext } from './types/CstContext';
import { pages } from './components/what_bot_can';
import { generatePairButtons } from './utils/btn_generate';
import { getPaginationKeyboard } from './utils/pagintaion';
import fs from 'fs';
import {
  formatLeaderboardPage,
  paginateUsers,
} from './utils/leaderboard';
import { topUsers } from './components/top-user';
import { getPaginationKeyboardUsers } from './utils/pag-top-user';

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN!;
const bot = new Telegraf<MyContext>(BOT_TOKEN);

bot.use(session());

bot.launch();
const images = {
  up: './src/assets/up.png',
  down: './src/assets/down.png',
};

function generateMarketSignal(pair: string) {
  const directions = [
    { text: 'ВЫШЕ ↑', emoji: '📈', img: images.up },
    { text: 'НИЖЕ ↓', emoji: '📉', img: images.down },
  ];
  const risks = ['Low risk', 'Moderate risk', 'High risk'];

  const randomPercent = (Math.random() * (1.5 - 0.1) + 0.1).toFixed(2);
  const direction = directions[Math.floor(Math.random() * directions.length)];
  const risk = risks[Math.floor(Math.random() * risks.length)];

  const marketOverview =
    '• Волатильность: Moderate • Настроения: Bearish • Объём: Spiked';
  const tradingViewRating =
    '• Сводка: STRONG SELL • Скользящие средние: SELL • Осцилляторы: BUY';
  const technicalAnalysis =
    '• RSI (14): Topping Out • MACD: Bullish Crossover • Полосы Боллинджера: Whipsaw Reactions • Pattern: Double Top';

  const text = `${pair} Прогноз (+${randomPercent}%) ${direction.text} (${risk})

Обзор рынка: ${marketOverview}

Рейтинг TradingView: ${tradingViewRating}

Технический анализ: ${technicalAnalysis}`;

  return { text, imgPath: direction.img };
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
bot.action('how_works_bot', async (ctx) => {
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
const pageSize = 5;
// Обработчик первой страницы лидерборда
bot.action('leader_boards', async (ctx) => {
  await ctx.answerCbQuery();

  const pages = paginateUsers(topUsers, pageSize);
  const pageIndex = 0;

  const text = `🏆 Лидерборд:\n\n${formatLeaderboardPage(
    pages[pageIndex],
    pageIndex * pageSize
  )}`;

  await ctx.editMessageText(text, getPaginationKeyboardUsers(pageIndex, pages.length));
});

// Обработчик переключения страниц лидерборда
bot.action(/leader_page_(\d+)/, async (ctx) => {
  const pageIndex = Number(ctx.match[1]);
  const pages = paginateUsers(topUsers, pageSize);

  if (pageIndex < 0 || pageIndex >= pages.length) {
    await ctx.answerCbQuery('Нет такой страницы');
    return;
  }

  const pageUsers = pages[pageIndex];
  const text = `🏆 Лидерборд:\n\n${formatLeaderboardPage(
    pageUsers,
    pageIndex * pageSize
  )}`;

  await ctx.editMessageText(text, getPaginationKeyboardUsers(pageIndex, pages.length));

  await ctx.answerCbQuery();
});
bot.action(/photo_page_(\d+)/, async (ctx) => {
  const page = parseInt(ctx.match[1]);

  if (page < 0 || page >= pages.length) {
    return ctx.answerCbQuery();
  }

  await ctx.editMessageMedia(
    {
      type: 'photo',
      media: { source: pages[page].photo },
      caption: pages[page].text, // <-- добавляем caption
      parse_mode: 'Markdown', //
    },
    getPaginationKeyboard(page)
  );

  await ctx.answerCbQuery();
});

bot.action(/^select_pair_(.+)$/, async (ctx) => {
  const selectedPairRaw = ctx.match[1];
  const selectedPair = selectedPairRaw.replace(/_/g, '').toUpperCase();
  const { selectedTimeframe, selectedType } = ctx.session;

  if (!selectedTimeframe || !selectedType) {
    await ctx.answerCbQuery('Сначала выберите таймфрейм и тип.');
    return;
  }

  const { text, imgPath } = generateMarketSignal(selectedPair);

  await ctx.answerCbQuery(`Вы выбрали пару: ${selectedPair}`);

  await ctx.replyWithPhoto(
    { source: fs.createReadStream(imgPath) },
    {
      caption: `📊 ${text}\n\nТаймфрейм: ${selectedTimeframe.toUpperCase()}\nТип: ${selectedType.toUpperCase()}`,
      reply_markup: Markup.inlineKeyboard([
        [Markup.button.callback('🏠 В главное меню', 'show_main_menu')],
      ]).reply_markup,
    }
  );
});

bot.action('get_support_link', async (ctx) => {
  try {
    const response = await fetch(
      'http://localhost:3000/support/get-support-link'
    ); // или твой продовый URL
    const data = await response.json();

    if (!data.link) {
      return ctx.reply('Ссылка на поддержку не найдена.');
    }

    await ctx.reply(`✉️ Связаться с поддержкой:\n${data.link}`, {
      reply_markup: Markup.inlineKeyboard([
        [Markup.button.callback('🏠 В главное меню', 'show_main_menu')],
      ]).reply_markup,
    });
  } catch (error) {
    console.error('Ошибка при получении ссылки поддержки:', error);
    await ctx.reply('Произошла ошибка при получении ссылки на поддержку.');
  }
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
    const type = match[2];

    ctx.session.selectedTimeframe = timeframe;
    ctx.session.selectedType = type;
    ctx.session.waitingForAdminId = false;
    ctx.session.action = undefined;

    await ctx.answerCbQuery(
      `Выбран таймфрейм: ${timeframe.toUpperCase()} (${type.toUpperCase()})`
    );

    const pairButtons = generatePairButtons(type);

    const refreshButton = [
      Markup.button.callback(
        '🔄 Обновить',
        `refresh_pairs_${timeframe}_${type}`
      ),
    ];
    const navigationButtons = [
      [Markup.button.callback('⬅️ Назад', `show_time_menu_${type}`)],
      [Markup.button.callback('🏠 В меню', 'show_main_menu')],
    ];

    await ctx.editMessageText(
      `📈 Выберите валютную пару\nТаймфрейм: ${timeframe.toUpperCase()} | Тип: ${type.toUpperCase()}`,
      Markup.inlineKeyboard([
        ...pairButtons,
        refreshButton,
        ...navigationButtons,
      ])
    );

    return;
  }

  if (/^refresh_pairs_([a-z0-9]+)_([a-z]+)$/.test(data)) {
    const match = data.match(/^refresh_pairs_([a-z0-9]+)_([a-z]+)$/);
    if (!match) return;

    const timeframe = match[1];
    const type = match[2];

    const pairButtons = generatePairButtons(type);

    const refreshButton = [
      Markup.button.callback(
        '🔄 Обновить',
        `refresh_pairs_${timeframe}_${type}`
      ),
    ];
    const navigationButtons = [
      [Markup.button.callback('⬅️ Назад', `show_time_menu_${type}`)],
      [Markup.button.callback('🏠 В меню', 'show_main_menu')],
    ];

    await ctx.editMessageText(
      `📈 Обновлено! Выберите валютную пару\nТаймфрейм: ${timeframe.toUpperCase()} | Тип: ${type.toUpperCase()}`,
      Markup.inlineKeyboard([
        ...pairButtons,
        refreshButton,
        ...navigationButtons,
      ])
    );
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
