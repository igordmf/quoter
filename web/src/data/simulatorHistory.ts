import { ApiError } from '../api/errors.ts';
import { CURRENCY_NAMES, QUOTE_TTL_MS } from '../lib/currencies.ts';
import { STORAGE_KEYS } from '../lib/storageKeys.ts';
import type { ConfirmInput, ExchangeRow } from './types.ts';

function historyKey(username: string) {
  return `${STORAGE_KEYS.historyPrefix}${username}`;
}

export function readHistory(username: string): ExchangeRow[] {
  const raw = localStorage.getItem(historyKey(username));
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ExchangeRow[];
  } catch {
    return [];
  }
}

function writeHistory(username: string, rows: ExchangeRow[]) {
  localStorage.setItem(historyKey(username), JSON.stringify(rows));
}

export function confirmSimulatorExchange(username: string, input: ConfirmInput): ExchangeRow {
  const quotedAt = new Date(input.quotedAt).getTime();
  if (Number.isNaN(quotedAt) || Date.now() - quotedAt > QUOTE_TTL_MS) {
    throw new ApiError(409, 'quote_expired', 'This quote expired. Create a new quote to continue.');
  }
  const rows = readHistory(username);
  if (rows.some((row) => row.clientQuoteId === input.clientQuoteId)) {
    throw new ApiError(409, 'already_confirmed', 'This quote was already confirmed. Check your history.');
  }
  const row: ExchangeRow = {
    id: input.clientQuoteId,
    destinationCurrencyCode: input.destinationCurrencyCode,
    currencyName: CURRENCY_NAMES[input.destinationCurrencyCode],
    quantity: input.quantity,
    unitPriceBrl: input.unitPriceBrl,
    totalPriceBrl: input.totalPriceBrl,
    datetime: new Date().toISOString(),
    clientQuoteId: input.clientQuoteId,
  };
  writeHistory(username, [row, ...rows]);
  return row;
}
