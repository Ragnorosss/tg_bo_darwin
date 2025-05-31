import { MyContext } from '../types/CstContext';

export async function getUserAndAuthStatus(ctx: MyContext, telegramId: string) {
  try {
    const res = await fetch(`${process.env.URL}users/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        telegramId,
        username: ctx?.from?.username,
        firstName: ctx?.from?.first_name,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`Ошибка ${res.status}: ${text}`);
      await ctx.reply('Проблема с получением пользователя');
      return null;
    }

    const user = await res.json();
    const isUnauthorized = !user.qountexId && user.gaveAdminAccess === false;
    const checkAuth = isUnauthorized ? 'show_start_auth' : 'show_main_menu';
    return { user, checkAuth };
  } catch (err) {
    console.error('Ошибка при получении пользователя:', err);
    await ctx.reply('Серверная ошибка при авторизации');
    return null;
  }
}
