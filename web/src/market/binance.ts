import Decimal from 'decimal.js';
import { BINANCE_PAIRS, DEST_CURRENCIES, type DestCurrency } from '../lib/currencies.ts';
import type { BookTop } from '../lib/pricing.ts';

export type BinanceBooks = {
  usdtBrl: BookTop | null;
  dest: Partial<Record<DestCurrency, BookTop>>;
  error: string | null;
  updatedAt: number | null;
};

type Ticker = { symbol: string; bidPrice: string; askPrice: string };

const SYMBOLS = ['USDTBRL', ...DEST_CURRENCIES.map((code) => BINANCE_PAIRS[code].symbol)];
const FETCH_TIMEOUT_MS = 8_000;

export class BinanceMarketError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BinanceMarketError';
  }
}

function parseBook(ticker: Ticker | undefined): BookTop | null {
  if (!ticker) return null;
  const bid = new Decimal(ticker.bidPrice);
  const ask = new Decimal(ticker.askPrice);
  if (!bid.isFinite() || !ask.isFinite() || bid.lte(0) || ask.lte(0)) return null;
  return { bid, ask };
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && (error.name === 'AbortError' || error.name === 'TimeoutError');
}

export async function fetchBinanceBooks(signal?: AbortSignal): Promise<BinanceBooks> {
  const timeout = AbortSignal.timeout(FETCH_TIMEOUT_MS);
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;
  const params = new URLSearchParams({
    symbols: JSON.stringify(SYMBOLS),
  });

  let response: Response;
  try {
    response = await fetch(`/binance/api/v3/ticker/bookTicker?${params.toString()}`, {
      signal: combined,
    });
  } catch (error) {
    if (isAbortError(error) && signal?.aborted) {
      throw error;
    }
    if (isAbortError(error)) {
      throw new BinanceMarketError('Binance timed out. Quotes cannot be created until it recovers.');
    }
    throw new BinanceMarketError('Binance is unavailable. Quotes cannot be created until it recovers.');
  }

  if (response.status === 429 || response.status === 418) {
    throw new BinanceMarketError(
      'Binance rate-limited this IP. Quotes cannot be created until it recovers.',
    );
  }
  if (!response.ok) {
    throw new BinanceMarketError('Binance is unavailable. Quotes cannot be created until it recovers.');
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new BinanceMarketError('Binance returned invalid market data.');
  }
  if (!Array.isArray(body)) {
    throw new BinanceMarketError('Binance returned invalid market data.');
  }

  const tickers = body as Ticker[];
  const bySymbol = new Map(tickers.map((row) => [row.symbol, row]));
  const dest: Partial<Record<DestCurrency, BookTop>> = {};
  for (const code of DEST_CURRENCIES) {
    const top = parseBook(bySymbol.get(BINANCE_PAIRS[code].symbol));
    if (top) dest[code] = top;
  }
  return {
    usdtBrl: parseBook(bySymbol.get('USDTBRL')),
    dest,
    error: null,
    updatedAt: Date.now(),
  };
}
