import { currencyPairs, otcPairs } from './curremcuPair';
export function getFormattedLabel(rawPair: string): string {
  // 1. Убираем подчеркивания, приводим к нормальному виду и убираем OTC, пробелы и др.
  let cleaned = rawPair
    .replace(/_/g, ' ') // заменяем _ на пробелы
    .replace(/\s+/g, ' ') // убираем лишние пробелы
    .trim()
    .toUpperCase();

  // Убираем окончание OTC, если есть (с пробелом или без)
  cleaned = cleaned.replace(/\s*OTC\s*$/, '');

  // 2. Проверяем крипто OTC
  for (const cryptoName of otcPairs.crypto) {
    if (cleaned === cryptoName.toUpperCase()) {
      return cryptoName; // возвращаем название крипто без OTC и флагов
    }
  }

  // 3. Проверяем валютные пары из currencyPairs по коду
  // Убираем пробелы из cleaned, чтобы получить код валюты без разделителей
  const codeWithoutSpaces = cleaned.replace(/\s/g, '');
  const foundPair = currencyPairs.find((p) => p.code === codeWithoutSpaces);
  if (foundPair) {
    return foundPair.label;
  }

  // 4. Если не нашли пару, пробуем вставить слэш между двумя трехбуквенными валютами
  if (codeWithoutSpaces.length === 6) {
    return codeWithoutSpaces.slice(0, 3) + '/' + codeWithoutSpaces.slice(3);
  }

  // 5. Если ничего не подошло — возвращаем исходное, но без подчеркиваний и OTC
  return rawPair
    .replace(/_/g, ' ')
    .replace(/\s*OTC\s*$/i, '')
    .trim();
}
