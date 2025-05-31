import { Response } from 'express';
import { app } from './app';
import { bot } from './bot';
import dotenv from 'dotenv';
import { connectDB } from './config/db';

dotenv.config();

const PORT = process.env.PORT || 3000;
app.use(bot.webhookCallback('/webhook'));

app.get('/', (_, res: Response) => {
  res.send('Бот запущен');
});
connectDB().then(() => {
  app.listen(PORT, async () => {
    console.log(`🚀 Сервер на порту ${PORT}`);

    const webhookUrl = `${process.env.WEBHOOK_URL}/webhook`;

    try {
      await bot.telegram.setWebhook(webhookUrl, {
        secret_token: process.env.SECRET_TOKEN,
      });
    } catch (err) {
      console.error('❌ Ошибка при установке webhook:', err);
    }
  });
});
