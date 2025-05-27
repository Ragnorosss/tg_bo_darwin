import { User } from '../models/User';
import { SupportLink } from '../models/Support';

export class SupportService {
  static async setSupportLink(data: { telegramId: string; link: string }) {
    const user = await User.findOne({ telegramId: data.telegramId });

    if (!user) throw new Error('Пользователь не найден');
    if (!user.role.includes('admin')) throw new Error('Нет прав');

    // Обновляем или создаём новую ссылку
    const existing = await SupportLink.findOne();
    if (existing) {
      existing.link = data.link;
      await existing.save();
    } else {
      await SupportLink.create({ link: data.link });
    }
  }

  static async getSupportLink(): Promise<string | null> {
    const doc = await SupportLink.findOne();
    return doc?.link || null;
  }
}
