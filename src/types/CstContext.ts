import { Context } from "telegraf";

interface MySession {
  waitingForAdminId?: boolean;
}

export interface MyContext extends Context{
  session: MySession;
}
