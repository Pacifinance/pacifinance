# Skill: Add Transaction Type

## Purpose
Add a new transaction type (outflow or income) with all the necessary layers: tag, categorization, selector, UI, i18n.

## Trigger
Use when: *add transaction type*, *new outflow/income category*, *new asset type*.

---

## Instructions

Pacifinance manages transactions via backend tags. Each transaction type has:
- A tag in the tags system (`outflowsTags`, `incomesTags`, `paymentTags`)
- Centralized colors/icons
- i18n keys for display
- Selectors for data access

### Phase 1 — Identify the type
- **Outflow**: goes into `outflowsTags` → `expenses.allOutflows`
- **Income**: goes into `incomesTags` → `incomes.allIncomes`
- **Payment (method)**: goes into `paymentTags`

### Phase 2 — Add color/icon
```ts
// src/data/categoryColors.ts
export const getCategoryColor = (key: string): string => {
  const colors: Record<string, string> = {
    // ... existing ...
    'newType': '#HEXCOLOR',  // ← add here
  };
  return colors[key] ?? '#999999'; // fallback
};
```
Same pattern for `categoryIcons.ts`.

### Phase 3 — Add i18n
In both `it.json` and `en.json`:
```json
"categories": {
  "newType": "Category Name"
}
```

### Phase 4 — Add to tagTranslations.ts
```ts
export const tagTranslations: Record<string, { it: string; en: string }> = {
  // ... existing ...
  'newType': { it: 'Nome IT', en: 'Name EN' },
};
```

### Phase 5 — Selector (if aggregated access is needed)
In `src/utils/userDataSelectors.ts`:
```ts
export const getOutflowsByType = (userData: UserData | null, type: string) =>
  userData?.expenses?.outflowsArray?.filter(o => o.category === type) ?? [];
```

### Phase 6 — MockAuthContext
Add sample data in the mock for the new type:
```ts
// src/contexts/MockAuthContext.tsx
// Add to mockUserData.expenses.outflowsArray or .allIncomes
```

### Phase 7 — Tests
```ts
describe('getOutflowsByType - newType', () => {
  it('returns [] for null userData', () => ...);
  it('filters correctly by type', () => ...);
});
```

### Verification
```bash
npm run lint && npm test && npm run build
```
