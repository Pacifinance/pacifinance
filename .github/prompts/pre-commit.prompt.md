---
mode: ask
description: Checklist completa prima di fare commit di una nuova feature
---

Prima di committare, verifica ogni punto di questo gate:

## 1. Compilazione & Qualità
- [ ] `npm run lint` — zero errori
- [ ] `npm test` — tutti i test passano
- [ ] `npm run build` — build di produzione completata

## 2. i18n
- [ ] Ogni stringa UI nuova è in `src/i18n/locales/it.json`
- [ ] Ogni stringa UI nuova è in `src/i18n/locales/en.json`
- [ ] Nessun testo hardcoded (`"Salva"`, `"Save"`, ecc.)

## 3. Currency
- [ ] Nessun `€` o `EUR` hardcoded nel JSX/TSX
- [ ] Tutti gli importi usano `formatAmount()` da `CurrencyContext`
- [ ] Input utente convertiti con `toEUR()` prima dell'invio all'API

## 4. Dati & State
- [ ] Nessun accesso diretto a `userData.balances[x]...` — usa selectors
- [ ] Se aggiunto campo a `userData` → aggiornato anche `MockAuthContext.tsx`
- [ ] Nessuna chiamata API fuori da `UserContext.tsx`

## 5. Routing
- [ ] Nessun `<Link to="...">` diretto — usa `<LocalizedLink>`
- [ ] Nessun `useNavigate()` diretto — usa `useLocalizedNavigate()`

## 6. Test
- [ ] Nuovi test aggiunti per le nuove funzioni in `utils/`
- [ ] Test negativi scritti prima del happy path
- [ ] Selectors testati con input null/undefined

## 7. Feature User-Facing
- [ ] Se la feature è visibile all'utente:
  - [ ] `scripts/roadmap-items.json` aggiornato con `completedDate`
  - [ ] `todo.md` aggiornato con `[x]` e `<!-- roadmap:id -->`
  - [ ] `npm run roadmap` eseguito → `src/data/roadmapData.js` rigenerato

## 8. TypeScript
- [ ] Nessun `any` — usa tipi espliciti o `unknown` + type guard
- [ ] Props dei componenti definite come `interface`

Se tutti i punti sono ✅, sei pronto per il commit.
