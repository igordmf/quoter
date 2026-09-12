import type { DestCurrency } from '../lib/currencies.ts';

export type CurrencyRow = { code: DestCurrency; currencyName: string };

export type ExchangeRow = {
  id: string;
  destinationCurrencyCode: DestCurrency;
  currencyName: string;
  quantity: string;
  unitPriceBrl: string;
  totalPriceBrl: string;
  datetime: string;
  clientQuoteId: string;
};

export type ConfirmInput = {
  clientQuoteId: string;
  destinationCurrencyCode: DestCurrency;
  quantity: string;
  unitPriceBrl: string;
  totalPriceBrl: string;
  quotedAt: string;
};
