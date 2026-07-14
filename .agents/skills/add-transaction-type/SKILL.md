# Skill: Add Transaction Type

## Purpose
Aggiunge un nuovo tipo di transazione (uscita o entrata) con tutti i layer necessari: tag, категорiz­azione, selector, UI, i18n.

## Trigger
Usa quando: *aggiungi tipo transazione*, *nuova categoria di uscita/entrata*, *nuovo tipo di asset*.

---

## Instructions

Pacifinance gestisce transazioni tramite tag backend. Ogni tipo di transazione ha:
- Un tag nel sistema tags (`outflowsTags`, `incomesTags`, `paymentTags`)
- Colori/icone centralizzati
- Chiavi i18n per display
- Selectors per accesso ai dati

### Phase 1 — Identifica il tipo
- **Uscita (outflow)**: va in `outflowsTags` → `expenses.allOutflows`
- **Entrata (income)**: va in `incomesTags` → `incomes.allIncomes`
- **Pagamento (metodo)**: va in `paymentTags`

### Phase 2 — Aggiungi colore/icona
```ts
// src/data/categoryColors.ts
export const getCategoryColor = (key: string): string => {
  const colors: Record<string, string> = {
    // ... existing ...
    'nuovoTipo': '#HEXCOLOR',  // ← aggiungi qui
  };
  return colors[key] ?? '#999999'; // fallback
};
```
Stesso pattern per `categoryIcons.ts`.

### Phase 3 — Aggiungi i18n
In entrambi `it.json` e `en.json`:
```json
"categories": {
  "nuovoTipo": "Nome Categoria"
}
```

### Phase 4 — Aggiungi in tagTranslations.ts
```ts
export const tagTranslations: Record<string, { it: string; en: string }> = {
  // ... existing ...
  'nuovoTipo': { it: 'Nome IT', en: 'Name EN' },
};
```

### Phase 5 — Selector (se serve accesso aggregato)
In `src/utils/userDataSelectors.ts`:
```ts
export const getOutflowsByType = (userData: UserData | null, type: string) =>
  userData?.expenses?.outflowsArray?.filter(o => o.category === type) ?? [];
```

### Phase 6 — MockAuthContext
Aggiungi dati di esempio nel mock per il nuovo tipo:
```ts
// src/contexts/MockAuthContext.tsx
// Aggiungi nel mockUserData.expenses.outflowsArray o .allIncomes
```

### Phase 7 — Test
```ts
describe('getOutflowsByType - nuovoTipo', () => {
  it('returns [] for null userData', () => ...);
  it('filters correctly by type', () => ...);
});
```

### Verifica
```bash
npm run lint && npm test && npm run build
```
