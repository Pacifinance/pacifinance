# Changelog - Pacifinance

All notable changes to the project are documented in this file.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project adheres to [Semantic Versioning](https://semver.org/) (`MAJOR.MINOR.PATCH`; pre-1.0.0, `MINOR` bumps can still include breaking changes).

> **A note on the version numbers below `[0.10.0]`:** entries from `[0.9.0] - 2024 (Early)` through `[0.9.9] - 2026-04-17` were written narratively, grouping features into a `0.9.x` sequence that was never actually reflected in `package.json` (which really went `0.1.0` → `0.5.1` → `0.9.0` → `0.9.9`, confirmed from `git log -- package.json`, and only became `0.9.9` in February 2026 — a year after this file's own `[0.9.3] - 2024-10` entry). They're kept as-is below for the feature-level detail, which is accurate and worth having, but treat their version *numbers* as approximate rather than git-tag-accurate. Starting with `[0.10.0]`, every entry here corresponds to one real `package.json` bump and one git tag — see "Versioning policy" at the bottom.

---

## [Unreleased]

### Fixed
- The redesigned Comparison page's percentile gauge crashed the whole page at
  render time (a styled-components `keyframes` object was interpolated into
  a plain inline `style` string instead of an actual styled-components
  template, which styled-components deliberately throws on) - visible in
  the browser console as `Uncaught Error ... errors.md#12`, reachable the
  moment benchmark consent was on and the gauge had a value to animate.
  Added a render smoke test for `Comparison` so this class of runtime-only
  bug (invisible to lint/types/pure-function tests) fails a test run again.
- Comparison page polish from live-testing on a deployed preview:
  - The percentile gauge is now a full ring instead of a semicircle dome, and
    its number/label are centered with plain flexbox instead of a hand-tuned
    `top: 54%` guess - the old shape made pixel-perfect centering inherently
    fiddly; a full circle's visual center trivially matches its bounding box.
  - The gauge caption and the three headline chips (net worth/income/
    frugality percentiles) didn't explain what the percentage actually meant.
    The caption now states it explicitly ("higher than X% of people with a
    similar profile"), and a new line under the chips clarifies that higher
    is always better, including for the frugality (outflow) one.
  - The info icon next to "Your comparison group" rendered black in dark
    mode (no theme-aware color was set, so it fell back to the browser
    default instead of inheriting one) - same class of bug as any other
    icon with no explicit color, now fixed here explicitly since no
    centralized icon-color helper exists in this codebase.
  - "Spending by Category" only ever showed the user's own amounts - added
    the same "vs. your comparison group" line every other accordion section
    already has, per category.
  - The gauge caption (the sentence explaining what the percentile means) was
    missing `margin: 0 auto` on its `max-width`-constrained box, so it hugged
    the left edge of the card instead of centering under the now-circular
    gauge above it.
- Insert Data's "outflows"/"income" secondary tools row (CSV/Excel,
  Ricorrenti, Spese condivise) stayed capped at an old 1000px width on
  desktop while the page around it (`ContentWrapper`/`SectionCard`) was
  widened to 1400px in a previous change, leaving a wide dead strip to its
  right instead of right-aligning against the same edge as the form card
  beneath it.
- Consistency and correctness pass across the CSV import wizard and the
  Aggiungi entrate/uscite flow, prompted by live-testing a real Trade
  Republic export:
  - Standardized every dropdown that wasn't already using the app's own
    `CategoryPicker` (categories, with sub-category support) or `ThemedSelect`
    (everything else) - column-mapping and default-category pickers in the
    CSV import wizard, several selects in Settings/Goals & Limits/Liquidity
    Accounts/Investment panels, and 6 profile-field selects in the sidebar
    that had no dark-mode styling at all. Category *filters* (Outflows/
    Incomes/insert-values) now also list the user's own custom
    sub-categories, nested under their parent via `<optgroup>`, not just the
    official tags.
  - CSV import duplicate detection no longer widens its match window just
    because two transactions share a broad official category (e.g.
    "Alimentari") - that's true of dozens of unrelated purchases, so on its
    own it was flagging genuinely unrelated transactions days apart (even
    across a month boundary) as possible duplicates. Widening the window now
    requires either a shared merchant token in the notes or a match on the
    user's own specific custom sub-category.
  - A Trade Republic "saveback" cashback reward that Trade Republic invests
    directly (no cash ever hits the account) was being imported as plain
    income, inflating income statistics. It's now tagged as an investment
    purpose and excluded from income statistics, with a badge in the import
    review explaining why. Actually crediting the reward to the holding it
    funded is a bigger, separate change - tracked in `todo.md`.
  - The outflow "Tipo di movimento" (purpose) and "Tipologia" (payment type)
    fields could previously be combined in ways that don't make sense (e.g.
    "Piano di accumulo" on a plain expense). Tipologia's options now depend
    on the selected purpose, and switching purpose resets an option that's
    no longer valid instead of silently keeping it.
  - Replaced the cramped inline edit grid in Outflows/Incomes card view -
    and, in a follow-up, the equally cramped inline row edit in table view
    too - with a single shared centered modal (reusing the same modal
    primitives `CategoryPicker`'s create-category dialog already uses),
    at every screen size, instead of one popup for mobile and a different
    inline layout for desktop.
  - Outflows/Incomes table view on mobile no longer pins the category column
    left and the edit/delete column right - that combination left only a
    narrow sliver of the table actually scrollable, showing one value at a
    time and making the table hard to read. The whole row now scrolls
    together as one unit, like a normal mobile table.
  - Shared expenses are now grouped by month (collapsible, newest first)
    with a filter panel (note search, status, date range), instead of one
    long flat list.
  - Follow-up polish from live-testing the modal and mobile scroll fixes
    above:
    - The shared `FilterRow`/`FilterInlineRow` components (used by every
      Outflows/Incomes/Shared-Expenses filter panel) weren't receiving the
      `theme` prop they need to color their own note/date `<input>`s and any
      nested `<select>` - rendering as plain unthemed white boxes with
      unreadable white-on-white text in dark mode. Fixed everywhere this
      pattern was used.
    - The transaction-edit modal's category/typology/amount/note/date/
      purpose fields still used the old inline-edit styling (a permanent
      blue-tinted border, meant to flag "you're editing this" in a dense
      list row) - visually inconsistent now that they live in a modal, which
      already signals that. Switched them to the same neutral field style
      used by the rest of the app's modals and forms.
    - Removed the redundant "Annulla modifica" button from the edit modal's
      footer - the header's ✕ already closes/cancels it.
    - `insert-values`' content area was capped at 1100px, leaving large
      unused margins on wide screens and forcing the transaction table to
      horizontally scroll even when the window had room to spare. Widened it
      to 1400px (matching the width already used on Comparison/Knowledge)
      and let the table fill its container instead of capping at 1200px on
      its own.

### Added
- Recurring transaction templates (subscriptions, rent, salary) can now pick
  a source/destination account and sub-account, the same grouped picker used
  everywhere else a balance source is chosen. When the daily cron fires a
  template, the generated transaction now records that source and - a
  genuine behavior change - automatically moves the amount in/out of the
  selected account/sub-account (liquidity account, investment holding, or
  the plain macro balance field), the same way a manually-entered
  transaction already does, since no one is there to confirm it when the
  cron runs unattended. Templates left without a source keep behaving
  exactly as before (ledger entry only, no balance movement).
- `docs/DEPENDENCIES.md`: a reviewable, per-package justification for every
  direct dependency, a periodic re-audit process, and the reasoning behind
  deliberately deferring the Vite 8 and TypeScript 7 upgrades for now.
  Prompted by a full `depcheck` audit (zero genuinely unused runtime
  dependencies found) and by noticing four separate icon libraries in active
  use with nobody having decided that on purpose - now tracked as a real
  cleanup target in `todo.md` instead of silently accumulating further.
- `.github/workflows/publish-docker.yml`: publishes prebuilt multi-arch
  (`linux/amd64`, `linux/arm64`) `web`/`api` images to GHCR on every tagged
  release, so self-hosting no longer requires a local build - see "Prebuilt
  images" under "Docker self-hosting" in `README.md`. Also pushes the same
  images to Docker Hub once `DOCKERHUB_USERNAME`/`DOCKERHUB_TOKEN` repo
  secrets exist (skips itself otherwise, so this stays optional and never
  breaks the GHCR publish). Ships without Turnstile/Umami/Web Push keys
  baked in (those are Vite build-time values); self-hosters who want their
  own still use `docker compose up --build`.
- README: a top-of-file quick-links row (Website/Live Demo/Pricing/FAQ/
  Roadmap/Contributing), a "Contributions Welcome" badge linking to
  `CONTRIBUTING.md`, and a short "who it's for" bullet list replacing part
  of the opening paragraph, to make the pitch scannable in a few seconds
  instead of requiring a full paragraph read.
- Outflow/income table and card views: a "Payment method" column showing
  which account/balance a transaction was paid from or credited to, editable
  in place. Changing it now correctly moves the amount out of the old
  account/balance and into the new one (previously, changing the source
  together with the amount could revert the wrong account).
- CSV import wizard: when a bank/provider export is auto-detected (Revolut,
  N26, Trade Republic, PayPal), the wizard now auto-selects the matching
  liquidity sub-account if one is already linked to it, or falls back to the
  right generic balance macrocategory (e.g. "Bank") instead of leaving the
  payment source unset. Liquidity accounts can be manually linked to a
  provider from the account management panel, and get linked automatically
  the first time one is created during an import.
- Fixed-denomination liquidity accounts (e.g. electronic meal vouchers issued
  in fixed units like €8): a liquidity account can now be given a
  denomination and a fallback account from the account management panel.
  Spending an amount that isn't an exact multiple of the denomination (or
  that exceeds the account's balance) now automatically splits the payment
  across the voucher account and its fallback, shown as one row (e.g.
  "Edenred (8,00€) + Banca (3,50€)") — applied automatically for imported
  CSV rows, and available when editing a transaction's payment method
  in-place.

### Changed
- Comparison page, fully rethought: replaced the dense always-visible stat
  grids and the dead motivational-popup/legacy-rankings-tab code with a
  narrative "financial mirror" layout - a single percentile gauge and
  plain-language headline insight up front, everything else (cashflow,
  savings rate, asset allocation, spending by category, behavior) tucked
  behind a progressive-disclosure accordion so the page shows one clear
  thing at a time instead of everything at once. Every number still comes
  from the same anonymous, privacy-gated cohort data as before (same
  `MIN_COHORT` threshold, same consent flow) - this is a presentation
  rewrite, not a data change. New: a "compare by country" view that isolates
  geography as the only cohort factor, and a "Region & city" placeholder
  that's honest about not collecting that data yet while laying the
  groundwork (see `todo.md`) for a future clickable map and location/job
  change simulator.
- Custom comparison cohorts (the factor customizer and the new "compare by
  country" view) now relax automatically instead of just reporting "not
  enough data": when the exact combination of factors you picked doesn't
  reach the privacy threshold, the server progressively drops household,
  then life stage, then career and retries - geography is never dropped
  automatically, since cost of living dominates nominal financial
  differences more than any other single factor. The comparison always says
  plainly which factors it actually ended up using when it had to broaden.
  The main percentile comparison also now shows a running "X of 20 people
  so far" count instead of a bare "not available yet" while the platform is
  still small, so it's clear the wait is about community size, not something
  broken.
- The public demo account ("Try Demo") now shows the redesigned Comparison
  page fully populated instead of behind its opt-in wall or in an empty
  state: demo data ships with benchmark consent already granted and realistic
  cohort/population numbers, and the demo now mocks the behaviour-benchmark
  and custom-cohort endpoints (factor customizer, "compare by country")
  instead of leaving them to hit a real backend that doesn't exist in demo
  mode - including a demo-only simulation of the new automatic factor
  relaxation, so a visitor can see that in action too.
- Migrated Tailwind CSS from v3 to v4: switched from the PostCSS plugin to
  the official `@tailwindcss/vite` plugin (removes `postcss.config.js`
  entirely), dropped `autoprefixer`/`postcss` (built into v4), and kept the
  existing `tailwind.config.js` working via the new `@config` directive in
  `src/index.css` rather than hand-translating custom theme tokens to CSS
  `@theme` syntax (safer - zero risk of a typo silently dropping a utility
  class used across the app).

### Fixed
- Fixed the Quick Add popup's "Conto (opzionale)" field only ever showing the
  11 macro asset categories: it already fetched and merged in liquidity
  accounts and investment holdings as selectable sub-account entries, but
  rendered them all as a flat, unstyled native `<select>` instead of the
  grouped/indented MUI picker (`renderBalanceSourceMenuItems`) used
  everywhere else a balance source is picked - swapped to the shared
  component for visual consistency.
- Fixed Umami analytics reporting zero traffic in production: the `/stats/:match*`
  proxy rewrite in `vercel.json` pointed at `https://eu.umami.is`, which
  301-redirects to `https://cloud.umami.is` (the CSP `connect-src` already
  allow-listed `cloud.umami.is`, not `eu.umami.is` - a mismatch present since
  this proxy was first added). Loading the tracker script through a
  cross-origin redirect gets it blocked by `script-src 'self'`, so
  `window.umami` never initialized and every pageview/event silently
  no-opped. Pointed the rewrite at `https://cloud.umami.is` to match.
- Fixed Umami analytics still reporting zero traffic after the fix above:
  the `/stats/:match*` reverse proxy only ever covers the `script.js`
  download - Umami Cloud's hosted tracker script has its actual event-collection
  host (`https://gateway.umami.is`) hardcoded at build time, so every
  `/api/send` call bypasses the proxy entirely and goes straight there
  regardless of what path the script itself was loaded from. That domain
  wasn't in the CSP `connect-src` allowlist (which listed the now-confirmed-unused
  `cloud.umami.is` instead), so the browser blocked every single event -
  confirmed via a real browser's console CSP violations, which is also what
  revealed the actual endpoint. Swapped `connect-src`'s `cloud.umami.is` for
  `gateway.umami.is`.
- Fixed a site-wide styling regression from the Tailwind v4 migration: Tailwind
  v4 wraps its output in native CSS cascade layers, and per spec any unlayered
  rule always wins over a layered one regardless of specificity - so the
  global reset in `src/index.css` (previously plain, unlayered CSS) was
  silently overriding every Tailwind spacing utility (`p-8`, `mb-16`, `gap-5`...)
  across the whole app, breaking the landing page, footer pages
  (pricing/FAQ/sitemap), and the profile menu. Fixed by wrapping that reset in
  `@layer base`, the same layer Tailwind's own reset uses.

### Security
- Added rate limiting (existing Redis-backed `checkAndConsumeRateLimit`) to
  the private-session middleware, the cron secret-check middleware,
  registration, login, and several password-verification/destructive user
  routes that had none - CodeQL had flagged 9 of these; login itself wasn't
  flagged but had the same gap and got the same fix as password recovery.
- Fixed a tainted-format-string issue in the rate limiter's own error
  logging (`server/src/libs/rateLimiter.ts`).
- Added CSRF protection: a same-origin check (`server/src/libs/csrfProtection.ts`)
  on all state-changing requests, comparing the browser's `Origin`/`Referer`
  against the request's own host - no configuration needed, so it's correct
  for both the hosted deployment and any self-hosted domain automatically.
  Complements the existing `sameSite: "lax"` on the auth cookies.
- Fixed `sanitizeInput`'s HTML-tag strip (`server/src/routes/common.ts`,
  shared by ~40+ input fields) to loop until stable instead of a single
  pass, so a nested tag like `<<script>script>` can no longer survive as
  `<script>` after sanitization.
- Fixed an origin-spoofing bug in `TradingViewWidget`'s `postMessage`
  listener: it checked `event.origin.includes('tradingview.com')`, which
  also matches attacker-controlled origins like `evil.com/tradingview.com`;
  now requires an exact hostname/subdomain match.
- Added a guard against prototype-pollution in `scripts/translateLocales.js`'s
  path-based deep-set helper (dev-only script, real exploitability was near
  nil, but cheap to close).
- Added explicit, minimal `permissions:` blocks to the two GitHub Actions
  workflows that were missing one.
- Resolved the `npm audit`-fixable dependency vulnerabilities (`npm audit
  fix`, lockfile-only, no `package.json` range changes). The remaining
  stragglers are all rooted in `@vercel/node`'s own dependency tree or need
  compatibility testing beyond a version bump - tracked in `todo.md`.
- Closed two more of those stragglers via `package.json` `overrides`:
  `js-yaml` to `^4.3.1` (fixes the quadratic-CPU-DoS CVEs in `!!omap`/merge-key
  resolution; pulled in transitively by `eslint` and `@vercel/node`'s bundled
  Python-runtime detector, both dev/build-time only) and `uuid` to `^11.1.1`
  (fixes the missing-buffer-bounds-check CVE; pulled in by `exceljs`, a real
  runtime dependency - verified its only call site uses the no-`buf` `uuidv4()`
  form that was never actually affected). `undici`/`path-to-regexp`/`smol-toml`/
  `ajv`/`@vercel/*` remain open: they're hard-pinned inside `@vercel/node`'s own
  tree, dev/build-time only (never reachable via the deployed app), and the
  only path that resolves them (`npm audit fix --force`) wants to downgrade
  `@vercel/node` to 4.0.0 untested - see `todo.md`.
- Resolved every Supabase Security/Performance Advisor warning
  (`supabase/migrations/harden-function-search-path-and-extension-schema.sql`,
  `optimize-rls-policies-and-add-fk-indexes.sql`, applied to `schema.sql` in
  its final-state form too): pinned `search_path` on the 5 SQL functions the
  advisor flagged as mutable (`function_search_path_mutable`); revoked
  `anon`/`authenticated` EXECUTE on `rls_auto_enable()` - a `SECURITY
  DEFINER` event-trigger handler that was reachable via `POST
  /rest/v1/rpc/rls_auto_enable` despite only ever needing to run as the
  trigger itself; moved the `pg_net` extension out of the `public` schema
  (best-effort - wrapped in exception handling since some pg_net versions
  aren't relocatable, see the migration's comment); rewrote all 26 RLS
  policies that called `auth.uid()` unwrapped in `USING`/`WITH CHECK` so it
  evaluates once per query instead of once per row
  (`auth_rls_initplan`); added the 41 missing covering indexes on foreign
  key columns the advisor listed (`unindexed_foreign_keys`). One advisor
  item is out of SQL's reach: "Leaked Password Protection Disabled" is a
  Supabase Auth dashboard toggle (Authentication -> Policies), not a
  database object - needs enabling manually per project, hosted and
  self-hosted alike.

### Added
- Deployment-mode detection: `DEPLOYMENT_MODE` env var (`server/src/libs/deploymentMode.ts`,
  fails safe to self-hosted), `GET /api/config`, and a new `DeploymentContext`
  (`src/contexts/DeploymentContext.tsx`) that lets the frontend tell a
  self-hosted instance apart from the official pacifinance.com deployment
  without ever calling the backend in mock/demo mode. First consumer: the
  Comparison page's benchmark opt-in card now shows honest self-hosted-
  instance copy (this instance's own users only; cross-instance community
  comparison is planned, not live yet) instead of the hosted-community
  wording, via new `optInTitleSelfHosted`/`optInDescriptionSelfHosted` i18n
  keys in all six locales.
- `server/src/services/communityStatsContribution.ts`: typed, pure envelope
  builder matching the shape already specified in
  `docs/COMMUNITY_STATS_PROTOCOL.md`, for future cross-instance community
  benchmarking. Structure only — no bucket-coarsening, pseudonym generation,
  signing, or network transport yet; see the file's own comments and
  `docs/PRODUCT_VISION.md` §9 for what's still open.
- `scripts/self-host-local.sh`: one command for a fully local self-host with
  no cloud account — clones Supabase's own official self-hosting stack on
  demand (never vendored into this repo, so it can't drift from their actual
  setup), generates its secrets, bootstraps `supabase/schema.sql` against it,
  wires this repo's `.env` to it, then builds and starts Pacifinance. Works
  because the backend already only talks to Supabase's API (including its
  Auth admin API), so it runs unmodified against a self-hosted instance.
  `docker-compose.yml`'s `api` service now maps `host.docker.internal` on
  Linux too, so it can reach that locally self-hosted stack the same way
  Docker Desktop already lets it on Mac/Windows. README documents both this
  script and the equivalent manual steps.
