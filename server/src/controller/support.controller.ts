import { Request, Response } from 'express';
import { SupportService } from '../service/support.service';

export class SupportController {
  static async setSupportLink(req: Request, res: Response) {
    const { telegramId, link } = req.body;

    try {
      await SupportService.setSupportLink({ telegramId, link });
      res.status(200).json({ message: 'Ссылка успешно обновлена' });
    } catch (error: any) {
      res.status(403).json({ error: error.message });
    }
  }

  static async getSupportLink(req: Request, res: Response) {
    try {
      const link = await SupportService.getSupportLink();
      if (!link) {
         res.status(404).json({ error: 'Ссылка не найдена' });
      }
      res.status(200).json({ link });
    } catch (error) {
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }
}
