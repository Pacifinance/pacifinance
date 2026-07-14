---
applyTo: "src/utils/**,src/data/**"
---

# Utils & Data — Pacifinance Rules

## utils/ — Pure Functions Only
- No React, no hooks, no context imports
- All functions must be unit-testable in isolation
- Every function needs a corresponding test in `src/__tests__/utils/`

## userDataSelectors.ts — SINGLE ACCESS POINT
```ts
// ❌ WRONG — direct access
const bank = userData.balances[0].balance.bank;
const outflows = userData.expenses.allOutflows;

// ✅ CORRECT — always via selector
import { getBankValue, getAllOutflows, getCurrentBalance } from './userDataSelectors';
const bank = getBankValue(userData);
const outflows = getAllOutflows(userData);
```

**All selectors must:**
1. Accept `userData` as first parameter (typed, not `any`)  
2. Return a safe default (`0`, `[]`, `null`) when `userData` is null/undefined
3. Never throw — always guard with optional chaining

```ts
// Selector template
export const getBankValue = (userData: UserData | null): number =>
  userData?.balances?.[0]?.balance?.bank ?? 0;
```

## data/ — Static Config Only
```
assetColors.ts       getCategoryColor(key: string): string
assetIcons.ts        getAssetIcon(key: string): IconComponent
categoryColors.ts    getCategoryColor(key: string): string
categoryIcons.ts     getCategoryIcon(key: string): IconComponent
currencyConfig.ts    19 currencies + fallback rates
financeDefaults.ts   Default values for balances, limits, goals
tagTranslations.ts   Map backend tag keys to display values
```

**Rules for data/ files:**
- No async calls — pure static constants or synchronous functions
- No React imports — plain TypeScript/JavaScript only
- Export named constants, not default exports
- Fallback must exist for every `get*` function: `getAssetColor('unknown') → '#999'`

## calculations.ts — Finance Math
All financial calculations live here:
- `calculateNetWorth(userData)` — total assets - liabilities
- `getMonthlyDelta(userData)` — income - outflows for current month  
- `getAverageSavingsRate(userData)` — savings/income over last N months

Date calculations: **NEVER use `.toISOString().split('T')[0]`** (UTC midnight bug).
Use local date strings: `new Date().toLocaleDateString('it-IT')` or date helpers.

## userDataTransformers.ts — Shape Conversion
Transform raw API responses into the `userData` shape. No business logic here — only structural mapping.

## i18nRouting.ts — Routing Helpers
```ts
LocalizedLink          // <Link> wrapper with language prefix
useLocalizedNavigate   // useNavigate wrapper
addLanguageToPath      // '/dashboard' → '/it/dashboard'
removeLanguageFromPath // '/it/dashboard' → '/dashboard'
getLanguageFromPath    // '/it/dashboard' → 'it'
isValidLanguage        // 'it' → true, 'xx' → false
```

## Common Anti-patterns
```ts
// ❌ Direct userData property access in utils
export const getBank = (data) => data.balances[0].balance.bank; // crashes if empty

// ✅ Safe selector
export const getBank = (data: UserData | null): number =>
  data?.balances?.[0]?.balance?.bank ?? 0;

// ❌ Date bug
const today = new Date().toISOString().split('T')[0]; // Wrong at midnight UTC

// ✅ Local date
const today = new Date().toLocaleDateString('sv'); // 'YYYY-MM-DD' local
```
