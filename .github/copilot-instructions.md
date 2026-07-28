# Copilot Instructions — Pacifinance

> React + TypeScript personal finance app. Anonymous auth (userId+password, no email). IT/EN i18n. 19 currencies. Vite + styled-components.
> Detailed rules live in `.github/instructions/`. Skills in `.agents/skills/`. Prompts in `.github/prompts/`.

---

## Quick Commands
| Command | Purpose |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build (auto-runs roadmap generator) |
| `npm run lint` | ESLint |
| `npm test` | Vitest (all tests) |
| `npm run roadmap` | Regenerate `src/data/roadmapData.js` |

## After Every Change
```
npm run lint && npm test && npm run build
```

**Do not start `npm run dev` / the dev server on your own initiative for extra verification (screenshots, browser checks, Playwright).** It slows development down significantly and the user can verify most things themselves. `lint && test && build` is the standard, sufficient verification — only start the dev server if the user explicitly asks for it.

---

## Architecture

```
src/
  components/   # Presentational UI — NO context imports (props only in reusable ones)
  pages/        # Route endpoints — assembles contexts + sections
  sections/     # Major page features
  contexts/     # Global state (see hierarchy below)
  hooks/        # Reusable logic
  utils/        # Pure functions (selectors, routing, calculations)
  data/         # Static config (colors, icons, currency, tags)
  i18n/         # Translations + language config
  __tests__/    # Mirrors src/ structure
scripts/         # Build-time automation (roadmap, versioning)
server/          # Backend — DO NOT MODIFY
```

**Context provider hierarchy (order matters — never change):**
```
MediaQuery > Language > Theme > DevMode > User > Currency > Page > Privacy > Toast
```

---

## Critical Rules

1. **i18n MANDATORY** — Every user-facing string must exist in both `src/i18n/locales/it.json` AND `src/i18n/locales/en.json`. Never hardcode UI text. Full rules: `i18n.instructions.md`
2. **URL routing** — Use `LocalizedLink` (not `Link`) and `useLocalizedNavigate` (not `useNavigate`). All routes are prefixed `/it/` or `/en/`. Full rules: `react-components.instructions.md`
3. **Currency** — All DB values are EUR. Use `CurrencyContext` (`formatAmount`, `fromEUR`, `toEUR`) for display. Never hardcode `€` or `EUR`. Full rules: `react-components.instructions.md`
4. **Selectors** — Access `userData` only via `src/utils/userDataSelectors.ts`. Never access nested properties directly.
5. **Mock data** — Any new `userData` field must also be added to `MockAuthContext.tsx`.
6. **Colors & icons** — Use `getAssetColor/Icon`, `getCategoryColor/Icon` from `src/data/`. Never hardcode colors for financial data.
7. **Outflows not expenses** — Use "outflows" (uscite) everywhere. "Expenses" only when investments are explicitly excluded.
8. **No server/ edits** — Frontend only. Backend is a separate concern.
9. **Roadmap** — User-facing feature completed? Update `scripts/roadmap-items.json` + `todo.md`, run `npm run roadmap`. Full rules: `react-components.instructions.md`
10. **No `any`** — TypeScript strict mode is on. All props typed as interfaces.

---

## Key Files Reference

| File | Purpose |
|---|---|
| `src/AppRouter.tsx` | All routes (use lazy loading for non-critical pages) |
| `src/contexts/UserContext.tsx` | All API calls + userData shape |
| `src/contexts/MockAuthContext.tsx` | Dev mock — mirror of UserContext data |
| `src/utils/userDataSelectors.ts` | ONLY way to access userData fields |
| `src/utils/i18nRouting.ts` | `LocalizedLink`, `useLocalizedNavigate` utilities |
| `src/i18n/languagesConfig.js` | SINGLE SOURCE OF TRUTH for supported languages |
| `src/i18n/locales/it.json` + `en.json` | Translation files |
| `src/data/currencyConfig.ts` | 19 currencies + fallback rates |
| `scripts/roadmap-items.json` | Roadmap source (→ `src/data/roadmapData.js`) |

---

## userData Shape (summary)
```ts
userData = {
  userId, userType, currency, // currency = resolved code e.g. 'EUR'
  profile: { nationality, job, age, preferredCurrency: { key, value } },
  balances: [{ date, balance: { bank, cash, stocks, etf, crypto, realEstate, other } }],
  expenses: { allOutflows, outflowsArray, totalOutflowsPerCategoryPerMonth },
  incomes: { allIncomes, incomesArray },
  tags: { outflowsTags, incomesTags, paymentTags, currencyTags },
  rankings: { balance, incomes, outflows, balanceSimilar, ... },
  dates: { current, preMonth, preYearSameMonth },
  goals, limits, assets, averages
}
```

---

## Scoped Rules Index

| File | Applies to |
|---|---|
| `.github/instructions/react-components.instructions.md` | `src/components/**`, `src/pages/**`, `src/sections/**` |
| `.github/instructions/i18n.instructions.md` | `src/i18n/**`, `src/utils/i18nRouting*` |
| `.github/instructions/contexts.instructions.md` | `src/contexts/**` |
| `.github/instructions/testing.instructions.md` | `src/__tests__/**` |
| `.github/instructions/utils-data.instructions.md` | `src/utils/**`, `src/data/**` |
