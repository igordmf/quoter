import { useEffect, useState } from 'react';
import { fetchBinanceBooks, type BinanceBooks } from './binance.ts';

const BINANCE_POLL_MS = 2_000;

const emptyBinance: BinanceBooks = { usdtBrl: null, dest: {}, error: null, updatedAt: null };

function isAbortError(error: unknown) {
  return error instanceof DOMException && (error.name === 'AbortError' || error.name === 'TimeoutError');
}

export function useBinancePoll(): BinanceBooks {
  const [binance, setBinance] = useState<BinanceBooks>(emptyBinance);

  useEffect(() => {
    const controller = new AbortController();
    let inFlight = false;

    async function poll() {
      if (inFlight) return;
      inFlight = true;
      try {
        const next = await fetchBinanceBooks(controller.signal);
        setBinance(next);
      } catch (error) {
        if (isAbortError(error) && controller.signal.aborted) {
          return;
        }
        const message =
          error instanceof Error
            ? error.message
            : 'Binance is unavailable. Quotes cannot be created until it recovers.';
        setBinance({ usdtBrl: null, dest: {}, error: message, updatedAt: null });
      } finally {
        inFlight = false;
      }
    }

    void poll();
    const timer = setInterval(() => {
      void poll();
    }, BINANCE_POLL_MS);
    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, []);

  return binance;
}
