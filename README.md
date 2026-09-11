# Quoter — BRL → Fiat

Web app to quote and confirm BRL purchases of EUR, ARS, COP, MXN, and ZAR using USDT as the bridge currency.

## Layout

- `api/` — Express + TypeScript.
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
npm run dev

API `npm run dev` uses nodemon and restarts when files under `api/src` change.
```

API health: `http://localhost:3001/health`.
