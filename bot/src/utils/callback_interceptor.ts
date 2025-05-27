import { Markup } from 'telegraf';
import { MyContext } from '../types/CstContext';

export async function handleCallbackQuery(ctx: MyContext, data: string) {
  const telegramId = String(ctx?.from?.id);
  const res = await fetch(`http://localhost:3000/users/${telegramId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    await ctx.reply('Ошибка при получении данных пользователя');
    return;
  }

  const user = await res.json();

  if (!ctx.session) ctx.session = {};
  switch (data) {
    case 'give_admin':
      await ctx.answerCbQuery('Админка выдана');
      await ctx.reply(
        'Введите Telegram ID пользователя, которому хотите выдать админку:'
      );
      ctx.session.waitingForAdminId = true;
      ctx.session.action = 'give_admin';
      break;

    case 'revoke_admin':
      await ctx.answerCbQuery('Админка утрачена');
      await ctx.reply(
        'Введите Telegram ID пользователя, у которого хотите забрать админку:'
      );
      ctx.session.waitingForAdminId = true;
      ctx.session.action = 'revoke_admin';
      break;

    case 'set_support_link':
      await ctx.answerCbQuery('Ссылка на саппорт установлена');
      break;

    case 'get_user_info':
      await ctx.answerCbQuery('Информация о пользователе получена');
      break;

    case 'search_project_by_id':
      await ctx.answerCbQuery('Поиск проекта запущен');
      break;

    case 'grant_access_self':
      await ctx.answerCbQuery('Доступ выдан себе');
      break;

    case 'grant_access_by_id':
      await ctx.answerCbQuery('Доступ выдан по id');
      break;

    case 'revoke_access_by_id':
      await ctx.answerCbQuery('Доступ удалён по id');
      break;
    case 'get_signal': {
      // if (
      //   ctx.session.authorizedInQountex === false ||
      //   user?.qountexId === null
      // ) {
      //   return await ctx.reply(
      //     '❌ Вы не зарегистрированы. Пожалуйста, зарегистрируйтесь.',
      //     Markup.inlineKeyboard([
      //       [Markup.button.callback('📝 Регистрация', 'start_registration')],
      //       [Markup.button.callback('Написать в саппорт', 'btn_5')],
      //       [Markup.button.callback('🏠 В меню', 'show_main_menu')],
      //     ])
      //   );
      // }

      // ctx.session.action = 'get_signal'; // только теперь устанавливаем

      await ctx.editMessageText(
        'Новое меню:',
        Markup.inlineKeyboard([
          [
            Markup.button.callback('STOK', 'show_time_menu_stok'),
            Markup.button.callback('OCT', 'show_time_menu_oct'),
          ],
          [Markup.button.callback('Назад', 'show_main_menu')],
        ])
      );
      break;
    }
    case 'show_main_menu':
      await ctx.replyWithHTML(
        `🔑 Чтобы получить полный доступ к нашему роботу с более чем 100 активами, Вам нужно создать <b>НОВЫЙ АККАУНТ</b> на брокере Pocket Option строго по ссылке 🔗\n\n
❗ <b>Внимание!</b> Даже если у Вас уже есть аккаунт — нужно создать <b>НОВЫЙ</b> по ссылке ниже. Иначе бот не сможет проверить аккаунт, и Вы не получите доступ к боту ❗\n\n
👉 <a href="https://broker-qx.pro/sign-up/?lid=1367282">Зарегистрироваться на Pocket Option</a>\n\n
⚠️ <b>Важно:</b> не давайте никому свой ID, так как бот выдается только на 1 аккаунт.\n\n
Если вам нужно что-то еще, дайте знать! 😉`,
        Markup.inlineKeyboard([
          [
            Markup.button.callback('📡 Получить сигнал', 'get_signal'),
            Markup.button.callback('🤖 Как работает бот?', 'btn_2'),
          ],
          [
            Markup.button.callback('🏆 Лидерборд', 'btn_4'),
            Markup.button.callback('✉️ Написать в саппорт', 'btn_5'),
          ],
          [Markup.button.callback('🔙 Назад', 'show_main_menu')],
        ])
      );
      break;
    case 'show_reg_menu':
      await ctx.reply(
        `"Введите ваш ID, который находится в вашем профиле (Например: 46230574)"
Сообщение просит пользователя ввести свой ID, который можно найти в его профиле, и приводит пример номера ID: 46230574. `,
        Markup.inlineKeyboard([
          [Markup.button.callback('Написать в саппорт', 'btn_5')],
          [Markup.button.callback('Отмена', 'show_main_menu')],
        ])
      );
      break;
    case 'show_time_menu_stok':
      // Показать меню для STOK (например, или сразу OTC крипто)
      await ctx.editMessageText(
        'Меню STOK — выберите таймфрейм:',
        Markup.inlineKeyboard([
          [
            Markup.button.callback('S5', 'timeframe_s5_stok'),
            Markup.button.callback('S15', 'timeframe_s15_stok'),
            Markup.button.callback('S30', 'timeframe_s30_stok'),
          ],
          [
            Markup.button.callback('M1', 'timeframe_m1_stok'),
            Markup.button.callback('M3', 'timeframe_m3_stok'),
            Markup.button.callback('M5', 'timeframe_m5_stok'),
          ],
          [
            Markup.button.callback('M30', 'timeframe_m30_stok'),
            Markup.button.callback('H1', 'timeframe_h1_stok'),
            Markup.button.callback('H4', 'timeframe_h4_stok'),
          ],
          [Markup.button.callback('Назад', 'get_signal')],
        ])
      );
      break;
    case 'btn_2':
      await ctx.editMessageText(
        `🤖 Как работает бот?

Наш бот — это инструмент для автоматического получения торговых сигналов на платформе Pocket Option.

📈 Он анализирует более 100 активов и определяет оптимальные точки входа в рынок.

🔔 Что вы получаете:
• Сигналы с чётким направлением (вверх или вниз)
• Указание актива и таймфрейма
• Уведомления в реальном времени прямо в Telegram

📌 Чтобы получить доступ ко всем функциям:
1. Зарегистрируйтесь через нашу ссылку (это важно!)
2. Введите свой ID из профиля Pocket Option
3. Получите доступ к бот-сигналам

Если у вас остались вопросы — напишите в поддержку 💬`,
        Markup.inlineKeyboard([
          [Markup.button.callback('📝 Регистрация', 'start_registration')],
          [Markup.button.callback('🏠 В меню', 'show_main_menu')],
        ])
      );
      break;
    case 'show_time_menu_oct':
      // Показать меню для OCT (или OTC форекс)
      await ctx.editMessageText(
        'Меню OCT — выберите таймфрейм:',
        Markup.inlineKeyboard([
          [
            Markup.button.callback('S5', 'timeframe_s5_oct'),
            Markup.button.callback('S15', 'timeframe_s15_oct'),
            Markup.button.callback('S30', 'timeframe_s30_oct'),
          ],
          [
            Markup.button.callback('M1', 'timeframe_m1_oct'),
            Markup.button.callback('M3', 'timeframe_m3_oct'),
            Markup.button.callback('M5', 'timeframe_m5_oct'),
          ],
          [
            Markup.button.callback('M30', 'timeframe_m30_oct'),
            Markup.button.callback('H1', 'timeframe_h1_oct'),
            Markup.button.callback('H4', 'timeframe_h4_oct'),
          ],
          [Markup.button.callback('Назад', 'get_signal')],
        ])
      );
      break;

    default:
      await ctx.answerCbQuery('Неизвестная команда');
  }
}
