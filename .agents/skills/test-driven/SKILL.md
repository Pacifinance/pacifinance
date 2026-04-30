# Skill: Test-Driven Development

## Purpose
Implementa funzionalità seguendo il ciclo Red → Green → Refactor, con test negativi prima del happy path.

## Trigger
Usa quando: *scrivi test prima*, *TDD*, *test-driven*, *test prima del codice*, *aggiungi test*.

---

## Instructions

### Il Ciclo TDD
```
Red    → Scrivi un test che FALLISCE → confermane il fallimento
Green  → Scrivi il codice MINIMO per farlo passare
Refactor → Pulisci solo dopo che tutti i test passano
```
"Codice minimo" significa: se un valore hardcoded fa passare il test, usalo — il test successivo forzerà la logica reale. Questo previene over-engineering precoce.

---

### Phase 1 — Piano dei Test
Prima di scrivere codice, elenca i casi di test in quest'ordine:

```ts
// Template: scrivi questi stub vuoti come piano
describe('functionName', () => {
  // 1. Input null/undefined
  it('returns default for null input', () => {});

  // 2. Input invalido / forma sbagliata
  it('returns default for malformed input', () => {});

  // 3. Valori boundary
  it('returns 0 for empty array', () => {});
  it('handles single item', () => {});

  // 4. Errore asincrono (se applicabile)
  it('handles API failure gracefully', () => {});

  // 5. Happy path (ultimo)
  it('returns correct value for valid input', () => {});
});
```

### Phase 2 — Red (failing test)
```bash
npm test -- NomeFile   # ← deve fallire
```
Se il test NON fallisce, il test è sbagliato — correggilo prima di procedere.

### Phase 3 — Green (codice minimo)
Implementa il minimo per far passare il test attuale. Solo quello.

```bash
npm test -- NomeFile   # ← deve passare
```

### Phase 4 — Refactor
Solo dopo che TUTTI i test passano:
- Rimuovi duplicazioni
- Migliora nomi variabili
- Estrai funzioni helper

```bash
npm test               # ← tutti i test, nessuna regressione
```

---

### Esempi Dominio PaciFinance

#### Selector (utils)
```ts
// RED: scrivi prima
it('getBankValue returns 0 for null', () => {
  expect(getBankValue(null)).toBe(0);
});
// GREEN: implementa
export const getBankValue = (u: UserData | null) => u?.balances?.[0]?.balance?.bank ?? 0;
```

#### Calcolo finanziario
```ts
// Ordine: null → 0 → negativo → mese vuoto → happy path
describe('getMonthlyDelta', () => {
  it('returns 0 for null userData', () => ...);
  it('returns 0 when no balances', () => ...);
  it('handles negative delta (spese > entrate)', () => ...);
  it('returns correct delta for current month', () => ...);
});
```

#### Funzione con date
```ts
// Minimo 3 test: data normale, mezzanotte, cambio mese
describe('formatDate', () => {
  it('formats a midday date correctly', () => ...);
  it('does not shift midnight date (UTC bug)', () => ...);
  it('handles month boundary correctly', () => ...);
});
```

#### Componente con Context mock
```ts
const renderWithMocks = (ui: ReactElement) =>
  render(ui, {
    wrapper: ({ children }) => (
      <MockUserContext value={{ userData: mockUserData, isLoading: false }}>
        <MockCurrencyContext value={{ formatAmount: v => `${v} €` }}>
          {children}
        </MockCurrencyContext>
      </MockUserContext>
    )
  });

// Test order: loading state → no data state → happy path
it('shows skeleton when loading', () => ...);
it('shows empty state when no userData', () => ...);
it('renders balance correctly', () => ...);
```

---

### Regole Invarianti
- **Mai scrivere codice senza un test rosso prima** (nella logica pura/selector)
- **Mai saltare i test negativi** — definiscono il contratto della funzione
- **"Se ha un `if`, ha ≥2 test"** — una per ogni branch
- **"Se tocca una data, ha ≥3 test"** — normal, midnight, boundary
- **Coverage target**: `utils/` e selectors → 100% righe
