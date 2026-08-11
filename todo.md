# Pacifinance - TODO

> Last updated: 2026-04-17
> For proposed designs of features not yet built, see [docs/FUTURE_DESIGNS.md](docs/FUTURE_DESIGNS.md)
> For the longer-term product vision beyond this list (simulations, generic assets, context engine, optional AI), see [docs/PRODUCT_VISION.md](docs/PRODUCT_VISION.md)
> Roadmap status legend: [x] done · [~] in progress · [ ] planned (with `<!-- roadmap:id -->` markers)

- [x] Account recovery code: block code + word phrase, printable card with QR, can also be regenerated from Settings <!-- roadmap:account-recovery-code -->
- [x] Interactive investment charts: collapsible/selectable categories, asset detail and a progressive "What's New" feed <!-- roadmap:interactive-investment-chart-legends -->

---

## Completed

- [x] Mobile BottomNavBar (React Portal, popup menu, active indicator) <!-- roadmap:mobile-nav -->
- [x] Sidebar desktop: fixed `Link` -> `LocalizedLink` for i18n routing
- [x] `useLocalizedNavigate` used everywhere <!-- roadmap:i18n -->
- [x] Fixed `useScrollNavigation` with `removeLanguageFromPath()`
- [x] DashboardPage: localized `navigate()` instead of `window.location.href`
- [x] Sidebar translations: dashboard, more, goalsLimits
- [x] Axios 401 interceptor (automatic logout on expired session)
- [x] ProtectedRoute redirects to / (landing)
- [x] Mobile dashboard UI/UX (2-per-row cards, metric card column, smaller charts, spacing)
- [x] Floating animations disabled on mobile
- [x] SettingsPage: fixed typo, fixed toggleLanguage, fixed useNavigate, reordered sections
- [x] Lazy loading: FinancialInsights, GoalTracker, GamificationSection
- [x] Pie chart memoization with useMemo
- [x] Skeleton loading with shimmer animation
- [x] Tests: BottomNavBar (10), useScrollNavigation (10), SettingsPage order (2)
- [x] Gamification: 44 badges across 10 categories, GamificationSection, IT/EN translations <!-- roadmap:gamification -->
- [x] Customizable dashboard: drag-and-drop, compact view, toolbar <!-- roadmap:dashboard-custom -->
- [x] BuyMeACoffee widget: mobile positioning CSS
- [x] ScrollNavigationIndicator: bottom 74px on mobile
- [x] Client-side generated avatar (1400+ combinations, regenerable)
- [x] Multi-currency: CurrencyContext, 19 currencies, frankfurter.app API, 24h cache, fallback rates <!-- roadmap:multi-currency -->
- [x] Multi-currency: replaced hardcoded euro, provider tree, tests (17+12), translations
- [x] Multi-currency: `preferredCurrency` from DB (index -> code via currency tags)
- [x] Multi-currency: session-only Settings currency (not persisted), ProfilePage currency persisted to DB
- [x] Roadmap: public kanban page, automated from todo.md, filters, translations <!-- roadmap:roadmap-feedback -->
- [x] Feedback: GitHub Issues link in SettingsPage + Info page
- [x] Anonymous comparison with similar users (net worth/income/outflow rankings) <!-- roadmap:anonymous-comparison -->
- [x] SettingsPage redesign: compact layout, Account Preferences, fixed currency dropdown
- [x] CSV/Excel import: multi-step wizard, dual column, fuzzy category matching <!-- roadmap:csv-import -->
- [x] Import: fixed white dropdowns, fixed negative amounts, Excel parsing padding
- [x] Import: modal overlay, direct URL (`?section=import`), landing page card, SEO
- [x] Fix: dashboard stuck loading (error recovery + retry + timeout)
- [x] Fix: achievement toast overlapping BottomNavBar on mobile
- [x] Fix: broken achievements (verify against real data, not just structure)
- [x] Fix: language switch from settings (double language prefix)
- [x] Edit notes from the Excel import before inserting transactions
- [x] Fix: blank page after registration (reset auth state on logout) <!-- roadmap:stability -->
- [x] Fix: retry mechanism after an API error (retryCounter to force a re-fetch)
- [x] Redesigned loading screen with better branding and contrast
- [x] Landing page image performance (LCP preload, fetchpriority)
- [x] Fix: horizontal overflow on mobile insert pages
- [x] Prevent accidental pinch/zoom on mobile (viewport + CSS touch-action) <!-- roadmap:mobile-ux -->
- [x] Tests for critical app states: 79 new tests for auth, data loading, error recovery
- [x] Dependency Injection architecture via ServiceContext (internal refactor)
- [x] Tests: axios 401 interceptor, full auth flow, error retries
- [x] Ranking: backend now sends the percentage directly, frontend adapted to use it
- [x] Dark/light mode: animated transition on theme switch (already implemented)
- [x] Haptic feedback on nav bar taps (navigator.vibrate)
- [x] In-app notifications/changelog for updates and new features (WhatsNewBanner)
- [x] Tests for removeLanguageFromPath edge cases (8 tests)
- [x] Tests for DataImportWizard processRowDual (15 tests)
- [x] Undo/rollback of the last import (saveLastImport + UI undo)
- [x] Drag and drop file upload (already implemented in the wizard)
- [x] Inline editing of income/outflows: edit directly in the table with delete+reinsert <!-- roadmap:inline-edit -->
- [x] PWA install guide: auto-detects device (iOS/Android/Desktop) in Settings and Info <!-- roadmap:pwa-install-guide -->
- [x] Fix: category color i18n with a robust reverse-lookup fallback for translated tags <!-- roadmap:i18n-category-colors -->
- [x] Mock data aligned with i18n files for demo/dev/prod consistency
- [x] CoinGecko mock data for the Market Prices page in dev mode
- [x] Crypto market prices page with data and 7-day sparklines <!-- roadmap:market-prices -->
- [x] Multi-insert: outflows, incomes and balances in one operation (MultiOutflowInsert, MultiIncomeInsert, MultiBalanceInsert) <!-- roadmap:multi-insert -->
- [x] Detailed outflow analysis: categories, payment methods, recurring patterns with monthly comparisons <!-- roadmap:detailed-outflow-analysis -->
- [x] Income/outflow explorer: KPIs, trend, net flow, categories, period comparison, responsive table <!-- roadmap:income-outflow-explorer -->
- [x] Fix: outflow categories translated in every language (i18n category names in DetailedOutflowsAnalysis) <!-- roadmap:i18n-category-colors -->
- [x] User choice for balance impact on backdated entries (past date balance choice), with a modal, persisted preference and a Settings toggle <!-- roadmap:past-date-balance-choice -->
- [x] Duplicate detection on manual income/outflow entry too (same heuristic as CSV import), with a confirmation modal <!-- roadmap:manual-duplicate-check -->
- [x] Shared expenses: "I paid for the group" on an outflow records only your own share as a real expense and tracks the rest as a receivable, recoverable without creating a fake income entry <!-- roadmap:shared-expenses -->
- [x] Live stock/ETF prices via Finnhub: "Refresh prices" button in investment charts, converts the quote to EUR at the exchange currency, updates the current value and logs a monthly history <!-- roadmap:live-stock-prices -->
- [x] Adaptive investment portfolio analysis: gain/loss, best/worst position, average monthly invested amount and time-to-goal estimate — each figure unlocks based on the history actually entered, with suggestions on what to add for a more precise analysis <!-- roadmap:portfolio-insights -->
- [x] Monthly investment target: set how much you'd like to invest each month and automatically check, month by month, whether you hit it, reconstructed from the investment history already entered <!-- roadmap:investment-monthly-target -->
- [x] Balance/holdings reconciliation: declared monthly total kept distinct from the detailed holdings, with coverage, drift and percentage weight per position <!-- roadmap:investment-balance-reconciliation -->
- [x] Community-verified historical prices: propose the price of one of your assets for a past month, an admin verifies it against a real provider and, once approved, it becomes the shared price for everyone — a free alternative to paid historical price data <!-- roadmap:community-historical-prices -->
---

