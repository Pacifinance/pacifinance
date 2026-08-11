# Pacifinance — Claude Code Context

## Quick Commands
```bash
npm run dev       # dev server
npm run lint      # ESLint
npm test          # Vitest
npm run build     # prod build (auto-roadmap)
npm run roadmap   # regenerates src/data/roadmapData.js
```
After every change: `npm run lint && npm test && npm run build`

**Don't start `npm run dev` / the dev server for extra checks (screenshots, Playwright, browser) on your own initiative.** It slows development down a lot and in most cases the user verifies things themselves. `lint && test && build` is the standard and sufficient check — only start the dev server if the user explicitly asks for it.

## Architecture
```
src/
  components/   # Generic UI, reusable across unrelated features
  pages/        # Routes — assembles contexts + sections
  sections/     # Feature blocks tied to one domain/page
  contexts/     # Global state
  utils/        # Pure functions (selectors, routing, math)
  data/         # Static config (colors, icons, currencies)
  i18n/         # locales/it.json + locales/en.json
  __tests__/    # Mirrors src/
```

**components/ vs sections/ — the test isn't "does it use a context?", it's "which domain does it belong to?"**
A component can live in `components/` even while reading a context, as long as that context is
cross-cutting/UI-level (`LanguageContext`, `ThemeContext`, `ToastContext`) and not business data
(`UserContext`, data from a specific domain like investments/transactions). The real criterion:
- **`components/`** — generic, reusable across unrelated features (e.g.
  `LocalizedLink`, `ThemedSelect`, `AvatarIcon`, `CategoryPicker`, `LanguageSelector`,
  `ScrollNavigationIndicator`, `PWAInstallGuide`, `ImportPlatformGuide`). If it reads a context,
  it must be only for a cross-cutting need (language/theme/toast), never to fetch domain
  data (e.g. `useDemoServices`, calls to `services/*`).
- **`sections/`** — tied to a specific domain/feature (transactions, investments, goals),
  even if reused in 2+ places within the same domain (e.g. `InvestmentHoldingsPanel` is
  reused but stays investment-specific → stays in `sections/`).

When adding a new file or moving an existing one, apply this test instead of
just checking whether it imports a context.

**Context hierarchy (fixed order):**
```
MediaQuery > Language > Theme > DevMode > User > Currency > Page > Privacy > Toast
```

## Critical Rules
1. **i18n** — every UI string in both `it.json` and `en.json`. Never hardcoded.
2. **Routing** — `LocalizedLink` (not `Link`), `useLocalizedNavigate` (not `useNavigate`)
3. **Currency** — DB is always EUR. Display via `formatAmount()` from `CurrencyContext`. Never hardcode `€`.
4. **Selectors** — access `userData` only via `src/utils/userDataSelectors.ts`
5. **Mock** — every new `userData` field → update `MockAuthContext.tsx`
6. **Colors/Icons** — `getAssetColor()`, `getCategoryColor()` from `src/data/`. Never hardcoded.
7. **Outflows not expenses** — always "outflows". Use "expenses" only when investments are excluded.
8. **Roadmap** — completed user-facing feature → `roadmap-items.json` + `todo.md` + `npm run roadmap`
9. **No `any`** — TypeScript strict. Props as `interface`.
10. **Commit messages only** — after each finished update, include a short commit message in English as the very last line of the assistant response. Keep it concise, imperative, and open-source friendly. Never run `git commit` or `git push` autonomously: the user performs both operations.
11. **Changelog** — every user-facing change gets a line under `[Unreleased]` in `CHANGELOG.md`. Release steps (version bump + tag) are documented there under "Versioning policy".

## Key Files
| File | Purpose |
|---|---|
| `src/AppRouter.tsx` | All routes (lazy-loaded for non-critical pages) |
| `src/contexts/UserContext.tsx` | All API calls + the `userData` shape |
| `src/contexts/MockAuthContext.tsx` | Dev mock — mirrors `UserContext` |
| `src/utils/userDataSelectors.ts` | The only access point for `userData` |
| `src/utils/i18nRouting.ts` | `LocalizedLink`, `useLocalizedNavigate` |
| `src/i18n/languagesConfig.js` | Single source of truth for supported languages |
| `src/data/currencyConfig.ts` | 19 currencies + fallback rates |
| `scripts/roadmap-items.json` | Public roadmap source |
| `CHANGELOG.md` | Version history + release process |

## userData Shape
```ts
{ userId, userType, currency,
  profile: { nationality, job, age, preferredCurrency: { key, value } },
  balances: [{ date, balance: { bank, cash, stocks, etf, crypto, realEstate, other } }],
  expenses: { allOutflows, outflowsArray, totalOutflowsPerCategoryPerMonth },
  incomes: { allIncomes, incomesArray },
  tags: { outflowsTags, incomesTags, paymentTags, currencyTags },
  rankings: { balance, incomes, outflows, balanceSimilar, ... },
  dates: { current, preMonth, preYearSameMonth },
  goals, limits, assets, averages }
```

## DO NOT
- Use `Link` or `useNavigate` directly (use the localized wrappers)
- Hardcode `€`, `EUR`, or hex colors for financial data or UI text
- Access `userData.property` without a selector
- Make API calls outside `UserContext.tsx`
- Add success toasts for normal operations
- Use `.toISOString().split('T')[0]` (UTC midnight bug)
- End an update without a final commit message in English
- Run `git commit`, `git push`, or create/push git tags autonomously — always ask first
- Start the dev server / browser on your own initiative for extra checks — only if explicitly requested
