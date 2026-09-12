import { LiveMarketProvider } from '../../market/MarketContext.tsx';
import { QuoteForm } from './QuoteForm.tsx';

export function QuotePage() {
  return (
    <LiveMarketProvider>
      <QuoteForm />
    </LiveMarketProvider>
  );
}
