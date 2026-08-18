---
applyTo: "src/components/**,src/pages/**,src/sections/**"
---

# React Components — Pacifinance Rules

## Component Architecture

| Layer | Rule |
|---|---|
| `components/` | Presentational only. No context imports in reusable components — receive data via props. |
| `pages/` | Route endpoints. Can import any context. Assembles sections + components. |
| `sections/` | Major features. Can import contexts. Never import other sections. |

## Routing — MANDATORY
```tsx
// ❌ WRONG
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
<Link to="/dashboard">Go</Link>
navigate('/dashboard');

// ✅ CORRECT
import { LocalizedLink } from '../components/LocalizedLink';
import { useLocalizedNavigate } from '../utils/i18nRouting';
<LocalizedLink to="/dashboard">Go</LocalizedLink>
navigate('/dashboard'); // auto-prefixes /it/ or /en/
```

## Currency — MANDATORY
```tsx
// ❌ WRONG — hardcoded € or EUR
<span>{value} €</span>
new Intl.NumberFormat('it-IT', { currency: 'EUR' }).format(v)

// ✅ CORRECT
import { CurrencyContext } from '../contexts/CurrencyContext';
const { formatAmount, fromEUR, toEUR, currencySymbol } = useContext(CurrencyContext);
<span>{formatAmount(eurValueFromDB)}</span>   // DB → display currency
const eurVal = toEUR(userInput);               // user input → EUR for API
```

## Colors & Icons — MANDATORY
```tsx
// ❌ WRONG
const color = '#27ae60';

// ✅ CORRECT
import { getAssetColor, getAssetIcon } from '../data/assetColors';
import { getCategoryColor, getCategoryIcon } from '../data/categoryColors';
const color = getAssetColor('stocks');
const icon = getCategoryIcon('food');
```

## Shared Selectors (accounts, categories, payment types...) — MANDATORY
Every place a user picks from a recurring domain concept — a balance
source/sub-account, a category (incl. custom sub-categories), a payment
type/tag — must render it through the one shared component/helper for that
concept, not a fresh inline `<select>`/`<Select>` mapped over the raw data.
A second implementation drifts in look (flat vs grouped, no sub-account
indentation) and in behavior, exactly what happened with Quick Add's account
field and the recurring-transactions panel before both were fixed to reuse
the real thing.
```tsx
// ❌ WRONG — reimplementing the balance-source dropdown inline
<select value={source} onChange={...}>
  {entries.map(e => <option key={e.label} value={e.label}>{e.label}</option>)}
</select>

// ✅ CORRECT — same grouped/indented rendering everywhere a balance source is picked
import { renderBalanceSourceMenuItems, resolveBalanceSourceLabel } from '../components/multiInsert/balanceSourceMenu';
<Select value={selectedOption} onChange={...}>
  {renderBalanceSourceMenuItems(balanceOptions, balanceSourceMeta)}
</Select>
// resolveBalanceSourceLabel(...) to preselect it from a stored transaction/template

// ✅ CORRECT — categories (including the user's own custom sub-categories)
import CategoryPicker from '../components/CategoryPicker';
<CategoryPicker officialTags={tags} customCategories={customCategories} onSelect={...} />
```
Before writing a new selector for an existing domain concept, grep for how it
is already rendered elsewhere (`renderBalanceSourceMenuItems`, `CategoryPicker`,
`sortTagsByLanguage`/`translateTag` for payment-type/tag dropdowns) and reuse
it. If a shared renderer genuinely can't be reused (e.g. a stripped-down flow
that intentionally avoids a heavier component's side effects), say so in a
comment next to the duplicate — same as `QuickAddTransaction.tsx`'s own doc
comment already does for its balance-delta logic — so the drift is a
documented, reviewable choice instead of silent duplication that only shows up
as a bug later.

## userData — MANDATORY
```tsx
// ❌ WRONG — direct property access
const bank = userData.balances[0].balance.bank;

// ✅ CORRECT — always use selectors
import { getBankValue, getCurrentBalance } from '../utils/userDataSelectors';
const bank = getBankValue(userData);
```

## i18n — MANDATORY
```tsx
// ❌ WRONG
<button>Salva</button>

// ✅ CORRECT
const { translations } = useContext(LanguageContext);
<button>{translations.common.save}</button>
```

## New Page Checklist
1. Add route in `src/AppRouter.tsx` with `React.lazy()`
2. Add i18n keys to both `it.json` and `en.json`
3. Add `<Helmet>` SEO tags (title, description, og:*)
4. Wrap read-only pages in `React.Suspense`
5. Add Umami tracking: `data-umami-event="page-action-name"`

## Roadmap Update (user-facing features)
```
1. scripts/roadmap-items.json  → add/update entry with completedDate
2. todo.md                     → mark [x] with <!-- roadmap:id --> marker
3. npm run roadmap             → regenerate src/data/roadmapData.js
```

## Common Patterns
```tsx
// Loading state
if (!userData) return <DashboardSkeleton />;

// Privacy mode
const { isPrivate } = useContext(PrivacyContext);
<span>{isPrivate ? '••••' : formatAmount(value)}</span>

// Toast for errors only
const { showToast } = useContext(ToastContext);
catch (e) { showToast('error', translations.errors.generic); }
// ✅ NO success toasts for normal operations

// Umami analytics
<button data-umami-event="outflow-insert-clicked">...</button>
```

## State & Side Effects
```tsx
// ❌ Never use useEffect to write persistent/synced state
useEffect(() => { saveToAPI(value); }, [value]); // WRONG

// ✅ Only explicit handlers write persistent state
const handleSave = async () => { await saveToAPI(value); };

// ✅ localStorage BEFORE navigate (pages read it on mount, not from params)
localStorage.setItem('pendingDraft', JSON.stringify(data));
navigate('/confirm');
// In ConfirmPage: const draft = JSON.parse(localStorage.getItem('pendingDraft') ?? '{}');
```

## TypeScript
- All props as `interface`, never `type` aliases for component props
- No `any` — use `unknown` + type guard if unsure
- Import types: `import type { UserData } from '../types/UserData'`
