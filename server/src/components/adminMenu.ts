import { Markup } from 'telegraf';

export const adminMenu = Markup.inlineKeyboard([
  [Markup.button.callback('Надати адмінку', 'give_admin')],
  [Markup.button.callback('Забрати адмінку', 'revoke_admin')],
  [
    Markup.button.callback(
      'Встановити посилання на сапорт',
      'set_support_link'
    ),
  ],
  [Markup.button.callback('Пошук за ID проєкту', 'search_project_by_id')],
  [Markup.button.callback('Надати доступ собі', 'grant_access_self')],
  [Markup.button.callback('Надати доступ за ID', 'grant_access_by_id')],
  [Markup.button.callback('Забрати доступ за ID', 'revoke_access_by_id')],
  [Markup.button.callback('Інформація про користувача', 'show_user_info')],
]);
