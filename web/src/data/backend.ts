import { apiFetch } from '../api/client.ts';
import { ApiError } from '../api/errors.ts';
import type { SessionUser } from '../api/session.ts';
import { API_PATHS } from '../lib/apiPaths.ts';
import { CURRENCY_NAMES, DEST_CURRENCIES } from '../lib/currencies.ts';
import { isSimulator } from '../mode.ts';
import users from '../simulator/users.json';
import { confirmSimulatorExchange, readHistory } from './simulatorHistory.ts';
import type { ConfirmInput, CurrencyRow, ExchangeRow } from './types.ts';

export type { ConfirmInput, CurrencyRow, ExchangeRow } from './types.ts';

const CURRENCIES: CurrencyRow[] = DEST_CURRENCIES.map((code) => ({
  code,
  currencyName: CURRENCY_NAMES[code],
}));

export async function loginRequest(username: string): Promise<{ token: string; user: SessionUser }> {
  const name = username.trim().toLowerCase();
  if (isSimulator()) {
    if (!name) {
      throw new ApiError(400, 'invalid_username', 'Enter a username.');
    }
    const spread = (users as Record<string, string>)[name] ?? '0';
    return {
      token: 'simulator',
      user: { id: name, name, spread },
    };
  }
  return apiFetch(API_PATHS.login, {
    method: 'POST',
    body: JSON.stringify({ username: name }),
  });
}

export async function listCurrencies(): Promise<CurrencyRow[]> {
  if (isSimulator()) return CURRENCIES;
  const data = await apiFetch<{ currencies: CurrencyRow[] }>(API_PATHS.currencies);
  return data.currencies;
}

export async function listExchanges(username: string): Promise<ExchangeRow[]> {
  if (isSimulator()) return readHistory(username);
  const data = await apiFetch<{ exchanges: ExchangeRow[] }>(API_PATHS.exchanges);
  return data.exchanges;
}

export async function confirmExchange(username: string, input: ConfirmInput): Promise<ExchangeRow> {
  if (isSimulator()) {
    return confirmSimulatorExchange(username, input);
  }
  const data = await apiFetch<{ exchange: ExchangeRow }>(API_PATHS.exchanges, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return data.exchange;
}
