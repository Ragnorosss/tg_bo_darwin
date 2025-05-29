import { Markup, Telegraf, session } from 'telegraf';
import dotenv from 'dotenv';
import { MyContext } from './types/CstContext';
import { getPaginationKeyboard } from './utils/pagintaion';
import { formatLeaderboardPage, paginateUsers } from './utils/leaderboard';
import { getPaginationKeyboardUsers } from './utils/pag-top-user';
import { topUsers } from './components/top-user';
import { pages } from './components/what_bot_can';
import { generateMarketSignal } from './utils/generateMark';
import * as fs from 'fs';
import { handleCallbackQuery } from './utils/callback_interceptor';
import { generatePairButtons } from './utils/btn_generate';
import { adminMenu } from './components/adminMenu';
import { IUser } from './models/User';

dotenv.config();

export const bot = new Telegraf<MyContext>(process.env.BOT_TOKEN!);

bot.use(session());

bot.command('start', async (ctx) => {
  const telegramId = String(ctx.from.id);

  const res = await fetch(`${process.env.URL}users/${telegramId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const text = await res.text(); // вместо json, чтобы увидеть ошибку
    console.error(`Ошибка ${res.status}: ${text}`);
    await ctx.reply('Проблема с получением пользователя');
    return;
  }
  const user: IUser = await res.json();
  if (!user) {
    await fetch(`${process.env.URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        telegramId,
        username: ctx.from.username,
        firstName: ctx.from.first_name,
      }),
    });
  }
  console.log(user);

  if (typeof user?.role === 'string' && user.role.includes('admin')) {
    await ctx.reply('Вы в роли администратора');
    await ctx.reply('Админское меню:', adminMenu);
  }
  await ctx.replyWithPhoto(
    { source: './src/assets/welcome.jpg' },
    {
      caption: `📈 Ласкаво просимо!

🔥 Твій особистий помічник у світі бінарних опціонів!
Наш бот проводить глибокий технічний аналіз ринку і надає точні сигнали, які допоможуть підвищити ймовірність успішних угод.
Торгуй розумніше, ефективно керуй ризиками і довіряй перевіреним алгоритмам!

💡 Наш бот використовує передові стратегії та інструменти аналізу ринку, такі як рівні підтримки та опору, трендові індикатори і свічковий аналіз, щоб визначити оптимальні моменти для входу в угоду.
Ти завжди будеш знати, коли настає найкращий час відкрити опціон!

💰 Торгуй з розумом — заробляй більше! 🚀`,
      parse_mode: 'Markdown',
      reply_markup: Markup.inlineKeyboard([
        [Markup.button.callback('Далее', 'show_main_menu')],
      ]).reply_markup,
    }
  );
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

bot.command('ping', async (ctx) => {
  await ctx.reply('🏓 Pong!');
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

  await ctx.editMessageText(
    text,
    getPaginationKeyboardUsers(pageIndex, pages.length)
  );
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

  await ctx.editMessageText(
    text,
    getPaginationKeyboardUsers(pageIndex, pages.length)
  );

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
      `${process.env.URL}support/get-support-link`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );
    if (!response.ok) {
      const text = await response.text(); // вместо json, чтобы увидеть ошибку
      console.error(`Ошибка ${response.status}: ${text}`);
      await ctx.reply('Проблема с получением пользователя');
      return;
    }
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

  const res = await fetch(`${process.env.URL}/users`, {
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

  try {
    switch (ctx.session.action) {
      case 'give_admin':
        if (user.role !== 'admin') {
          await fetch(`${process.env.URL}/users/${telegramId}/admin`, {
            method: 'PATCH',
          });
          await ctx.reply(`✅ Адмінка надана користувачу з ID ${inputId}.`);
        } else {
          await ctx.reply(`ℹ️ Користувач з ID ${inputId} вже має адмінку.`);
        }
        break;

      case 'revoke_admin':
        if (user.role === 'admin') {
          await fetch(`${process.env.URL}/users/${telegramId}/revoke-admin`, {
            method: 'PATCH',
          });
          await ctx.reply(`✅ Адмінка видалена у користувача з ID ${inputId}.`);
        } else {
          await ctx.reply(`ℹ️ Користувач з ID ${inputId} не має адмінки.`);
        }
        break;

      case 'grant_access':
        if (user.gaveAdminAccess !== true) {
          await fetch(`${process.env.URL}/users/${telegramId}/add-access`, {
            method: 'PATCH',
          });
          await ctx.reply(`✅ Доступ надано користувачу з ID ${inputId}.`);
        } else {
          await ctx.reply(`ℹ️ Користувач з ID ${inputId} вже має доступ.`);
        }
        break;

      case 'revoke_access':
        if (user.gaveAdminAccess === true) {
          await fetch(`${process.env.URL}/users/${telegramId}/revoke-access`, {
            method: 'PATCH',
          });
          await ctx.reply(
            `✅ Доступ відкликано у користувача з ID ${inputId}.`
          );
        } else {
          await ctx.reply(`ℹ️ Користувач з ID ${inputId} не має доступу.`);
        }
        break;
    }
  } catch (error) {
    console.error('❌ Error handling admin action:', error);
    await ctx.reply('❌ Сталася помилка при обробці запиту.');
  }

  // Сброс состояния
  ctx.session.waitingForAdminId = false;
  ctx.session.action = undefined;
});
