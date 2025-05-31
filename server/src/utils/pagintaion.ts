import { pages } from '../components/what_bot_can';
import { MyContext } from '../types/CstContext';
import { getUserAndAuthStatus } from './check-auth';

export async function getPaginationKeyboard(
  page: number,
  ctx: MyContext,
  telegramId: string
) {
  const buttons = [];
  const totalPages = pages.length;

  if (page > 0) {
    buttons.push({ text: '⬅️ Назад', callback_data: `photo_page_${page - 1}` });
  }
  buttons.push({
    text: `${page + 1} з ${totalPages}`,
    callback_data: 'page_counter',
  });

  if (page < pages.length - 1) {
    buttons.push({
      text: 'Вперёд ➡️',
      callback_data: `photo_page_${page + 1}`,
    });
  }
  const result = await getUserAndAuthStatus(ctx, telegramId);
  if (!result) return;

  const { checkAuth } = result;
  const mainMenuButton = [{ text: '🏠 В меню', callback_data: checkAuth }];
  console.log('getPaginationKeyboard:', { page, checkAuth });
  return {
    reply_markup: {
      inline_keyboard: [
        buttons, 
        mainMenuButton, 
      ],
    },
  };
}
