import { Markup } from 'telegraf';

export const adminMenu = Markup.inlineKeyboard([
  [Markup.button.callback('Выдать админку', 'give_admin')],
  [Markup.button.callback('Утратить админку', 'revoke_admin')],
  [Markup.button.callback('Установить ссылку на сапорт', 'set_support_link')],
  [Markup.button.callback('Получить инфу про юзера', 'get_user_info')],
  [Markup.button.callback('Поиск по id проекта', 'search_project_by_id')],
  [Markup.button.callback('Дать доступ себе', 'grant_access_self')],
  [Markup.button.callback('Дать доступ по id', 'grant_access_by_id')],
  [Markup.button.callback('Дать убрать по id', 'revoke_access_by_id')],
]);
