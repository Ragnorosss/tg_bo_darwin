import { Markup } from 'telegraf';
import { MyContext } from '../types/CstContext';

export async function handleAdminIdInput(
  user: any,
  ctx: MyContext,
  inputId: string
) {
  ctx.session.waitingForAdminId = true;

  const telegramId = inputId;

  switch (ctx.session.action) {
    case 'give_admin':
      if (user.role === 'admin') {
        ctx.session.waitingForAdminId = false;
        return ctx.reply(
          `ℹ️ Користувач з ID ${inputId} вже має адмінку.`,
          Markup.inlineKeyboard([
            [Markup.button.callback('🏠 До головного меню', 'show_main_menu')],
            [Markup.button.callback('Адмін меню', 'show_admin_menu')],
          ])
        );
      }

      const res2 = await fetch(`${process.env.URL}users/${telegramId}/admin`, {
        method: 'PATCH',
      });

      if (!res2.ok) {
        const text = await res2.text();
        console.error(`❌ Помилка ${res2.status}: ${text}`);
        return ctx.reply(
          '❌ Проблема з видачею адмінки.',
          Markup.inlineKeyboard([
            [Markup.button.callback('❌ Відміна', 'show_main_menu')],
          ])
        );
      }

      ctx.session.waitingForAdminId = false;
      return ctx.reply(
        `✅ Адмінка надана користувачу з ID ${inputId}.`,
        Markup.inlineKeyboard([
          [Markup.button.callback('🏠 До головного меню', 'show_main_menu')],
          [Markup.button.callback('Адмін меню', 'show_admin_menu')],
        ])
      );
  }
}
