import {
  IconCoins,
  IconCurrencyDollar,
  IconCurrencyEuro,
  IconLetterR,
} from '@tabler/icons-react';
import type { DestCurrency } from '../lib/currencies.ts';

const ICONS: Record<DestCurrency, typeof IconCurrencyEuro> = {
  EUR: IconCurrencyEuro,
  ARS: IconCurrencyDollar,
  COP: IconCurrencyDollar,
  MXN: IconCurrencyDollar,
  ZAR: IconLetterR,
};

export function CurrencyIcon({ code, className }: { code: DestCurrency; className?: string }) {
  const Icon = ICONS[code] ?? IconCoins;
  return <Icon className={className} />;
}
