# Dependency Policy

Pacifinance is privacy-first and self-hostable. Every dependency is code we didn't
write, don't fully control, and are trusting not to introduce a vulnerability,
a supply-chain compromise, or unnecessary weight. Fewer, well-justified
dependencies mean a smaller attack surface, less to audit, and an easier
self-host. This document exists so that's a deliberate, reviewable choice per
package, not an accumulation nobody remembers the reason for.

## Rules for adding a new dependency

1. **Prefer native code first.** If the browser/Node standard library or a
   handful of lines can do it, don't add a package for it.
2. **If a package is genuinely needed, add it to this file in the same PR**
   with a one-line reason and today's date as "last reviewed."
3. **Prefer a library we already depend on** over a second one that does
   almost the same thing (see "Known duplication" below for what happens when
   this rule gets skipped).
4. **Runtime dependencies get more scrutiny than dev-only ones** - a
   vulnerable `devDependency` is a build-time risk; a vulnerable runtime
   dependency ships to every user, hosted and self-hosted alike.

## Review cadence

Re-check this file whenever `npm audit`/Dependabot flags something in it, and
at minimum once per quarter: is the package still used (`npx depcheck`), is
it still maintained upstream, and does the reason still hold? Update the
"last reviewed" date whenever a package is touched for any reason.

## Audit status (last run: 2026-08-15)

`npx depcheck` reports **zero unused runtime dependencies**. It flags six
devDependencies as unused (`tailwindcss`, `@tailwindcss/vite`-era postcss
setup, `autoprefixer`, `babel-plugin-styled-components`,
`@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`) - verified
by hand as false positives: all six are referenced only from config files
(`vite.config.mjs`, `eslint.config.js`, `tailwind.config.js`), which
depcheck's static import analysis doesn't trace. No real dead weight found.

One real gap: `@fortawesome/fontawesome-svg-core` is used implicitly (a peer
of `@fortawesome/free-solid-svg-icons`) but isn't declared directly - add it
explicitly next time either FontAwesome package is touched.

## Known duplication - the next real cleanup target

**Four separate icon libraries are in active use**: `@mui/icons-material`
(24 files), `@fortawesome/*` (27 files), `react-icons` (17 files),
`lucide-react` (14 files). This happened gradually, one PR at a time, without
anyone deciding "we now support four icon systems." None is unused, so
`depcheck` won't catch it, and removing any of them means re-touching dozens
of files - a real project, not a quick fix, and not attempted in this pass.
Tracked in `todo.md`. New icon usage should reuse whichever of the four
already covers the need, not add a fifth or lean further into all four.

## Runtime dependencies

| Package | Why |
|---|---|
| `@emotion/react`, `@emotion/styled` | Required by `@mui/material`'s own styling engine, not used directly |
| `@fortawesome/free-solid-svg-icons`, `@fortawesome/react-fontawesome` | Icon set (see "Known duplication") |
| `@mui/icons-material`, `@mui/material` | Dialogs, icon buttons, and other complex components not worth hand-building |
| `@supabase/supabase-js` | The backend's Postgres/Auth client |
| `@upstash/redis` | REST-based Redis client - cache, rate limiting, registration anti-replay guard |
| `axios` | HTTP client for every frontend→backend API call (`src/services/apiClient.ts`) |
| `cookie-parser` | Express middleware, parses the httpOnly auth cookies |
| `dom-to-image` | Exports charts/UI sections as shareable images |
| `exceljs` | Investment CSV/XLSX import wizard, community price data export |
| `express` | Backend web framework |
| `file-saver` | Triggers browser downloads for CSV/Excel exports |
| `jszip` | Bundles files for the GDPR data-export download (`src/utils/dataExport.tsx`) |
| `lucide-react` | Icon set (see "Known duplication") |
| `papaparse` | CSV parsing for the transaction import wizard |
| `qrcode` | Generates the printable QR code on the account-recovery card |
| `react`, `react-dom` | The framework |
| `react-calendar` | Date picker component |
| `react-csv` | CSV export |
| `react-helmet` | Per-page SEO meta tags (`SEOHead`) |
| `react-icons` | Icon set (see "Known duplication") |
| `react-responsive` | The `useMediaQuery` hook behind `MediaQueryContext` |
| `react-router-dom` | Routing, including the localized-route wrappers |
| `recharts` | Investment/balance/trend charts |
| `serverless-http` | Wraps the Express app for Vercel's serverless functions (and for tests, via the same handler) |
| `styled-components` | Primary CSS-in-JS styling system |
| `terser` | JS minifier, used explicitly by the Vite build config |
| `typescript` | The language |
| `web-push` | Sends Web Push notifications (VAPID) |

## Dev dependencies

| Package | Why |
|---|---|
| `@eslint/js`, `eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals`, `typescript-eslint`, `@typescript-eslint/*` | Lint toolchain |
| `@tailwindcss/vite`, `tailwindcss` | Utility CSS, wired in via the Vite plugin (v4, migrated 2026-08-15) |
| `@testing-library/*` | React component rendering/assertions in tests |
| `@types/*` | Type definitions for their corresponding runtime/dev packages |
| `@vercel/node` | Vercel's serverless Node runtime/build tool |
| `@vitejs/plugin-react` | Vite's JSX transform + Fast Refresh |
| `@vitest/coverage-v8`, `@vitest/ui` | Vitest coverage reporting and UI runner |
| `babel-plugin-styled-components` | Adds real component display names in dev tools for styled-components |
| `jsdom` | Simulated DOM for frontend tests |
| `tsx` | Runs the TypeScript backend directly (`npm run dev:server`, and the Docker `api` image) |
| `vite`, `vite-tsconfig-paths` | Build tool + tsconfig path-alias resolution |
| `vitest` | Test runner |

## Deliberately not upgraded right now

- **Vite 8**: possible (a compatible `@vitejs/plugin-react@6` exists), but
  the upgrade path currently resolves an optional peer chain
  (`@vitejs/plugin-react`→`@rolldown/plugin-babel`→`@babel/plugin-transform-runtime`)
  into a **Babel 8 release candidate**, and Vite 8 itself replaces the
  Rollup/esbuild engine with Rolldown/Oxc - two independent signals that
  this specific ecosystem is too fresh to force through on a build tool this
  central. Revisit in a few weeks/months once the peer chain stabilizes on
  real releases.
- **TypeScript 7**: blocked upstream - `@typescript-eslint/eslint-plugin`'s
  peer range is `typescript: ">=4.8.4 <6.1.0"`. Nothing to do until that
  package ships support; re-check `npm view @typescript-eslint/eslint-plugin peerDependencies`
  periodically.
