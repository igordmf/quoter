import Decimal from 'decimal.js';
import type { BookTop } from '../lib/pricing.ts';

const WS_URL = 'wss://ws.okx.com:8443/ws/v5/public';
const REST_URL = '/okx/api/v5/market/books?instId=USDT-BRL&sz=5';
const STALE_MS = 5_000;
const REST_INTERVAL_MS = 1_000;
const PING_MS = 20_000;
const FETCH_TIMEOUT_MS = 8_000;

type Listener = (state: OkxState) => void;

export type OkxState = {
  book: BookTop | null;
  available: boolean;
  source: 'websocket' | 'rest' | null;
  error: string | null;
};

type BooksPayload = {
  data?: Array<{
    asks?: string[][];
    bids?: string[][];
  }>;
};

function bookFromLevels(bids?: string[][], asks?: string[][]): BookTop | null {
  const bid = bids?.[0]?.[0];
  const ask = asks?.[0]?.[0];
  if (!bid || !ask) return null;
  const bidDec = new Decimal(bid);
  const askDec = new Decimal(ask);
  if (!bidDec.isFinite() || !askDec.isFinite() || bidDec.lte(0) || askDec.lte(0)) return null;
  return { bid: bidDec, ask: askDec };
}

export function createOkxFeed() {
  let socket: WebSocket | null = null;
  let lastMessageAt = 0;
  let restTimer: ReturnType<typeof setInterval> | null = null;
  let pingTimer: ReturnType<typeof setInterval> | null = null;
  let staleTimer: ReturnType<typeof setInterval> | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let stopped = false;
  let running = false;
  let restInFlight = false;
  const listeners = new Set<Listener>();
  let state: OkxState = { book: null, available: false, source: null, error: null };

  function emit(next: OkxState) {
    state = next;
    listeners.forEach((fn) => fn(state));
  }

  async function pollRest() {
    if (restInFlight || stopped) return;
    restInFlight = true;
    try {
      const response = await fetch(REST_URL, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
      if (!response.ok) {
        throw new Error('OKX REST error');
      }
      let body: unknown;
      try {
        body = await response.json();
      } catch {
        throw new Error('OKX REST invalid json');
      }
      const payload = body as BooksPayload;
      const book = bookFromLevels(payload.data?.[0]?.bids, payload.data?.[0]?.asks);
      if (!book) {
        throw new Error('OKX REST empty book');
      }
      emit({ book, available: true, source: 'rest', error: null });
    } catch {
      if (stopped) return;
      emit({
        book: state.book,
        available: Boolean(state.book),
        source: state.book ? state.source : null,
        error: 'OKX is unreachable. Using Binance only for USDT/BRL when possible.',
      });
    } finally {
      restInFlight = false;
    }
  }

  function startRestFallback() {
    if (restTimer) return;
    void pollRest();
    restTimer = setInterval(() => {
      void pollRest();
    }, REST_INTERVAL_MS);
  }

  function stopRestFallback() {
    if (restTimer) {
      clearInterval(restTimer);
      restTimer = null;
    }
  }

  function connect() {
    socket = new WebSocket(WS_URL);
    socket.addEventListener('open', () => {
      socket?.send(
        JSON.stringify({
          op: 'subscribe',
          args: [{ channel: 'books5', instId: 'USDT-BRL' }],
        }),
      );
      pingTimer = setInterval(() => {
        socket?.send('ping');
      }, PING_MS);
    });
    socket.addEventListener('message', (event) => {
      const raw = String(event.data);
      if (raw === 'pong') {
        lastMessageAt = Date.now();
        return;
      }
      let payload: BooksPayload & { event?: string };
      try {
        payload = JSON.parse(raw) as BooksPayload & { event?: string };
      } catch {
        return;
      }
      const book = bookFromLevels(payload.data?.[0]?.bids, payload.data?.[0]?.asks);
      if (!book) return;
      lastMessageAt = Date.now();
      stopRestFallback();
      emit({ book, available: true, source: 'websocket', error: null });
    });
    socket.addEventListener('close', () => {
      if (pingTimer) clearInterval(pingTimer);
      pingTimer = null;
      if (stopped) return;
      startRestFallback();
      reconnectTimer = window.setTimeout(connect, 2_000);
    });
    socket.addEventListener('error', () => {
      socket?.close();
    });
  }

  function start() {
    if (running) return;
    running = true;
    stopped = false;
    connect();
    staleTimer = setInterval(() => {
      if (!lastMessageAt || Date.now() - lastMessageAt > STALE_MS) {
        startRestFallback();
      }
    }, 1_000);
  }

  function stop() {
    running = false;
    stopped = true;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    socket?.close();
    socket = null;
    stopRestFallback();
    if (pingTimer) clearInterval(pingTimer);
    if (staleTimer) clearInterval(staleTimer);
  }

  function subscribe(fn: Listener) {
    listeners.add(fn);
    fn(state);
    return () => listeners.delete(fn);
  }

  return { start, stop, subscribe, getState: () => state };
}
