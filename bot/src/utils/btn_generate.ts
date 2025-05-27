import { Markup } from "telegraf";
import { currencyPairs, otcPairs } from "../components/curremcuPair";

export function generatePairButtons(type: string) {
  if (type === 'stok') {
    return currencyPairs.map((pair) => [
      Markup.button.callback(pair.label, `select_pair_${pair.code}`),
    ]);
  }

  if (type === 'oct') {
    const forexButtons = otcPairs.forex.map((pair) => {
      const code = pair.replace(/[^\w]/g, ''); // убираем спецсимволы
      return [Markup.button.callback(pair, `select_pair_${code}`)];
    });

    const cryptoButtons = otcPairs.crypto.map((pair) => {
      const code = pair.replace(/\s|\(|\)/g, '').toLowerCase(); // пример: Ethereum (OTC) -> ethereumotc
      return [Markup.button.callback(pair, `select_pair_${code}`)];
    });

    return [...forexButtons, ...cryptoButtons];
  }

  return [];
}
