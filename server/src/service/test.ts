import { Request, Response } from 'express';
import { bot } from '../bot';

export const Test = async (req: Request, res: Response): Promise<void> => {
  console.log('📩 Webhook получен:', req.body);

  const tokenFromHeader = req.headers['x-telegram-bot-api-secret-token'];
  console.log('🔐 Заголовок секретного токена:', tokenFromHeader);

  if (tokenFromHeader !== process.env.SECRET_TOKEN) {
    console.log('⛔ Неверный секретный токен');
    res.sendStatus(403);
    return;
  }

  try {
    await bot.handleUpdate(req.body);
    res.sendStatus(200);
  } catch (err) {
    console.error('❌ Ошибка при обработке webhook:', err);
    res.sendStatus(500);
  }
};
