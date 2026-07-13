# PaciFinance

PaciFinance is a privacy-first personal finance app for tracking balances,
income, outflows, goals, recurring payments, custom categories, and anonymous
comparisons with similar users.

The project is designed for two use cases:

- a hosted version for people who want the app without running infrastructure;
- a self-hostable open-source version for people who want full control.

The codebase contains both the React frontend and the Express serverless backend.
Data is stored in Supabase Postgres, with optional Upstash Redis caching for
prices and aggregate statistics.

[![License: AGPL v3](https://img.shields.io/badge/License-AGPLv3-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)](https://vite.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?logo=supabase)](https://supabase.com/)

## Features

- Balance tracking across liquidity, investments, crypto, bonds, funds, and gold
- Income and outflow tracking with custom user sub-categories
- Anonymous comparison rankings and cohort averages
- Goals and limits, including goals linked to live balance fields
- Recurring transactions and quick-add workflows
- CSV/Excel import/export
- Market prices for crypto and investment-oriented portfolio details
- Multi-language routing and locale files
- Multi-currency display while storing canonical values in EUR
- Demo mode for frontend development without real user data

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

```bash
npm install
```

Create a local env file:

```bash
cp .env.example .env
```

Fill the variables you need. For UI-only work, demo mode can run without
Supabase/Redis. For backend work, apply `supabase/schema.sql` or the migrations
in `supabase/migrations`.

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

Demo mode uses local mock services instead of real backend calls. It is useful
for UI work, screenshots, and public demos.

Open the app with:

```text
http://localhost:5173?dev=true
```

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

## Important Development Rules

- Keep user-facing strings in all locale files under `src/i18n/locales`.
- Use `LocalizedLink` and localized navigation helpers for app routes.
- Store canonical money values in EUR and format through `CurrencyContext`.
- Read `userData` through selectors in `src/utils/userDataSelectors.ts`.
- Keep demo/mock data aligned when adding API fields.
- Use shared balance helpers from `src/constants/balanceSchema.ts`.
- Server date-only strings must use `toDateOnly` from `server/src/libs/datelib.ts`.
- Do not commit `.env`, database backups, migration dumps, or personal finance data.

## Open Source Model

PaciFinance is licensed under the GNU AGPLv3. If you run a modified version as a
network service, the license requires making the corresponding source available
to users of that service.

The hosted/community comparison features are designed to work with privacy in
mind: shared statistics should be aggregate, anonymous, and never raw personal
transactions.

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before
opening a PR.

For security issues, do not open a public issue. See [SECURITY.md](SECURITY.md).
