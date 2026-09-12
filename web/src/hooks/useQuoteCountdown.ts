import { useEffect, useState } from 'react';

export function useQuoteCountdown(active: boolean) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!active) return;
    const tick = () => setNow(Date.now());
    tick();
    const timer = setInterval(tick, 100);
    return () => clearInterval(timer);
  }, [active]);

  return now;
}
