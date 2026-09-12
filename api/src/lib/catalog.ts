import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const sharedDir = join(dirname(fileURLToPath(import.meta.url)), '../../../shared');

export type CurrencyCatalogRow = { code: string; currencyName: string };

export const CURRENCY_CATALOG = JSON.parse(
  readFileSync(join(sharedDir, 'currencies.json'), 'utf8'),
) as CurrencyCatalogRow[];

export const DEST_CURRENCY_ORDER = CURRENCY_CATALOG.map((row) => row.code);