- `.env.example`: documented `VITE_UMAMI_WEBSITE_ID`, `VITE_UMAMI_SCRIPT_URL`,
  `GITHUB_TOKEN` and the `GITHUB_APP_*` trio, which the code already read
  but which weren't listed anywhere.
- Info page (`/info`): rewritten. Replaced the six UI-tutorial FAQ entries
  ("how do I add an income", "how do I change my password"...) with actual
  frequently-asked questions (privacy, data export, account deletion,
  pricing, self-hosting, AI use); added a "Where we're headed" section
  summarizing `docs/PRODUCT_VISION.md` (generic assets/complete net worth,
  scenario simulations, explainable financial health, optional/local-first
  AI) with links to the Roadmap and the full vision doc on GitHub, since
  that material previously wasn't surfaced anywhere in the app; replaced the
  generic "Continuous Support" feature card with an "Open Source" one and
  added a GitHub link next to the donation button; dropped the redundant
  "Our Commitment" section (four paragraphs restating things already said
  elsewhere on the page); fixed the hardcoded English "Support Pacifinance"
  button label. Also fixed the page's background, which had its own opaque
  gradient silently overriding the shared background every other page uses
  — Info was the one page in the app that visibly looked different.
- Dashboard: Income/Outflow, Balance Analysis, Financial Insights and Goal
  Tracker sections are now collapsible (Liquidity/Emergency Fund/Investments
  already were), with the open/closed state remembered per section across
  visits. Any section with no saved preference yet starts collapsed on
  mobile and expanded on desktop — the mobile dashboard previously forced
  everyone to scroll past every large section fully open on every visit.
  All six sections now share the exact same collapsed/expanded card chrome
  (`PortfolioSection`) instead of four different ad hoc treatments — Balance
  Analysis previously had no border at all when collapsed, and Financial
  Insights was noticeably wider than every other section.
