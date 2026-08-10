# Skill: Fix Bug

## Purpose
Diagnose and fix bugs in Pacifinance while verifying that no regressions are introduced.

## Trigger
Use this skill when: *there's a bug*, *something isn't working*, *console error*, *test fails*, *unexpected behavior*.

---

## Instructions

### Phase 1 — Reproduction
1. Read the full error message (including stack trace)
2. Identify the file and line of the error
3. Read the file context: ±30 lines around the error
4. Identify: is it a runtime, logic, network, or rendering error?

### Phase 2 — Diagnosis
Scan this table of known bugs before looking elsewhere:

| Symptom | Likely cause | File to check |
|---|---|---|
| `userData is null/undefined` | Component used outside `UserProvider`, or before the data has loaded | `UserContext.tsx`, guard `if (!userData)` |
| `translations.X.Y is undefined` | Key missing in `it.json` or `en.json`, or in a different section | `src/i18n/locales/*.json` |
| Route `/en/...` not found | Missing language prefix in `AppRouter.tsx` | `src/AppRouter.tsx` |
| Navigation without language prefix | Use of `useNavigate` instead of `useLocalizedNavigate` | File calling `navigate()` |
| Amount always shown in EUR | Use of `toLocaleString` instead of `formatAmount` | Component displaying the value |
| Undefined color/icon | `getAssetColor('nonexistent-key')` — key not mapped | `src/data/assetColors.ts` |
| Mock not updated | New field in `userData` without updating `MockAuthContext` | `src/contexts/MockAuthContext.tsx` |
| Build fails after i18n change | Key present in one file but not the other | `it.json` vs `en.json` |
| `date.toISOString()` overnight bug | UTC midnight issue | Function using `toISOString()` |
| Test failing after adding a field | `mockUserData` not updated in tests | `src/__tests__/setup.js` or the specific test |

### Phase 3 — Fix
1. Apply the **minimal** fix — only the necessary lines
2. Do not refactor during a bug fix
3. If the bug is in a selector: add a test that reproduces the bug BEFORE the fix

### Phase 4 — Verification
```bash
npm run lint && npm test && npm run build
```
- [ ] The bug no longer reproduces
- [ ] Existing tests still pass
- [ ] No new warnings in the console

### Phase 5 — Documentation
If the bug is a recurring pattern (see Phase 2 table): update the table with the new case.

---

## Common Quick Fixes

```tsx
// userData null guard
if (isLoading || !userData) return <Skeleton />;

// Missing translation — safe fallback
const title = translations?.dashboard?.title ?? 'Pacifinance';

// Local date (not UTC)
const today = new Date().toLocaleDateString('sv'); // 'YYYY-MM-DD'

// Safe selector
export const getBank = (u: UserData | null) => u?.balances?.[0]?.balance?.bank ?? 0;
```
