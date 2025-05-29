import { Markup } from "telegraf";
import { currencyPairs, otcPairs } from "../components/curremcuPair";
import { getRandomItems } from "./randomItem";
//@ts-ignore
export function generatePairButtons(type: string) {
  if (type === 'stok') {
    return getRandomItems(currencyPairs, 5).map((pair) => [
      Markup.button.callback(pair.label, `select_pair_${pair.code}`),
    ]);
  }

  if (type === 'oct') {
    const forexButtons = getRandomItems(otcPairs.forex, 3).map((pair) => {
      const code = pair.replace(/[^\w]/g, '_').toLowerCase();
      return [Markup.button.callback(pair, `select_pair_${code}`)];
    });

    const cryptoButtons = getRandomItems(otcPairs.crypto, 2).map((pair) => {
      const code = pair.replace(/\s|\(|\)/g, '').toLowerCase();
      return [Markup.button.callback(pair, `select_pair_${code}`)];
    });

    return [...forexButtons, ...cryptoButtons];
  }

  return [];
}
