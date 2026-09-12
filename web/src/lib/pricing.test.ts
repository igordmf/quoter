import { describe, expect, it } from 'vitest';
import { composeQuote, Decimal } from './pricing.ts';

describe('composeQuote', () => {
  it('matches the 100 MXN reference at 0.6% spread', () => {
    const quote = composeQuote({
      destQuantity: 100,
      spread: '0.006',
      binanceUsdtBrl: { bid: new Decimal('4.99'), ask: new Decimal('5.00') },
      okxUsdtBrl: null,
      binanceUsdtDest: { bid: new Decimal('16.00'), ask: new Decimal('16.02') },
      destPairKind: 'usdt_base',
    });
    expect(quote.totalPriceBrl.toFixed(2)).toBe('31.44');
  });

  it('quotes via Binance when OKX is missing', () => {
    const quote = composeQuote({
      destQuantity: 100,
      spread: '0',
      binanceUsdtBrl: { bid: new Decimal('4.99'), ask: new Decimal('5.00') },
      okxUsdtBrl: null,
      binanceUsdtDest: { bid: new Decimal('16.00'), ask: new Decimal('16.02') },
      destPairKind: 'usdt_base',
    });
    expect(quote.brlSource).toBe('binance');
    expect(quote.okxUnavailable).toBe(true);
    expect(quote.totalPriceBrl.toFixed(2)).toBe('31.25');
  });

  it('does not quote when Binance books are missing', () => {
    expect(() =>
      composeQuote({
        destQuantity: 100,
        spread: '0',
        binanceUsdtBrl: null,
        okxUsdtBrl: { bid: new Decimal('4.98'), ask: new Decimal('5.00') },
        binanceUsdtDest: { bid: new Decimal('16.00'), ask: new Decimal('16.02') },
        destPairKind: 'usdt_base',
      }),
    ).toThrow(/Binance prices are unavailable/);
  });

  it('picks the cheaper USDT/BRL ask', () => {
    const quote = composeQuote({
      destQuantity: 100,
      spread: '0',
      binanceUsdtBrl: { bid: new Decimal('4.99'), ask: new Decimal('5.10') },
      okxUsdtBrl: { bid: new Decimal('4.98'), ask: new Decimal('5.00') },
      binanceUsdtDest: { bid: new Decimal('16.00'), ask: new Decimal('16.02') },
      destPairKind: 'usdt_base',
    });
    expect(quote.brlSource).toBe('okx');
    expect(quote.totalPriceBrl.toFixed(2)).toBe('31.25');
  });
});
