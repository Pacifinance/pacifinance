# Pacifinance

Pacifinance is an open-source, privacy-first personal finance app for tracking balances, income, outflows, recurring payments, goals, investments, and anonymous comparisons with similar users.

The project has a clear product bet: personal finance software should help people understand their own situation without turning their private financial life into a public profile. Community comparisons should be useful, aggregated, anonymous, and explainable.

Pacifinance supports two operating models:

- a hosted app for people who want the product without managing infrastructure;
- a self-hostable open-source app for people who want full control of their data.

The codebase contains both the React frontend and the Express serverless backend. Data is stored in Supabase Postgres, with optional Upstash Redis caching for prices and aggregate statistics.

[![License: AGPL v3](https://img.shields.io/badge/License-AGPLv3-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)](https://vite.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?logo=supabase)](https://supabase.com/)

## Core Principles

- Privacy first: no raw transactions, notes, merchants, account identifiers, or exact personal records should be exposed in public comparison flows.
- Anonymous by design: comparisons are based on cohorts, thresholds, bucketing, and aggregate statistics, not user-to-user visibility.
- Explainable benchmarks: every comparison should make clear what period, cohort, sample size, and method produced the result.
- Self-hostable by default: the app should remain useful without joining any hosted community network.
- Open source with responsibility: examples, tests, issues, and docs must never include real personal finance data or secrets.

## Features

- Balance tracking across liquidity, investments, crypto, bonds, funds, and gold
- Income and outflow tracking with custom categories and sub-categories
- Anonymous comparison rankings and cohort averages
- Goals and limits, including goals linked to live balance fields
- Recurring transactions and quick-add workflows
- CSV/Excel import/export
- Market prices for crypto and investment-oriented portfolio details
- Multi-language routing and locale files
- Multi-currency display while storing canonical values in EUR
- Demo mode for frontend development without real user data

## Privacy And Anonymous Comparisons

Pacifinance's comparison features should answer questions like "how am I doing compared with people in a similar situation?" without revealing who those people are.

The intended model is:

- users explicitly opt in to community comparisons;
- profile fields are bucketed before aggregation;
- financial metrics are rounded and aggregated;
- small cohorts are suppressed or merged;
- clients receive aggregate statistics only;
- results disclose cohort size, period, freshness, and confidence.

See [docs/PRIVACY_ANONYMITY.md](docs/PRIVACY_ANONYMITY.md), [docs/COMMUNITY_STATS_PROTOCOL.md](docs/COMMUNITY_STATS_PROTOCOL.md), and [docs/COMMUNITY_BENCHMARK_STRATEGY.md](docs/COMMUNITY_BENCHMARK_STRATEGY.md) for the product and technical boundaries.

The product and open-source decisions are recorded in
[docs/OPEN_SOURCE_PRODUCT_CHARTER.md](docs/OPEN_SOURCE_PRODUCT_CHARTER.md).

## Stack

- Frontend: React, Vite, TypeScript, styled-components, Recharts
- Backend: Express, TypeScript, Supabase JS, serverless-http
- Database: Supabase Postgres, SQL migrations in `supabase/migrations`
- Cache: optional Upstash Redis
- Tests: Vitest, Testing Library
- Deployment: Vercel-compatible serverless entrypoint in `api/index.ts`

## Getting Started

Requirements:

- Node.js 20+
- npm 10+
- A Supabase project if you want to run the real backend locally

Install dependencies:

### Docker self-hosting

Copy `.env.example` to `.env`, configure Supabase and required provider keys, then run:

```bash
docker compose up --build
```

The web client is available on port 8080 and the API on port 3000. See [the backup runbook](docs/BACKUP_RECOVERY.md), [the threat model](docs/THREAT_MODEL.md), and [the Supabase/RLS checklist](docs/SUPABASE_RLS_AUDIT.md) before production use.

```bash
npm install
```

Create a local env file:

```bash
cp .env.example .env
```

Fill the variables you need. For UI-only work, demo mode can run without Supabase or Redis. For backend work, apply `supabase/schema.sql` or the migrations in `supabase/migrations`.

For local demo defaults, copy `.env.development.example` to `.env.local`.

Start the app:

```bash
npm run dev
```

Start the API server in another terminal:

```bash
npm run dev:server
```

Open `http://localhost:5173`.

## Demo Mode

Demo mode uses local mock services instead of real backend calls. It is useful for UI work, screenshots, and public demos.

Open the app with:

```text
http://localhost:5173?dev=true
```

Demo data must stay synthetic. Do not copy real transactions, balances, notes, screenshots, or profile details into demo fixtures.

## Scripts

```bash
npm run dev          # Vite frontend
npm run dev:server   # Express backend
npm run build        # Production build, regenerates roadmap data first
npm run preview      # Preview production build
npm run lint         # ESLint
npm test             # Frontend/unit tests
npm run test:server  # Backend route/lib tests
npm run roadmap      # Regenerate src/data/roadmapData.ts from todo.md
```

## Project Layout

```text
api/                 Vercel serverless entrypoint
server/src/          Express backend, routes, db models, cache and libs
src/components/      Reusable UI components
src/contexts/        React providers
src/data/            Static app data, colors, icons, translations helpers
src/hooks/           Shared hooks
src/i18n/locales/    Locale JSON files
src/pages/           Route-level pages
src/sections/        Larger page sections
src/services/        API service clients
src/types/           Shared TypeScript/API contracts
src/utils/           Pure helpers, selectors, import/export logic
supabase/            Canonical schema and incremental migrations
```

## Development Rules

- Keep user-facing strings in all locale files under `src/i18n/locales`.
- Use `LocalizedLink` and localized navigation helpers for app routes.
- Store canonical money values in EUR and format through `CurrencyContext`.
- Read `userData` through selectors in `src/utils/userDataSelectors.ts`.
- Keep demo/mock data aligned when adding API fields.
- Use shared balance helpers from `src/constants/balanceSchema.ts`.
- Server date-only strings must use `toDateOnly` from `server/src/libs/datelib.ts`.
- Do not commit `.env`, database backups, migration dumps, logs with tokens, screenshots with real financial data, or personal finance exports.

## Open Source Model

Pacifinance is licensed under the GNU AGPLv3. If you run a modified version as a network service, the license requires making the corresponding source available to users of that service.

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a PR. For security issues, do not open a public issue; see [SECURITY.md](SECURITY.md).
