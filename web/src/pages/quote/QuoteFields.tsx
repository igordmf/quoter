import { CurrencyIcon } from '../../components/CurrencyIcon.tsx';
import type { DestCurrency } from '../../lib/currencies.ts';

type CurrencyOption = { code: DestCurrency; currencyName: string };

type Props = {
  dest: DestCurrency;
  quantity: string;
  options: CurrencyOption[];
  binanceDown: boolean;
  onDestChange: (code: DestCurrency) => void;
  onQuantityChange: (value: string) => void;
  onCreate: () => void;
};

export function QuoteFields({
  dest,
  quantity,
  options,
  binanceDown,
  onDestChange,
  onQuantityChange,
  onCreate,
}: Props) {
  return (
    <div className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <label className="block text-sm font-medium" htmlFor="dest">
        Destination currency
      </label>
      <div className="flex items-center gap-2">
        <CurrencyIcon code={dest} className="h-6 w-6 text-emerald-700 dark:text-emerald-400" />
        <select
          id="dest"
          value={dest}
          onChange={(event) => onDestChange(event.target.value as DestCurrency)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
        >
          {options.map((row) => (
            <option key={row.code} value={row.code}>
              {row.code} — {row.currencyName}
            </option>
          ))}
        </select>
      </div>

      <label className="block text-sm font-medium" htmlFor="qty">
        Quantity
      </label>
      <input
        id="qty"
        type="number"
        min="0"
        step="any"
        value={quantity}
        onChange={(event) => onQuantityChange(event.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
      />

      <button
        type="button"
        onClick={onCreate}
        disabled={binanceDown}
        className="w-full rounded-lg bg-emerald-700 px-3 py-2 font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
      >
        Create quote
      </button>
    </div>
  );
}
