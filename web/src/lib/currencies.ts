import catalog from '../../../shared/currencies.json' with { type: 'json' };
import quote from '../../../shared/quote.json' with { type: 'json' };

export const DEST_CURRENCIES = catalog.map((row) => row.code) as unknown as readonly [
  'EUR',
  'ARS',
  'COP',
  'MXN',
  'ZAR',
];

export type DestCurrency = (typeof DEST_CURRENCIES)[number];

export const QUOTE_TTL_MS = quote.ttlMs;

export const CURRENCY_NAMES = Object.fromEntries(
  catalog.map((row) => [row.code, row.currencyName]),
) as Record<DestCurrency, string>;

/** Binance listing shape for USDT vs dest fiat. EUR is inverted (EURUSDT). */
export const BINANCE_PAIRS: Record<
  'BRL' | DestCurrency,
  { symbol: string; kind: 'usdt_base' | 'usdt_quote' }
> = {
  BRL: { symbol: 'USDTBRL', kind: 'usdt_base' },
  ARS: { symbol: 'USDTARS', kind: 'usdt_base' },
  COP: { symbol: 'USDTCOP', kind: 'usdt_base' },
  MXN: { symbol: 'USDTMXN', kind: 'usdt_base' },
  ZAR: { symbol: 'USDTZAR', kind: 'usdt_base' },
  EUR: { symbol: 'EURUSDT', kind: 'usdt_quote' },
};