- Account deletion confirmation now spells out, before you commit to it: what
  gets deleted, that it only actually happens after a 30-day grace period,
  that logging back in during those 30 days cancels it, and that any
  community prices you've verified stay visible to other users (previously
  a single generic sentence, with that detail only shown *after* confirming).
- `server/src/libs/userDataDomains.ts`: a single registry of every
  user-owned data domain, now driving the "Export Data" endpoint
  (`POST /api/user/alldata`), which previously only ever returned balances
  and transactions (truncated at that — even those were missing several
  columns) while silently omitting the other 20 domains (investments,
  custom categories, liquidity sub-accounts, goals, recurring transactions,
  shared expenses, notification preferences, roadmap votes...). Two new
  tests (`userDataDomains.test.ts`, `userDataCascadeGuard.test.ts`) fail if
  a future data domain is ever added to the database without being either
  registered for export or explicitly excluded with a reason, and if any
  user-owned table's foreign key isn't `ON DELETE CASCADE`. Documented as
  a standing rule in `AGENTS.md` (rule 12) and `CONTRIBUTING.md` (rule 12).
- Notification settings: a "Send test notification" button (shown once
  reminders are enabled) that triggers an immediate push through the same
  delivery path as real reminders, for the user to confirm push actually
  works on their device.
- `AI_POLICY.md`: AI-assisted contributions are welcome, but must be
  disclosed, reviewed, tested, and aligned with the project's vision before
  a PR — linked from `CONTRIBUTING.md` and a checklist item in the PR
  template.
