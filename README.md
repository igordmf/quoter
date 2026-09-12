# Quoter — BRL → Fiat

Web app to quote and confirm BRL purchases of EUR, ARS, COP, MXN, and ZAR using USDT as the bridge currency.

## Layout

- `api/` — Express + TypeScript + Prisma (SQLite). Login, currencies, confirmed history.
- `web/` — Vite + React.

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

API `npm run dev` uses nodemon and restarts when files under `api/src` change.

# Web (another terminal)
cd web
npm install
cp .env.example .env
npm run dev
```

Open the Vite URL (default `http://localhost:5173`).

Spreads:

| username | spread |
| -------- | ------ |
| alice    | 0%     |
| bob      | 0.6%   |
| carol    | 1%     |

## Quote validity

A quote is valid for **10 seconds** and can be confirmed **once**. Confirming after expiry shows a warning and is not saved.
