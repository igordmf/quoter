# Technical decisions

Format: context → options → choice → why. Rejected options stay listed so later work does not re-litigate them.

## Repository layout

- **Chosen:** two folders (`api/`, `web/`) plus root `README.md` and `DECISIONS.md`.
- **Rejected:** npm workspaces / monorepo tooling — extra ceremony for two independent packages.
- **Why:** matches the spec; each app has its own scripts.
