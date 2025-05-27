import { User } from '../models/User';

export class UserService {
  static async createOrFindUser(data: {
    telegramId: string;
    username?: string;
    firstName?: string;
  }) {
    let user = await User.findOne({ telegramId: data.telegramId });

    if (!user) {
      user = await User.create({
        telegramId: data.telegramId,
        username: data.username,
        firstName: data.firstName,
        role: 'user',
      });
    }

    return user;
  }
  static async giveAdminAccess(telegramId: string) {
    const user = await User.findOne({ telegramId });
    if (!user) throw new Error('Пользователь не найден');

    if (user.role === 'admin') {
      return { message: 'Пользователь уже админ', user };
    }

    user.role = 'admin';
    await user.save();

    return { message: 'Роль admin выдана', user };
  }

  static async revokeAdminAccess(telegramId: string) {
    const user = await User.findOne({ telegramId });
    if (!user) throw new Error('Пользователь не найден');

    if (user.role !== 'admin') {
      return { message: 'Пользователь не является админом', user };
    }

    user.role = 'user';
    await user.save();

    return { message: 'Роль admin забрана', user };
  }
  static async GetAccessForMe(telegramId: string) {
    const user = await User.findOne({ telegramId });
    if (!user) throw new Error('Пользователь не найден');

    user.role = 'admin';
    await user.save();
    return user;
  }
  static async setRole(telegramId: string, role: 'admin' | 'user') {
    const user = await User.findOne({ telegramId });
    if (!user) throw new Error('Пользователь не найден');

    user.role = role;
    await user.save();
    return user;
  }
}
