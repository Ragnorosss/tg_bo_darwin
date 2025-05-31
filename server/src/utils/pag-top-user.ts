import { MyContext } from '../types/CstContext';
import { getUserAndAuthStatus } from './check-auth';

export async function getPaginationKeyboardUsers(
  page: number,
  totalPages: number,
  ctx: MyContext,
  telegramId: string
) {
  const buttons = [];

  if (page > 0) {
    buttons.push({
      text: '⬅️ Назад',
      callback_data: `leader_page_${page - 1}`,
    });
  }

  buttons.push({
    text: `${page + 1} з ${totalPages}`,
    callback_data: 'page_counter',
  });

  if (page < totalPages - 1) {
    buttons.push({
      text: 'Вперёд ➡️',
      callback_data: `leader_page_${page + 1}`,
    });
  }
  const result = await getUserAndAuthStatus(ctx, telegramId);
  if (!result) return;

  const { checkAuth } = result;

  const mainMenuButton = [{ text: '🏠 В меню', callback_data: checkAuth }];

  return {
    reply_markup: {
      inline_keyboard: [buttons, mainMenuButton],
    },
  };
}
