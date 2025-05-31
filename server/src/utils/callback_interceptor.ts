import { Markup } from 'telegraf';
import { MyContext } from '../types/CstContext';
import dotenv from 'dotenv';
import { isStockTradingTime } from './days_time_check';
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

  const user = await res.json();
  if (!ctx.session) ctx.session = {};

  switch (data) {
    case 'give_admin':
      await ctx.answerCbQuery('Адмінка видана');
      await ctx.reply(
        'Введіть Telegram ID користувача, якому хочете видати адмінку:',
        Markup.inlineKeyboard([
          [Markup.button.callback('🏠 До головного меню', 'show_main_menu')],
          [Markup.button.callback('Адмін меню', 'show_admin_menu')],
        ])
      );
      ctx.session.waitingForAdminId = true;
      ctx.session.action = 'give_admin';
      break;

    case 'revoke_admin':
      await ctx.answerCbQuery('Адмінка відкликана');
      await ctx.reply(
        'Введіть Telegram ID користувача, у якого хочете забрати адмінку:',
        Markup.inlineKeyboard([
          [Markup.button.callback('❌ Відміна', 'show_main_menu')],
          [Markup.button.callback('Адмін меню', 'show_admin_menu')],
        ])
      );
      ctx.session.waitingForAdminId = true;
      ctx.session.action = 'revoke_admin';
      break;

    case 'grant_access_self':
      await ctx.answerCbQuery('Доступ надано собі');
      break;
    case 'grant_access_by_id':
      await ctx.reply(
        'Введіть Telegram ID користувача, якому хочете надати доступ:',
        Markup.inlineKeyboard([
          [Markup.button.callback('❌ Відміна', 'show_main_menu')],
          [Markup.button.callback('Адмін меню', 'show_admin_menu')],
        ])
      );
      ctx.session.waitingForAdminId = true;
      ctx.session.action = 'grant_access';
      break;

    // Отзыв доступа (без роли admin)
    case 'revoke_access_by_id':
      await ctx.reply(
        'Введіть Telegram ID користувача, у якого хочете відкликати доступ:',
        Markup.inlineKeyboard([
          [Markup.button.callback('❌ Відміна', 'show_main_menu')],
          [Markup.button.callback('Адмін меню', 'show_admin_menu')],
        ])
      );
      ctx.session.waitingForAdminId = true;
      ctx.session.action = 'revoke_access';
      break;
    case 'show_user_info':
      {
        ctx.session.waitingForUserInfoId = true;

        await ctx.answerCbQuery();
        await ctx.reply(
          '🔍 Введіть Telegram ID користувача, інформацію про якого хочете отримати:',
          Markup.inlineKeyboard([
            [Markup.button.callback('❌ Відміна', 'show_main_menu')],
            [Markup.button.callback('Адмін меню', 'show_admin_menu')],
          ])
        );
      }
      break;

    case 'show_start_auth':
      if (user.role.includes('user')) {
        await ctx.replyWithPhoto(
          { source: './src/assets/last.jpg' },
          {
            parse_mode: 'Markdown',
            reply_markup: Markup.inlineKeyboard([
              [Markup.button.callback('🤖 Як працює бот?', 'how_works_bot')],
              [
                Markup.button.callback('🏆 Лідерборд', 'leader_boards'),
                Markup.button.callback(
                  '✉️ Написати в підтримку',
                  'get_support_link'
                ),
              ],
              [Markup.button.callback('Почати', 'next_step_auth')],
            ]).reply_markup,
          }
        );
      } else if (user.role.includes('admin')) {
        await ctx.replyWithPhoto(
          { source: './src/assets/last.jpg' },
          {
            parse_mode: 'Markdown',
            reply_markup: Markup.inlineKeyboard([
              [Markup.button.callback('🤖 Як працює бот?', 'how_works_bot')],
              [Markup.button.callback('🏆 Лідерборд', 'leader_boards')],
              [
                Markup.button.callback(
                  '✉️ Написати в підтримку',
                  'get_support_link'
                ),
              ],
              [Markup.button.callback('Почати', 'next_step_auth')],
              [Markup.button.callback('Адмін меню', 'show_admin_menu')],
            ]).reply_markup,
          }
        );
      }
      break;
    case 'next_step_auth':
      {
        await ctx.replyWithPhoto(
          { source: './src/assets/fifty.jpg' },
          {
            caption: `🖥 Щоб успішно увійти та активувати бота, необхідно створити новий акаунт на Quotex за нашою спеціальною посиланням або через кнопку нижче. ↓

⭕️ ВАЖЛИВО: Ви повинні зареєструватися тільки за нашим посиланням. В іншому випадку бот не зможе підтвердити, що ви створили акаунт.

Монетизація бота здійснюється завдяки партнерській програмі платформи. Ми не стягуємо жодних комісій і не беремо з вас ніяких коштів.`,
            reply_markup: Markup.inlineKeyboard([
              [
                Markup.button.callback(
                  'Я створив аккаунт, перевірити ID',
                  'show_reg_menu'
                ),
                Markup.button.url(
                  'Створити аккаунт на Quotex',
                  'https://broker-qx.pro/sign-up/?lid=1367282'
                ),
              ],
            ]).reply_markup,
          }
        );
      }
      break;

    case 'show_main_menu':
      if (user.role.includes('admin')) {
       return await ctx.replyWithPhoto(
          { source: './src/assets/start_sell.jpg' },
          {
            reply_markup: Markup.inlineKeyboard([
              [
                Markup.button.callback('💻Отримати прогноз', 'get_signal'),
                Markup.button.callback('🤖 Як працює бот?', 'how_works_bot'),
              ],
              [
                Markup.button.callback('🏆 Лідерборд', 'leader_boards'),
                Markup.button.callback(
                  '✉️ Написати в підтримку',
                  'get_support_link'
                ),
                Markup.button.callback('Адмін меню', 'show_admin_menu'),
              ],
            ]).reply_markup,
          }
        );
      }
      if (user.role.includes('user')) {
       return await ctx.replyWithPhoto(
          { source: './src/assets/start_sell.jpg' },
          {
            reply_markup: Markup.inlineKeyboard([
              [
                Markup.button.callback('💻Отримати прогноз', 'get_signal'),
                Markup.button.callback('🤖 Як працює бот?', 'how_works_bot'),
              ],
              [
                Markup.button.callback('🏆 Лідерборд', 'leader_boards'),
                Markup.button.callback(
                  '✉️ Написати в підтримку',
                  'get_support_link'
                ),
              ],
            ]).reply_markup,
          }
        );
      }
      break;

    case 'get_signal': {
      const stockActive = isStockTradingTime();
      ctx.session.action = 'get_signal';
      if (user && !user.qountexId && user.role.includes('user')) {
        if (user.gaveAdminAccess === true) {
          return await ctx.editMessageText(
            'Виберіть тип ринку:',
            Markup.inlineKeyboard([
              [
                stockActive
                  ? Markup.button.callback('STOK', 'show_time_menu_stok')
                  : Markup.button.callback(
                      'STOK ❌ (заблоковано)',
                      'blocked',
                      false
                    ),
                Markup.button.callback('OCT', 'show_time_menu_oct'),
              ],
              [Markup.button.callback('Назад', 'show_main_menu')],
            ])
          );
        }
        return await ctx.reply(
          '❌ Ви не зареєстровані. Будь ласка, зареєструйтесь.',
          Markup.inlineKeyboard([
            [Markup.button.callback('📝 Реєстрація', 'show_start_auth')],
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

      await ctx.reply(
        'Виберіть тип ринку:',
        Markup.inlineKeyboard([
          [
            stockActive
              ? Markup.button.callback('STOK', 'show_time_menu_stok')
              : Markup.button.callback(
                  'STOK ❌ (заблоковано)',
                  'blocked',
                  false
                ),
            Markup.button.callback('OCT', 'show_time_menu_oct'),
          ],
          [Markup.button.callback('Назад', 'show_main_menu')],
        ])
      );
      break;
    }
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
