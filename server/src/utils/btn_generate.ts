import { Markup } from 'telegraf';
import { currencyPairs,otcPairs } from '../components/curremcuPair';
import { getRandomItems } from './randomItem';

export function generatePairButtons(type: string) {
  if (type === 'stok') {
    return getRandomItems(currencyPairs, 5).map((pair) => [
      Markup.button.callback(pair.label, `select_pair_${pair.code}`),
    ]);
  }

  if (type === 'oct') {
    // Объединяем все пары OTC в один массив
    const allOtcPairs: string[] = [...otcPairs.forex, ...otcPairs.crypto];

    // Берём 5 случайных пар
    const randomOtc = getRandomItems(allOtcPairs, 5);

    // Генерируем кнопки
    return randomOtc.map((pair) => {
      const code = pair.replace(/[^\w]/g, '_').toLowerCase();
      return [Markup.button.callback(pair, `select_pair_${code}`)];
    });
  }

  return [];
}
