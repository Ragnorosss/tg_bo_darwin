import { tz } from 'moment-timezone';

export function isStockTradingTime() {
  // Текущее время в часовом поясе Киева
  const now = tz('Europe/Kiev');
  const day = now.isoWeekday(); // Пн=1, Вс=7
  const hour = now.hour();

  // Разрешено с Пн(1) по Пт(5)
  const isWeekday = day >= 1 && day <= 5;

  // Разрешено с 13 до 21 (т.е. >=13 и <21)
  const isWorkingHour = hour >= 13 && hour < 21;

  return isWeekday && isWorkingHour;
}
