import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { apiFetch } from '../../api/client.ts';
import { ApiError } from '../../api/errors.ts';
import { useAuth } from '../../auth/AuthContext.tsx';
import { Notice } from '../../components/Notice.tsx';
import { useDestCurrency } from '../../hooks/useDestCurrency.ts';
import { useQuoteCountdown } from '../../hooks/useQuoteCountdown.ts';
import { API_PATHS } from '../../lib/apiPaths.ts';
import { DEST_CURRENCIES, QUOTE_TTL_MS } from '../../lib/currencies.ts';
import { QuoteError, useMarket } from '../../market/MarketContext.tsx';
import { PendingQuoteCard } from './PendingQuoteCard.tsx';
import { QuoteFields } from './QuoteFields.tsx';
import type { PendingQuote } from './pendingQuote.ts';

type CurrencyRow = { code: (typeof DEST_CURRENCIES)[number]; currencyName: string };

export function QuoteForm() {
  const { user } = useAuth();
  const { binance, okx, quoteFor } = useMarket();
  const queryClient = useQueryClient();
  const [dest, setDest] = useDestCurrency();
  const [quantity, setQuantity] = useState('1');
  const [pending, setPending] = useState<PendingQuote | null>(null);
  const [message, setMessage] = useState<{ kind: 'error' | 'warning' | 'success'; text: string } | null>(
    null,
  );
  const now = useQuoteCountdown(Boolean(pending));

  const currencies = useQuery({
    queryKey: ['currencies'],
    queryFn: () =>
      apiFetch<{ currencies: CurrencyRow[] }>(API_PATHS.currencies).then((data) => data.currencies),
  });

  const remainingMs = pending ? Math.max(0, pending.expiresAt - now) : 0;
  const expired = Boolean(pending && remainingMs <= 0);

  const confirmMutation = useMutation({
    mutationFn: (quote: PendingQuote) =>
      apiFetch(API_PATHS.exchanges, {
        method: 'POST',
        body: JSON.stringify({
          clientQuoteId: quote.clientQuoteId,
          destinationCurrencyCode: quote.dest,
          quantity: quote.quantity,
          unitPriceBrl: quote.unitPriceBrl,
          totalPriceBrl: quote.totalPriceBrl,
          quotedAt: quote.quotedAt,
        }),
      }),
    onSuccess: async () => {
      setMessage({ kind: 'success', text: 'Quote confirmed and saved to your history.' });
      setPending(null);
      await queryClient.invalidateQueries({ queryKey: ['exchanges'] });
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        setMessage({ kind: error.code === 'quote_expired' ? 'warning' : 'error', text: error.message });
        return;
      }
      setMessage({ kind: 'error', text: 'Could not confirm the quote. Please try again.' });
    },
  });

  const options = useMemo(() => {
    const fromApi = currencies.data ?? [];
    if (fromApi.length) return fromApi;
    return DEST_CURRENCIES.map((code) => ({ code, currencyName: code }));
  }, [currencies.data]);

  function createQuote() {
    if (binance.error) return;
    setMessage(null);
    try {
      const quote = quoteFor(dest, quantity, user!.spread);
      const quotedAt = new Date();
      setPending({
        clientQuoteId: uuidv4(),
        dest,
        quantity,
        unitPriceBrl: quote.unitPriceBrl.toFixed(2),
        totalPriceBrl: quote.totalPriceBrl.toFixed(2),
        quotedAt: quotedAt.toISOString(),
        expiresAt: quotedAt.getTime() + QUOTE_TTL_MS,
        brlSource: quote.brlSource,
        okxUnavailable: quote.okxUnavailable,
      });
      if (quote.okxUnavailable) {
        setMessage({
          kind: 'warning',
          text: 'OKX is unavailable. This quote uses Binance for USDT/BRL.',
        });
      }
    } catch (error) {
      setPending(null);
      if (error instanceof QuoteError) {
        setMessage({ kind: 'error', text: error.message });
        return;
      }
      setMessage({ kind: 'error', text: 'Market data was invalid. Quotes cannot be created right now.' });
    }
  }

  function confirmQuote() {
    if (!pending) return;
    if (Date.now() > pending.expiresAt) {
      setMessage({
        kind: 'warning',
        text: 'This quote expired. Create a new quote to continue.',
      });
      return;
    }
    confirmMutation.mutate(pending);
  }

  const currencyError =
    currencies.isError && currencies.error instanceof ApiError
      ? currencies.error.message
      : currencies.isError
        ? 'Could not load currencies. Using the built-in list.'
        : null;

  return (
    <section className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold">Quote</h1>
      <p className="mt-1 text-sm text-slate-500">
        Spread: <span className="font-semibold">{(Number(user?.spread) * 100).toFixed(1)}%</span>
      </p>

      {binance.error ? (
        <Notice kind="error" className="mt-4">
          {binance.error}
        </Notice>
      ) : null}
      {okx.error ? (
        <Notice kind="warning" className="mt-4">
          {okx.error}
        </Notice>
      ) : null}
      {currencyError ? (
        <Notice kind="warning" className="mt-4">
          {currencyError}
        </Notice>
      ) : null}

      <QuoteFields
        dest={dest}
        quantity={quantity}
        options={options}
        binanceDown={Boolean(binance.error)}
        onDestChange={setDest}
        onQuantityChange={setQuantity}
        onCreate={createQuote}
      />

      {pending ? (
        <PendingQuoteCard
          pending={pending}
          expired={expired}
          remainingMs={remainingMs}
          confirming={confirmMutation.isPending}
          onConfirm={confirmQuote}
        />
      ) : null}

      {message ? (
        <Notice kind={message.kind} className="mt-4">
          {message.text}
        </Notice>
      ) : null}
    </section>
  );
}
