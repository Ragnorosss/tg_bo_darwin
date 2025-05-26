import { Context } from 'telegraf';
type Timeframe =
  | 's5'
  | 's15'
  | 's30'
  | 'm1'
  | 'm3'
  | 'm5'
  | 'm30'
  | 'h1'
  | 'h4';
interface MySession {
  waitingForAdminId?: boolean;
  action?: string;
  selectedPair?: string;
  selectedTimeframe?: string;
  selectedType?: string;
  authorizedInQountex?: boolean;
}

export interface MyContext extends Context {
  session: MySession;
}
