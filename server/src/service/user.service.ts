import { User } from '../models/User';
interface PostbackData {
  uid: string;
  status: string;
  registration: string; // будет 'true' или 'false' в строке
}
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
      return { message: 'Користувач вже має роль admin', user };
    }

    // Роль не admin — просто даём доступ
    user.gaveAdminAccess = true;
    await user.save();

    return { message: 'Доступ надано (без ролі admin)', user };
  }

  static async revokeAdminAccess(telegramId: string) {
    const user = await User.findOne({ telegramId });
    if (!user) throw new Error('Пользователь не найден');

    if (!user.gaveAdminAccess) {
      return { message: 'Користувач не має доступу', user };
    }

    // Просто убираем флаг доступа
    user.gaveAdminAccess = false;
    await user.save();

    return { message: 'Доступ скасовано', user };
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

  static async savePostbackData(data: PostbackData) {
    const { uid, status, registration } = data;

    const regFlag = registration === 'true';

    const user = await User.findOne({ traderId: uid });

    if (user) {
      user.traderId = uid;
      user.status = status;
      user.registration = regFlag;
      await user.save();
    }

    return user;
  }
}
