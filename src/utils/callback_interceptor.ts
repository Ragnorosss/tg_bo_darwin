import { Context, Markup } from 'telegraf';
import { MyContext } from '../types/CstContext';

export async function handleCallbackQuery(ctx: MyContext, data: string) {
  if (!ctx.session) ctx.session = {};
  switch (data) {
    case 'give_admin':
      await ctx.answerCbQuery('Админка выдана');
      await ctx.reply(
        'Введите Telegram ID пользователя, которому хотите выдать админку:'
      );
      ctx.session.waitingForAdminId = true;
      break;

    case 'revoke_admin':
      await ctx.answerCbQuery('Админка утрачена');
      await ctx.reply(
        'Введите Telegram ID пользователя, которому забрать  админку:'
      );
      ctx.session.waitingForAdminId = true;
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

    case 'show_new_menu':
      await ctx.editMessageText(
        'Новое меню:',
        Markup.inlineKeyboard([
          [
            Markup.button.callback('Получить сигнал', 'btn_1'),
            Markup.button.callback('Как работает бот?', 'btn_2'),
          ],
          [
            Markup.button.callback('Выбор языка', 'btn_3'),
            Markup.button.callback('Лидерборд', 'btn_4'),
            Markup.button.callback('Написать в саппорт', 'btn_5'),
          ],
          [Markup.button.callback('Назад', 'show_main_menu')],
        ])
      );
      break;

    case 'show_main_menu':
      await ctx.editMessageText(
        'Главное меню:',
        Markup.inlineKeyboard([
          Markup.button.callback('Показать другое меню', 'show_new_menu'),
        ])
      );
      break;

    default:
      await ctx.answerCbQuery('Неизвестная команда');
  }
}
