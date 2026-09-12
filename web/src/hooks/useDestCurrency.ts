import { useCallback, useState } from 'react';
import { DEST_CURRENCIES, type DestCurrency } from '../lib/currencies.ts';
import { STORAGE_KEYS } from '../lib/storageKeys.ts';

function readStoredDest(): DestCurrency {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.destCurrency);
    if (raw && (DEST_CURRENCIES as readonly string[]).includes(raw)) {
      return raw as DestCurrency;
    }
  } catch {
    /* ignore */
  }
  return DEST_CURRENCIES[0];
}

export function useDestCurrency() {
  const [dest, setDestState] = useState<DestCurrency>(readStoredDest);

  const setDest = useCallback((next: DestCurrency) => {
    setDestState(next);
    try {
      localStorage.setItem(STORAGE_KEYS.destCurrency, next);
    } catch {
      /* private mode */
    }
  }, []);

  return [dest, setDest] as const;
}
