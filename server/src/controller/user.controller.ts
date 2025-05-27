import { Request, Response } from 'express';
import { UserService } from '../service/user.service';
import { User } from '../models/User';

export class UserController {
  static async GetInfoTrader(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      const tradeId = req.query.trade_id as string;

      console.log('User ID:', userId);
      console.log('Trade ID:', tradeId);

      console.log('Sending 200 response');
      res.status(200).json({ userId, tradeId });
      console.log('Response sent');
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }
  static async GetAccessForMe(req: Request, res: Response) {
    try {
      const { telegramId } = req.params;
      const user = await UserService.GetAccessForMe(telegramId);
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
      }
      res.json(user);
    } catch (err) {
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
}
