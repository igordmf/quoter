# Quoter — BRL → Fiat

Web app to quote and confirm BRL purchases of EUR, ARS, COP, MXN, and ZAR using USDT as the bridge currency.

## Layout

- `api/` — Express + TypeScript + Prisma (SQLite).
- `web/` — planned Vite + React client.

## Prerequisites

- Node.js 20+
- npm

Clone this repository, then follow the blocks below.

## Run

```bash
# API
cd api
npm install
cp .env.example .env
npx prisma migrate dev
npx prisma db seed
npm run dev

API `npm run dev` uses nodemon and restarts when files under `api/src` change.
```

API health: `http://localhost:3001/health`.

Spreads:

| username | spread |
| -------- | ------ |
| alice    | 0%     |
| bob      | 0.6%   |
| carol    | 1%     |
