# Technical decisions

Format: context → options → choice → why. Rejected options stay listed so later work does not re-litigate them.

## Repository layout

- **Chosen:** two folders (`api/`, `web/`) plus root `README.md` and `DECISIONS.md`.
- **Rejected:** npm workspaces / monorepo tooling — extra ceremony for two independent packages.
- **Why:** matches the spec; each app has its own scripts.

## Where quotes are priced (live)

- **Chosen:** web client fetches Binance REST and holds OKX last price from WebSocket (REST poll if the socket dies). API stores only confirmed exchanges.
- **Rejected:** all market I/O on the API (original volume-protection idea); Binance Convert API.
- **Why:** later spec asked for client-side Binance HTTP and OKX WS. Convert endpoints are not public bid/ask and usually need keys. Spot `GET /api/v3/ticker/bookTicker` matches “top of book, no depth”.

## Binance CORS

- **Chosen:** Vite `server.proxy` (`/binance` → `https://api.binance.com`, `/okx` → `https://www.okx.com`) so the browser stays same-origin.
- **Rejected:** raw `fetch('https://api.binance.com/...')` (often blocked by CORS); always-on API reverse proxy (would contradict “request from web client”).
- **Why:** still a client-initiated quote path without a custom backend market service.

## OKX channel

- **Chosen:** public WS `wss://ws.okx.com:8443/ws/v5/public`, channel `books5`, `instId: USDT-BRL`. Fallback `GET /api/v5/market/books?instId=USDT-BRL&sz=5` every 1s if the socket is down or silent.
- **Rejected:** `bbo-tbt` (requires login per OKX docs).
- **Why:** top-of-book without auth. Quotes never wait on OKX; they use last memory or mark OKX unavailable.

## Rate limits (thousands of quotes)

- **Chosen:** one shared in-tab Binance poll (~2s) for USDTBRL + dest pairs while `/quote` is mounted; one OKX WS (or 1s REST fallback). Create-quote reads memory. Polls use an in-flight lock and ~8s abort so a hung fetch cannot stack requests. Vite `/binance` and `/okx` proxies are **dev only**; production must not funnel every user through one server IP to Binance.
- **Rejected:** fetch Binance only when Create quote is clicked (would spike per-click); one Binance HTTP call per quote from a busy tab; server-side price cache; Shared Worker / BroadcastChannel to share one poll across tabs (overkill for this test); a production reverse-proxy of Binance through a single IP (would concentrate rate limits).
- **Why:** spread already covers sub-second lag; we must not approach Binance IP bans. Each browser uses its own public IP. Timeouts and a single in-flight poll keep one tab from multiplying traffic when the network stalls.

## Money

- **Chosen:** `decimal.js` for all quote math; Prisma `Decimal` for persisted amounts; round **up** to 2 decimal places only on user-facing BRL.
- **Rejected:** IEEE `number`; string-only arithmetic without a library.
- **Why:** spec requires a library so rounding stays consistent (reference: 100 MXN → R$ 31.44 at 0.6%).

## Auth

- **Chosen:** username-only `POST /login` returning a JWT; no passwords, signup, or recovery.
- **Rejected:** cookies/sessions (more moving parts); storing the password-less user in a cookie without a signed token.
- **Why:** deliberate test shortcut; JWT is enough to attach history to a user.

## Pending quotes vs confirmed history

- **Chosen:** 10s pending quote lives in the browser; API `users_exchanges` is confirmed only. Extra columns: `unitPriceBrl`, `totalPriceBrl`, `clientQuoteId` (unique) for history and concurrent confirm.
- **Rejected:** persist pending quotes in SQLite; schema with only user/currency/qty/datetime (cannot show unit/total or idempotent confirm).
- **Why:** history UI needs prices; unique `clientQuoteId` makes parallel confirms a single row.

## Client-trusted prices

- **Chosen:** `POST /exchanges` checks TTL and unique `clientQuoteId`, then stores the client-sent BRL amounts. The API does not recompute the USDT bridge formula.
- **Rejected:** server-side replay of Binance/OKX books at confirm time.
- **Why:** username-only test app; prices already live in the browser. Not a production risk control.

## Clock skew

- **Chosen:** expiry uses browser `quotedAt` vs server `Date.now()`, with 1s slack for a client clock that is slightly ahead (`ageMs < -1000`).
- **Rejected:** server-assigned quote timestamps (would require persisting pending quotes); NTP checks.
- **Why:** pending quotes stay in the tab; a slow client expires a bit early, a fast clock can confirm a bit late. Acceptable for this test.

## Extra libraries (when first used)

| Library                         | Why                                      | Rejected alternative      |
| ------------------------------- | ---------------------------------------- | ------------------------- |
| `decimal.js`                    | Monetary math                            | `big.js`, native `number` |
| `zod`                           | Request/env validation                   | `yup` (heavier, same job) |
| `jsonwebtoken`                  | Signed login token                       | `express-session`         |
| `uuid`                          | Quote / row ids                          | DB autoincrement only     |
| `date-fns`                      | Display timestamps                       | `luxon`, `moment`         |
| `@tanstack/react-query`         | HTTP cache for API                       | ad-hoc `useEffect`        |
| `@tabler/icons-react`           | Fiat currency glyphs                     | extra icon font           |
| `lucide-react`                  | Shell icons (nav, user, logout)          | Tabler for everything     |
| `react-router-dom`              | `/login` `/quote` `/history` routes      | hand-rolled History API   |
| `vitest`                        | Lock the R$ 31.44 pricing fixture        | ad-hoc console asserts    |
| Prisma 6 + SQLite               | Persistence as specified                 | raw `better-sqlite3`; Prisma 7 |

## Web routing

- **Chosen:** `react-router-dom` for `/login`, `/quote`, and `/history`, with a `RequireAuth` layout around `AppShell`.
- **Rejected:** hand-rolled History API + `useSyncExternalStore` in `App.tsx` — it mixed auth redirects with page switching and flashed `/history` until we special-cased it.
- **Why:** route components, `NavLink`, and nested layouts are the usual React pattern; Vite still serves `index.html` for those paths in dev.

## Web tooling

- **Chosen:** Vite React TypeScript template, then ESLint + Prettier (same style as the API) and Tailwind v4 via `@tailwindcss/vite`.
- **Rejected:** keeping the template’s oxlint-only setup — the spec asked for ESLint and Prettier on both apps.
- **Why:** one lint/format story across `api` and `web`.

## Binance dest pairs

- **Chosen:** `USDTBRL`, `USDTARS`, `USDTCOP`, `USDTMXN`, `USDTZAR` (USDT as base). EUR uses `EURUSDT` (inverted): USDT needed = dest × ask.
- **Rejected:** pretending `USDTEUR` exists; skipping EUR.
- **Why:** live Binance `exchangeInfo` has no `USDTEUR`. Spec is USDT/dest; EUR is listed the other way, so we invert instead of dropping the currency.

## Tabler rand icon

- **Chosen:** `IconLetterR` for ZAR; `IconCurrencyDollar` for ARS/COP/MXN; euro for EUR.
- **Rejected:** peso “P” glyph; generic `IconCurrency` for ZAR.
- **Why:** Tabler has no rand glyph. Pesos use the dollar icon; ZAR uses R.

## Last destination currency

- **Chosen:** persist `quoter.destCurrency` in `localStorage`; default is index 0 of `DEST_CURRENCIES` (`EUR`). Currency list order matches the seed (not alphabetical).
- **Rejected:** always default to MXN; sort currencies by code (ARS first).
- **Why:** returning to the quote page should restore the last destination; array position 0 is the documented default.
