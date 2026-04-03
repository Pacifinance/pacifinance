# PaciFinance — Analisi Flow Conversioni Valuta

> Documento di riferimento per il flusso completo delle conversioni EUR ↔ valuta display.
> Ultima revisione: Aprile 2026

---

## 📑 Indice

1. [Principio Fondamentale](#-principio-fondamentale)
2. [Funzioni di Conversione (CurrencyContext)](#-funzioni-di-conversione-currencycontext)
3. [Mappa Completa dei Flussi per Sezione](#-mappa-completa-dei-flussi-per-sezione)
   - [Inserimento Singolo (Uscita / Entrata)](#1-inserimento-singolo-uscita--entrata)
   - [Inserimento Multiplo Uscite](#2-inserimento-multiplo-uscite)
   - [Inserimento Multiplo Entrate](#3-inserimento-multiplo-entrate)
   - [Inserimento Multiplo Bilancio](#4-inserimento-multiplo-bilancio)
   - [Inserimento Bilancio Manuale](#5-inserimento-bilancio-manuale)
   - [Modifica Inline (Uscita / Entrata)](#6-modifica-inline-uscita--entrata)
   - [Eliminazione (Uscita / Entrata)](#7-eliminazione-uscita--entrata)
   - [Import CSV/Excel](#8-import-csvexcel)
   - [Undo Import](#9-undo-import)
4. [Stato dei Valori in Memoria (Balance State)](#-stato-dei-valori-in-memoria-balance-state)
5. [Funzione Helper: parseFormattedAmount](#-funzione-helper-parseformattedamount)
6. [Tabella Riepilogativa](#-tabella-riepilogativa)
7. [Regole d'Oro](#-regole-doro)

---

## 🏛️ Principio Fondamentale

```
DB = sempre EUR
Display = valuta scelta dall'utente (EUR, USD, JPY, GBP, ...)

Scrittura DB:  utente → toEUR() → API → DB (EUR)
Lettura DB:    DB (EUR) → API → fromEUR() / formatAmount() → utente
```

- **`toEUR(displayValue)`** — converte dalla valuta display a EUR (per salvare su DB)
- **`fromEUR(eurValue)`** — converte da EUR alla valuta display (per mostrare all'utente)
- **`formatAmount(eurValue)`** — chiama internamente `fromEUR()` + formatta con simbolo valuta
- **`formatNumber(eurValue)`** — chiama internamente `fromEUR()` + formatta senza simbolo

Quando la valuta è EUR, tutte le funzioni sono no-op (restituiscono il valore invariato).

---

## 🔧 Funzioni di Conversione (CurrencyContext)

**File:** `src/contexts/CurrencyContext.jsx`

### `fromEUR(eurValue)` — EUR → Display
```javascript
const fromEUR = (eurValue) => {
  if (typeof eurValue !== 'number' || isNaN(eurValue)) return 0;
  if (currency === 'EUR') return eurValue;
  const rate = exchangeRates[currency] || FALLBACK_RATES[currency] || 1;
  return eurValue * rate;  // Es: 100 EUR * 1.08 = 108 USD
};
```

### `toEUR(localValue)` — Display → EUR
```javascript
const toEUR = (localValue) => {
  if (typeof localValue !== 'number' || isNaN(localValue)) return 0;
  if (currency === 'EUR') return localValue;
  const rate = exchangeRates[currency] || FALLBACK_RATES[currency] || 1;
  return localValue / rate;  // Es: 108 USD / 1.08 = 100 EUR
};
```

### `formatAmount(eurValue)` — EUR → stringa formattata con simbolo
```javascript
const formatAmount = (eurValue) => {
  const displayValue = fromEUR(eurValue);  // ← chiama internamente fromEUR
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(displayValue);
};
// Es: formatAmount(100) con USD → "$108.00"
```

### `formatNumber(eurValue)` — EUR → stringa formattata senza simbolo
```javascript
const formatNumber = (eurValue) => {
  const displayValue = fromEUR(eurValue);  // ← chiama internamente fromEUR
  return displayValue.toLocaleString(locale, { minimumFractionDigits: 2 });
};
// Es: formatNumber(100) con USD → "108.00"
```

### Exports del Provider
```javascript
value={{ currency, setCurrency, currencySymbol, currencyConfig, 
         exchangeRates, formatAmount, formatNumber, fromEUR, toEUR }}
```

---

## 🗺️ Mappa Completa dei Flussi per Sezione

### 1. Inserimento Singolo (Uscita / Entrata)

**File:** `InsertValues.jsx` → `createInExJson()` + `handleConfirmInEx()`

```
Utente digita "108" (USD)
    │
    ▼
outflow / income state = "108" (stringa, valuta display)
    │
    ├─► createInExJson(amount="108")
    │       Number("108") = 108
    │       toEUR(108) = 100          ──► API: { amount: 100 }  ✅ EUR
    │
    └─► Aggiornamento bilancio (se selectedOption attivo):
            valueBalanceSelected = parseFloat(bankValue)   // EUR da DB
            outflowNumber = toEUR(parseFloat("108"))       // 108 USD → 100 EUR
            newValue = valueBalanceSelected - 100           // tutto in EUR
            createBalancesJson(date, "Banca", newValue)    ──► API ✅ EUR
```

### 2. Inserimento Multiplo Uscite

**File:** `InsertValues.jsx` → `handleBatchOutflowSubmit()`

```
Utente compila N righe con importi in valuta display
    │
    ▼
Per ogni riga:
    parseFormattedAmount(row.amount) → numero (es: 108 USD)
    createInExJson(amount=108) → toEUR(108) = 100 EUR     ──► API ✅ EUR
    │
Aggiornamento bilancio per sorgente:
    groupAmountsByBalanceSource(rows) → { "Banca": 500 }  // totale display
    currentBalanceValue (EUR da state)
    newValue = currentBalanceValue - toEUR(500)            ──► API ✅ EUR
```

### 3. Inserimento Multiplo Entrate

**File:** `InsertValues.jsx` → `handleBatchIncomeSubmit()`

```
Identico al flusso uscite, ma:
    newValue = currentBalanceValue + toEUR(totalAmount)    ──► API ✅ EUR
```

### 4. Inserimento Multiplo Bilancio

**File:** `InsertValues.jsx` → `handleBatchBalanceSubmit()`

```
Utente compila importi per ogni asset in valuta display
    │
    ▼
Per ogni riga e per ogni asset:
    val = parseFormattedAmount(row[key])     // es: "1.234,56" → 1234.56 (display)
    balance[assetDbKey] = toEUR(val)         ──► API ✅ EUR
```

### 5. Inserimento Bilancio Manuale

**File:** `InsertValues.jsx` → `handleConfirmBalance()` → `createBalancesJson()`

```
Stato iniziale:
    bankValue = getBankValue(userData)   // EUR da DB, tipo number

Utente NON modifica il campo:
    typeof bankValue === 'number'  →  return bankValue  ──► API ✅ EUR (invariato)

Utente modifica il campo:
    handleInputChange → bankValue = "1234.56" (stringa, raw digits)
    handleInputBlur   → bankValue = "1.234,56" (stringa formato IT, valuta display)
    │
    ▼
    typeof bankValue === 'string'
    parseFormattedAmount("1.234,56") = 1234.56
    toEUR(1234.56) = ~1143.11                            ──► API ✅ EUR
```

### 6. Modifica Inline (Uscita / Entrata)

**File:** `OutflowSection.jsx` / `IncomeSection.jsx` → `startEditing()` + `InsertValues.jsx` → `handleSaveEditOutflow/Income()`

```
Fase LETTURA (DB → utente):
    add.amount = 100 (EUR da DB)
    displayAmount = fromEUR(100) = 108 (USD)
    editValues.amount = "108"                            // utente vede 108

Fase SCRITTURA (utente → DB):
    1. Delete originale:
       originalAdd.amount = 100 (EUR da DB, invariato)
       API delete: { amount: 100 }                      ──► API ✅ EUR

    2. Insert nuovo:
       editedValues.amount = "120" (utente ha modificato, valuta display)
       createInExJson(amount="120") → toEUR(120)        ──► API ✅ EUR
```

### 7. Eliminazione (Uscita / Entrata)

**File:** `InsertValues.jsx` → `handleIncomesDelete()` / `handleOutflowsDelete()`

```
deleteIncomeAmount = add.amount     // EUR da DB (passato da IncomeSection)
    │
    ▼
API delete: { amount: Number(deleteIncomeAmount) }       ──► API ✅ EUR

Aggiornamento bilancio:
    valueBalanceSelected = parseFloat(bankValue)          // EUR (se non editato)
    incomeNumber = parseFloat(deleteIncomeAmount)         // EUR da DB
    newValue = valueBalanceSelected - incomeNumber        // EUR - EUR ✅
    createBalancesJson(date, "Banca", newValue)           ──► API ✅ EUR
```

> **Nota:** `deleteIncomeAmount` e `deleteOutflowAmount` provengono da `add.amount` che è il valore EUR dal database. Non serve conversione.

### 8. Import CSV/Excel

**File:** `DataImportWizard.jsx` + `src/utils/dataImport.js`

```
CSV parsing → tx.amount = valore numerico (valuta display dell'utente)
    │
    ▼
Import batch:
    toAPIFormat({ ...tx, amount: toEUR(tx.amount) })     ──► API ✅ EUR

Salvataggio per undo:
    savedTxForUndo.amount = toEUR(tx.amount)             // salvato in EUR
```

> **Nota:** `toAPIFormat()` in `dataImport.js` è una funzione pura che non fa conversioni — la conversione avviene nel chiamante (`DataImportWizard.jsx`) prima di passare il tx.

### 9. Undo Import

**File:** `DataImportWizard.jsx` → `handleUndo()`

```
importedTx = importResult._savedTx     // già in EUR (salvato post-conversione)
    │
    ▼
Per ogni tx:
    financeService.deleteExpenseOrIncome({ expense: tx })
    // tx.amount è già EUR                               ──► API ✅ EUR
```

---

## 💾 Stato dei Valori in Memoria (Balance State)

I valori di bilancio (`bankValue`, `cashValue`, ecc.) seguono un ciclo specifico:

```
INIZIALIZZAZIONE:
    fetchData() → setBankValue(getBankValue(userData))
    Tipo: number (EUR da DB)

SE L'UTENTE NON TOCCA IL CAMPO:
    bankValue rimane number (EUR)
    createBalancesJson → typeof === 'number' → return as-is

SE L'UTENTE MODIFICA IL CAMPO:
    1. handleInputChange → setBankValue("1234.56")     // stringa raw
    2. handleInputBlur   → setBankValue("1.234,56")    // stringa formato IT
       Ora bankValue è una stringa in VALUTA DISPLAY
    3. createBalancesJson → typeof === 'string'
       → parseFormattedAmount("1.234,56") = 1234.56
       → toEUR(1234.56) = EUR value
```

### Mappa balance state:

| Stato | Tipo | Valuta | Conversione in createBalancesJson |
|-------|------|--------|----------------------------------|
| Da fetchData (mai toccato) | `number` | EUR | Nessuna (`return currentValue`) |
| Dopo edit + blur | `string` | Display | `toEUR(parseFormattedAmount(str))` |
| Override da selectedOption | `number` | EUR | `return Number(newValue)` (pre-converted) |

---

## 🔧 Funzione Helper: parseFormattedAmount

**File:** `src/components/multiInsert/helpers.js`

Converte stringhe formato italiano in numeri float:

```javascript
export const parseFormattedAmount = (value) => {
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  if (!value || typeof value !== 'string') return 0;
  const cleaned = value.replace(/\./g, '').replace(',', '.');
  const result = parseFloat(cleaned);
  return isNaN(result) ? 0 : result;
};
```

| Input | Output |
|-------|--------|
| `"1.234,56"` | `1234.56` |
| `"10,00"` | `10.00` |
| `"1234"` | `1234` |
| `""` / `null` | `0` |
| `42` (number) | `42` |

---

## 📊 Tabella Riepilogativa

| Operazione | Input utente | Conversione | Valore API | File |
|------------|-------------|-------------|------------|------|
| **Uscita singola** | Display currency | `createInExJson` → `toEUR()` | EUR ✅ | InsertValues.jsx |
| **Entrata singola** | Display currency | `createInExJson` → `toEUR()` | EUR ✅ | InsertValues.jsx |
| **Bilancio manuale (non editato)** | — | Nessuna (già EUR) | EUR ✅ | InsertValues.jsx |
| **Bilancio manuale (editato)** | Display currency IT format | `parseFormattedAmount` → `toEUR()` | EUR ✅ | InsertValues.jsx |
| **Batch uscite** | Display currency IT format | `parseFormattedAmount` → `createInExJson` → `toEUR()` | EUR ✅ | InsertValues.jsx |
| **Batch entrate** | Display currency IT format | `parseFormattedAmount` → `createInExJson` → `toEUR()` | EUR ✅ | InsertValues.jsx |
| **Batch bilancio** | Display currency IT format | `parseFormattedAmount` → `toEUR()` | EUR ✅ | InsertValues.jsx |
| **Modifica inline** | Display currency (da `fromEUR`) | `createInExJson` → `toEUR()` | EUR ✅ | InsertValues.jsx |
| **Delete inline** | EUR (da DB, `add.amount`) | Nessuna (già EUR) | EUR ✅ | InsertValues.jsx |
| **Import CSV/Excel** | Display currency (dal file) | `toEUR()` nel chiamante | EUR ✅ | DataImportWizard.jsx |
| **Undo import** | EUR (salvato post-conversione) | Nessuna (già EUR) | EUR ✅ | DataImportWizard.jsx |
| **Balance update post-insert** | EUR (da state) - `toEUR(amount)` | Tutto EUR | EUR ✅ | InsertValues.jsx |
| **Balance update post-delete** | EUR (da state) ± EUR (da DB) | Tutto EUR | EUR ✅ | InsertValues.jsx |
| **Visualizzazione importi** | EUR (da DB) | `formatNumber()` / `formatAmount()` → `fromEUR()` interno | Display ✅ | OutflowSection / IncomeSection |
| **Placeholder bilancio** | EUR (da DB) | `fromEUR()` → `toLocaleString()` | Display ✅ | BalanceSection.jsx |

---

## 🏆 Regole d'Oro

1. **Mai mandare valuta display all'API** — tutto ciò che va al DB deve passare per `toEUR()`
2. **Mai mostrare EUR crudo all'utente** — usare `formatAmount()`, `formatNumber()`, o `fromEUR()` manualmente
3. **`formatAmount`/`formatNumber` fanno `fromEUR` internamente** — non fare doppia conversione: ❌ `formatAmount(fromEUR(val))`
4. **I valori da DB (`add.amount`, `userData.balances`) sono sempre EUR** — nessuna conversione necessaria per il delete o per passarli come identificativi
5. **`typeof` check per balance state** — se `number` = EUR da DB, se `string` = valuta display editata dall'utente
6. **`parseFormattedAmount` prima di `toEUR`** — per stringhe formato IT: `toEUR(parseFormattedAmount("1.234,56"))`
7. **`toAPIFormat` è una funzione pura** — la conversione a EUR avviene PRIMA nel chiamante, non dentro `toAPIFormat()`
