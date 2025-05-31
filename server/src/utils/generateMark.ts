const images = {
  up: './src/assets/up.png',
  down: './src/assets/down.png',
};

export function generateMarketSignal(pair: string) {
  const directions = [
    { text: 'ВИЩЕ ↑', emoji: '📈', img: images.up },
    { text: 'НИЖЧЕ ↓', emoji: '📉', img: images.down },
  ];
  const risks = ['Низький ризик', 'Помірний ризик', 'Високий ризик'];

  const randomPercent = (Math.random() * (1.5 - 0.1) + 0.1).toFixed(2);
  const direction = directions[Math.floor(Math.random() * directions.length)];
  const risk = risks[Math.floor(Math.random() * risks.length)];

  const marketOverview =
    '• Волатильність: Помірна • Настрої: Ведмежі • Обʼєм: Різко зріс';
  const tradingViewRating =
    '• Підсумок: СИЛЬНИЙ ПРОДАЖ • Скользькі середні: ПРОДАВАТИ • Осцилятори: КУПУВАТИ';
  const technicalAnalysis =
    '• RSI (14): Досягає піку • MACD: Бичаче перехрестя • Смуги Боллінджера: Хаотичні коливання • Фігура: Подвійна вершина';

  const text = `${pair} Прогноз (+${randomPercent}%) ${direction.text} (${risk})

Огляд ринку: ${marketOverview}

Оцінка TradingView: ${tradingViewRating}

Технічний аналіз: ${technicalAnalysis}`;

  return { text, imgPath: direction.img };
}