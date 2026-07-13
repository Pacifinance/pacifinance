# Contributing to PaciFinance

Thanks for your interest in contributing! PaciFinance is a privacy-first personal
finance app. This guide explains how to set up the project, the rules that keep
the codebase consistent, and how to submit changes.

## Getting started

```bash
git clone <repo-url>
cd pacifinance-serverless
npm install
cp .env.example .env   # fill in what you need (see comments in the file)

npm run dev            # frontend (Vite, http://localhost:5173)
npm run dev:server     # backend (Express, http://localhost:3000)
```

The frontend proxies `/api/*` to the local Express server (see `vite.config.mjs`).
For most UI work you can also use the built-in **demo mode**, which mocks the
whole API layer and needs no backend or database at all.

Backend requirements (only if you work on server features): a Supabase project
with `supabase/schema.sql` applied, plus the env vars listed in `.env.example`.
Optional integrations (Upstash Redis, CoinGecko, OpenFIGI, Turnstile) degrade
gracefully when unconfigured.

## Before you open a PR

Run the full check locally — CI runs the same on every PR:

```bash
npm run lint && npm test && npm run build
npm run test:server        # if you touched server/
```

When you use an AI assistant to help with the change, ask it to finish every update with a short commit message in English. That keeps the history readable for open source reviews and future maintainers.

## Project structure

```
src/
  components/   # Presentational components — no context imports in reusable ones
  pages/        # Routes — assemble contexts + sections
  sections/     # Feature blocks — may use contexts
  contexts/     # Global state (fixed provider order, see below)
  hooks/        # Shared React hooks
  services/     # API clients (axios), injected via ServiceContext
  utils/        # Pure functions (selectors, routing, math)
  constants/    # Single-source-of-truth schemas (balance keys, API paths…)
  data/         # Static config (colors, icons, currencies)
  styles/       # Shared styled-components
  types/        # Shared TypeScript types (API contract in types/api.ts)
  i18n/         # locales/*.json — 6 languages (it, en, es, de, fr, pt-BR)
  __tests__/    # Mirrors src/
server/src/     # Express backend (deployed as a single Vercel function)
  routes/       # public / cron / private routers (RPC-style POST endpoints)
  db/models/    # One module per table, Supabase queries live only here
  libs/         # Pure helpers (dates, money, timeouts, rate limiting)
  cache/        # Redis-backed cache (crypto prices, user averages)
supabase/       # schema.sql (canonical) + migrations/
api/index.ts    # Single Vercel serverless entrypoint (wraps the Express app)
```

Context provider order is fixed:
`MediaQuery > Language > Theme > DevMode > User > Currency > Page > Privacy > Toast`.

## Critical rules

These rules exist because breaking them causes real, hard-to-spot bugs:

1. **i18n** — every UI string goes in **all** `src/i18n/locales/*.json` files.
   Never hardcode user-facing text (there is known legacy debt here; don't add more).
2. **Routing** — use `LocalizedLink` (not `Link`) and `useLocalizedNavigate`
   (not `useNavigate`): URLs are language-prefixed.
3. **Currency** — the database stores **EUR only**. Display values via
   `formatAmount()` from `CurrencyContext`. Never hardcode `€` or `EUR`.
4. **Selectors** — read `userData` only through `src/utils/userDataSelectors.ts`.
5. **Mocks** — any new `userData` field must be mirrored in `MockAuthContext.tsx`
   so demo mode stays complete.
6. **Colors/Icons** — use `getAssetColor()`, `getCategoryColor()` from `src/data/`.
   No hardcoded hex colors for financial data.
7. **Wording** — say "outflows", not "expenses" (expenses excludes investments).
8. **TypeScript** — strict, no `any`. Props are declared as `interface`.
9. **Dates** — never use `.toISOString().split('T')[0]` (UTC-midnight timezone
   bug). Build date strings from explicit getters (see `toDateOnly` in
   `server/src/libs/datelib.ts`).
10. **Balance keys** — never index balance snapshots by hand: use the helpers in
    `src/constants/balanceSchema.ts` (`buildAddBalancePayload`,
    `snapshotToEurMap`, `buildSnapshotWithDeltas`). Mixing camelCase/snake_case
    keys silently zeroes assets.

## Submitting changes

1. Fork and create a feature branch from `main`.
2. Keep PRs focused — one feature or fix per PR.
3. Add or update tests for what you change (`src/__tests__/` mirrors `src/`).
4. Make sure `npm run lint && npm test && npm run build` passes.
5. Fill in the PR template. Screenshots are welcome for UI changes.

For larger features, please open an issue first to discuss the approach —
it avoids wasted work on both sides.

## Reporting security issues

Please do **not** open public issues for security vulnerabilities.
See [SECURITY.md](SECURITY.md).

## License

By contributing, you agree that your contributions will be licensed under the
[GNU AGPL-3.0](LICENSE).
