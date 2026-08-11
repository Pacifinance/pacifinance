# Contributing to Pacifinance

Thanks for your interest in contributing. Pacifinance is a privacy-first personal finance app, so technical quality and data-safety habits matter equally here.

This guide explains how to set up the project, what to check before opening a pull request, and how to keep the codebase ready for open-source collaboration.

Looking for a bigger idea to work on than a single bug fix? [docs/PRODUCT_VISION.md](docs/PRODUCT_VISION.md) is the long-term product vision — simulations, generic assets, a financial context engine, optional AI — organized Now/Next/Later/Research so it's clear which pieces are ready to start and which still need groundwork.

Using AI tools to help write your contribution is welcome — see [AI_POLICY.md](AI_POLICY.md) for what that means in practice.

## Getting Started

```bash
git clone <repo-url>
cd pacifinance-serverless
npm install
cp .env.example .env

npm run dev
npm run dev:server
```

The frontend proxies `/api/*` to the local Express server through `vite.config.mjs`. For most UI work you can also use demo mode, which mocks the API layer and does not need a backend or database.

Backend work requires a Supabase project with `supabase/schema.sql` applied, plus the env vars listed in `.env.example`. Optional integrations such as Upstash Redis, CoinGecko, OpenFIGI, and Turnstile should degrade gracefully when unconfigured.

## Privacy Rules For Contributors

Never commit or paste:

- `.env` files, API keys, access tokens, cookies, database dumps, or production logs;
- real transactions, bank names tied to a person, merchant notes, salaries, balances, screenshots, or exported spreadsheets;
- profile combinations that could identify a real user;
- benchmark examples with tiny cohorts or exact personal records.

Use synthetic data in tests, fixtures, screenshots, and docs. If a bug needs a real example, reduce it to the smallest anonymized shape before opening an issue or PR.

## Anonymous Benchmark Rules

Changes touching comparisons, rankings, profile matching, averages, or community statistics must preserve these rules:

1. Participation must be explicit and reversible.
2. Clients must receive aggregate statistics only, never raw peer rows.
3. Small cohorts must be suppressed, merged, or marked unavailable.
4. Profile fields should be bucketed before comparison.
5. Financial values used for community statistics should be rounded or aggregated.
6. Every result should expose period, cohort size, freshness, method, and confidence when available.
7. Demo and test accounts must not influence real community aggregates.

Read [docs/PRIVACY_ANONYMITY.md](docs/PRIVACY_ANONYMITY.md) and [docs/COMMUNITY_BENCHMARK_STRATEGY.md](docs/COMMUNITY_BENCHMARK_STRATEGY.md) before changing that area.

## Before You Open A PR

Run the relevant checks locally:

```bash
npm run lint
npm test
npm run build
npm run test:server   # if you touched server/
```

If you use an AI assistant, ask it to finish with a short English commit message. That keeps the history readable for future maintainers.

## Project Structure

```text
src/
  components/   Generic UI, reusable across unrelated features
  pages/        Route-level pages
  sections/     Feature blocks tied to one domain/page
  contexts/     Global state providers
  hooks/        Shared React hooks
  services/     API clients
  utils/        Pure helpers, selectors, import/export logic
  constants/    Shared schemas and API paths
  data/         Static config, colors, icons, currencies
  styles/       Shared styled-components
  types/        Shared TypeScript/API contracts
  i18n/         Locale JSON files
  __tests__/    Frontend tests
server/src/     Express backend
supabase/       SQL schema and migrations
api/index.ts    Vercel serverless entrypoint
```

Context provider order is fixed: `MediaQuery > Language > Theme > DevMode > User > Currency > Page > Privacy > Toast`.

**`components/` vs `sections/`:** the test isn't "does it use a context?", it's "which domain does it belong to?"
A file can live in `components/` while still reading a context, as long as that context is a
cross-cutting UI concern (`LanguageContext`, `ThemeContext`, `ToastContext`) rather than
business/domain data (`UserContext`, a service call, a domain-specific hook like
`useDemoServices`). In practice:
- **`components/`** — generic and reusable across unrelated features (e.g. `LocalizedLink`,
  `ThemedSelect`, `CategoryPicker`, `LanguageSelector`, `PWAInstallGuide`). May read
  language/theme/toast context, never domain data.
- **`sections/`** — tied to one domain or feature (transactions, investments, goals), even if
  it's reused in more than one place within that same domain (e.g. `InvestmentHoldingsPanel`
  is used from two pages but stays investment-specific, so it stays in `sections/`).

## Critical Rules

1. i18n: every UI string goes in all `src/i18n/locales/*.json` files.
2. Routing: use `LocalizedLink` and `useLocalizedNavigate` for localized URLs.
3. Currency: the database stores EUR only; display values through `CurrencyContext`.
4. Selectors: read `userData` through `src/utils/userDataSelectors.ts`.
5. Mocks: mirror new `userData` fields in demo/mock data.
6. Colors/icons: use shared helpers from `src/data/` for financial categories.
7. Wording: prefer "outflows" over "expenses" for money leaving the account.
8. TypeScript: avoid `any`; declare props as interfaces.
9. Dates: avoid UTC-midnight date bugs; use `toDateOnly` in server code.
10. Balance keys: use helpers from `src/constants/balanceSchema.ts` instead of hand-indexing snapshots.
11. Changelog: note any user-facing change under `[Unreleased]` in [CHANGELOG.md](CHANGELOG.md), in the same PR.

## Submitting Changes

`main` is the only permanent branch. Do not push changes directly to it. Create
a short-lived branch from the latest `main` for each change:

- `feature/<short-description>` for new functionality;
- `fix/<short-description>` for bug fixes;
- `docs/<short-description>` for documentation; and
- `chore/<short-description>` for maintenance.

For example:

```bash
git switch main
git pull --ff-only origin main
git switch -c feature/recurring-payment-alerts
```

Collaborators with write access may push that branch to the official
repository. External contributors should create the branch in their own fork
and open a pull request against `Pacifinance/pacifinance:main`.

1. Keep each branch and pull request focused on one feature or fix.
2. Add or update tests for behavior you change.
3. Include screenshots for UI changes when useful.
4. Explain privacy impact when touching auth, profile data, comparison,
   import/export, analytics, or storage.
5. Wait for the required checks and review before merging into `main`.
6. Delete the short-lived branch after its pull request is merged.

For larger features, open an issue first so the design can be discussed before implementation.

## Releasing

Version numbers and tags follow [CHANGELOG.md](CHANGELOG.md#versioning-policy) - see that section for the exact steps when cutting a release.

## Reporting Security Issues

Do not open public issues for security vulnerabilities. See [SECURITY.md](SECURITY.md).

## License

By contributing, you agree that your contributions will be licensed under the [GNU AGPL-3.0](LICENSE).
