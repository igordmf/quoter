# Quoter — BRL → Fiat

Web app to quote and confirm BRL purchases of EUR, ARS, COP, MXN, and ZAR using USDT as the bridge currency.

## Layout

- `api/` — Express + TypeScript + Prisma (SQLite). Login, currencies, confirmed history.
- `web/` — Vite + React. Quotes (Binance REST + OKX WebSocket in live mode).

## Prerequisites

- Node.js 20+
- npm

Clone this repository, then follow the blocks below.

## Live mode (API + web)

```bash
# API
cd api
npm install
cp .env.example .env
npx prisma migrate dev
npx prisma db seed
npm run dev
```

API `npm run dev` uses nodemon and restarts when files under `api/src` change. `npm test` runs HTTP checks against a throwaway SQLite database (not `dev.db`).

```bash
# Web (another terminal)
cd web
npm install
cp .env.example .env
npm run dev
```

Open the Vite URL (default `http://localhost:5173`). Unauthenticated visits go to `/login`. After login the app is `/quote`; confirmed quotes are `/history`. Log in as `alice`, `bob`, or `carol` (no password).

Moon/sun on login and in the sidebar switches light and dark. The choice is stored in `localStorage` (`quoter.theme`, default light) and is shared by live and simulator. Simulator dark is amber-tinted, not the live slate palette.

Spreads:

| username | spread |
| -------- | ------ |
| alice    | 0%     |
| bob      | 0.6%   |
| carol    | 1%     |

Live USDT/BRL and destination prices refresh while you stay on `/quote` (Binance REST poll plus OKX WebSocket). Create quote reads the last in-memory tickers.

## Simulator mode (frontend only)

No API and no network. Prices come from `web/src/simulator/prices.json`. Login, quotes, expiry, confirmation, and history use `localStorage`.

1. In `web/`:

   ```bash
   cd web
   npm install
   cp .env.example .env
   ```

2. In `web/.env` set:

   ```
   VITE_SIMULATOR=true
   ```

3. Start only the web app:

   ```bash
   npm run dev
   ```

Any username is accepted. `alice` / `bob` / `carol` keep the same spreads as live; other names use 0%.

A banner and amber theme mark simulator vs live (dark amber when dark mode is on). There is no in-app toggle for simulator vs live — change `.env` and restart Vite.

## Tests

```bash
cd api && npm install && npm test   # HTTP against a temp SQLite DB (not dev.db)
cd web && npm install && npm test   # pricing fixture (R$ 31.44)
```

## Quote validity

A quote is valid for **10 seconds** and can be confirmed **once**. Confirming after expiry shows a warning and is not saved.
