# Pacifinance — Currency Conversion Flow Analysis

> Reference document for the complete EUR ↔ display currency conversion flow.
> Last revised: April 2026

---

## 📑 Index

1. [Fundamental Principle](#-fundamental-principle)
2. [Conversion Functions (CurrencyContext)](#-conversion-functions-currencycontext)
3. [Complete Flow Map by Section](#-complete-flow-map-by-section)
   - [Single Insert (Outflow / Income)](#1-single-insert-outflow--income)
   - [Multiple Outflow Insert](#2-multiple-outflow-insert)
   - [Multiple Income Insert](#3-multiple-income-insert)
   - [Multiple Balance Insert](#4-multiple-balance-insert)
   - [Manual Balance Insert](#5-manual-balance-insert)
   - [Inline Edit (Outflow / Income)](#6-inline-edit-outflow--income)
   - [Delete (Outflow / Income)](#7-delete-outflow--income)
   - [CSV/Excel Import](#8-csvexcel-import)
   - [Undo Import](#9-undo-import)
4. [In-Memory Value State (Balance State)](#-in-memory-value-state-balance-state)
5. [Helper Function: parseFormattedAmount](#-helper-function-parseformattedamount)
6. [Summary Table](#-summary-table)
7. [Golden Rules](#-golden-rules)

---

## 🏛️ Fundamental Principle

```
DB = always EUR
Display = currency chosen by the user (EUR, USD, JPY, GBP, ...)

Writing to DB:  user → toEUR() → API → DB (EUR)
Reading from DB: DB (EUR) → API → fromEUR() / formatAmount() → user
```

- **`toEUR(displayValue)`** — converts from the display currency to EUR (for saving to DB)
- **`fromEUR(eurValue)`** — converts from EUR to the display currency (for showing to the user)
- **`formatAmount(eurValue)`** — internally calls `fromEUR()` + formats with the currency symbol
- **`formatNumber(eurValue)`** — internally calls `fromEUR()` + formats without the symbol

When the currency is EUR, all functions are no-ops (they return the value unchanged).

---

## 🔧 Conversion Functions (CurrencyContext)

**File:** `src/contexts/CurrencyContext.jsx`

### `fromEUR(eurValue)` — EUR → Display
```javascript
const fromEUR = (eurValue) => {
  if (typeof eurValue !== 'number' || isNaN(eurValue)) return 0;
  if (currency === 'EUR') return eurValue;
  const rate = exchangeRates[currency] || FALLBACK_RATES[currency] || 1;
  return eurValue * rate;  // E.g.: 100 EUR * 1.08 = 108 USD
};
```

### `toEUR(localValue)` — Display → EUR
```javascript
const toEUR = (localValue) => {
  if (typeof localValue !== 'number' || isNaN(localValue)) return 0;
  if (currency === 'EUR') return localValue;
  const rate = exchangeRates[currency] || FALLBACK_RATES[currency] || 1;
  return localValue / rate;  // E.g.: 108 USD / 1.08 = 100 EUR
};
```

### `formatAmount(eurValue)` — EUR → formatted string with symbol
```javascript
const formatAmount = (eurValue) => {
  const displayValue = fromEUR(eurValue);  // ← internally calls fromEUR
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(displayValue);
};
// E.g.: formatAmount(100) with USD → "$108.00"
```

### `formatNumber(eurValue)` — EUR → formatted string without symbol
```javascript
const formatNumber = (eurValue) => {
  const displayValue = fromEUR(eurValue);  // ← internally calls fromEUR
  return displayValue.toLocaleString(locale, { minimumFractionDigits: 2 });
};
// E.g.: formatNumber(100) with USD → "108.00"
```

### Provider Exports
```javascript
value={{ currency, setCurrency, currencySymbol, currencyConfig, 
         exchangeRates, formatAmount, formatNumber, fromEUR, toEUR }}
```

---

## 🗺️ Complete Flow Map by Section

### 1. Single Insert (Outflow / Income)

**File:** `InsertValues.jsx` → `createInExJson()` + `handleConfirmInEx()`

```
User types "108" (USD)
    │
    ▼
outflow / income state = "108" (string, display currency)
    │
    ├─► createInExJson(amount="108")
    │       Number("108") = 108
    │       toEUR(108) = 100          ──► API: { amount: 100 }  ✅ EUR
    │
    └─► Balance update (if selectedOption active):
            valueBalanceSelected = parseFloat(bankValue)   // EUR from DB
            outflowNumber = toEUR(parseFloat("108"))       // 108 USD → 100 EUR
            newValue = valueBalanceSelected - 100           // all in EUR
            createBalancesJson(date, "Banca", newValue)    ──► API ✅ EUR
```

### 2. Multiple Outflow Insert

**File:** `InsertValues.jsx` → `handleBatchOutflowSubmit()`

```
User fills in N rows with amounts in the display currency
    │
    ▼
For each row:
    parseFormattedAmount(row.amount) → number (e.g.: 108 USD)
    createInExJson(amount=108) → toEUR(108) = 100 EUR     ──► API ✅ EUR
    │
Balance update per source:
    groupAmountsByBalanceSource(rows) → { "Banca": 500 }  // display total
    currentBalanceValue (EUR from state)
    newValue = currentBalanceValue - toEUR(500)            ──► API ✅ EUR
```

### 3. Multiple Income Insert

**File:** `InsertValues.jsx` → `handleBatchIncomeSubmit()`

```
Identical to the outflow flow, but:
    newValue = currentBalanceValue + toEUR(totalAmount)    ──► API ✅ EUR
```

### 4. Multiple Balance Insert

**File:** `InsertValues.jsx` → `handleBatchBalanceSubmit()`

```
User fills in amounts for each asset in the display currency
    │
    ▼
For each row and for each asset:
    val = parseFormattedAmount(row[key])     // e.g.: "1.234,56" → 1234.56 (display)
    balance[assetDbKey] = toEUR(val)         ──► API ✅ EUR
```

### 5. Manual Balance Insert

**File:** `InsertValues.jsx` → `handleConfirmBalance()` → `createBalancesJson()`

```
Initial state:
    bankValue = getBankValue(userData)   // EUR from DB, number type

User does NOT modify the field:
    typeof bankValue === 'number'  →  return bankValue  ──► API ✅ EUR (unchanged)

User modifies the field:
    handleInputChange → bankValue = "1234.56" (string, raw digits)
    handleInputBlur   → bankValue = "1.234,56" (string, IT format, display currency)
    │
    ▼
    typeof bankValue === 'string'
    parseFormattedAmount("1.234,56") = 1234.56
    toEUR(1234.56) = ~1143.11                            ──► API ✅ EUR
```

### 6. Inline Edit (Outflow / Income)

**File:** `OutflowSection.jsx` / `IncomeSection.jsx` → `startEditing()` + `InsertValues.jsx` → `handleSaveEditOutflow/Income()`

```
READ phase (DB → user):
    add.amount = 100 (EUR from DB)
    displayAmount = fromEUR(100) = 108 (USD)
    editValues.amount = "108"                            // user sees 108

WRITE phase (user → DB):
    1. Delete the original:
       originalAdd.amount = 100 (EUR from DB, unchanged)
       API delete: { amount: 100 }                      ──► API ✅ EUR

    2. Insert the new one:
       editedValues.amount = "120" (user modified it, display currency)
       createInExJson(amount="120") → toEUR(120)        ──► API ✅ EUR
```

### 7. Delete (Outflow / Income)

**File:** `InsertValues.jsx` → `handleIncomesDelete()` / `handleOutflowsDelete()`

```
deleteIncomeAmount = add.amount     // EUR from DB (passed from IncomeSection)
    │
    ▼
API delete: { amount: Number(deleteIncomeAmount) }       ──► API ✅ EUR

Balance update:
    valueBalanceSelected = parseFloat(bankValue)          // EUR (if not edited)
    incomeNumber = parseFloat(deleteIncomeAmount)         // EUR from DB
    newValue = valueBalanceSelected - incomeNumber        // EUR - EUR ✅
    createBalancesJson(date, "Banca", newValue)           ──► API ✅ EUR
```

> **Note:** `deleteIncomeAmount` and `deleteOutflowAmount` come from `add.amount`, which is the EUR value from the database. No conversion needed.

### 8. CSV/Excel Import

**File:** `DataImportWizard.jsx` + `src/utils/dataImport.js`

```
CSV parsing → tx.amount = numeric value (user's display currency)
    │
    ▼
Batch import:
    toAPIFormat({ ...tx, amount: toEUR(tx.amount) })     ──► API ✅ EUR

Saving for undo:
    savedTxForUndo.amount = toEUR(tx.amount)             // saved in EUR
```

> **Note:** `toAPIFormat()` in `dataImport.js` is a pure function that performs no conversions — the conversion happens in the caller (`DataImportWizard.jsx`) before passing the tx.

### 9. Undo Import

**File:** `DataImportWizard.jsx` → `handleUndo()`

```
importedTx = importResult._savedTx     // already in EUR (saved post-conversion)
    │
    ▼
For each tx:
    financeService.deleteExpenseOrIncome({ expense: tx })
    // tx.amount is already EUR                               ──► API ✅ EUR
```

---

## 💾 In-Memory Value State (Balance State)

Balance values (`bankValue`, `cashValue`, etc.) follow a specific cycle:

```
INITIALIZATION:
    fetchData() → setBankValue(getBankValue(userData))
    Type: number (EUR from DB)

IF THE USER DOES NOT TOUCH THE FIELD:
    bankValue remains a number (EUR)
    createBalancesJson → typeof === 'number' → return as-is

IF THE USER MODIFIES THE FIELD:
    1. handleInputChange → setBankValue("1234.56")     // raw string
    2. handleInputBlur   → setBankValue("1.234,56")    // IT format string
       Now bankValue is a string in DISPLAY CURRENCY
    3. createBalancesJson → typeof === 'string'
       → parseFormattedAmount("1.234,56") = 1234.56
       → toEUR(1234.56) = EUR value
```

### Balance state map:

| State | Type | Currency | Conversion in createBalancesJson |
|-------|------|--------|----------------------------------|
| From fetchData (never touched) | `number` | EUR | None (`return currentValue`) |
| After edit + blur | `string` | Display | `toEUR(parseFormattedAmount(str))` |
| Override from selectedOption | `number` | EUR | `return Number(newValue)` (pre-converted) |

---

## 🔧 Helper Function: parseFormattedAmount

**File:** `src/components/multiInsert/helpers.js`

Converts Italian-formatted strings into float numbers:

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

## 📊 Summary Table

| Operation | User input | Conversion | API value | File |
|------------|-------------|-------------|------------|------|
| **Single outflow** | Display currency | `createInExJson` → `toEUR()` | EUR ✅ | InsertValues.jsx |
| **Single income** | Display currency | `createInExJson` → `toEUR()` | EUR ✅ | InsertValues.jsx |
| **Manual balance (not edited)** | — | None (already EUR) | EUR ✅ | InsertValues.jsx |
| **Manual balance (edited)** | Display currency, IT format | `parseFormattedAmount` → `toEUR()` | EUR ✅ | InsertValues.jsx |
| **Batch outflows** | Display currency, IT format | `parseFormattedAmount` → `createInExJson` → `toEUR()` | EUR ✅ | InsertValues.jsx |
| **Batch incomes** | Display currency, IT format | `parseFormattedAmount` → `createInExJson` → `toEUR()` | EUR ✅ | InsertValues.jsx |
| **Batch balance** | Display currency, IT format | `parseFormattedAmount` → `toEUR()` | EUR ✅ | InsertValues.jsx |
| **Inline edit** | Display currency (from `fromEUR`) | `createInExJson` → `toEUR()` | EUR ✅ | InsertValues.jsx |
| **Inline delete** | EUR (from DB, `add.amount`) | None (already EUR) | EUR ✅ | InsertValues.jsx |
| **CSV/Excel import** | Display currency (from file) | `toEUR()` in the caller | EUR ✅ | DataImportWizard.jsx |
| **Undo import** | EUR (saved post-conversion) | None (already EUR) | EUR ✅ | DataImportWizard.jsx |
| **Balance update post-insert** | EUR (from state) - `toEUR(amount)` | All EUR | EUR ✅ | InsertValues.jsx |
| **Balance update post-delete** | EUR (from state) ± EUR (from DB) | All EUR | EUR ✅ | InsertValues.jsx |
| **Amount display** | EUR (from DB) | `formatNumber()` / `formatAmount()` → internal `fromEUR()` | Display ✅ | OutflowSection / IncomeSection |
| **Balance placeholder** | EUR (from DB) | `fromEUR()` → `toLocaleString()` | Display ✅ | BalanceSection.jsx |

---

## 🏆 Golden Rules

1. **Never send the display currency to the API** — everything that goes to the DB must pass through `toEUR()`
2. **Never show raw EUR to the user** — use `formatAmount()`, `formatNumber()`, or `fromEUR()` manually
3. **`formatAmount`/`formatNumber` call `fromEUR` internally** — do not double-convert: ❌ `formatAmount(fromEUR(val))`
4. **Values from DB (`add.amount`, `userData.balances`) are always EUR** — no conversion needed for delete or when passing them as identifiers
5. **`typeof` check for balance state** — if `number` = EUR from DB, if `string` = display currency edited by the user
6. **`parseFormattedAmount` before `toEUR`** — for IT-format strings: `toEUR(parseFormattedAmount("1.234,56"))`
7. **`toAPIFormat` is a pure function** — the conversion to EUR happens BEFORE, in the caller, not inside `toAPIFormat()`
