# Pacifinance

**Privacy-first, self-hostable personal finance tracking with anonymous peer comparison**

[**Website**](https://www.pacifinance.com) | [**Live Demo**](https://www.pacifinance.com) | [**Pricing**](https://www.pacifinance.com/pricing) | [**FAQ**](https://www.pacifinance.com/faq) | [**Roadmap**](https://www.pacifinance.com/roadmap) | [**Contributing**](CONTRIBUTING.md)

[![License: AGPL v3](https://img.shields.io/badge/License-AGPLv3-blue.svg)](LICENSE)
[![Contributions Welcome](https://img.shields.io/badge/Contributions-Welcome-limegreen.svg)](CONTRIBUTING.md)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)](https://vite.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?logo=supabase)](https://supabase.com/)

A good fit if you:

- 💰 want balances, investments, crypto, and recurring payments tracked in one place
- 📊 are curious how your net worth compares to people in a similar situation — without anyone seeing your actual numbers
- 🔒 don't want to hand a raw bank feed to a startup you've never heard of
- 🖥️ want the option to self-host, or to run the free hosted version without managing any infrastructure yourself
- 🌍 want an app that isn't only built around US/UK financial products
- 🤝 want the roadmap and the comparison algorithm to both be public, not just marketing copy

The project has a clear product bet: personal finance software should help people understand their own situation without turning their private financial life into a public profile. Community comparisons should be useful, aggregated, anonymous, and explainable.

Pacifinance supports two operating models:

- a hosted app for people who want the product without managing infrastructure;
- a self-hostable open-source app for people who want full control of their data.

The codebase contains both the React frontend and the Express serverless backend. Data is stored in Supabase Postgres, with optional Upstash Redis caching for prices and aggregate statistics.

The source-code licence does not grant permission to present a fork as an
official Pacifinance product. See the [Trademark Policy](TRADEMARK_POLICY.md)
for permitted uses of the name and logo.

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

The web client is available on port 8080 and the API on port 3001 (only needed for hitting it directly - the web client already reaches it internally). See [the backup runbook](docs/BACKUP_RECOVERY.md), [the threat model](docs/THREAT_MODEL.md), and [the Supabase/RLS checklist](docs/SUPABASE_RLS_AUDIT.md) before production use.

#### Prebuilt images

Every tagged release also publishes multi-arch (`linux/amd64`, `linux/arm64`) images, so you don't need a local build at all:

```bash
docker pull ghcr.io/pacifinance/pacifinance-web:latest
docker pull ghcr.io/pacifinance/pacifinance-api:latest
# or, from Docker Hub:
docker pull pacifinance/pacifinance-web:latest
docker pull pacifinance/pacifinance-api:latest
```

These images ship without a Turnstile/Umami/Web Push key baked in (those are Vite build-time values, not runtime config) - fine for a first try, but if you want your own keys, use `docker compose up --build` above instead.

#### Fully local Supabase (no cloud account)

The backend talks to Supabase's own API (`@supabase/supabase-js`, including its Auth admin API for account creation/deletion), not to raw Postgres, so it works unmodified against a self-hosted Supabase stack — you don't have to create a project on supabase.com at all.

One command does the whole thing — clones Supabase's own self-hosting stack, generates its secrets, bootstraps `supabase/schema.sql` against it, wires this repo's `.env` to it, then builds and starts Pacifinance:

```bash
bash scripts/self-host-local.sh
```

That script deliberately doesn't vendor Supabase's services into this repo's `docker-compose.yml` — it clones their own official, always-current self-hosting setup on demand into `.selfhost-supabase/` (gitignored) instead. That way this project never has to track Supabase's internal service changes (their default gateway moved from Kong to Envoy since this was last checked, for example); it always gets whatever Supabase currently ships. Re-running the script is safe — it reuses the existing local stack and skips re-applying the schema.

<details>
<summary>What the script does, if you'd rather run the steps by hand or something goes wrong</summary>

Supabase's own Docker setup evolves independently of this repo, so treat [their self-hosting guide](https://supabase.com/docs/guides/self-hosting/docker) as the source of truth if these commands look outdated; as of this writing it's:

```bash
git clone --depth 1 --branch self-hosted/v0.8.0 https://github.com/supabase/supabase
cp -rf supabase/docker/. supabase-project && cd supabase-project
cp .env.example .env
sh utils/generate-keys.sh        # POSTGRES_PASSWORD, JWT_SECRET, ...
sh utils/add-new-auth-keys.sh    # ANON_KEY, SERVICE_ROLE_KEY
sh run.sh start                  # docker compose up -d --wait
sh run.sh secrets                # prints the generated keys
```

This starts Postgres plus Supabase's Auth/API layer on the same machine, gateway (Envoy) on port 8000. Bootstrap the schema against it exactly like the cloud path: connect to its Postgres (`db` service, default port 5432) and apply `supabase/schema.sql`, or paste it into Studio's SQL editor.

Then, back in this repo's `.env`:

```bash
SUPABASE_URL=http://host.docker.internal:8000
SUPABASE_SERVICE_ROLE_KEY=<service_role key from `sh run.sh secrets`>
```

`docker-compose.yml`'s `api` service already maps `host.docker.internal` to the host machine (needed on Linux; Docker Desktop on Mac/Windows does this on its own), so `docker compose up --build` reaches the locally self-hosted Supabase stack with no further networking setup. The result: everything - frontend, API, database, auth - runs on your own machine with no outbound calls and no third-party account, beyond whatever optional provider keys (`CG_KEY`, `FINNHUB_KEY`, ...) you choose to fill in.

</details>

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

Pacifinance is licensed under the
[GNU AGPLv3 or later](LICENSE). Commercial use, paid hosting, support and
integration services are allowed. You do not need to assign your changes to
Pacifinance or open an upstream pull request.

If users interact with your modified version over a network, the AGPL requires
you to give those users a clear opportunity to obtain the Corresponding Source
of the version you are running, under the same licence. A practical way to do
this is to place a visible **Source code** link in the application that points
to a public repository or downloadable archive. The offered source should:

- match the version actually provided to users;
- include the code and scripts needed to build, install, run and modify it;
- retain the required copyright, licence and modification notices; and
- exclude credentials, production secrets and user data, which are not source
  code and must never be published.

Users who receive that source may modify and redistribute it under the AGPL.
The licence does not require the project maintainers to accept, merge or support
a fork's changes. This summary is provided for convenience and is not a
substitute for the full licence text or legal advice.

The code licence and project identity are separate. Forks may accurately state
that they are based on Pacifinance, but must follow the
[Trademark Policy](TRADEMARK_POLICY.md) and must not imply endorsement or
official status.

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a PR. For security issues, do not open a public issue; see [SECURITY.md](SECURITY.md).