- Demo account: investment holdings (stocks/ETF/crypto with real
  quantities, cost basis, transactions and dividends), liquidity
  sub-accounts, recurring transactions, a shared-expense receivable, and
  populated spending/savings limits with custom categories — previously
  most of these returned empty arrays or nulls in demo mode, so several
  shipped features (portfolio insights, balance reconciliation, recurring
  transactions, shared expenses, goals & limits, custom categories) had
  nothing to show a visitor trying the demo. Documented in `AGENTS.md`
  (rule 5) as a standing requirement: new demo-reachable features need
  real seed data, not just a structurally-correct empty state.
- Custom 404 page: unknown routes previously redirected silently to the
  homepage, giving no feedback that the URL was wrong. Now shows a real
  not-found page with a CTA back to the dashboard (if logged in) or the
  homepage, and is excluded from indexing.
- Sticky "Get Started" call-to-action on mobile landing page, so the
  primary CTA stays reachable without scrolling back to the hero on small
  screens.
- Security headers: Content-Security-Policy, X-Frame-Options,
  X-Content-Type-Options, Referrer-Policy, Permissions-Policy and
  Strict-Transport-Security, set via `vercel.json` for the app shell/static
  pages and via Express middleware for the JSON API.
- FAQ page: `FAQPage` JSON-LD structured data, so search engines can show
  the questions as rich results.
