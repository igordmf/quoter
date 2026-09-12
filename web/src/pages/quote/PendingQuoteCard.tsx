import type { PendingQuote } from './pendingQuote.ts';

type Props = {
  pending: PendingQuote;
  expired: boolean;
  remainingMs: number;
  confirming: boolean;
  onConfirm: () => void;
};

export function PendingQuoteCard({ pending, expired, remainingMs, confirming, onConfirm }: Props) {
  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">Cost in BRL</p>
      <p className="text-3xl font-semibold">R$ {pending.totalPriceBrl}</p>
      <p className="mt-1 text-sm text-slate-500">Unit: R$ {pending.unitPriceBrl}</p>
      <p className={`mt-3 text-sm ${expired ? 'text-amber-800' : 'text-slate-600'}`}>
        {expired
          ? 'This quote expired. Create a new quote to continue.'
          : `Valid for ${(remainingMs / 1000).toFixed(1)}s`}
      </p>
      <button
        type="button"
        disabled={expired || confirming}
        onClick={onConfirm}
        className="mt-4 w-full rounded-lg border border-emerald-700 px-3 py-2 font-medium text-emerald-800 hover:bg-emerald-50 disabled:opacity-60"
      >
        {confirming ? 'Confirming…' : 'Confirm'}
      </button>
    </div>
  );
}
