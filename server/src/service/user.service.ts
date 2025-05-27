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

  static async setRole(telegramId: string, role: 'admin' | 'user') {
    const user = await User.findOne({ telegramId });
    if (!user) throw new Error('Пользователь не найден');

    user.role = role;
    await user.save();
    return user;
  }
}