- `scripts/generateSitemap.js`: `public/sitemap.xml` is now generated at
  build time from the real public route list (`npm run prebuild`), instead
  of being a hand-maintained file that had drifted — it listed auth-gated
  routes a crawler could never reach (`/dashboard`, `/comparison`) while
  missing real public pages added since, and its `<lastmod>` was frozen at
  a single past date.
- Dark mode now persists across visits (`localStorage`) and, absent a saved
  choice, follows the OS `prefers-color-scheme` on first load instead of
  always defaulting to dark.
- Terms of Service and Cookie Policy pages are now fully translated in all
  six supported languages via the standard i18n system, matching how the
  Privacy Policy already worked — previously both fell back to English for
  four of the six languages (es/de/fr/pt-BR).

### Changed
- `.github/dependabot.yml`: minor/patch version-update PRs are now grouped
  into one PR per ecosystem per week (npm, GitHub Actions) instead of one
  PR per dependency — major bumps stay ungrouped since those are the ones
  actually worth a separate look before merging.
- Consolidated `CLAUDE.md`, `AGENTS.md` and `.github/copilot-instructions.md`
  into one source of truth (`AGENTS.md`); the other two now just import it.
  Dropped a stale "server/ is off-limits" line that contradicted `AGENTS.md`
  and no longer reflected how the project actually works.
- Roadmap page: the pre-filled bug-report title is always in English now
  (GitHub issues are triaged in English regardless of the reporter's UI
  language).
- Landing hero: softened the desktop background fade so it reads as a
  gradual blend instead of a hard edge partway across the screen; the art
  now stays visible (lightened via filter) in light mode too, instead of
  disappearing behind a plain dotted background.
- Landing footer: moved the "Support Pacifinance" button into the
  Community column, next to the text that's actually about supporting the
  project, instead of sitting under the logo.
- `todo.md`: reconciled the backlog against the actual code — checked off
  the onboarding checklist and roadmap voting (fully shipped but left
  unchecked), corrected push notifications back to in-progress (backend is
  scaffolded — VAPID, cron scheduler, reminder types — but not working
  end-to-end yet) and OFX/QIF support back to not-started (no code behind
  it despite being marked in-progress), added a real entry for 2FA
  (doesn't exist yet — this also fixed a false "completed" on the public
  roadmap, see below), and removed two stale/duplicate lines (a superseded
  per-bank-template entry, an old one-off bundle-size check for a feature
  shipped long ago).

### Added
- `docker-compose.yml`: added local `redis` + `redis-http` (Upstash's own
  official REST shim, `serverless-redis-http`) services, with `api`
  defaulting to them when `UPSTASH_REDIS_REST_URL`/`_TOKEN` are unset in
  `.env`. Redis was a hard, silent dependency for Docker self-hosting even
  though nothing provisioned it - registration hard-fails without a
  reachable Redis (the Turnstile anti-replay guard calls it
  unconditionally), so self-hosting via Docker was broken for registration
  specifically until now unless you separately owned a cloud Upstash
  account. `.env.example` documents both the local default and how to point
  at a real Upstash instance instead.

### Changed
- `docker-compose.yml`: the `api` service's host-side port is now
  configurable via `API_HOST_PORT` (`.env.example`, defaults to 3001)
  instead of hardcoded, since no single default port is safe from colliding
  with something else already running on a given self-hoster's machine.
- `Dockerfile`: both `npm ci` steps (`web` and `api` build stages) now use a
  BuildKit cache mount for npm's package cache, so rebuilds after the first
  one don't re-download the entire dependency tree from the registry every
  time `package.json`/`package-lock.json` haven't changed.

### Fixed
- `scripts/self-host-local.sh` decided whether to apply `supabase/schema.sql`
  based on whether `.selfhost-supabase/` already existed, not on whether the
  schema was actually present in the database - a first run interrupted
  partway through (a crashed Docker Desktop/WSL, for example) could leave a
  permanently empty database that every later run silently kept skipping.
  It now checks the database itself (`profiles` table presence) and
  restarts PostgREST after applying the schema, since PostgREST caches the
  schema at startup and wouldn't otherwise see new tables until restarted.
- Registration on a self-hosted instance using Cloudflare's public Turnstile
  test keys (the ones documented in `.env.example` for local testing) always
  failed with a hostname mismatch: Cloudflare's test keys report a fixed
  `hostname: "example.com"` in their verification response regardless of the
  real page origin, which the non-production `localhost`/`127.0.0.1`
  allowlist didn't account for. Sign-up and password recovery now also show
  a small note when a self-hosted instance is using a public test key,
  pointing at setting up a real Turnstile site before deploying for real.
