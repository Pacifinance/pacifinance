# Skill: Code Review

## Purpose
Review sistematico del codice Pacifinance per correttezza, sicurezza, convenzioni e qualità.

## Trigger
Usa quando: *revisione PR*, *review del codice*, *controlla questo file*, *è corretto?*

---

## Instructions

### Checklist di Review (in ordine di priorità)

#### 🔴 Auto-fail — blocca il merge
- [ ] Testo UI hardcoded (non in `it.json`/`en.json`)
- [ ] `€` o `EUR` hardcoded nel JSX
- [ ] `any` in TypeScript
- [ ] Accesso diretto a `userData.property` senza selector
- [ ] `useNavigate()` o `<Link>` diretto invece dei localized equivalenti
- [ ] Chiamata API fuori da `UserContext.tsx`
- [ ] Modifica a `server/` (backend — off limits)
- [ ] `dangerouslySetInnerHTML` senza sanitizzazione
- [ ] Segreti/API keys hardcoded nel codice

#### 🟡 Warning — correggere prima possibile
- [ ] Nuovo campo `userData` non aggiunto a `MockAuthContext.tsx`
- [ ] Funzione utility senza test corrispondente
- [ ] Componente con stato/logica che dovrebbe essere in un hook
- [ ] `useEffect` che scrive su stato persistente (pattern pericoloso)
- [ ] Colore/icona hardcoded per dati finanziari
- [ ] Mancanza guard `if (!userData)` in pagine autenticate
- [ ] `console.log` dimenticato in produzione

#### 🟢 Best practice — suggerire
- [ ] Lazy loading per pagine non critiche
- [ ] Privacy mode: usa `isPrivate` da `PrivacyContext` per valori sensibili
- [ ] Umami analytics su azioni interattive: `data-umami-event="..."`
- [ ] ARIA labels su elementi interattivi
- [ ] Gestione stato loading/error espliciti

### OWASP Check (per codice che tocca auth/dati)
| Rischio | Cosa controllare |
|---|---|
| XSS | Input utente mai in `innerHTML` raw |
| Auth bypass | Route protette verificano `isAuthenticated`, non solo `userData` |
| Info exposure | Nessun dato sensibile in localStorage non cifrato |
| CSRF | Chiamate API usano `withCredentials: true` (cookie HTTP-only) |

### Formato risposta review
```
## Auto-fail ❌
- [file:riga] Descrizione problema + fix suggerito

## Warning ⚠️  
- [file:riga] Descrizione + suggerimento

## OK ✅
- Aspetti positivi (brevemente)

## Suggerimenti 💡
- Miglioramenti non bloccanti
```
