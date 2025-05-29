import { Context } from 'telegraf';

interface MySession {
  waitingForAdminId?: boolean;
  action?: string;
  selectedPair?: string;
  selectedTimeframe?: string;
  selectedType?: string;
  authorizedInQountex?: boolean;
  waitingForTraderId?: boolean;
  waitingForUserInfoId?: boolean;
  waitingForSupportLink?: true | false;
}

export interface MyContext extends Context {
  session: MySession;
}
