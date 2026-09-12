import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { BINANCE_PAIRS, type DestCurrency } from '../lib/currencies.ts';
import { composeQuote, QuoteError, type QuoteResult } from '../lib/pricing.ts';
import type { BinanceBooks } from './binance.ts';
import type { OkxState } from './okx.ts';
import { useBinancePoll } from './useBinancePoll.ts';
import { useOkxFeed } from './useOkxFeed.ts';

export type { BinanceBooks };

export type MarketContextValue = {
  binance: BinanceBooks;
  okx: OkxState;
  quoteFor: (dest: DestCurrency, quantity: string, spread: string) => QuoteResult;
};

export const MarketContext = createContext<MarketContextValue | null>(null);

export function LiveMarketProvider({ children }: { children: ReactNode }) {
  const binance = useBinancePoll();
  const okx = useOkxFeed();

  const value = useMemo<MarketContextValue>(
    () => ({
      binance,
      okx,
      quoteFor(dest, quantity, spread) {
        return composeQuote({
          destQuantity: quantity,
          spread,
          binanceUsdtBrl: binance.usdtBrl,
          okxUsdtBrl: okx.book,
          binanceUsdtDest: binance.dest[dest] ?? null,
          destPairKind: BINANCE_PAIRS[dest].kind,
        });
      },
    }),
    [binance, okx],
  );

  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>;
}

export function useMarket() {
  const ctx = useContext(MarketContext);
  if (!ctx) {
    throw new Error('useMarket must be used within a market provider');
  }
  return ctx;
}

export { QuoteError };
