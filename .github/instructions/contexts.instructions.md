---
applyTo: "src/contexts/**"
---

# Contexts — Pacifinance Rules

## Provider Hierarchy (NEVER change order)
```
MediaQuery > Language > Theme > DevMode > User > Currency > Page > Privacy > Toast
```
Changing this order causes circular dependency or context-not-found bugs.

`DeploymentContext` lives **outside** this fixed chain, wrapping it from
`ServiceProvider > DeploymentProvider > MediaQueryProvider > ... > ToastProvider`
(see `src/index.tsx`). It has no dependency on, and nothing in the chain
depends on it — it only needs `ServiceContext` (for `apiClient`) — so it
doesn't fit anywhere in the ordered list above and doesn't need to.

## Context Responsibilities
| Context | Owns |
|---|---|
| `DeploymentContext` | Whether this instance is self-hosted vs. the official hosted deployment (`selfHosted`) |
| `MediaQueryContext` | Responsive breakpoints (`isMobile`, `isTablet`) |
| `LanguageContext` | Active language, translations object |
| `ThemeContext` | Dark/light theme object |
| `DevModeProvider` | Dev toolbar visibility |
| `UserContext` | Auth state, `userData`, all API calls |
| `CurrencyContext` | `formatAmount`, `fromEUR`, `toEUR`, `currencySymbol`, rates |
| `PageContext` | Current page identifier |
| `PrivacyContext` | `isPrivate` toggle (hide values) |
| `ToastContext` | `showToast(type, message)` |

## Rules
- **No cross-context imports** — contexts must not import from other contexts
- **UserContext owns all API calls** — no `axios` calls in other contexts or components
- **CurrencyContext depends on UserContext** for `userData.currency` — this is the only allowed direction
- **MockAuthContext must mirror UserContext** — any field added to `userData` must also be added to mock

## Adding Data to UserContext
```ts
// 1. Add API call in UserContext.tsx
const newData = await axios.get('/api/new-endpoint');

// 2. Extend userData state with the new field
setUserData(prev => ({ ...prev, newField: newData }));

// 3. Add selector in src/utils/userDataSelectors.ts
export const getNewField = (userData: UserData) => userData?.newField ?? defaultValue;

// 4. Mirror in MockAuthContext.tsx
mockUserData = { ...existing, newField: mockValue };
```

## CurrencyContext API
```ts
const {
  formatAmount,    // (eurValue: number) => '1.234,56 €' (in display currency)
  formatNumber,    // (eurValue: number) => '1.234,56' (no symbol)
  fromEUR,         // (eurValue: number) => displayCurrencyValue
  toEUR,           // (displayValue: number) => eurValue
  currencySymbol,  // '€' | '$' | ...
  currentCurrency, // 'EUR' | 'USD' | ...
} = useContext(CurrencyContext);
```

## UserContext Auth Pattern
```ts
const { userData, isLoading, isAuthenticated, login, logout, register } = useContext(UserContext);

// Guard pattern in pages
if (isLoading) return <Skeleton />;
if (!isAuthenticated) return <Navigate to={localizedLoginPath} />;
```

## Toast — Errors Only
```ts
// ✅ Use for errors
showToast('error', translations.errors.saveFailed);

// ❌ Never for success confirmations of normal operations
// ❌ Never for info that is already visible in the UI
```