- The Turnstile-test-key notice (and `.env.example`'s comment) wrongly
  implied every self-hoster eventually needs real Turnstile keys "before a
  real deployment." Not true if the instance stays local/private forever
  (personal use, never reachable from the public internet) - there's no
  bot-abuse surface to protect in that case, so the test keys are fine
  indefinitely. Real keys are only needed if registration is ever exposed
  publicly.
- The self-hosted Turnstile-test-key notice on Sign-up/Recovery was a quiet
  gray sentence *below* Cloudflare's own alarming red "test key" banner, so
  a self-hoster would see the scary part first and the explanation second.
  Moved it above the widget instead and styled it as a proper amber notice
  box (matching the page's existing info-box language, `theme.warningColor`)
  so it reads as "this is expected" before the red banner, not after.
- Sign-up error toasts (registration failure, Turnstile pending/error) were
  built as raw HTML template strings but rendered as plain text, so users
  saw literal `<div><strong>` markup instead of formatted text. Replaced
  with plain sentences, matching every other `showError` call in the app.
- `Dockerfile`/`docker-compose.yml`: the `web` image's build stage never
  received any `VITE_*` variables from `.env` (`.env` is deliberately
  excluded from the Docker build context so server secrets can't end up in
  an image layer, but that silently starved Vite of the public ones too -
  Turnstile site key, Umami website ID, web push key) - they'd compile in
  empty with no error. Passed through explicitly as Docker build args
  instead, sourced from `.env` via Compose's own interpolation.
- `Dockerfile`: the `api` image's start command
  (`node --import tsx/esm server/src/index.ts`) crash-looped on Node 22 with
  `ERR_REQUIRE_CYCLE_MODULE` - handing a `.ts` entry file directly to `node`
  while registering `tsx/esm` as a loader makes it load through both the CJS
  and ESM paths at once. Switched to running it through the `tsx` CLI
  instead, the same way `package.json`'s `dev:server` script already does.
- `docker/nginx.conf`, referenced by the Dockerfile's `web` build stage, was
  missing from the repo entirely — `docker compose build` failed immediately
  for any self-hoster following the README. Added it, serving the SPA with a
  static-file/`index.html` fallback and proxying `/api/` to the `api`
  container (the frontend calls `/api/...` with a relative path, so the two
  containers need nginx to bridge them).
- `.env.example`: clarified that `VITE_DEV_MODE`'s Turnstile bypass only works
  against the frontend-only mock/demo mode, not the real backend (Docker
  self-hosting included) — the real backend never had a dev bypass and still
  calls Cloudflare's siteverify with whatever token it's sent, so the old
  wording would have led a self-hoster straight into a confusing 401 on
  registration. Documented Cloudflare's own official test keys as the
  correct way to test registration against a real backend without owning a
  real Turnstile site.
- Analytics no longer falls back to pacifinance.com's own Umami website ID
  when `VITE_UMAMI_WEBSITE_ID` is unset — a self-hosted deployment that never
  set it was silently reporting its traffic into pacifinance.com's own
  dashboard instead of just staying off.
- `supabase/schema.sql` had silently drifted since 6 August: it still
  created a `public.expenses` table, but a same-day migration
  (`use-transactions-domain.sql`) had renamed it to `transactions` — a fresh
  self-hosted deploy applying `schema.sql` per README.md/CONTRIBUTING.md
  would get a database the server code couldn't actually use. Also missing
  entirely: `roadmap_votes`, `notification_preferences`, `push_subscriptions`,
  `instrument_historical_prices` (community prices) and several investment
  tables, none of which had ever made it in. Regenerated from a live
  `supabase db dump --linked --schema public` and re-added the one thing the
  dump can't export, the `rls_auto_enable` event trigger (a database-level
  object, created directly against the live project outside any migration,
  that auto-enables RLS on future tables). `AGENTS.md` (rule 11) now
  requires every schema-changing migration to update `schema.sql` in the
  same PR so this can't happen again. Also fixed
  `userDataCascadeGuard.test.ts`'s FK scanner, which only recognized the
  old hand-written `column uuid ... references auth.users(id)` style and
  had gone completely blind to `schema.sql` once it became a raw
  `pg_dump` (which always expresses foreign keys as separate `ALTER TABLE
  ... FOREIGN KEY` constraints) — it now recognizes both styles, so the
  guard is actually checking `schema.sql` again instead of silently passing
  on an empty match set.
- Gamification badges (Savings streaks, First Save, Big/Super Saver, Budget
  Master, Frugal Month, Spending Down) compared income against
  `outflowsArray`, which sums *every* outflow transaction including money
  moved into investments and transfers between the user's own accounts (see
  `buildMonthlyArrays`). A user who invested a large share of their income,
  or transferred money between accounts, could be told they "hadn't saved"
  that month even though they clearly had. Switched all of these to
  `expensesArray` (true discretionary/necessary spending only), with a
  fallback to `outflowsArray` for callers that haven't computed it.
- Public roadmap: the "Two-Factor Authentication" item showed as completed
  because `scripts/generateRoadmap.js`'s fallback text-match
  (`todoMatch: "2FA"`) landed on an unrelated, already-checked `todo.md`
  line about mandatory 2FA for GitHub org members — 2FA for user accounts
  doesn't exist yet. Added a real `todo.md` entry with a stable
  `<!-- roadmap:2fa -->` marker, which takes priority over the text-match
  fallback and resolves this correctly.
- `vitest.config.mjs` coverage `include` globs only matched `.js`/`.jsx`,
  silently excluding `src/utils`, `src/contexts`, `src/hooks` and
  `src/services` (100% TypeScript today) from coverage measurement — the
  60/60/50/60 thresholds were checking almost nothing. Fixed the globs and
  reset the thresholds to the real, now-measured baseline (55/47/48/55);
  wired `npm run test:coverage` into CI in place of the plain `npm test`
  step, so a regression below today's actual coverage now fails a PR.
- Landing hero: the desktop artwork was cropping off the tree and moon
  because it was center-positioned inside a panel narrower than the source
  image — repositioned so the full subject is visible instead.
- Account deletion could fail for an admin account that had ever
  approved/rejected another user's community price submission:
  `instrument_historical_prices.verified_by` referenced `auth.users(id)`
  without `ON DELETE CASCADE` (every other user reference in the schema
  has it), so deleting that admin's Supabase Auth user hit a foreign-key
  violation. Fixed via a migration setting it to `ON DELETE SET NULL`
  (it records who reviewed a submission, not who owns it — `submitted_by`,
  already cascading, is the real owner reference).
