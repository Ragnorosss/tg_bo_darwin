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
bot.action('show_admin_menu', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply('Адмінське меню:', adminMenu);
});
bot.action('set_support_link', async (ctx) => {
  ctx.session.waitingForSupportLink = true;
  ctx.session.waitingForTraderId = false; // ❗ обязательно сбрасываем другие флаги
  await ctx.answerCbQuery(); // закрываем "часики"
  await ctx.reply(
    '🔗 Введіть нове посилання на підтримку (наприклад: https://t.me/support)',
    Markup.inlineKeyboard([
      [Markup.button.callback('Відміна', 'show_main_menu')],
    ])
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
bot.action('search_by_trade_id', async (ctx) => {
  ctx.session.waitingForTradeId = true;
  await ctx.answerCbQuery();
  await ctx.reply(
    '🔍 Введіть trade_id для пошуку проєкту:',
    Markup.inlineKeyboard([
      [Markup.button.callback('❌ Відміна', 'show_main_menu')],
    ])
  );
});

bot.on('text', async (ctx) => {
  const inputId = ctx.message.text.trim();

  const senderId = ctx.from.id.toString();

  if (ctx.session.waitingForSupportLink) {
    ctx.session.waitingForSupportLink = false;

    try {
      const response = await fetch(
        `${process.env.URL}support/set-support-link`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ telegramId: senderId, link: inputId }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        return await ctx.reply('✅ Посилання на підтримку оновлено успішно.');
      } else {
        return await ctx.reply(
          `❌ Помилка: ${data.error || 'Невідома помилка.'}`
        );
      }
    } catch (error) {
      console.error(
        '❌ Помилка при встановленні посилання на підтримку:',
        error
      );
      return await ctx.reply('❌ Сталася помилка при відправці запиту.');
    }
  }

  if (!/^\d+$/.test(inputId)) {
    return ctx.reply('❌ Введіть коректний числовий ID.');
  }

  // === 1. Обработка ожидания ID для просмотра информации о пользователе ===
  if (ctx.session.waitingForUserInfoId) {
    ctx.session.waitingForUserInfoId = false;

    try {
      const senderRes = await fetch(`${process.env.URL}users/${senderId}`);
      const senderData: IUser = await senderRes.json();

      if (!senderRes.ok || !senderData?.role?.includes('admin')) {
        return ctx.reply('❌ У вас немає прав для виконання цієї дії.');
      }

      const userRes = await fetch(`${process.env.URL}users/${inputId}`);
      const userData = await userRes.json();

      if (!userRes.ok || !userData.telegramId) {
        return ctx.reply(`❌ Користувача з ID ${inputId} не знайдено.`);
      }

      const userInfo = `
    👤 Інформація про користувача:
    🆔 Telegram ID: ${userData.telegramId}
    📛 Ім'я: ${userData.firstName} ${userData.userName}
    👤 Роль: ${userData.role}
    🔗 Trader ID: ${userData.traderId || "не прив'язаний"}
    ✅ Зареєстрований: ${userData.registration ? 'Так' : 'Ні'}
          `;

      return ctx.reply(
        userInfo,
        Markup.inlineKeyboard([
          [Markup.button.callback('🏠 До головного меню', 'show_main_menu')],
          [Markup.button.callback('Адмін меню', 'show_admin_menu')],
        ])
      );
    } catch (error) {
      console.error('❌ Помилка при отриманні інформації:', error);
      return ctx.reply('❌ Сталася помилка при отриманні інформації.');
    }
  }

  if (ctx.session.waitingForAdminId && ctx.session.action) {
    ctx.session.waitingForAdminId = false;

    const telegramId = inputId;

    try {
      console.log(inputId);

      const res = await fetch(`${process.env.URL}users/${inputId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const text = await res.text(); // вместо json, чтобы увидеть ошибку
        console.error(`Ошибка ${res.status}: ${text}`);
        await ctx.reply('Проблема с получением пользователя');
        return;
      }
      const user = await res.json();

      if (!user) {
        return ctx.reply(`Пользователь с ID ${inputId} не найден.`);
      }
      switch (ctx.session.action) {
        case 'give_admin':
          if (user.role === 'admin') {
            return ctx.reply(`ℹ️ Користувач з ID ${inputId} вже має адмінку.`);
          }

          try {
            const res = await fetch(
              `${process.env.URL}users/${telegramId}/admin`,
              {
                method: 'PATCH',
              }
            );

            if (!res.ok) {
              const text = await res.text();
              console.error(`❌ Помилка ${res.status}: ${text}`);
              return ctx.reply('❌ Проблема з видачею адмінки.');
            }

            return ctx.reply(`✅ Адмінка надана користувачу з ID ${inputId}.`);
          } catch (err) {
            console.error('❌ Помилка при видачі адмінки:', err);
            return ctx.reply('❌ Сталася помилка при обробці запиту.');
          }

        case 'revoke_admin':
          if (user.role !== 'admin') {
            return ctx.reply(`ℹ️ Користувач з ID ${inputId} не має адмінки.`);
          }

          try {
            const res = await fetch(
              `${process.env.URL}users/${telegramId}/revoke-admin`,
              {
                method: 'PATCH',
              }
            );

            if (!res.ok) {
              const text = await res.text();
              console.error(`❌ Помилка ${res.status}: ${text}`);
              return ctx.reply('❌ Не вдалося зняти адмінку.');
            }

            return ctx.reply(
              `✅ Адмінка видалена у користувача з ID ${inputId}.`
            );
          } catch (err) {
            console.error('❌ Помилка при знятті адмінки:', err);
            return ctx.reply('❌ Сталася помилка при запиті.');
          }

        case 'grant_access':
          if (user.gaveAdminAccess !== true) {
            await fetch(`${process.env.URL}users/${inputId}/add-access`, {
              method: 'PATCH',
            });
            return ctx.reply(`✅ Доступ надано користувачу з ID ${inputId}.`);
          } else {
            return ctx.reply(`ℹ️ Користувач з ID ${inputId} вже має доступ.`);
          }

        case 'revoke_access':
          if (user.gaveAdminAccess === true) {
            await fetch(`${process.env.URL}users/${inputId}/revoke-access`, {
              method: 'PATCH',
            });
            return ctx.reply(
              `✅ Доступ відкликано у користувача з ID ${inputId}.`
            );
          } else {
            return ctx.reply(`ℹ️ Користувач з ID ${inputId} не має доступу.`);
          }
      }
    } catch (error) {
      console.error('❌ Error handling admin action:', error);
      return ctx.reply('❌ Сталася помилка при обробці запиту.');
    } finally {
      ctx.session.action = undefined;
    }
  }
  if (ctx.session.waitingForTradeId) {
    try {
      const res = await fetch(`${process.env.URL}users/qountexId/${inputId}`, {
        method: 'GET',
      });

      if (!res.ok) {
        const text = await res.text();
        console.error(`❌ Помилка ${res.status}: ${text}`);
        return ctx.reply('❌ Не вдалося знайти проект за trade_id.');
      }

      await ctx.reply(`✅ Проект з trade_id ${inputId} успішно знайдено.`);
      const data = await res.json();
      const userInfo = `
👤 Інформація про користувача:
🆔 Telegram ID: ${data.telegramId}
📛 Ім'я: ${data.firstName} ${data.username}
👤 Роль: ${data.role}
🔗 Trader ID: ${data.traderId || "не прив'язаний"}
✅ Зареєстрований: ${data.registration ? 'Так' : 'Ні'}
      `;
      return ctx.reply(
        userInfo,
        Markup.inlineKeyboard([
          [Markup.button.callback('🏠 До головного меню', 'show_main_menu')],
          [Markup.button.callback('Адмін меню', 'show_admin_menu')],
        ])
      );
    } catch (err) {
      console.error('❌ Помилка при пошуку проекту:', err);
      return ctx.reply('❌ Сталася помилка при запиті.');
    }
  }
  // === 3. Обработка ожидания traderId ===
  if (ctx.session.waitingForTraderId) {
    ctx.session.waitingForTraderId = false;

    try {
      const res = await fetch(
        `${process.env.URL}users/${senderId}/link-trader`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ traderId: inputId }),
        }
      );

      const text = await res.text();
      console.log('Ответ сервера:', text);

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        return ctx.reply('Сервер вернул неожиданный ответ');
      }

      if (res.ok) {
        return ctx.reply(
          `✅ Ваш ID (${inputId}) успішно зв’язано з вашим профілем.`,
          Markup.inlineKeyboard([
            [Markup.button.callback('🔙 Назад', 'show_main_menu')],
          ])
        );
      } else {
        return ctx.reply(
          `❌ Помилка: ${data.error || 'Не вдалося зв’язати ID.'}`
        );
      }
    } catch (error) {
      console.error('❌ Error linking trader ID:', error);
      return ctx.reply('❌ Сталася помилка при обробці запиту.');
    }
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
        [Markup.button.callback('🏠 До головного меню', 'show_main_menu')],
      ]).reply_markup,
    }
  );
});
bot.action('show_user_info', async (ctx) => {
  ctx.session.waitingForUserInfoId = true;

  await ctx.answerCbQuery();
  await ctx.reply(
    '🔍 Введіть Telegram ID користувача, інформацію про якого хочете отримати:',
    Markup.inlineKeyboard([
      [Markup.button.callback('❌ Відміна', 'show_main_menu')],
    ])
  );
});

bot.action('get_support_link', async (ctx) => {
  try {
    const response = await fetch(`${process.env.URL}support/get-support-link`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
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
        [Markup.button.callback('🏠 До головного меню', 'show_main_menu')],
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
bot.action('show_reg_menu', async (ctx) => {
  // Помечаем в сессии, что пользователь сейчас вводит traderId
  ctx.session.waitingForTraderId = true;

  await ctx.answerCbQuery(); // закрываем "часики" на кнопке
  await ctx.reply(
    `Введіть ваш ID, який знаходиться у вашому профілі (Наприклад: 46230574)`,
    Markup.inlineKeyboard([
      [Markup.button.callback('Написати в підтримку', 'get_support_link')],
      [Markup.button.callback('Відміна', 'show_main_menu')],
    ])
  );
});
