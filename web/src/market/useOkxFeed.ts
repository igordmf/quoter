import { useEffect, useState } from 'react';
import { createOkxFeed, type OkxState } from './okx.ts';

const emptyOkx: OkxState = {
  book: null,
  available: false,
  source: null,
  error: null,
};

export function useOkxFeed(): OkxState {
  const [okx, setOkx] = useState<OkxState>(emptyOkx);

  useEffect(() => {
    const feed = createOkxFeed();
    const unsub = feed.subscribe(setOkx);
    feed.start();
    return () => {
      unsub();
      feed.stop();
    };
  }, []);

  return okx;
}
