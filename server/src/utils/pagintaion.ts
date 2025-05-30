import { pages } from '../components/what_bot_can';

export function getPaginationKeyboard(page: number) {
  const buttons = [];
  const totalPages = pages.length;

  if (page > 0) {
    buttons.push({ text: '⬅️ Назад', callback_data: `photo_page_${page - 1}` });
  }
  buttons.push({
    text: `${page + 1} из ${totalPages}`,
    callback_data: 'page_counter',
  });

  if (page < pages.length - 1) {
    buttons.push({
      text: 'Вперёд ➡️',
      callback_data: `photo_page_${page + 1}`,
    });
  }

  // Кнопка "В меню"
  const mainMenuButton = [
    { text: '🏠 В меню', callback_data: 'show_main_menu' },
  ];
  return {
    reply_markup: {
      inline_keyboard: [
        buttons, // Строка с навигацией назад/вперёд
        mainMenuButton, // Отдельная строка с кнопкой "В меню"
      ],
    },
  };
}
