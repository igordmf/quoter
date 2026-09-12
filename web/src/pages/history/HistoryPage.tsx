import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../api/client.ts';
import { ApiError } from '../../api/errors.ts';
import { Notice } from '../../components/Notice.tsx';
import { API_PATHS } from '../../lib/apiPaths.ts';
import type { DestCurrency } from '../../lib/currencies.ts';
import { HistoryTable } from './HistoryTable.tsx';

type ExchangeRow = {
  id: string;
  destinationCurrencyCode: DestCurrency;
  currencyName: string;
  quantity: string;
  unitPriceBrl: string;
  totalPriceBrl: string;
  datetime: string;
};

export function HistoryPage() {
  const history = useQuery({
    queryKey: ['exchanges'],
    queryFn: async () => {
      const data = await apiFetch<{ exchanges: ExchangeRow[] }>(API_PATHS.exchanges);
      return data.exchanges;
    },
  });

  const rows = history.data ?? [];
  const errorText =
    history.error instanceof ApiError
      ? history.error.message
      : 'Could not load your history. Please try again.';

  return (
    <section>
      <h1 className="text-2xl font-semibold">History</h1>
      <p className="mt-1 text-sm text-slate-500">Confirmed quotes for the signed-in user.</p>
      {history.isPending ? <p className="mt-6 text-slate-500">Loading history…</p> : null}
      {history.isError ? (
        <div className="mt-6">
          <Notice kind="error">{errorText}</Notice>
          <button
            type="button"
            onClick={() => {
              void history.refetch();
            }}
            className="mt-3 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            Retry
          </button>
        </div>
      ) : null}
      {!history.isPending && !history.isError && rows.length === 0 ? (
        <p className="mt-6 text-slate-500">No confirmed quotes yet.</p>
      ) : null}
      {!history.isPending && !history.isError && rows.length > 0 ? <HistoryTable rows={rows} /> : null}
    </section>
  );
}
