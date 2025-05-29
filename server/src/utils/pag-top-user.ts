const pageSize = 5; // размер страницы — 5 юзеров

// Функция генерации клавиатуры для лидеров, учитывающая totalPages
export function getPaginationKeyboardUsers(page: number, totalPages: number) {
  const buttons = [];

  if (page > 0) {
    buttons.push({
      text: '⬅️ Назад',
      callback_data: `leader_page_${page - 1}`,
    });
  }

  buttons.push({
    text: `Страница ${page + 1} из ${totalPages}`,
    callback_data: 'page_counter',
  });

  if (page < totalPages - 1) {
    buttons.push({
      text: 'Вперёд ➡️',
      callback_data: `leader_page_${page + 1}`,
    });
  }

  const mainMenuButton = [
    { text: '🏠 В меню', callback_data: 'show_main_menu' },
  ];

  return {
    reply_markup: {
      inline_keyboard: [buttons, mainMenuButton],
    },
  };
}
