# Pacifinance — Claude Code Context

## Quick Commands
```bash
npm run dev       # dev server
npm run lint      # ESLint
npm test          # Vitest
npm run build     # prod build (auto-roadmap)
npm run roadmap   # rigenera src/data/roadmapData.js
```
After every change: `npm run lint && npm test && npm run build`

**Non avviare `npm run dev` / il dev server per verifiche extra (screenshot, Playwright, browser) di tua iniziativa.** Rallenta molto lo sviluppo e nella maggior parte dei casi l'utente verifica autonomamente. `lint && test && build` è la verifica standard e sufficiente — avvia il dev server solo se l'utente lo chiede esplicitamente.

## Architecture
```
src/
  components/   # Presentational — NO context imports nei riusabili
  pages/        # Routes — assembla contexts + sections
  sections/     # Feature blocks — può usare contexts
  contexts/     # Global state
  utils/        # Pure functions (selectors, routing, math)
  data/         # Static config (colors, icons, currencies)
  i18n/         # locales/it.json + locales/en.json
  __tests__/    # Mirrors src/
```

**Context hierarchy (ordine fisso):**
```
MediaQuery > Language > Theme > DevMode > User > Currency > Page > Privacy > Toast
```

## Critical Rules
1. **i18n** — ogni stringa UI in `it.json` + `en.json`. Mai hardcoded.
2. **Routing** — `LocalizedLink` (non `Link`), `useLocalizedNavigate` (non `useNavigate`)
3. **Currency** — DB sempre EUR. Display via `formatAmount()` da `CurrencyContext`. Mai `€` hardcoded.
4. **Selectors** — `userData` solo via `src/utils/userDataSelectors.ts`
5. **Mock** — ogni campo `userData` nuovo → aggiornare `MockAuthContext.tsx`
6. **Colors/Icons** — `getAssetColor()`, `getCategoryColor()` da `src/data/`. Mai hardcoded.
7. **Outflows not expenses** — "outflows/uscite" sempre. "expenses" solo se investimenti esclusi.
8. **Roadmap** — feature user-facing completata → `roadmap-items.json` + `todo.md` + `npm run roadmap`
9. **No `any`** — TypeScript strict. Props come `interface`.
10. **Commit messages only** — after each finished update, include a short commit message in English as the very last line of the assistant response. Keep it concise, imperative, and open-source friendly. Never run `git commit` or `git push` autonomously: the user performs both operations.

## Key Files
| File | Scopo |
|---|---|
| `src/AppRouter.tsx` | Tutte le routes (lazy load per pagine non critiche) |
| `src/contexts/UserContext.tsx` | Tutte le API calls + shape userData |
| `src/contexts/MockAuthContext.tsx` | Dev mock — mirror di UserContext |
| `src/utils/userDataSelectors.ts` | Unico accesso a userData |
| `src/utils/i18nRouting.ts` | LocalizedLink, useLocalizedNavigate |
| `src/i18n/languagesConfig.js` | Unica fonte per lingue supportate |
| `src/data/currencyConfig.ts` | 19 valute + fallback rates |
| `scripts/roadmap-items.json` | Sorgente roadmap pubblica |

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
- Usare `Link` o `useNavigate` diretti (usa i localized wrapper)
- Hardcodare `€`, `EUR`, colori hex per dati finanziari, testo UI
- Accedere a `userData.property` senza selector
- Fare chiamate API fuori da `UserContext.tsx`
- Aggiungere toast di successo per operazioni normali
- Usare `.toISOString().split('T')[0]` (UTC midnight bug)
- Chiudere un update senza una commit message finale in inglese
- Eseguire `git commit` o `git push` autonomamente
- Avviare il dev server / browser di tua iniziativa per verifiche extra — solo se richiesto esplicitamente
