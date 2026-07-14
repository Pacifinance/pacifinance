# Pacifinance - Analisi, Idee e Feature Planning

> Documento centralizzato per analisi tecniche, idee future e planning delle feature.
> Le analisi vengono spostate qui dal `todo.md` per tenerlo pulito come puro checklist.

---

## 📑 Indice

1. [Idee Future](#-idee-future)
2. [Le Mie Idee (Appunti Veloci)](#-le-mie-idee)
3. [Analisi: Gestione Email Utenti (Cifratura & Privacy)](#-analisi-gestione-email-utenti-cifratura--privacy)
4. [Analisi: Tracciamento Donazioni BuyMeACoffee → Achievement "Supporter"](#-analisi-tracciamento-donazioni-buymeacoffee--achievement-supporter)
5. [Analisi: PWA Push Notifications](#-analisi-pwa-push-notifications)
6. [Analisi: Supporto Multi-Valuta](#-analisi-supporto-multi-valuta) ✅ Completato
7. [Analisi: Pagina Roadmap Pubblica](#-analisi-pagina-roadmap-pubblica) ✅ Completato
8. [Analisi: Sistema Feedback & Bug Report](#-analisi-sistema-feedback--bug-report) ✅ Fase 0 Completata
9. [Analisi: Flow Conversioni Valuta](CURRENCY_FLOW.md) ✅ Documento dedicato
10. [Note Tecniche](#-note-tecniche)

---

## 💡 Idee Future

### UX/UI
- Tema personalizzato: colore primario scelto dall'utente
- Onboarding guidato al primo accesso (tour interattivo)
- Swipe gesture per navigare tra le pagine su mobile (alternativa allo scroll navigation)
- Animazioni di ingresso differenziate per ogni card asset (staggered)

### Funzionalità Avanzate
- Collegamento API bancarie (Open Banking PSD2) per importazione automatica transazioni
- Previsioni AI sul patrimonio futuro basate sui trend
- Categorizzazione automatica delle spese con machine learning
- Budget planner con scenari "what if"
- Calcolo interesse composto per gli investimenti
- Tracker dividendi (date ex-dividend, importi attesi)
- Confronto patrimonio con media nazionale per fascia d'età/lavoro

### Gamification
- Classifica opzionale tra utenti anonimi della stessa fascia (per ora no)
- Badge "Supporter" per chi dona via BuyMeACoffee (vedi analisi sotto)

### Sicurezza & Privacy
- Autenticazione biometrica (fingerprint/face ID) su mobile
- 2FA con TOTP (Google Authenticator)
- Crittografia end-to-end per i dati finanziari
- Sessione con timeout configurabile dall'utente
- PIN di accesso rapido all'app

### Integrazioni
- Widget iOS/Android (se PWA supporta)
- Telegram bot per inserimento rapido spese
- Esportazione verso Google Sheets
- Sincronizzazione con app di budget esistenti (YNAB, Mint)

### SEO & Marketing
- Blog con consigli di finanza personale
- Pagina "case study" con dati anonimi aggregati
- Referral program
- Versione multilingua: aggiungere ES, DE, FR, PT

---

## 💭 Le Mie Idee

> **Come usare questa sezione:** Scrivi qui le tue idee in formato libero. Quando le vedrò, le organizzerò nel todo, le valuterò e le implementerò.
> Formato suggerito: una riga per idea, anche solo un appunto veloce.

<!-- Scrivi le tue idee qui sotto, una per riga -->
- ~~C'è un modo per capire se un utente fa effettivamente una donazione alla piattaforma?~~ ✅ **Analizzato** — vedi sotto
- Potrei fare che gli achievements dei traguardi di net worth siano più variabilizzati sul bilancio dell'utente e gli scalini siano coerenti per far si che siano raggiungibili e sproni veramente l'utente. (caso studio utente con 1000€, l'obbiettivo da 50k€ è forse troppo alto)
Se lo si variabilizza si potrebbero mettere dei lucchetti su quelli successivi come da sbloccare, che non possa vederle (da valutare)
- Tracker di log degli utenti per badge e punti. Tipo ti sei connesso

---

## 📧 Analisi: Gestione Email Utenti (Cifratura & Privacy)

> Data: 15/02/2026

### Contesto Attuale

Attualmente Pacifinance ha un sistema di autenticazione **ultra-minimale orientato alla privacy**:
- L'utente si registra inserendo **solo una password**
- Il sistema genera automaticamente un **ID univoco** (userId)
- L'utente accede con **ID + password**
- **Non viene raccolta NESSUNA email** o dato identificativo

**Problema critico:** Se l'utente perde il suo ID o la password, **non c'è modo di recuperarli**. Non possiamo contattarlo, non possiamo verificare la sua identità, non possiamo mandare un link di reset.

### Obiettivo

Introdurre un sistema di gestione email che:
1. **Permetta il recupero dell'account** (reset password, recupero ID)
2. **Mantenga la privacy** — l'email non deve essere leggibile nel DB
3. **Abiliti funzionalità future** — email reminder per inserimento dati mensili, login via magic link
4. **Sia compatibile** con il principio "non conosciamo i nostri utenti"

### Soluzione Proposta: Email Cifrata con Hash Deterministico

L'approccio è usare **due campi separati** nel database per ogni utente:

```
┌─────────────────────────────────────────────────────────────────┐
│ User Document                                                    │
├─────────────────────────────────────────────────────────────────┤
│ userId:        "abc123"                                          │
│ passwordHash:  "$2b$10$..." (bcrypt)                             │
│ emailHash:     "sha256(normalize(email) + PEPPER)" (per lookup)  │
│ emailEncrypted: "AES-256-GCM(email, SERVER_KEY)" (per invio)    │
│ emailVerified:  true/false                                       │
└─────────────────────────────────────────────────────────────────┘
```

**Due livelli di protezione:**

| Campo | Scopo | Algoritmo | Reversibile? |
|---|---|---|---|
| `emailHash` | Lookup/matching (es. "questa email è già registrata?", matching webhook BMC) | SHA-256 + pepper | ❌ No (one-way hash) |
| `emailEncrypted` | Invio email effettive (reset password, reminder) | AES-256-GCM con chiave server | ✅ Sì (solo il server può decifrare) |

### Come Funzionerebbe

#### Registrazione (con email opzionale)
```
1. Utente inserisce: password + email (opzionale)
2. Frontend → POST /auth/register { password, email? }
3. Backend:
   a. Genera userId univoco
   b. passwordHash = bcrypt(password)
   c. Se email fornita:
      - emailHash = SHA-256(normalizeEmail(email) + PEPPER)
      - emailEncrypted = AES-256-GCM.encrypt(email, SERVER_KEY)
      - Invia email di verifica (link con token temporaneo)
   d. Salva nel DB
4. Ritorna: { userId }
```

#### Verifica email
```
1. Utente clicca link nella email di verifica
2. Backend verifica il token (JWT con scadenza 24h)
3. Imposta emailVerified = true nel DB
```

#### Recupero Password ("Ho dimenticato la password")
```
1. Utente inserisce: la sua email
2. Frontend → POST /auth/forgot-password { email }
3. Backend:
   a. emailHash = SHA-256(normalizeEmail(email) + PEPPER)
   b. Cerca utente con questo emailHash nel DB
   c. Se trovato e emailVerified === true:
      - Decifra emailEncrypted per ottenere l'email reale
      - Genera token di reset (JWT, scadenza 1h)
      - Invia email con link di reset
   d. Risponde SEMPRE con "Se l'email è registrata, riceverai un link"
      (per non rivelare se l'email esiste)
4. Utente clicca link → form per nuova password
5. Backend: aggiorna passwordHash
```

#### Recupero UserId ("Ho dimenticato il mio ID")
```
1. Utente inserisce: la sua email
2. Backend:
   a. Calcola emailHash, cerca nel DB
   b. Se trovato: invia email con il userId
3. Stessa risposta generica per privacy
```

### Normalizzazione Email

Fondamentale per garantire match deterministici:

```javascript
function normalizeEmail(email) {
  email = email.trim().toLowerCase();
  const [local, domain] = email.split('@');
  // Rimuovi punti da Gmail (a.b.c@gmail.com === abc@gmail.com)
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    return local.replace(/\./g, '').split('+')[0] + '@gmail.com';
  }
  // Rimuovi tutto dopo + (alias tag)
  return local.split('+')[0] + '@' + domain;
}
```

### Flusso Client-Side

```
┌──────────────────────────────────────────────────────────────┐
│                        FRONTEND                                │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  Registrazione:                                                │
│  ┌─────────────────────────────────────────────┐               │
│  │ Password: [••••••••]                         │               │
│  │ Email:    [user@example.com]  (opzionale)    │               │
│  │ [Registrati]                                 │               │
│  └─────────────────────────────────────────────┘               │
│  → POST /auth/register { password, email? }                    │
│  ← { userId: "abc123" }                                        │
│  → Mostra: "Il tuo ID è abc123. Salvalo!"                      │
│  → Se email fornita: "Controlla la tua email per verificarla"  │
│                                                                │
│  Login:                                                        │
│  ┌─────────────────────────────────────────────┐               │
│  │ ID:       [abc123]                           │               │
│  │ Password: [••••••••]                         │               │
│  │ [Accedi]                                     │               │
│  │ Hai dimenticato password/ID? (link)          │               │
│  └─────────────────────────────────────────────┘               │
│  → POST /auth/login { userId, password }                       │
│                                                                │
│  Recupero:                                                     │
│  ┌─────────────────────────────────────────────┐               │
│  │ Inserisci la tua email:                      │               │
│  │ Email: [user@example.com]                    │               │
│  │ [Recupera Password] [Recupera ID]            │               │
│  └─────────────────────────────────────────────┘               │
│  → POST /auth/forgot-password { email }                        │
│  ← "Se l'email è registrata, riceverai un link"               │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

### Compatibilità con Feature Future

| Feature | Compatibile? | Come |
|---|---|---|
| **Email reminder mensile** | ✅ Sì | Il server decifra `emailEncrypted`, invia il reminder. L'utente può attivare/disattivare nelle Settings |
| **Login via magic link** | ⚠️ Parziale | Possibile: utente inserisce email → server invia link con token → login senza password. **MA**: contrasta con il principio "non conosciamo i nostri utenti" perché l'email diventa di fatto l'identità |
| **Webhook BMC (donazioni)** | ✅ Sì | L'`emailHash` permette matching senza mai esporre l'email in chiaro |
| **2FA via email** | ✅ Sì | Il server decifra l'email, invia OTP. Alternativa a TOTP app |
| **Notifiche importanti** | ✅ Sì | Es. "La tua sessione scade", "Aggiornamento termini di servizio" |

### Considerazioni Privacy vs Funzionalità

**Il compromesso fondamentale:**
- 🔒 **Privacy estrema (attuale):** zero email, zero tracciabilità → impossibile aiutare l'utente
- 📧 **Privacy con email cifrata (proposta):** email opzionale, cifrata e hashata → recupero account possibile, ma il server _tecnicamente_ può decifrare l'email

**Trasparenza consigliata:** Spiegare chiaramente all'utente:
- "La tua email è cifrata nel nostro database. Nessuno può leggerla direttamente."
- "Usiamo la tua email SOLO per: recupero password, recupero ID, e reminder (se attivati)."
- "Puoi usare Pacifinance anche senza email — ma non potremo aiutarti a recuperare l'account."

### Magic Link e Reminder: il Dilemma Privacy

**Magic Link (login senza password via email):**
- ✅ UX eccellente — niente password da ricordare
- ❌ L'email diventa l'identità dell'utente → mina il principio "non conosciamo gli utenti"
- ❌ Se qualcuno ha accesso all'email, ha accesso all'account
- 🤔 **Valutazione:** Implementabile come opzione aggiuntiva (non sostitutiva). L'utente continua a poter fare login con ID+password. Il magic link è un'alternativa opt-in.

**Email Reminder ("Hai inserito i dati questo mese?"):**
- ✅ Molto utile per engagement e retention
- ✅ Compatibile con la privacy: il server decifra l'email solo per inviare, non la espone a nessuno
- ⚠️ Richiede opt-in esplicito dall'utente (toggle in Settings)
- 🤔 **Valutazione:** Perfettamente compatibile. L'utente sceglie se attivare i reminder.

### Sicurezza: Dettagli Implementativi

**PEPPER per l'hash:**
```
EMAIL_HASH_PEPPER=<random 64-char hex string>
```
- Salvato SOLO come variabile d'ambiente del server (non nel codice, non nel DB)
- Rende impossibile il pre-compute di rainbow table anche se il DB viene compromesso

**Chiave AES per cifratura:**
```
EMAIL_ENCRYPTION_KEY=<random 32-byte key, hex encoded>
```
- Separata dal PEPPER
- Anche questa solo come env variable
- Se compromessa, consente la decifratura di tutte le email → proteggere con HSM in produzione se possibile

**Rotation delle chiavi:**
- Prevedere un campo `encryptionVersion` per supportare la rotazione delle chiavi in futuro
- Quando si ruota la chiave: decifrare con la vecchia, ri-cifrare con la nuova (batch job)

### Implementazione Richiesta

**Backend (server/):**
- [ ] Campo `emailHash` (stringa, indexed, unique, nullable) nel documento utente
- [ ] Campo `emailEncrypted` (stringa, nullable) nel documento utente
- [ ] Campo `emailVerified` (boolean, default false) nel documento utente
- [ ] Endpoint `POST /auth/register` aggiornato per accettare email opzionale
- [ ] Endpoint `POST /auth/forgot-password` per reset password
- [ ] Endpoint `POST /auth/recover-id` per recupero userId
- [ ] Endpoint `GET /auth/verify-email/:token` per verifica email
- [ ] Endpoint `POST /auth/reset-password` per impostare nuova password
- [ ] Servizio di invio email (es. Resend, SendGrid, o AWS SES)
- [ ] Env variables: `EMAIL_HASH_PEPPER`, `EMAIL_ENCRYPTION_KEY`, `EMAIL_SERVICE_API_KEY`
- [ ] Template email: verifica, reset password, recupero ID

**Frontend (src/):**
- [ ] SignUpForm: aggiungere campo email opzionale con nota privacy
- [ ] LoginForm: aggiungere link "Ho dimenticato password/ID"
- [ ] Nuova pagina ForgotPasswordPage con form recovery
- [ ] Nuova pagina ResetPasswordPage per inserire nuova password
- [ ] SettingsPage: sezione per aggiungere/modificare email + toggle reminder
- [ ] ProfilePage: mostrare stato email (verificata/non verificata/non impostata)
- [ ] Traduzioni IT/EN per tutti i flussi
- [ ] MockAuthContext: aggiungere campi email-related per dev mode

### Stima Lavoro
- Backend: ~2-3 giorni (crypto, endpoints, email service, template)
- Frontend: ~1-2 giorni (form, pagine recovery, settings)
- **Totale: ~3-5 giorni**

### Priorità
**Alta** — Questa è una delle feature più importanti per la retention degli utenti. Senza di essa, ogni utente che perde le credenziali è un utente perso per sempre.

---

## 📊 Analisi: Tracciamento Donazioni BuyMeACoffee → Achievement "Supporter"

**Risposta: Sì, è possibile!** BuyMeACoffee offre **Webhooks** che notificano il tuo server in tempo reale quando qualcuno fa una donazione.

**Come funzionerebbe:**

1. **Setup Webhook BMC** → Registra un endpoint del tuo server (es. `POST /api/webhooks/bmc`) nella dashboard BMC ([studio.buymeacoffee.com/webhooks](https://studio.buymeacoffee.com/webhooks))
2. **Ricezione evento** → Quando qualcuno dona, BMC invia un payload JSON con info del supporter (email, nome, messaggio)
3. **Matching utente** → Il server confronta l'`emailHash` del donatore con gli `emailHash` degli utenti registrati su Pacifinance (⚠️ richiede che l'utente abbia fornito la stessa email sia su BMC che su Pacifinance)
4. **Flag nel database** → Se c'è match, imposta `hasDonated: true` sul documento utente (nessun dato di pagamento salvato!)
5. **Badge "Supporter"** → Il frontend legge il flag da `userData.hasDonated` e sblocca il badge

**Privacy e sicurezza:**
- ✅ Nessun dato di pagamento salvato (no importo, no carta, no transazione)
- ✅ Solo un flag booleano `hasDonated: true/false`
- ✅ Il matching avviene via hash — l'email non viene mai salvata in chiaro
- ✅ Token di verifica webhook per autenticità delle richieste

**Approccio alternativo (più semplice, senza webhook):**
- L'utente dona su BMC, poi clicca "Ho donato" in Pacifinance
- Il server verifica tramite l'API BMC (endpoint `/supporters`) se l'emailHash corrisponde
- Se confermato, sblocca il badge

**Cosa otterrebbe il donatore (idee):**
- 🏅 Badge esclusivo "Supporter" / "Sostenitore" nel profilo
- ⭐ Bordo dorato sull'avatar
- 🎨 Colori avatar esclusivi (palette premium)
- 🔓 Funzionalità extra (es. più personalizzazione dashboard)

**Implementazione richiesta:**
- **Backend**: nuovo endpoint webhook + campo `hasDonated` nel DB + route API per verificare
- **Frontend**: badge "Supporter" in `useGamification.js` (già predisposto, basta aggiungere `check: (data) => data.hasDonated === true`)

**Stato: Pronto per implementazione backend** — il frontend è già preparato per supportare un badge `supporter` quando il server fornirà il flag `hasDonated`. Nota: il matching via email funzionerà solo dopo l'implementazione del sistema email cifrata.

---

## 📲 Analisi: PWA Push Notifications per Promemoria Inserimento Dati Mensili

**Obiettivo:** Inviare una notifica push all'utente (es. giorno 1-3 del mese) se non ha ancora inserito i dati del mese corrente.

**Architettura necessaria:**
```
Browser (Push API) → subscribe → Backend (Node/cron) → web-push → Web Push Service → Notification
```

**Componenti necessari:**

| Componente | Stato | Lavoro stimato |
|---|---|---|
| Service Worker (`sw.js`) | ✅ Già presente | Aggiungere listener `push` e `notificationclick` |
| Push API (frontend) | ❌ Da fare | `reg.pushManager.subscribe(...)` con VAPID key |
| VAPID keys | ❌ Da fare | `web-push generate-vapid-keys` (una tantum) |
| Backend: endpoint subscription | ❌ Da fare | `POST /api/push/subscribe` + tabella DB |
| Backend: cron job | ❌ Da fare | Job mensile che invia push a chi non ha inserito dati |
| UI: toggle notifiche | ❌ Da fare | Switch in SettingsPage per attivare/disattivare |
| Permessi browser | ❌ Da fare | `Notification.requestPermission()` con UX non invasiva |

**Compatibilità browser:**
- ✅ Chrome, Firefox, Edge (desktop + Android) — funziona anche a browser chiuso
- ⚠️ iOS Safari: solo da iOS 16.4+ e **solo** se PWA installata su home screen
- ❌ Safari desktop: supporto limitato

**Pro:**
- Gratuito (Web Push non costa, a differenza di FCM per mobile nativo)
- L'utente riceve promemoria anche a browser chiuso (se SW registrato)
- Nessun servizio terzo necessario (solo libreria `web-push` lato server)

**Contro:**
- Richiede **modifiche backend** (nuovo endpoint + cron + VAPID)
- iOS richiede PWA installata → la maggior parte degli utenti iOS non la installerà
- Bassa adoption rate: ~50% degli utenti rifiuta le notifiche push web
- Complessità: gestione subscription expiry, token refresh, error handling

**Alternativa: Email Reminder** (richiede sistema email — vedi analisi sopra)
- Cron job backend che decifra le email e invia reminder se l'utente non ha inserito dati
- Zero modifiche frontend (solo toggle on/off in Settings)
- Compatibile al 100% con tutti i dispositivi
- Open rate email ~40% vs push notification ~20%

**Stima lavoro:**
- Push Notifications: ~2 giorni frontend + ~1 giorno backend
- Email Reminder: ~0.5 giorni backend (dopo implementazione sistema email), 0 frontend

**Raccomandazione:** Implementare prima il sistema email cifrata, poi valutare email reminder (molto più semplice e efficace). Push notifications come enhancement futuro opzionale.

---

## 💱 Analisi: Supporto Multi-Valuta ✅ COMPLETATA

> Questa feature è stata completamente implementata. Documentazione qui per riferimento storico.

**Approccio implementato: EUR come valuta base nel DB, conversione a display-time**

```
User input (USD) → conversione → DB (EUR) → lettura → conversione → display (USD)
```

**Architettura:**

| Componente | Dove | Cosa fa |
|---|---|---|
| `CurrencyContext` | `src/contexts/` | Stato globale: valuta utente, simbolo, tasso, `formatAmount()`, `toEUR()`, `fromEUR()` |
| `currencyConfig.js` | `src/data/` | Mappa 19 valute supportate con simboli, locale, flag |
| Exchange rate API | frankfurter.app | API gratuita per tassi aggiornati, cache 24h in localStorage |
| `preferredCurrency` | Profilo | Valuta preferita dell'utente salvata nel DB (index → codice via currency tags) |
| Settings currency | SettingsPage | Valuta di visualizzazione rapida (session-only, NON persistita nel DB) |

**19 Valute supportate:** EUR, USD, GBP, CHF, JPY, CAD, AUD, SEK, NOK, DKK, PLN, CZK, HUF, RON, BGN, BRL, INR, CNY, TRY

---

## 🗺️ Analisi: Pagina Roadmap Pubblica ✅ COMPLETATA

> Implementata con layout kanban, 3 colonne, filtri, automazione da `todo.md`, route pubblica `/roadmap`.

**Architettura implementata:**
- `scripts/roadmap-items.json` — lista curata di item roadmap con titoli bilingui
- `scripts/generateRoadmap.js` — genera `src/data/roadmapData.js` da `roadmap-items.json` + `todo.md`
- `npm run roadmap` e `prebuild` hook per auto-generazione

---

## 📝 Analisi: Sistema Feedback & Bug Report ✅ Fase 0 Completata

**Fase 0 (completata):** Link diretto a GitHub Issues in SettingsPage + Info page.

**Fase 1 (da fare):** Form in-app che crea GitHub Issue via backend.

**Flusso utente proposto per Fase 1:**
```
Utente → clicca "Feedback" → sceglie tipo (🐛 Bug / 💡 Idea / 💬 Altro)
→ compila form (titolo + descrizione) → invio
→ Backend crea GitHub Issue con label appropriata
→ Utente vede conferma + link alla Issue
```

**Campi del form:**
- **Tipo** (select, obbligatorio): Bug / Idea / Feedback / Domanda
- **Titolo** (input, obbligatorio, max 100 chars)
- **Descrizione** (textarea, obbligatorio, max 1000 chars)
- **Pagina correlata** (select, opzionale): Dashboard / Inserimento / Grafici / ...

**Privacy:**
- ✅ Il feedback è anonimo su GitHub (il backend lo posta come bot, non espone l'utente)
- ✅ Nessun dato personale incluso nella Issue

---

## 📋 Note Tecniche

- **Breakpoint mobile**: `max-width: 839px` (MediaQueryContext `isMobileScreen`)
- **Breakpoint CSS**: la maggior parte degli styled-components usa `max-width: 768px`
- **BottomNavBar height**: 66px + safe-area-inset-bottom
- **Routing**: tutte le route hanno prefisso lingua (`/it/dashboard`, `/en/dashboard`)
- **Server folder**: NON modificare — gestito separatamente
- **Autenticazione attuale**: ID generato dal sistema + password (nessuna email)
- **Sessioni**: Cookie HTTP-only, axios interceptor per 401 (logout automatico)
- **Valori monetari nel DB**: tutti in EUR, conversione a display-time via CurrencyContext
- **preferredCurrency**: salvata nel DB come index, mappata a codice valuta via currency tags da `/tags/get`
