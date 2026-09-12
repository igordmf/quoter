import { LiveMarketProvider } from '../../market/MarketContext.tsx';
import { isSimulator } from '../../mode.ts';
import { SimMarketProvider } from '../../simulator/SimMarketProvider.tsx';
import { QuoteForm } from './QuoteForm.tsx';

const MarketProvider = isSimulator() ? SimMarketProvider : LiveMarketProvider;

export function QuotePage() {
  return (
    <MarketProvider>
      <QuoteForm />
    </MarketProvider>
  );
}
