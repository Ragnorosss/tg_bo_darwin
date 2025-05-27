import { MiddlewareFn } from "telegraf";
import { MyContext } from "../types/CstContext";
import { Message } from "telegraf/typings/core/types/typegram";

export const textHandler: MiddlewareFn<MyContext> = async (ctx) => {
  if (ctx.session.waitingForAdminId) {
    const msg = ctx.message;
    // Явная проверка на наличие поля text и что это строка
    if (msg && typeof (msg as any).text === 'string') {
      const inputId = (msg as Message.TextMessage).text.trim();
      await ctx.reply(`Введённый ID: ${inputId}`);
      ctx.session.waitingForAdminId = false;
    } else {
      await ctx.reply('Ожидается текстовое сообщение');
    }
  }
};