- Deleting an account used to cascade-delete every community price the user
  had ever submitted, including already-verified ones other users' portfolios
  actively rely on (`getVerifiedCommunityPricesForInstrument`) — a
  contributor closing their account shouldn't take that shared data down
  with them. `instrument_historical_prices.submitted_by` is now nullable and
  `ON DELETE SET NULL` instead of `CASCADE`; the application already treated
  it as nullable everywhere (provider-sourced rows already store `null`
  there), so this was a schema-only fix.
- Mobile header: the privacy toggle rendered in alarming red with a red-tinted
  background whenever privacy mode was on — every time, since it's a
  deliberate protective feature many users leave on by default, not an error
  state. Restyled to the brand accent color with a subtle pop animation on
  toggle instead.
- Notification settings: enabling reminders always blamed a failure on
  browser notification permission, even when the actual cause was
  something else (a subscribe/network failure), which was misleading when
  the browser had already granted permission. Now only a genuine
  permission denial shows that message; other failures show a distinct,
  actionable one.
- Desktop sidebar's and Settings page's privacy (eye) toggles were leftover,
  differently-styled buttons (plain dark/light square, no animation) instead
  of the same brand-accent button with the pop animation already used in the
  mobile header. All three now render the same shared `PrivacyToggleButton`.
- Settings page's privacy-toggle description said only "hide amounts in
  charts", understating what the mode actually does: it hides values
  everywhere in the app, and in charts it also randomizes percentages/values
  and desaturates colors to grayscale so the hidden data can't be guessed
  from shape or hue. Rewritten to say so, in all six languages (previously
  hardcoded it/en only).
- Removed a fully unreachable legacy "Settings" popup in `SidebarModals.tsx`
  (its trigger button no longer existed anywhere in the UI) together with
  the duplicate delete-account confirmation flow it was the only way to
  reach — account deletion has been fully served by the redesigned,
  itemized-consequences flow on the Settings page for a while, so this was
  a second, unreachable copy of the same feature. Also deleted two
  components this left orphaned with zero remaining callers
  (`SidebarMobile`, `PrivacyToggleModeButton`) and their now-dead styled
  helpers, and dropped a dozen imports in `Sidebar.tsx` and
  `SidebarModals.tsx` left over from before this code was split into its
  own file.

## [0.10.0] - 2026-08-11

### Added
- Landing page: dedicated **Features** section (dashboard, investments, multi-currency, import, recurring transactions, goals/limits, market prices, gamification), distinct from the existing "why Pacifinance" pillars, with a link into the roadmap for what's coming next.
- Roadmap page: "show more" per column instead of one long list, and a bug-report link on completed items (opens a pre-filled GitHub issue).

### Changed
- Roadmap page: modernized card/column styling; voting on already-completed items is now read-only (voting is for prioritizing what's next, not re-litigating what already shipped).
- Landing hero: the mobile background artwork is now a real full-bleed background (matching the desktop treatment) instead of a separate boxed image sitting above the text.

### Fixed
- `scripts/setVersion.js` was writing `src/data/appVersion.js`, but the file actually imported by the app is `appVersion.ts` — every past version bump silently created a stray, unused `.js` file instead of updating the real one. The script now targets the correct file.

## [0.9.9] (continued) - 2026-07 to 2026-08

`package.json` stayed at `0.9.9` through this entire window (see the note above the [0.10.0] entry, and "Versioning policy" — this gap is exactly what that process now prevents). Shipped in that time, grouped by month:

**2026-08** — Net worth trend charts, account recovery code (block code + word phrase, printable/regenerable), income & outflow explorer, balance and holdings reconciliation.

**2026-07** — Interactive investment charts (collapsible legends, asset detail), recurring transactions, quick add, goals & spending limits, duplicate-entry detection on manual input, shared expenses, live market prices for stocks/ETFs, adaptive portfolio insights, monthly investment target, community-verified historical prices.

**2026-04** (between this and the `[0.9.9] - 2026-04-17` entry below) — multi-insert and detailed outflow analysis, already covered there.

## [0.9.9] - 2026-04-17

### Added
- **Multiple insert**: insert multiple outflows, incomes, or balance entries in a single operation (MultiOutflowInsert, MultiIncomeInsert, MultiBalanceInsert)
- **Detailed outflow analysis**: in-depth analysis by category, payment methods, and recurring patterns with monthly comparisons and 12-month average
- **Real-time crypto prices**: Market Prices page with CoinGecko data and 7-day sparklines
- **PWA installation guide**: auto-detect device instructions (iOS, Android, Desktop) in Settings and Info
- **Inline transaction editing**: edit incomes and outflows directly in the table with delete+reinsert
- **Balance impact choice for past dates**: when you insert outflows or incomes with a date in a past month, a modal asks whether you also want to update that month's balance snapshot. The preference can be saved (Ask every time / No impact / Update month's balance) and changed from Settings. Hook `usePastDateBalancePref`, selector `getBalanceForMonth`, component `PastDateBalanceChoiceModal`.
- Mock CoinGecko data for the Market Prices page in dev mode
- Mock data aligned with i18n files for demo/dev/prod consistency
- Changelog file to track the project's history

### Fixed
- Hardcoded English categories in the detailed outflow analysis: now translatable in all languages
- Category colors and icons not aligned with the centralized file in recurring sections
- Category color i18n: robust fallback with reverse-lookup for translated tags
- More stable app: resolved post-registration loading issues and improved network error recovery
- Improved mobile experience: eliminated accidental zoom, optimized layout

### Changed
- Updated roadmap with recent features (multi-insert, detailed outflow analysis, i18n colors)
- Updated Copilot instructions: requirement to update the roadmap for every user-facing feature

---

## [0.9.8] - 2026-02

### Added
- **More stable and reliable app**: fixed post-registration loading, automatic network error recovery
- **Improved mobile experience**: eliminated accidental zoom/pinch, optimized layout, faster loading
- **Inline transaction editing**: edit directly in the table without leaving the list view
- **PWA installation guide**: step-by-step instructions with automatic device detection
- **Real-time crypto prices**: price monitoring with 7-day sparklines
- Tests for critical app states: 79 new tests for authentication, data loading, error recovery
- Tests: 401 axios interceptor, full auth flow, error retry