## Roadmap

### Phase 1 — Entry friction (top priority)
- [x] Quick-add from the dashboard/PWA: floating action button + popup, log an outflow in under 10 seconds (amount + category, everything else optional) <!-- roadmap:quick-add -->
- [x] Recurring expenses/subscriptions: full end-to-end monthly recurrence (DB + backend + management UI) <!-- roadmap:recurring-transactions -->
- [x] Paste-and-recognize: client-side parsing (smartPasteParser.ts) of free text into amount+category, inside quick-add — 100% client-side, zero server involvement
- [x] Voice input = OS dictation in the paste-and-recognize field (the phone's keyboard mic transcribes, our parser recognizes it; the audio never touches our servers)
- [ ] Auto-link recurring outflows created from the "subscription/periodic payment" payment type (prompt "make it recurring" on save) — not done this round, for now these are only created from the dedicated panel
- [ ] Per-bank mapping templates for import (Fineco, Intesa, Revolut, N26) — a privacy-friendly substitute for open banking
- [ ] Receipt photo: client-side OCR with tesseract.js (WASM in the browser) → pre-fills quick-add; the image never leaves the device. Not done this round: needs a new heavyweight dependency (tesseract.js, a few MB of WASM + trained data) — deserves its own round to evaluate the bundle-size impact, not a rushed addition

### Phase 2 — Data consistency
- [x] Income/outflows: select the source at the sub-account level, with a nested dropdown (sub-accounts indented under the parent account, not flat "Bank / Revolut" entries)
- [ ] Persist the transaction→source link to the DB: deleting an outflow (or income) with a specified source should propose auto-reversing that exact field, with user confirmation
- [ ] Compact dashboard view: % of each sub-account relative to its parent account
- [ ] Compact view: expand "Category Summary" and "Income|Outflows" with more detail (%, change vs previous month, saving rate — a quick snapshot of the financial situation)
- [ ] Market Prices: fix values showing 0 (7d average, up/down), disclaimer "showing the top N by market cap", raise N beyond 10, on-demand search for coins not in cache (single fetch via CoinGecko /search + /coins/{id}) — minimal fix only, don't over-invest here

### Phase 3 — Going open source
- [x] Audit secrets/credentials in the git history before opening the repo — full history + working tree scanned, no live secrets found; the earlier Mongo migration data was already scrubbed via `git filter-repo`. Also found and removed a fabricated `aggregateRating` (fake star rating) that had shipped in the landing page's structured data for ~10 months (already gone from HEAD, now scrubbed from history too, including the giveaway commit message and author emails); translated ~20 stray Italian code comments to English <!-- roadmap:oss-history-audit -->
- [x] Chose a license: AGPLv3 — forces hosted forks to publish their changes back
- [x] Transferred the serverless repo into the Pacifinance GitHub organization (a transfer, not a copy: GitHub creates automatic redirects); archived the legacy repo with a README pointing to the new one
- [x] Vercel deploy from the org repo WITHOUT Vercel Pro: `.github/workflows/deploy-vercel.yml` workflow (Vercel CLI, not the native import — importing from an org pushes you toward the paid Team plan, deploying via CLI + personal token doesn't). Push to `main` → production, PR → preview with a URL comment. Still open: create the 3 secrets (VERCEL_TOKEN/VERCEL_ORG_ID/VERCEL_PROJECT_ID via a local `vercel link`) and disconnect Vercel's native Git integration to avoid deploying twice
- [x] GitHub org: mandatory 2FA for members, branch protection on main (PR + review), CODEOWNERS, secrets only in deploy environments (Vercel/Supabase), never in the repo
- [x] Co-owner: added a second maintainer as an org Owner (bus factor ≥ 2)
- [x] Removed the global floating BuyMeACoffee widget (a script injected outside the React tree that stayed visible on every page, including the authenticated app, after the first visit to Landing/Pricing/Info — invasive and inconsistent with the privacy-first positioning); replaced with a static "☕ Support Pacifinance" link only where a dedicated support section already exists
- [x] FUNDING.yml: BuyMeACoffee as the initial static channel; GitHub Sponsors can be added once active
- [x] README + CONTRIBUTING in English, public CI (GitHub Actions: lint+test+build on PR — free for public repos)
- [ ] Landing page "self-host in 10 minutes" with Docker (docker-compose: static frontend + Express server + Postgres; Redis optional)
- [x] Demo account with mock data and no DB requests (planned below too, becomes a launch prerequisite)
- [ ] Launch: Hacker News, r/selfhosted, r/ItaliaPersonalFinance

### Phase 3b — Hosted + self-hosted architecture
- [ ] Dual distribution: hosted web app (pacifinance.com, free) + free self-hosted (AGPL) — same codebase; the competition is NOT hosted-vs-self-hosted
- [ ] Anonymous comparison for self-hosted instances: an opt-in "community stats" service — the self-hosted instance sends ONLY anonymous aggregates (profile bucket: age range/job/country + rounded monthly totals), NEVER raw transactions; it receives percentiles back. Anyone who opts out gets everything except the comparison. This is the network effect that stays with the project even with open code
- [ ] Note on Vercel: the Hobby plan prohibits commercial use — the day a paid tier launches, Vercel Pro (or a host migration) becomes necessary; budget for it then, not before

### Phase 4 — Anonymous comparison (the differentiator)
- [x] Benchmark transparency v1: cohort size, factors used, privacy threshold and real percentiles all visible on the comparison page
- [x] Excluded demo/test accounts from community averages and rankings
- [x] Separate explicit consent to contribute to hosted benchmarks, with revocation/deletion available <!-- roadmap:benchmark-consent -->
- [x] Median, quartiles and the actual contributor count per metric (not relying on the average alone) <!-- roadmap:benchmark-distributions -->
- [x] Cohort personalization: dynamic selection of job/career, geographic area, life stage and household; short-lived Redis cache, on-demand aggregate computation, a live preview of cohort size and a hard cutoff below the privacy threshold <!-- roadmap:custom-cohort -->
- [x] Monthly snapshot of standard cohorts: save the profile buckets and the algorithm version at each monthly refresh, so every benchmark stays reproducible for the whole month without reacting to later profile changes. Balances, income or outflows are never part of the similarity definition. <!-- roadmap:benchmark-snapshots -->
- [~] Derived insights: highlight the parent category with the largest economic gap vs the cohort; add trend and percentage contribution to the gap
- [x] Longitudinal 3/6/12-month benchmarks using a stable group, with an update date, sample size and a reliability indicator <!-- roadmap:benchmark-longitudinal -->
- [ ] Benchmarks for emergency runway, fixed costs/income ratio, saving rate and asset diversification
- [ ] Comparisons by job, experience, work region, remote work and household composition; always show range and sample size
- [ ] Cost-of-living normalization by geographic area, while keeping the nominal comparison visible too
- [ ] Job/location change simulator as an observational scenario with explicit assumptions, never presented as advice or causation
- [~] Opt-in community stats protocol for self-hosted instances: sending only rounded monthly buckets and aggregates, never transactions — v1 spec in `docs/COMMUNITY_STATS_PROTOCOL.md`; endpoint and signing still to be implemented
- [ ] Signed/versioned benchmark snapshots for self-hosted instances, short contribution retention and verifiable revocation
- [ ] Anti-differencing/Sybil protections, a contribution quality score, and bias auditing for rare cohorts
- [ ] Referral and invite badges (already tracked in server/todo.md)

### Out of scope (decided, don't reopen without a strong reason)
- Job listings inside the platform (two-sided marketplace, off-focus, privacy risk)
- Expanding Market Prices beyond the minimal fix (commodities aren't a differentiator)
- New languages beyond the current 6 / exotic assets

---

### Security
<!-- Encrypted recovery-email idea evaluated and dropped: even as an optional
     field it wouldn't stop a user from typing firstname.lastname@..., which
     reintroduces the identifying-data exposure that the anonymous account
     model avoids. The recovery code (see above, done) solves the same
     problem while staying consistent with "no personal data, ever". -->


### Features
- [ ] Push notifications (PWA) as a monthly data-entry reminder <!-- roadmap:push-notifications -->
- [ ] Quick summary widget on the home: net worth + change vs previous month
- [x] Historical net-worth trend charts (timeline) <!-- roadmap:trend-charts -->
- [ ] Export PDF: improve the layout, include charts <!-- roadmap:pdf-reports -->
- [x] Flexible goals and limits: fixed and percentage thresholds that can be combined, emergency fund in months, per-category and concentration limits, debts and passive income (backend + UI + analysis) <!-- roadmap:goals-limits -->
- [~] Guided onboarding for new users: 4-step wizard with a progress bar <!-- roadmap:onboarding -->
- [ ] Make the demo account avoid DB requests entirely and use mock data instead, so it can quickly showcase every feature and convince the user to sign up (right now it hits the DB, which doesn't scale with many concurrent users)

### Community and Feedback
- [~] User feedback system (Phase 1): in-app form -> GitHub Issue via the backend <!-- roadmap:feedback-system -->
- [~] "Contribute" section: how to donate, report bugs, propose ideas <!-- roadmap:contribute-section -->
- [~] Roadmap priority voting system (needs a backend) <!-- roadmap:roadmap-voting -->

### Testing
<!-- From a coverage audit (2026-08): well covered overall (~1755 tests,
     real authFlow integration suite, all contexts, most of utils/), these
     are the gaps worth closing, roughly by risk. -->
- [ ] Comparison/Leaderboard: no frontend test verifies the anonymous-comparison UI never renders another user's identifying fields (`src/pages/ComparisonPage.tsx`, `src/sections/Comparison.tsx`, `src/sections/Leaderboard.tsx`) — highest-priority gap, this is the privacy-sensitive surface
- [ ] `CurrencyContext`: no test on the actual EUR↔display-currency conversion math, only on the static rate table (`currencyConfig.test.js`)
- [ ] `server/src/services/ranking.ts`: thin test coverage (27 lines) for a service computing percentile placement
- [ ] Page-level smoke tests: only `DashboardPage` has one; `AuthPage`, `ProfilePage`, `GoalsAndLimitsPage`, `SettingsPage` etc. have none
- [ ] Component tests for high-traffic forms: `SignInForm`, `SignUpForm`, `RecoveryForm`, `DataImportWizard`, `InvestmentImportWizard`, `GoalTracker`, `RecurringTransactionsPanel`
- [ ] No accessibility (a11y) testing anywhere (no `jest-axe`/`@axe-core`)
- [ ] Consider 3-5 targeted Playwright smoke tests for the true black-box gaps unit tests can't reach (login→dashboard render, CSV import happy path, comparison page not leaking PII) instead of a full e2e suite

### Performance
- [ ] Check bundle size after adding BottomNavBar + MUI icons

### Data Import (evolution)
- [ ] Support updating the balance via import
- [ ] Chart preview of imported transactions (histogram by month/category)
- [ ] Per-bank mapping templates (UniCredit, Revolut, N26...) with community sharing <!-- roadmap:bank-templates -->
- [~] Auto-detect known bank formats (Fineco, Intesa, Revolut, N26) <!-- roadmap:auto-detect-bank-format -->
- [~] OFX/QIF file support <!-- roadmap:OFX/QIF-support -->
- [ ] Recurring import: remember the last file and suggest an update
