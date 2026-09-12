import { LiveMarketProvider } from '../../market/MarketContext.tsx';
export function QuotePage() {
  return (
    <LiveMarketProvider>
    <section>
      <h1 className="text-2xl font-semibold">Quote</h1>
      <p className="mt-2 text-slate-500">Currency selection and quote creation will go here.</p>
    </section>
    </LiveMarketProvider>
  );
}
