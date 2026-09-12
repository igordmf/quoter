import { type ReactNode } from 'react';
import Decimal from 'decimal.js';
import { BINANCE_PAIRS, DEST_CURRENCIES, type DestCurrency } from '../lib/currencies.ts';
import type { BookTop } from '../lib/pricing.ts';
import { composeQuote } from '../lib/pricing.ts';
import { MarketContext, type BinanceBooks, type MarketContextValue } from '../market/MarketContext.tsx';
import type { OkxState } from '../market/okx.ts';
import prices from './prices.json';

function book(pair: { bid: string; ask: string }): BookTop {
  return { bid: new Decimal(pair.bid), ask: new Decimal(pair.ask) };
}

const dest: Partial<Record<DestCurrency, BookTop>> = {};
for (const code of DEST_CURRENCIES) {
  dest[code] = book(prices.binance[BINANCE_PAIRS[code].symbol as keyof typeof prices.binance]);
}

const binance: BinanceBooks = {
  usdtBrl: book(prices.binance.USDTBRL),
  dest,
  error: null,
  updatedAt: null,
};

const okx: OkxState = {
  book: book(prices.okx['USDT-BRL']),
  available: true,
  source: 'websocket',
  error: null,
};

const value: MarketContextValue = {
  binance,
  okx,
  quoteFor(destCode, quantity, spread) {
    return composeQuote({
      destQuantity: quantity,
      spread,
      binanceUsdtBrl: binance.usdtBrl,
      okxUsdtBrl: okx.book,
      binanceUsdtDest: binance.dest[destCode] ?? null,
      destPairKind: BINANCE_PAIRS[destCode].kind,
    });
  },
};

export function SimMarketProvider({ children }: { children: ReactNode }) {
  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>;
}
