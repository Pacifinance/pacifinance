# Changelog - Pacifinance

All notable changes to the project are documented in this file.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project adheres to [Semantic Versioning](https://semver.org/) (`MAJOR.MINOR.PATCH`; pre-1.0.0, `MINOR` bumps can still include breaking changes).

> **A note on the version numbers below `[0.10.0]`:** entries from `[0.9.0] - 2024 (Early)` through `[0.9.9] - 2026-04-17` were written narratively, grouping features into a `0.9.x` sequence that was never actually reflected in `package.json` (which really went `0.1.0` → `0.5.1` → `0.9.0` → `0.9.9`, confirmed from `git log -- package.json`, and only became `0.9.9` in February 2026 — a year after this file's own `[0.9.3] - 2024-10` entry). They're kept as-is below for the feature-level detail, which is accurate and worth having, but treat their version *numbers* as approximate rather than git-tag-accurate. Starting with `[0.10.0]`, every entry here corresponds to one real `package.json` bump and one git tag — see "Versioning policy" at the bottom.

---

## [Unreleased]

### Added
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

### Changed
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

### Fixed
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
