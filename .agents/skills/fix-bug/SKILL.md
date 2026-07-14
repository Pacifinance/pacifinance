# Skill: Fix Bug

## Purpose
Diagnosi e fix di bug in Pacifinance con verifica che non vengano introdotte regressioni.

## Trigger
Usa questa skill quando: *c'è un bug*, *qualcosa non funziona*, *errore in console*, *test fallisce*, *comportamento inatteso*.

---

## Instructions

### Phase 1 — Riproduzione
1. Leggi il messaggio di errore intero (stack trace incluso)
2. Identifica il file e la riga dell'errore
3. Leggi il contesto del file: ±30 righe intorno all'errore
4. Identifica: è un errore di runtime, logico, di rete, o di rendering?

### Phase 2 — Diagnosi
Scorri questa tabella di bug noti prima di cercare altrove:

| Sintomo | Causa probabile | File da controllare |
|---|---|---|
| `userData is null/undefined` | Componente usato fuori da `UserProvider`, o prima che i dati siano caricati | `UserContext.tsx`, guard `if (!userData)` |
| `translations.X.Y is undefined` | Chiave mancante in `it.json` o `en.json`, o sezione diversa | `src/i18n/locales/*.json` |
| Route `/en/...` non trovata | Manca prefisso lingua in `AppRouter.tsx` | `src/AppRouter.tsx` |
| Navigazione senza prefisso lingua | Uso di `useNavigate` invece di `useLocalizedNavigate` | File che chiama `navigate()` |
| Importo mostrato sempre in EUR | Uso di `toLocaleString` invece di `formatAmount` | Componente che mostra il valore |
| Colore/icona undefined | `getAssetColor('chiave-inesistente')` — chiave non mappata | `src/data/assetColors.ts` |
| Mock non aggiornato | Nuovo campo in `userData` senza aggiornare `MockAuthContext` | `src/contexts/MockAuthContext.tsx` |
| Build fallisce dopo cambio i18n | Chiave in un file ma non nell'altro | `it.json` vs `en.json` |
| `date.toISOString()` bug notturno | UTC midnight issue | Funzione che usa `toISOString()` |
| Test failing dopo aggiunta campo | `mockUserData` non aggiornato nei test | `src/__tests__/setup.js` o test specifico |

### Phase 3 — Fix
1. Applica il fix **minimo** — solo le righe necessarie
2. Non refactorare durante un bug fix
3. Se il bug è in un selector: aggiungi un test che riproduce il bug PRIMA del fix

### Phase 4 — Verifica
```bash
npm run lint && npm test && npm run build
```
- [ ] Il bug non si riproduce più
- [ ] I test esistenti passano ancora
- [ ] Nessun new warning in console

### Phase 5 — Documentazione
Se il bug è un pattern ricorrente (vedi tabella Phase 2): aggiorna la tabella con il nuovo caso.

---

## Quick Fixes Comuni

```tsx
// userData null guard
if (isLoading || !userData) return <Skeleton />;

// Traduzione mancante — fallback sicuro
const title = translations?.dashboard?.title ?? 'Pacifinance';

// Data locale (non UTC)
const today = new Date().toLocaleDateString('sv'); // 'YYYY-MM-DD'

// Selector sicuro
export const getBank = (u: UserData | null) => u?.balances?.[0]?.balance?.bank ?? 0;
```