---

## [0.9.7] - 2025-02

### Added
- **CSV/Excel import**: multi-step wizard with automatic column mapping and fuzzy category recognition
- **Multi-currency support**: 19 currencies with automatic conversion (frankfurter.app API, 24h cache, fallback rates)
- **Public roadmap**: kanban page auto-generated from todo.md with filters and translations
- **Feedback**: link to GitHub Issues in Settings and Info page
- Undo/rollback of last import (saveLastImport + UI undo)
- Drag and drop file upload in the import wizard
- Edit notes from the Excel file before inserting transactions
- Import: fixed white dropdowns, fixed negative amounts, parseExcel padding
- Import: modal overlay, direct URL (?section=import), landing page card, SEO
- Multi-currency: Settings currency session-only (not persisted), ProfilePage currency persisted in the DB
- Multi-currency: preferredCurrency from DB (index → code via currency tags)
- Ranking: backend now sends the %, frontend adapted to use it directly

### Fixed
- Fix: blank page after registration (reset authentication state on logout)
- Fix: retry mechanism after API error (retryCounter to force re-fetch)
- Fix: language change from settings (double language prefix)
- Fix: dashboard loading stuck (error recovery + retry + timeout)
- Fix: achievements toast above BottomNavBar on mobile
- Fix: buggy achievements (verify real data, not just structure)

---

## [0.9.6] - 2025-01

### Added
- **Customizable dashboard**: drag-and-drop sections, compact view, toolbar
- **Gamification**: 44 badges across 10 categories with GamificationSection and IT/EN translations
- **Native mobile navigation**: BottomNavBar with React Portal, popup menu, active indicator
- **Goals and Spending Limits**: dedicated frontend monitoring (backend in development)
- **Anonymous comparison**: net worth/income/outflow rankings against similar users
- Client-side generated avatar (1400+ combinations, regenerable)
- In-app notifications/changelog (WhatsNewBanner) for updates and new features
- Dark/Light mode: animated transition on theme change
- Haptic feedback on nav bar taps (navigator.vibrate)
- Skeleton loading with shimmer animation
- Lazy loading: FinancialInsights, GoalTracker, GamificationSection
- Pie chart memoization with useMemo
- Dependency Injection architecture with ServiceContext (internal refactoring)
- SettingsPage redesign: compact layout, Account Preferences, fixed currency dropdown
- BuyMeACoffee widget: CSS for mobile positioning
- ScrollNavigationIndicator: bottom 74px on mobile

### Fixed
- Fixed horizontal overflow on mobile on insert pages
- Prevented accidental zoom/pinch on mobile (viewport + CSS touch-action)

---

## [0.9.5] - 2024-12

### Added
- **Multilingual support**: interface in Italian and English with automatic language detection
- **URL-based language routing**: all routes with language prefix (/it/, /en/)
- useLocalizedNavigate and LocalizedLink used everywhere
- Desktop sidebar: fixed Link → LocalizedLink for i18n routing
- DashboardPage: localized navigate() instead of window.location.href
- Sidebar translations: dashboard, more, goalsLimits

---

## [0.9.4] - 2024-11

### Added
- **Data export**: export in CSV, Excel, JSON, and PDF format

---

## [0.9.3] - 2024-10

### Added
- **Anonymous comparison**: compare net worth, income, and outflows with similar users in a fully anonymous way
- 401 axios interceptor (automatic logout on expired session)
- ProtectedRoute redirect to / (landing)
- Mobile dashboard UI/UX (2-per-row cards, metric cards column, reduced charts, spacing)
- Floating animations disabled on mobile
- SettingsPage: typo fix, toggleLanguage fix, useNavigate fix, section reordering

---

## [0.9.0] - 2024 (Early)

### Added
- Initial launch of Pacifinance
- Anonymous registration (password only, auto-generated userId)
- Multi-platform net worth tracking (bank, stocks, ETF, crypto, cash, etc.)
- Income and outflow categorization
- Dashboard with interactive charts (Recharts)
- PWA-ready with service worker
- Cloudflare Turnstile for bot protection
- Styled-components with dark/light theme support
- Loading screen with branding
- Landing page image performance optimization (LCP preload, fetchpriority)
- Tests: BottomNavBar (10), useScrollNavigation (10), SettingsPage order (2)
- Tests for removeLanguageFromPath edge cases (8 tests)
- Tests for DataImportWizard processRowDual (15 tests)

---

## Before this file existed

`git log -- package.json` shows `package.json`'s version field actually went `0.1.0` (2023-06-11, first commit) → `0.5.1` (2023-10-18) → `0.9.0` (2025-07-12, real infra cycle: dependency injection, Redis-based sessions/cache, CRA→Vite migration, the roadmap generation script, first Vitest suite) → `0.9.9` (2026-02-17). `v0.1.0`, `v0.5.1` and `v0.9.0` are tagged on those exact commits for the record, even though the entries above don't cover that period in detail.

---

## Versioning policy

- **Every commit that changes user-facing behavior** gets a line under `[Unreleased]` above, in the same PR/commit as the change — not reconstructed later from memory or from `git log`.
- **Cutting a release**: run `npm run version:bump:<patch|minor|major>` (updates `package.json`, `package-lock.json` and `src/data/appVersion.ts` together), move the `[Unreleased]` entries under a new `## [x.y.z] - YYYY-MM-DD` heading, commit, then tag:
  ```
  git tag -a vX.Y.Z -m "vX.Y.Z"
  git push origin vX.Y.Z
  ```
- Use `MAJOR` for breaking changes (self-hosters, API consumers), `MINOR` for new user-facing features, `PATCH` for fixes only.
- This is what the `[0.9.9] (continued)` entry above exists to prevent: six months of real feature work landed without a single version bump, so `package.json`'s `0.9.9` stopped meaning anything specific. From `[0.10.0]` on, a version number always identifies one exact commit.
