import { Markup } from 'telegraf';
import { MyContext } from '../types/CstContext';
import dotenv from 'dotenv';
dotenv.config();
export async function handleCallbackQuery(ctx: MyContext, data: string) {
  const telegramId = String(ctx?.from?.id);

  const res = await fetch(`${process.env.URL}users/${telegramId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    await ctx.reply('Помилка при отриманні даних користувача');
    return;
  }

  const user = await res.json(); // 👈 обязательно await
  if (!ctx.session) ctx.session = {};

  switch (data) {
    case 'give_admin':
      await ctx.answerCbQuery('Адмінка видана');
      await ctx.reply(
        'Введіть Telegram ID користувача, якому хочете видати адмінку:'
      );
      ctx.session.waitingForAdminId = true;
      ctx.session.action = 'give_admin';
      break;

    case 'revoke_admin':
      await ctx.answerCbQuery('Адмінка відкликана');
      await ctx.reply(
        'Введіть Telegram ID користувача, у якого хочете забрати адмінку:'
      );
      ctx.session.waitingForAdminId = true;
      ctx.session.action = 'revoke_admin';
      break;

    case 'set_support_link':
      await ctx.answerCbQuery('Посилання на підтримку встановлено');
      break;

    case 'get_user_info':
      await ctx.answerCbQuery('Інформація про користувача отримана');
      break;

    case 'search_project_by_id':
      await ctx.answerCbQuery('Пошук проєкту розпочато');
      break;

    case 'grant_access_self':
      await ctx.answerCbQuery('Доступ надано собі');
      break;
    case 'grant_access_by_id':
      await ctx.reply(
        'Введіть Telegram ID користувача, якому хочете надати доступ:'
      );
      ctx.session.waitingForAdminId = true;
      ctx.session.action = 'grant_access';
      break;

    // Отзыв доступа (без роли admin)
    case 'revoke_access_by_id':
      await ctx.reply(
        'Введіть Telegram ID користувача, у якого хочете відкликати доступ:'
      );
      ctx.session.waitingForAdminId = true;
      ctx.session.action = 'revoke_access';
      break;
    case 'show_user_info': {
      ctx.session.waitingForUserInfoId = true;

      await ctx.answerCbQuery();
      await ctx.reply(
        '🔍 Введіть Telegram ID користувача, інформацію про якого хочете отримати:',
        Markup.inlineKeyboard([
          [Markup.button.callback('❌ Відміна', 'show_main_menu')],
        ])
      );
    }
    break;
    case 'get_signal': {
      if (user?.qountexId === null && user.role.includes('user')) {
        return await ctx.reply(
          '❌ Ви не зареєстровані. Будь ласка, зареєструйтесь.',
          Markup.inlineKeyboard([
            [Markup.button.callback('📝 Реєстрація', 'show_reg_menu')],
            [
              Markup.button.callback(
                'Написати в підтримку',
                'get_support_link'
              ),
            ],
            [Markup.button.callback('🏠 В меню', 'show_main_menu')],
          ])
        );
      }

      ctx.session.action = 'get_signal';
      await ctx.editMessageText(
        'Нове меню:',
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
        `🔑 Щоб отримати повний доступ до нашого робота з більш ніж 100 активами, Вам потрібно створити <b>НОВИЙ АККАУНТ</b> у брокера Quotex строго за посиланням 🔗\n\n
❗ <b>Увага!</b> Навіть якщо у Вас уже є акаунт — потрібно створити <b>НОВИЙ</b> за посиланням нижче. Інакше бот не зможе перевірити акаунт, і Ви не отримаєте доступ до бота ❗\n\n
👉 <a href="https://broker-qx.pro/sign-up/fast/?lid=1367279&click_id={cid}&site_id={sid}">Зареєструватись на Quotex</a>\n\n
⚠️ <b>Важливо:</b> не давайте нікому свій ID, оскільки бот видається тільки на 1 акаунт.\n\n
Якщо Вам потрібно щось ще, дайте знати! 😉`,
        Markup.inlineKeyboard([
          [
            Markup.button.callback('📡 Отримати сигнал', 'get_signal'),
            Markup.button.callback('🤖 Як працює бот?', 'how_works_bot'),
          ],
          [
            Markup.button.callback('🏆 Лідерборд', 'leader_boards'),
            Markup.button.callback(
              '✉️ Написати в підтримку',
              'get_support_link'
            ),
          ],
          [Markup.button.callback('🔙 Назад', 'show_main_menu')],
        ])
      );
      break;

    case 'show_reg_menu':
      await ctx.reply(
        `"Введіть ваш ID, який знаходиться у вашому профілі (Наприклад: 46230574)"\n
Повідомлення просить користувача ввести свій ID, який можна знайти в його профілі, і наводить приклад номера ID: 46230574.`,
        Markup.inlineKeyboard([
          [Markup.button.callback('Написати в підтримку', 'get_support_link')],
          [Markup.button.callback('Відміна', 'show_main_menu')],
        ])
      );
      ctx.session.waitingForTraderId = true;
      break;

    case 'show_time_menu_stok':
      await ctx.editMessageText(
        'Меню STOK — оберіть таймфрейм:',
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

    case 'show_time_menu_oct':
      await ctx.editMessageText(
        'Меню OCT — оберіть таймфрейм:',
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
      await ctx.answerCbQuery('Невідома команда');
  }
}
