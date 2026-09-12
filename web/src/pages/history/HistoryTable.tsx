import { format } from 'date-fns';
import { CurrencyIcon } from '../../components/CurrencyIcon.tsx';
import type { DestCurrency } from '../../lib/currencies.ts';

export type HistoryRow = {
  id: string;
  destinationCurrencyCode: DestCurrency;
  currencyName: string;
  quantity: string;
  unitPriceBrl: string;
  totalPriceBrl: string;
  datetime: string;
};

export function HistoryTable({ rows }: { rows: HistoryRow[] }) {
  return (
    <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3 font-medium">Currency</th>
            <th className="px-4 py-3 font-medium">Quantity</th>
            <th className="px-4 py-3 font-medium">Unit price</th>
            <th className="px-4 py-3 font-medium">Total (BRL)</th>
            <th className="px-4 py-3 font-medium">Date</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-slate-100 last:border-0">
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-2">
                  <CurrencyIcon
                    code={row.destinationCurrencyCode}
                    className="h-4 w-4 text-emerald-700"
                  />
                  {row.destinationCurrencyCode} · {row.currencyName}
                </span>
              </td>
              <td className="px-4 py-3">{row.quantity}</td>
              <td className="px-4 py-3">R$ {row.unitPriceBrl}</td>
              <td className="px-4 py-3">R$ {row.totalPriceBrl}</td>
              <td className="px-4 py-3">{format(new Date(row.datetime), 'dd MMM yyyy HH:mm:ss')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
