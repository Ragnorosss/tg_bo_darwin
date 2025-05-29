const images = {
  up: './src/assets/up.png',
  down: './src/assets/down.png',
};

export function generateMarketSignal(pair: string) {
  const directions = [
    { text: 'ВЫШЕ ↑', emoji: '📈', img: images.up },
    { text: 'НИЖЕ ↓', emoji: '📉', img: images.down },
  ];
  const risks = ['Low risk', 'Moderate risk', 'High risk'];

  const randomPercent = (Math.random() * (1.5 - 0.1) + 0.1).toFixed(2);
  const direction = directions[Math.floor(Math.random() * directions.length)];
  const risk = risks[Math.floor(Math.random() * risks.length)];

  const marketOverview =
    '• Волатильность: Moderate • Настроения: Bearish • Объём: Spiked';
  const tradingViewRating =
    '• Сводка: STRONG SELL • Скользящие средние: SELL • Осцилляторы: BUY';
  const technicalAnalysis =
    '• RSI (14): Topping Out • MACD: Bullish Crossover • Полосы Боллинджера: Whipsaw Reactions • Pattern: Double Top';

  const text = `${pair} Прогноз (+${randomPercent}%) ${direction.text} (${risk})

Обзор рынка: ${marketOverview}

Рейтинг TradingView: ${tradingViewRating}

Технический анализ: ${technicalAnalysis}`;

  return { text, imgPath: direction.img };
}