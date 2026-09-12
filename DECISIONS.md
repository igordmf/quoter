# Technical decisions

Format: context → options → choice → why. Rejected options stay listed so later work does not re-litigate them.

## Repository layout

- **Chosen:** two folders (`api/`, `web/`) plus root `README.md` and `DECISIONS.md`.
- **Rejected:** npm workspaces / monorepo tooling — extra ceremony for two independent packages.
- **Why:** matches the spec; each app has its own scripts.

## Binance CORS

- **Chosen:** Vite `server.proxy` (`/binance` → `https://api.binance.com`, `/okx` → `https://www.okx.com`) so the browser stays same-origin.
- **Rejected:** raw `fetch('https://api.binance.com/...')` (often blocked by CORS); always-on API reverse proxy (would contradict “request from web client”).
- **Why:** still a client-initiated quote path without a custom backend market service.

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
| `zod`                           | Request/env validation                   | `yup` (heavier, same job) |
| `jsonwebtoken`                  | Signed login token                       | `express-session`         |
| `@tanstack/react-query`         | HTTP cache for API                       | ad-hoc `useEffect`        |
| `@tabler/icons-react`           | Fiat currency glyphs                     | extra icon font           |
| `lucide-react`                  | Shell icons (nav, user, logout)          | Tabler for everything     |
| `react-router-dom`              | `/login` `/quote` `/history` routes      | hand-rolled History API   |
| Prisma 6 + SQLite               | Persistence as specified                 | raw `better-sqlite3`; Prisma 7 |

## Web routing

- **Chosen:** `react-router-dom` for `/login`, `/quote`, and `/history`, with a `RequireAuth` layout around `AppShell`.
- **Rejected:** hand-rolled History API + `useSyncExternalStore` in `App.tsx` — it mixed auth redirects with page switching and flashed `/history` until we special-cased it.
- **Why:** route components, `NavLink`, and nested layouts are the usual React pattern; Vite still serves `index.html` for those paths in dev.

## Web tooling

- **Chosen:** Vite React TypeScript template, then ESLint + Prettier (same style as the API) and Tailwind v4 via `@tailwindcss/vite`.
- **Rejected:** keeping the template’s oxlint-only setup — the spec asked for ESLint and Prettier on both apps.
- **Why:** one lint/format story across `api` and `web`.
