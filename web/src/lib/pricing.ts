import Decimal from 'decimal.js';

Decimal.set({ precision: 40, rounding: Decimal.ROUND_HALF_UP });

export { Decimal };

export function ceil2(value: Decimal.Value): Decimal {
  return new Decimal(value).toDecimalPlaces(2, Decimal.ROUND_UP);
}

export type BookTop = {
  bid: Decimal;
  ask: Decimal;
};

export type QuoteInputs = {
  destQuantity: Decimal.Value;
  spread: Decimal.Value;
  binanceUsdtBrl: BookTop | null;
  okxUsdtBrl: BookTop | null;
  binanceUsdtDest: BookTop | null;
  destPairKind: 'usdt_base' | 'usdt_quote';
};

export type QuoteResult = {
  usdtAmount: Decimal;
  brlAskUsed: Decimal;
  brlSource: 'binance' | 'okx';
  destPerUsdt: Decimal;
  totalPriceBrl: Decimal;
  unitPriceBrl: Decimal;
  okxUnavailable: boolean;
};

export class QuoteError extends Error {
  readonly code: 'binance_unavailable' | 'invalid_quantity' | 'invalid_book';

  constructor(code: 'binance_unavailable' | 'invalid_quantity' | 'invalid_book', message: string) {
    super(message);
    this.name = 'QuoteError';
    this.code = code;
  }
}

function usdtNeededForDest(
  destQuantity: Decimal,
  destBook: BookTop,
  kind: 'usdt_base' | 'usdt_quote',
): { usdt: Decimal; destPerUsdt: Decimal } {
  if (kind === 'usdt_base') {
    if (destBook.bid.lte(0)) {
      throw new QuoteError('invalid_book', 'Destination bid is invalid.');
    }
    return { usdt: destQuantity.div(destBook.bid), destPerUsdt: destBook.bid };
  }
  if (destBook.ask.lte(0)) {
    throw new QuoteError('invalid_book', 'Destination ask is invalid.');
  }
  return { usdt: destQuantity.mul(destBook.ask), destPerUsdt: new Decimal(1).div(destBook.ask) };
}

export function composeQuote(input: QuoteInputs): QuoteResult {
  const destQuantity = new Decimal(input.destQuantity);
  if (!destQuantity.isFinite() || destQuantity.lte(0)) {
    throw new QuoteError('invalid_quantity', 'Enter a quantity greater than zero.');
  }
  if (!input.binanceUsdtBrl || !input.binanceUsdtDest) {
    throw new QuoteError(
      'binance_unavailable',
      'Binance prices are unavailable. Quotes cannot be created right now.',
    );
  }

  const binanceAsk = input.binanceUsdtBrl.ask;
  const okxAsk = input.okxUsdtBrl?.ask ?? null;
  const okxUnavailable = !okxAsk;
  let brlAskUsed = binanceAsk;
  let brlSource: 'binance' | 'okx' = 'binance';
  if (okxAsk && okxAsk.lt(binanceAsk)) {
    brlAskUsed = okxAsk;
    brlSource = 'okx';
  }
  if (brlAskUsed.lte(0)) {
    throw new QuoteError('invalid_book', 'USDT/BRL ask is invalid.');
  }

  const { usdt, destPerUsdt } = usdtNeededForDest(
    destQuantity,
    input.binanceUsdtDest,
    input.destPairKind,
  );
  const gross = usdt.mul(brlAskUsed);
  const totalPriceBrl = ceil2(gross.mul(new Decimal(1).plus(input.spread)));
  const unitPriceBrl = ceil2(totalPriceBrl.div(destQuantity));

  return {
    usdtAmount: usdt,
    brlAskUsed,
    brlSource,
    destPerUsdt,
    totalPriceBrl,
    unitPriceBrl,
    okxUnavailable,
  };
}
