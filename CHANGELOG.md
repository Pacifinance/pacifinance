# Changelog - Pacifinance

All notable changes to the project are documented in this file.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project adheres to [Semantic Versioning](https://semver.org/).

---

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
