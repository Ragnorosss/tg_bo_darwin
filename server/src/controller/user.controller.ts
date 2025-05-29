import { Request, Response } from 'express';
import { UserService } from '../service/user.service';
import { User } from '../models/User';
import { PendingUserData } from '../models/Trader';

export class UserController {
  static async linkTraderId(req: Request, res: Response) {
    const { telegramId } = req.params;
    const { traderId } = req.body;

    if (typeof traderId !== 'string') {
      res.status(400).json({ error: 'Неверный формат traderId' });
    }

    try {
      const user = await UserService.linkTraderIdToUser(telegramId, traderId);
      res.json({ message: 'Пользователь обновлён', user });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
  static async GetAccessForUserID(req: Request, res: Response) {
    try {
      const { telegramId } = req.params;
      const user = await UserService.giveAdminAccess(telegramId);
      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  static async RevokeAccessForID(req: Request, res: Response) {
    try {
      const { telegramId } = req.params;
      const user = await UserService.revokeAdminAccess(telegramId);
      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  static async createUser(req: Request, res: Response) {
    try {
      const user = await UserService.createOrFindUser(req.body);
      res.json(user);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  static async getUserByTelegramId(req: Request, res: Response) {
    const { telegramId } = req.params;
    try {
      const user = await User.findOne({ telegramId });
      if (!user) {
        res.status(404).json({ message: 'Пользователь не найден' });
        return;
      }
      res.json(user);
    } catch (err) {
      console.error('Ошибка при получении пользователя:', err); // 👈 ОБЯЗАТЕЛЬНО
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  static async giveAdmin(req: Request, res: Response) {
    try {
      const { telegramId } = req.params;
      const user = await UserService.setRole(telegramId, 'admin');
      res.json({ message: 'Админка выдана', user });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  static async revokeAdmin(req: Request, res: Response) {
    try {
      const { telegramId } = req.params;
      const user = await UserService.setRole(telegramId, 'user');
      res.json({ message: 'Админка убрана', user });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }
  static async handlePostback(req: Request, res: Response): Promise<void> {
    try {
      const { uid, status, reg } = req.query;

      if (
        typeof uid !== 'string' ||
        typeof status !== 'string' ||
        typeof reg !== 'string'
      ) {
        res.status(400).json({ error: 'Некорректные параметры' });
        return;
      }

      const user = await User.findOne({ traderId: uid });

      if (user) {
        user.status = status;
        user.registration = reg === 'true';
        await user.save();
      } else {
        // Сохраняем во временную модель
        await PendingUserData.findOneAndUpdate(
          { uid },
          { status, registration: reg === 'true' },
          { upsert: true }
        );
      }

      res.status(200).json({ message: 'Данные сохранены' });
    } catch (error) {
      console.error('Ошибка при сохранении данных:', error);
      res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  }
}
