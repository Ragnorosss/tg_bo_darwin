import { Telegraf } from 'telegraf';
import { MyContext } from '../types/CstContext';
import { getPaginationKeyboard } from './pagintaion';


export function paginateUsers(users: any[], pageSize: number): any[][] {
  const pages = [];
  for (let i = 0; i < users.length; i += pageSize) {
    pages.push(users.slice(i, i + pageSize));
  }
  return pages;
}

// Функция формирования текста для страницы
export function formatLeaderboardPage(
  pageUsers: any[],
  startIndex = 0
): string {
  return pageUsers
    .map(
      (u, i) =>
        `${startIndex + i + 1}. ${u.nickname} — ${u.earnings.toLocaleString()}`
    )
    .join('\n');
}
export function BotLeaderBoard(bot: Telegraf<MyContext>) {

}
