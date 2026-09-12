import type { DestCurrency } from '../../lib/currencies.ts';

export type PendingQuote = {
  clientQuoteId: string;
  dest: DestCurrency;
  quantity: string;
  unitPriceBrl: string;
  totalPriceBrl: string;
  quotedAt: string;
  expiresAt: number;
  brlSource: 'binance' | 'okx';
  okxUnavailable: boolean;
};
