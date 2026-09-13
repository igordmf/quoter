import { useQuery } from '@tanstack/react-query';
import { ApiError } from '../../api/errors.ts';
import { useAuth } from '../../auth/AuthContext.tsx';
import { Notice } from '../../components/Notice.tsx';
import { listExchanges } from '../../data/backend.ts';
import { HistoryTable } from './HistoryTable.tsx';

export function HistoryPage() {
  const { user } = useAuth();
  const history = useQuery({
    queryKey: ['exchanges', user?.name],
    queryFn: () => listExchanges(user!.name),
    enabled: Boolean(user),
  });

  const rows = history.data ?? [];
  const errorText =
    history.error instanceof ApiError
      ? history.error.message
      : 'Could not load your history. Please try again.';

  return (
    <section>
      <h1 className="text-2xl font-semibold">History</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Confirmed quotes for the signed-in user.
      </p>
      {history.isPending ? (
        <p className="mt-6 text-slate-500 dark:text-slate-400">Loading history…</p>
      ) : null}
      {history.isError ? (
        <div className="mt-6">
          <Notice kind="error">{errorText}</Notice>
          <button
            type="button"
            onClick={() => {
              void history.refetch();
            }}
            className="mt-3 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Retry
          </button>
        </div>
      ) : null}
      {!history.isPending && !history.isError && rows.length === 0 ? (
        <p className="mt-6 text-slate-500 dark:text-slate-400">No confirmed quotes yet.</p>
      ) : null}
      {!history.isPending && !history.isError && rows.length > 0 ? <HistoryTable rows={rows} /> : null}
    </section>
  );
}
