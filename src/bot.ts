import {
  Markup,
  Telegraf,
  session,
} from 'telegraf';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { User } from './models/User';
import { adminMenu } from './components/adminMenu';
import { handleCallbackQuery } from './utils/callback_interceptor'; 
import { MyContext } from './types/CstContext';

dotenv.config();


const BOT_TOKEN = process.env.BOT_TOKEN!;
const bot = new Telegraf<MyContext>(BOT_TOKEN);

bot.use(session());


bot.start(async (ctx) => {
  const telegramId = String(ctx.from.id);

  let user = await User.findOne({ telegramId });

  if (user?.role.includes('admin')) {
    await ctx.reply('Вы в роли администратора');
    await ctx.reply('Админское меню:', adminMenu);
  }
  await ctx.reply(`Добро пожаловать, ${ctx.from.first_name}!`);

  await ctx.reply(
    'Главное меню:',
    Markup.inlineKeyboard([Markup.button.callback('Далее', 'show_new_menu')])
  );

  if (!user) {
    user = await User.create({
      telegramId,
      username: ctx.from.username,
      firstName: ctx.from.first_name,
    });
  } else {
    await ctx.reply(`С возвращением, ${ctx.from.first_name}!`);
  }
});

bot.on('callback_query', async (ctx) => {
  const callbackQuery = ctx.callbackQuery;
  if (!callbackQuery || !('data' in callbackQuery)) {
    return;
  }

  const data = callbackQuery.data;

  await handleCallbackQuery(ctx, data);

  await ctx.answerCbQuery();
});

bot.on('text', async (textHandler) => {
  if (textHandler.session.waitingForAdminId) {
    const inputId = textHandler?.message?.text?.trim();

    if (!/^\d+$/.test(inputId)) {
      return textHandler.reply(
        'Пожалуйста, введите корректный числовой Telegram ID.'
      );
    }

    // Выдаём админку пользователю с этим telegramId
    let user = await User.findOne({ telegramId: inputId });
    if (!user) {
      return textHandler.reply(`Пользователь с ID ${inputId} не найден.`);
    }

    // Добавляем роль admin, если её ещё нет
    if (!user.role.includes('admin')) {
      user.role = 'admin';
      await user.save();

      await textHandler.reply(
        `Админка успешно выдана пользователю с ID ${inputId}.`
      );
    } else {
      await textHandler.reply(
        `Пользователь с ID ${inputId} уже является администратором.`
      );
    }

    textHandler.session.waitingForAdminId = false;
  }
});

bot.on('text', async (textHandler) => {
  if (textHandler.session.waitingForAdminId) {
    const inputId = textHandler?.message?.text?.trim();

    if (!/^\d+$/.test(inputId)) {
      return textHandler.reply(
        'Пожалуйста, введите корректный числовой Telegram ID.'
      );
    }

    // Выдаём админку пользователю с этим telegramId
    let user = await User.findOne({ telegramId: inputId });
    if (!user) {
      return textHandler.reply(`Пользователь с ID ${inputId} не найден.`);
    }

    // Добавляем роль admin, если её ещё нет
    if (!user.role.includes('user')) {
      user.role = 'user';
      await user.save();

      await textHandler.reply(
        `Админка успешно удалена пользователю с ID ${inputId}.`
      );
    } else {
      await textHandler.reply(
        `Пользователь с ID ${inputId} уже является пользователем.`
      );
    }

    textHandler.session.waitingForAdminId = false;
  }
});

connectDB().then(() => {
  bot.launch();
  console.log('🤖 Бот запущен через long polling');
});
// Корректная остановка
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
