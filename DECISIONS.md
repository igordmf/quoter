# Technical decisions

Format: context → options → choice → why. Rejected options stay listed so later work does not re-litigate them.

## Repository layout

- **Chosen:** two folders (`api/`, `web/`) plus root `README.md` and `DECISIONS.md`.
- **Rejected:** npm workspaces / monorepo tooling — extra ceremony for two independent packages.
- **Why:** matches the spec; each app has its own scripts.

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
| Prisma 6 + SQLite               | Persistence as specified                 | raw `better-sqlite3`; Prisma 7 |
