# PaciFinance - TODO & Roadmap

> Ultimo aggiornamento: 12/02/2026

---

## ✅ Completati

### Navigazione Mobile
- [x] Sostituzione hamburger menu con **BottomNavBar** (stile app nativa, 4 tab: Dashboard, Inserisci, Altro, Account)
- [x] BottomNavBar usa React Portal per renderizzarsi sopra tutto il contenuto
- [x] Menu popup per "Altro" (Grafici, Confronto, Conoscenza, Info) e "Account" (Profilo, Obiettivi, Impostazioni, Logout)
- [x] Indicatore attivo (linea verde sopra il tab corrente)
- [x] Sidebar desktop: fix da `<Link>` a `<LocalizedLink>` per routing i18n corretto

### Routing & i18n
- [x] `useLocalizedNavigate` usato ovunque al posto di `useNavigate` (Dashboard, Profile, Settings)
- [x] `useScrollNavigation` fix: `removeLanguageFromPath()` prima di comparare con PAGE_ORDER
- [x] DashboardPage: sostituito `window.location.href` con `navigate()` localizzato
- [x] Traduzioni aggiunte: `sidebar.dashboard`, `sidebar.more`, `sidebar.goalsLimits`

### Gestione Sessione
- [x] Axios interceptor 401 in UserContext per sessioni scadute (logout automatico)
- [x] ProtectedRoute redirect a `/` (landing) invece di `/auth`

### UI/UX Mobile Dashboard
- [x] Card asset e investimenti: **2 per riga** su mobile (da 1 per riga)
- [x] Card compatte: padding, font, icone ridotti su mobile
- [x] Metric cards (Liquidità/Emergenza/Investimenti): layout **colonna verticale** per card, distribuzione equa (`flex: 1 1 0`)
- [x] Titoli sezione responsivi (1.1rem su mobile)
- [x] Grafici pie: altezza 220px su mobile (da 350px), outerRadius 80 (da 120)
- [x] Animazioni floating disattivate su mobile (performance)
- [x] Gap e spacing ridotti ovunque su mobile
- [x] Testo obiettivo fondo emergenza: font ridotto da 0.8rem a 0.55rem su mobile

### SettingsPage
- [x] Fix typo `tranhandleLanguageTogglbar` → `translations.sidebar.settings.language`
- [x] Fix `toggleLanguage` mancante nel destructuring di LanguageContext
- [x] Fix `useNavigate` → `useLocalizedNavigate`
- [x] Riordino sezioni: **Tema → Sicurezza → Esportazione Dati → Danger Zone**

### Performance
- [x] Lazy loading per `FinancialInsights`, `GoalTracker` e `GamificationSection` (React.lazy + Suspense)
- [x] Memoizzazione dati pie chart con `useMemo` (pieData, detailedPieData, incExpData)
- [x] Skeleton loading (`DashboardSkeleton`) con shimmer animation durante il caricamento dati

### Test
- [x] Test unitari per BottomNavBar (10 test cases: render, menu, logout, backdrop, dark theme)
- [x] Test per `useScrollNavigation` con path localizzati (10 test cases)
- [x] Test per ordine sezioni SettingsPage (2 test cases)

### Gamification
- [x] Hook `useGamification`: calcolo client-side di 44 badge in 10 categorie
  - **Costanza (7):** firstMonth, threeMonths, sixMonths, oneYear, twoYears, dataStreak6, dataStreak12
  - **Risparmio (6):** firstSave, savingsStreak3/6/12, bigSaver (30%+), superSaver (50%+)
  - **Patrimonio (7):** netWorth 1k/10k/50k/100k/250k/500k/1M
  - **Diversificazione (7):** firstInvestment, diversified3/5/7, cryptoExplorer, goldHolder, bondInvestor
  - **Emergenza e Crescita (4):** emergencyFundStarted/Goal, monthlyGrowth, yearlyGrowth
  - **Gestione Uscite (4):** budgetMaster, frugalMonth, spendingDown, categoryTracker
  - **Entrate (3):** firstIncome, incomeGrowth, steadyIncome
  - **Obiettivi (3):** goalSetter, goalAchiever, multiGoal
  - **Community (2):** topQuartile (top 25%), top10Percent (top 10%)
  - **Profilo (1):** profileComplete
- [x] Componente `GamificationSection`: griglia badge con filtro categoria (chip scrollabili) + raggruppamento per sezione, barra livello, tab sbloccati/bloccati, stats
- [x] Traduzioni IT/EN per tutti i 44 badge, 10 categorie e label
- [x] Sistema dinamico badgeTranslations (auto-mappa tutti i badge definiti)
- [x] `BADGE_CATEGORIES` e `BADGE_CATEGORY_ORDER` esportati per uso esterno

### Dashboard Personalizzabile
- [x] Hook `useDashboardLayout`: ordine sezioni + view mode persistiti in localStorage
- [x] Componente `DashboardToolbar`: toggle vista compatta/card + pannello personalizzazione con drag-and-drop
- [x] Componente `DashboardCompactView`: vista tabellare riassuntiva (panoramica asset, categorie, entrate/uscite)
- [x] Integrazione in Dashboard.jsx: toolbar, compact/cards conditional rendering
- [x] Traduzioni IT/EN per tutte le label della toolbar e compact view

### Varie
- [x] BuyMeACoffee widget: CSS override per posizionarlo sopra BottomNavBar su mobile
- [x] ScrollNavigationIndicator: `bottom: 74px` su mobile per stare sopra la nav bar
- [x] `index.css`: padding-bottom mobile per safe-area + BottomNavBar

### Account

- [x] **Avatar generato client-side**: cerchio colorato con occhi e bocca casuali (7 stili occhi × 10 stili bocca × 20 colori = 1400+ combinazioni)
  - `src/utils/avatarGenerator.js`: generatore canvas con palette colori PaciFinance
  - `src/components/AvatarIcon.jsx`: componente React con rigenerazione (doppio click/tasto destro)
  - Integrato in `Sidebar.jsx` (desktop) e `SidebarMobile.jsx` (mobile)
  - Salvato in localStorage (`pacifinance-avatar`), rigenerabile 1x al giorno
  - Toast notification su rigenerazione

### Multi-Valuta (Currency Support)
- [x] **CurrencyContext**: context globale con `setCurrency`, `formatAmount`, `formatNumber`, `fromEUR`, `toEUR`, `currencySymbol`
- [x] **currencyConfig.js**: 19 valute supportate (EUR, USD, GBP, CHF, JPY, CAD, AUD, SEK, NOK, DKK, PLN, CZK, HUF, RON, BGN, BRL, INR, CNY, TRY)
- [x] **Exchange rate API**: fetch da frankfurter.app con cache 24h in localStorage + fallback rates statici
- [x] **Selezione valuta in SettingsPage**: dropdown con bandiere e nomi valuta, persistenza in localStorage
- [x] **Conversione display-time**: tutti i valori EUR dal DB convertiti nella valuta scelta con `fromEUR()`
- [x] **Sostituzione hardcoded €**: rimosso simbolo `€` hardcodato da tutti i componenti (Dashboard, IncomeSection, OutflowSection, BalanceSection, InsertModals, GoalsAndLimits, FinancialInsights, DataImportWizard, DashboardCompactView, InsertValues)
- [x] **Provider tree aggiornato**: CurrencyProvider inserito nella gerarchia dei context
- [x] **Test**: unit test per CurrencyContext (17 test) e currencyConfig (12 test)
- [x] **Traduzioni IT/EN** per tutte le label valuta

### Roadmap Page
- [x] **RoadmapPage.jsx**: pagina pubblica con layout kanban a 3 colonne (Completato / In Corso / Pianificato)
- [x] **roadmapData.js**: dati statici con 19 item, titoli bilingui, categorie, icone, date
- [x] **Automazione roadmap**: script `scripts/generateRoadmap.js` genera `roadmapData.js` da `scripts/roadmap-items.json` + `todo.md`
- [x] **npm scripts**: `npm run roadmap` e `prebuild` hook per auto-generazione
- [x] **Filtri per categoria e stato**: chip selezionabili per filtrare gli item
- [x] **Route pubblica**: accessibile senza login a `/roadmap`
- [x] **Link in Info page**: pulsante "Scopri la nostra Roadmap" nella sezione supporto
- [x] **Traduzioni IT/EN complete**

### Feedback & Bug Report
- [x] **Link a GitHub Issues**: pulsante in SettingsPage (sezione Sicurezza) con link diretto a `github.com/Pacifinance/Pacifinance/issues/new/choose`
- [x] **Icona faBug** con testo tradotto IT/EN
- [x] **Umami tracking**: `data-umami-event="settings-bug-report-clicked"`

### SettingsPage Redesign
- [x] **Layout compatto**: max-width ridotto (700px), padding/font/gap ridotti ovunque
- [x] **Nuova sezione Account Preferences**: lingua + valuta raggruppate
- [x] **Fix dropdown valuta**: colori espliciti per option su tema chiaro e scuro (niente più bianco su bianco)
- [x] **Nuova struttura sezioni**: Account Preferences → Theme & Display → Security → Data Export → Data Import → Danger Zone

### Import Dati da CSV/Excel
- [x] **DataImportWizard**: wizard multi-step completo (Disclaimer Privacy → Mappatura colonne → Revisione e importazione)
  - Step 0: Disclaimer privacy con icona lucchetto, conferma obbligatoria
  - Step 1: Upload file CSV/Excel, selezione riga header, mappatura colonne (data, importo, categoria, note), salvataggio/caricamento preset mappatura
  - Step 2: Tabella revisione con filtro per data (min/max auto-popolato), selezione/deselezione righe con checkbox, modifica categoria per riga, conteggio e riepilogo
  - Step 3: Importazione con progress bar e feedback per riga
- [x] **Modalità colonna duale**: toggle per scegliere due colonne separate (entrate/uscite) invece di una singola colonna importo
- [x] **Fix dropdown bianchi su sfondo bianco**: stile esplicito per `option` nei SelectField e CompactSelect (tema dark/light)
- [x] **Fix importi negativi**: `parseAmount` gestisce undefined, null, numeri, trattini en-dash, valori tra parentesi; `parseExcel` padding righe sparse alla stessa lunghezza
- [x] **Riconoscimento categorie intelligente**: matching automatico tra testo delle transazioni e categorie PaciFinance (fuzzy matching)
- [x] **Integrazione nella pagina Inserimento Dati**: bottone "Importa da CSV / Excel" visibile sotto i tab Entrate/Uscite (nascosto nel tab Bilancio perché l'import non supporta ancora l'aggiornamento bilancio)
- [x] **Modal overlay full-screen**: wizard si apre in modale con lazy loading, chiusura click esterno o ✕
- [x] **Supporto URL diretto**: `?section=import` apre il wizard direttamente
- [x] **Landing page feature card**: sezione dedicata all'importazione CSV/Excel con layout orizzontale e tag pill
- [x] **SEO keywords aggiornate**: "importare transazioni CSV", "import Excel expenses" nei metadata della landing page
- [x] **Traduzioni IT/EN complete**: tutte le label, disclaimer, messaggi di errore/successo

---

## 🔧 Da Fare

### Bug Noti
- [ ] BuyMeACoffee widget: lo script inline imposta stili una sola volta al mount, il CSS `!important` è un workaround — verificare se il widget si posiziona correttamente su tutti i dispositivi
- [ ] Verificare che i grafici con label `renderCustomizedLabel` non si sovrappongano con raggio ridotto su mobile
- [x] ~~A volte all'avvio della dashboard, rimane nella pagina bianca del caricamento e non carica la dashboard~~ → Fix: aggiunto error recovery in `UserContext` (retry su errore API), `setIsLoading(false)` nel catch di `Dashboard.jsx`, e spinner + timeout + pulsante "Riprova" in `DashboardPage.jsx`
- [x] ~~da mobile la notifica dell' achievements raggiunto finisce sotto i pulsanti della sidebar in basso, spostare la notifica più in alto e renderla più compatta da mobile~~ → Fix: Toast posizionato a `bottom: 80px` su mobile (sopra BottomNavBar), stile compatto con font ridotto, animazione slide-up
- [x] ~~gli achievements sono buggati, vengono dati come fatti anche per utenti che per esempio non hanno inserito dati negli ultimi mesi~~ → Fix: tutti i 44 badge ora verificano i dati reali (`totalValue > 0`, `income > 0`, `outflows > 0`), non solo la presenza della struttura. `calculateDataStreak` e `calculateSavingsStreak` controllano valori effettivi. Nuova helper `countMonthsWithData`. Rankings richiedono patrimonio > 0. Budget check valida che il limite sia user-set (non fallback).
- [x] ~~Dalle impostazioni non si può cambiare lingua, farlo funzionare (forse dipende dall'url localizzato)~~ → Fix: `handleLanguageToggle` usava `useLocalizedNavigate` che aggiungeva doppio prefisso lingua (`/en/en/settings`). Ora usa `useNavigate` raw di react-router-dom per la navigazione con path già prefissato.

### Mobile
- [ ] Testare BottomNavBar su dispositivi con notch/Dynamic Island (safe-area-inset)
- [ ] Scroll navigation: valutare se disabilitare interamente su mobile (può interferire con scroll naturale)
- [ ] Card fondo emergenza sola → occupa tutta la larghezza, potrebbe essere ridimensionata come half-width
- [ ] Aggiungere haptic feedback (vibrazione) sui tap della nav bar (se supportato dal browser)
- [ ] Chart legend su mobile: testo troppo piccolo o troncato? Verificare su schermi ~320px

### Desktop
- [ ] Sidebar desktop: aggiungere tooltip "Goals & Limits" al link corrispondente
- [ ] Sidebar desktop: verificare che i link attivi siano evidenziati correttamente con il nuovo routing

### Funzionalità
- [ ] Dark/Light mode: transizione animata al cambio tema
- [ ] Notifiche push (PWA) per promemoria inserimento dati mensili — vedi **Analisi PWA Push Notifications** in fondo
- [ ] Widget "riepilogo rapido" nella home con patrimonio + variazione mese precedente
- [x] ~~Import dati da CSV/Excel (inverso dell'export)~~ → Implementato: DataImportWizard multi-step con supporto CSV/Excel, mappatura colonne, filtri data, colonna duale entrate/uscite, matching categorie automatico. Accessibile da Inserimento Dati e Impostazioni.
- [ ] Grafici trend storico patrimonio (linea temporale)
- [ ] Export PDF: migliorare layout con grafici inclusi nel report

### Community & Feedback
> PaciFinance è un progetto community-centrico, basato interamente sulle donazioni. Il coinvolgimento diretto degli utenti è fondamentale.

- [x] ~~**Pagina Roadmap pubblica**~~ → Implementato: RoadmapPage con layout kanban (3 colonne), filtri categoria/stato, 19 item, automazione da todo.md, route pubblica `/roadmap`
- [x] ~~**Sistema feedback utenti (Fase 0)**~~ → Implementato: link diretto a GitHub Issues in SettingsPage (sezione Sicurezza) + link in Info page
- [ ] **Sistema feedback utenti (Fase 1)**: form in-app che crea GitHub Issue via backend
- [ ] Notifiche/changelog in-app per comunicare aggiornamenti e nuove feature alla community
- [ ] Sezione "Contribuisci" visibile: come donare, come segnalare bug, come proporre idee
- [ ] Sistema di voto priorità roadmap (richiede backend)

### Performance
- [ ] Verificare bundle size dopo aggiunta BottomNavBar + MUI icons

### Test
- [ ] Test per axios interceptor 401
- [ ] Test per `removeLanguageFromPath` edge cases
- [ ] Eseguire test suite completa (`npm test`) — terminale bloccato al momento
- [ ] Test per DataImportWizard: unit test per `parseAmount`, `processRows`, `processRowDual`, `autoDetectColumns`

### Import Dati (Evoluzione)
- [ ] Supporto aggiornamento bilancio tramite import (mappare colonne asset → valori bilancio)
- [ ] Preview grafico delle transazioni importate prima della conferma (istogramma per mese/categoria)
- [ ] Salvataggio template di mappatura per banca (es. "UniCredit CSV", "Revolut Excel") con condivisione community
- [ ] Supporto formati bancari noti (Fineco, Intesa, Revolut, N26) con auto-detect del formato
- [ ] Undo/rollback dell'ultima importazione (eliminare tutte le transazioni importate in blocco)
- [ ] Drag & drop del file (al posto del solo bottone upload)
- [ ] Supporto file OFX/QIF (formati bancari standard)
- [ ] Import ricorrente: ricordare l'ultimo file importato e suggerire di aggiornare

---

## 💡 Idee Future

### UX/UI
- ~~Dashboard personalizzabile: drag-and-drop delle sezioni per riordinarle~~ ✅
- ~~Modalità "compact view" per la dashboard (tabella riassuntiva invece di card)~~ ✅
- Tema personalizzato: colore primario scelto dall'utente
- Onboarding guidato al primo accesso (tour interattivo)
- ~~Skeleton loading per le card durante il caricamento dati~~ ✅
- Swipe gesture per navigare tra le pagine su mobile (alternativa allo scroll navigation)
- Animazioni di ingresso differenziate per ogni card asset (staggered)

### Funzionalità Avanzate
- Collegamento API bancarie (Open Banking PSD2) per importazione automatica transazioni
- Previsioni AI sul patrimonio futuro basate sui trend
- Categorizzazione automatica delle spese con machine learning
- Budget planner con scenari "what if"
- Calcolo interesse composto per gli investimenti
- Tracker dividendi (date ex-dividend, importi attesi)
- ~~Sezione "net worth milestones" con badge/achievement~~ ✅
- ~~Multi-valuta con conversione automatica in tempo reale~~ ✅ (19 valute, frankfurter.app API, cache 24h)
- Confronto patrimonio con media nazionale per fascia d'età/lavoro

### Gamification
- ~~Sistema di punti per inserimento costante dei dati~~ ✅
- ~~Badge per obiettivi raggiunti (primo mese completo, 6 mesi di dati, ecc.)~~ ✅
- ~~Streak counter per inserimenti consecutivi~~ ✅
- ~~aggiungere molti più achievements, analizzare bene il codice~~ ✅ (da 17 a 44 badge in 10 categorie)
- Classifica opzionale tra utenti anonimi della stessa fascia (per ora no)
- Badge "Supporter" per chi dona via BuyMeACoffee (vedi analisi sotto in "Le Mie Idee")

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

## � Le Mie Idee

> **Come usare questa sezione:** Scrivi qui le tue idee in formato libero. Quando le vedrò, le organizzerò nel todo, le valuterò e le implementerò.
> Formato suggerito: una riga per idea, anche solo un appunto veloce.

<!-- Scrivi le tue idee qui sotto, una per riga -->
- ~~C'è un modo per capire se un utente fa effettivamente una donazione alla piattaforma?~~ ✅ **Analizzato** — vedi sotto
- Potrei fare che gli achievements dei traguardi di net worth siano più variabilizzati sul bilancio dell'utente e gli scalini siano coerenti per far si che siano raggiungiblili e sproni veramente l'utente. (caso studio utente con 1000€, l'obbiettivo da 50k€ è forse troppo alto)
Se lo si variabilizza si potrebbero mettere dei lucchetti su quelli successivi come da sbloccare, che non possa vederle (da valutare)

### 📊 Analisi: Tracciamento Donazioni BuyMeACoffee → Achievement "Supporter"

**Risposta: Sì, è possibile!** BuyMeACoffee offre **Webhooks** che notificano il tuo server in tempo reale quando qualcuno fa una donazione.

**Come funzionerebbe:**

1. **Setup Webhook BMC** → Registra un endpoint del tuo server (es. `POST /api/webhooks/bmc`) nella dashboard BMC ([studio.buymeacoffee.com/webhooks](https://studio.buymeacoffee.com/webhooks))
2. **Ricezione evento** → Quando qualcuno dona, BMC invia un payload JSON con info del supporter (email, nome, messaggio)
3. **Matching utente** → Il server confronta l'email del donatore con gli utenti registrati su PaciFinance
4. **Flag nel database** → Se c'è match, imposta `hasDonated: true` sul documento utente (nessun dato di pagamento salvato!)
5. **Badge "Supporter"** → Il frontend legge il flag da `userData.hasDonated` e sblocca il badge

**Privacy e sicurezza:**
- ✅ Nessun dato di pagamento salvato (no importo, no carta, no transazione)
- ✅ Solo un flag booleano `hasDonated: true/false`
- ✅ L'email serve solo per matching, non viene salvata separatamente
- ✅ Token di verifica webhook per autenticità delle richieste
- ✅ Completamente anonimo: nessuno può sapere chi ha donato quanto

**Approccio alternativo (più semplice, senza webhook):**
- L'utente dona su BMC, poi clicca "Ho donato" in PaciFinance
- Il server verifica tramite l'API BMC (endpoint `/supporters`) se l'email corrisponde
- Se confermato, sblocca il badge

**Cosa otterrebbe il donatore (idee):**
- 🏅 Badge esclusivo "Supporter" / "Sostenitore" nel profilo
- ⭐ Bordo dorato sull'avatar
- 🎨 Colori avatar esclusivi (palette premium)
- 🔓 Funzionalità extra (es. più personalizzazione dashboard)

**Implementazione richiesta:**
- **Backend**: nuovo endpoint webhook + campo `hasDonated` nel DB + route API per verificare
- **Frontend**: badge "Supporter" in `useGamification.js` (già predisposto, basta aggiungere `check: (data) => data.hasDonated === true`)

**Stato: Pronto per implementazione backend** — il frontend è già preparato per supportare un badge `supporter` quando il server fornirà il flag `hasDonated`.

---

### 📲 Analisi: PWA Push Notifications per Promemoria Inserimento Dati Mensili

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
- Richiede **modifiche backend** (nuovo endpoint + cron + VAPID) — viola regola "DO NOT modify server/"
- iOS richiede PWA installata → la maggior parte degli utenti iOS non la installerà
- Bassa adoption rate: ~50% degli utenti rifiuta le notifiche push web
- Complessità: gestione subscription expiry, token refresh, error handling

**Alternativa più semplice: Email Reminder**
- L'utente ha già un account con email → cron job backend che invia email se non ha inserito dati
- Zero modifiche frontend, solo backend
- Compatibile al 100% con tutti i dispositivi
- Open rate email ~40% vs push notification ~20%

**Stima lavoro:**
- Push Notifications: ~2 giorni frontend + ~1 giorno backend
- Email Reminder: ~0.5 giorni backend, 0 frontend

**Raccomandazione:** Parcheggiare per ora. Il rapporto costo/beneficio è basso per la base utenti attuale. Quando ci saranno più utenti attivi, l'**email reminder** (backend) è 10x più efficace e 5x più semplice da implementare. Se si decide di procedere, partire con email, poi valutare push come enhancement.

---

## �📋 Note Tecniche

- **Breakpoint mobile**: `max-width: 839px` (MediaQueryContext `isMobileScreen`)
- **Breakpoint CSS**: la maggior parte degli styled-components usa `max-width: 768px`
- **BottomNavBar height**: 66px + safe-area-inset-bottom
- **Routing**: tutte le route hanno prefisso lingua (`/it/dashboard`, `/en/dashboard`)
- **Server folder**: NON modificare — gestito separatamente
---

### 💱 Analisi: Supporto Multi-Valuta

**Problema attuale:** Tutta la piattaforma è hardcoded su EUR/€. Simbolo `€` è scritto direttamente nei componenti (~30+ occorrenze), `Intl.NumberFormat` usa `currency: 'EUR'` e `locale: 'it-IT'` fissi.

**File con `€` hardcodato:**
- `IncomeSection.jsx` — simbolo nel form + importi tabella (4 occorrenze)
- `OutflowSection.jsx` — simbolo nel form + importi tabella (4 occorrenze)
- `BalanceSection.jsx` — simbolo nel form (1)
- `InsertModals.jsx` — riepilogo conferma (8)
- `GoalsAndLimits.jsx` — label e valori obiettivi (6)
- `FinancialInsights.jsx` — insight cards (3)
- `DataImportWizard.jsx` — preview import (3)
- `Dashboard.jsx` — `formatCurrency()` con `currency: 'EUR'` (15+ usi via funzione)
- `DashboardCompactView.jsx` — riceve `formatCurrency` come prop (7)
- `InsertValues.jsx` — messaggi limite superato (3)

**Approccio consigliato: EUR come valuta base nel DB, conversione a display-time**

```
User input (USD) → conversione → DB (EUR) → lettura → conversione → display (USD)
```

**Perché questo approccio:**
1. ✅ **Zero migrazione DB** — tutti i dati esistenti restano validi (sono già in EUR)
2. ✅ **Rankings e confronti anonimi funzionano** — tutti comparati in EUR
3. ✅ **Semplicità** — un solo punto di conversione in/out
4. ✅ **Coerenza** — il DB ha una sola unità di misura
5. ⚠️ **Trade-off** — i tassi di cambio fluttuano, i valori storici convertiti non saranno esatti al centesimo

**Architettura proposta:**

| Componente | Dove | Cosa fa |
|---|---|---|
| `CurrencyContext` | `src/contexts/` | Stato globale: valuta utente, simbolo, tasso, `formatCurrency()`, `toEUR()`, `fromEUR()` |
| `currencyConfig.js` | `src/data/` | Mappa valute supportate: `{ USD: { symbol: '$', locale: 'en-US', position: 'before' }, EUR: { symbol: '€', locale: 'it-IT', position: 'after' }, ... }` |
| `useFormatCurrency` | `src/hooks/` | Hook che espone `format(amount)` nella valuta utente |
| Exchange rate API | Backend o client | API gratuita (es. exchangerate-api.com, frankfurter.app) per tassi aggiornati |
| Preferenza utente | Profilo/Settings | Dropdown valuta in SettingsPage, salvato nel profilo utente |

**Piano di implementazione step-by-step:**

#### Step 1: Centralizzare la formattazione (ZERO breaking changes)
- [ ] Creare `src/data/currencyConfig.js` con mappa valute supportate
- [ ] Creare `src/contexts/CurrencyContext.jsx` con:
  - `currency` (codice ISO: 'EUR', 'USD', ...)
  - `formatAmount(value)` — formatta con simbolo e locale corretti
  - `currencySymbol` — il simbolo da mostrare nei form
- [ ] Creare hook `useFormatCurrency()` per accesso rapido
- [ ] Default a EUR — comportamento identico a oggi

#### Step 2: Sostituire tutti gli hardcoded €
- [ ] `Dashboard.jsx`: sostituire `formatCurrency()` locale con quella dal context
- [ ] `IncomeSection.jsx`: sostituire `€` con `currencySymbol` dal context
- [ ] `OutflowSection.jsx`: idem
- [ ] `BalanceSection.jsx`: idem
- [ ] `InsertModals.jsx`: idem
- [ ] `GoalsAndLimits.jsx`: idem
- [ ] `FinancialInsights.jsx`: idem
- [ ] `DataImportWizard.jsx`: idem
- [ ] `DashboardCompactView.jsx`: ricevere `formatAmount` dal context anziché prop
- [ ] `InsertValues.jsx`: messaggi limite con valuta dinamica
- [ ] Rimuovere tutti i `toLocaleString('it-IT', ...)` sparsi → usare `formatAmount()`

#### Step 3: Conversione in/out dal DB
- [ ] In `UserContext.jsx`: dopo aver ricevuto dati dal server, convertire `fromEUR(amount)` per il display
- [ ] Prima di inviare dati al server (`onAddIncome`, `onAddOutflow`, `onUpdateBalance`): convertire `toEUR(amount)`
- [ ] Aggiungere endpoint/API per tassi di cambio (o usare API gratuita client-side)
- [ ] Cache del tasso di cambio (aggiornamento 1x/giorno è sufficiente)

#### Step 4: UI per selezione valuta
- [ ] Aggiungere dropdown valuta in SettingsPage
- [ ] Salvare preferenza nel profilo utente (backend: campo `currency` nel documento utente)
- [ ] Traduzioni IT/EN per le label

#### Step 5: Raffinamenti
- [ ] Gestire il caso "valuta cambiata" → ricalcolo di tutti i valori a display
- [ ] Tooltip/nota che spiega "i valori sono convertiti dal tasso corrente"
- [ ] MockAuthContext: aggiungere campo `currency: 'EUR'` per sviluppo locale

**Valute prioritarie (fase 1):**
- 🇪🇺 EUR (€) — default, già supportato
- 🇺🇸 USD ($)
- 🇬🇧 GBP (£)
- 🇨🇭 CHF (CHF)

**Stima lavoro:**
- Step 1-2 (centralizzazione): ~1 giorno — nessun cambio funzionale, solo refactoring
- Step 3 (conversione): ~1 giorno frontend + backend (nuovo campo + API tassi)
- Step 4-5 (UI + polish): ~0.5 giorni
- **Totale: ~2.5 giorni**

**Rischi e mitigazioni:**
- ⚠️ **Tassi fluttuanti**: il patrimonio in USD potrebbe variare anche senza azioni dell'utente → mostrare nota "valori convertiti al tasso del giorno"
- ⚠️ **API rate limit**: le API gratuite hanno limiti (es. 1500 req/mese) → cache aggressiva (1 fetch/giorno, salva in localStorage + backend)
- ⚠️ **Dati storici**: non è possibile sapere il tasso esatto del giorno in cui l'utente ha inserito il dato → accettabile per uso personale, non per contabilità certificata

---

### 🗺️ Analisi: Pagina Roadmap Pubblica

**Obiettivo:** Mostrare agli utenti lo stato del progetto in modo trasparente — cosa è stato fatto, cosa è in corso, cosa è pianificato. Permettere alla community di vedere dove va il progetto e sentirsi parte di esso.

**Formato proposto: Timeline/Kanban ibrido**

```
┌─────────────┬──────────────────┬────────────────────┐
│ ✅ Completato│  🔨 In Corso     │  📋 Pianificato    │
├─────────────┼──────────────────┼────────────────────┤
│ Dashboard   │ Multi-valuta     │ Push notifications │
│ Gamification│ Tabelle migliora │ Open Banking API   │
│ CSV Import  │                  │ AI predictions     │
│ i18n routing│                  │ Budget planner     │
└─────────────┴──────────────────┴────────────────────┘
```

**Struttura dati roadmap:**
```javascript
const roadmapItems = [
  {
    id: 'multi-currency',
    title: { it: 'Supporto Multi-Valuta', en: 'Multi-Currency Support' },
    description: { it: '...', en: '...' },
    status: 'in-progress', // 'completed' | 'in-progress' | 'planned' | 'idea'
    category: 'feature', // 'feature' | 'ux' | 'performance' | 'security'
    completedDate: null, // ISO date se completato
    votes: 0, // per futuro sistema di voto
  }
];
```

**Implementazione:**

| Componente | Dove | Descrizione |
|---|---|---|
| `RoadmapPage.jsx` | `src/pages/` | Pagina dedicata con route `/roadmap` |
| `roadmapData.js` | `src/data/` | Array di items con titoli, descrizioni, stato |
| `RoadmapCard.jsx` | `src/components/` | Card singola con badge stato, categoria, icona |
| Route | `AppRouter.jsx` | Aggiungere `/roadmap` (accessibile anche senza login) |
| Link | Landing page + Sidebar | Aggiungere link "Roadmap" visibile a tutti |

**Funzionalità:**
- [ ] Vista a 3 colonne (desktop) / lista con filtri (mobile)
- [ ] Filtro per categoria (Funzionalità, UX, Performance, Sicurezza)
- [ ] Filtro per stato (Completato, In Corso, Pianificato, Idea)
- [ ] Badge colorati per stato
- [ ] Accessibile senza login (pagina pubblica per attirare utenti)
- [ ] Opzionale: sistema di voto (futuro, richiede backend)
- [ ] Traduzioni IT/EN complete

**Stima:** ~1 giorno (frontend only, dati statici in `roadmapData.js`)

---

### 📝 Analisi: Sistema Feedback & Bug Report

**Obiettivo:** Permettere agli utenti di segnalare bug, proporre idee e suggerire miglioramenti direttamente dall'app. Essenziale per un progetto community-centrico basato sulle donazioni.

**Approccio consigliato: Form in-app + GitHub Issues (fase 1)**

Il modo più rapido e trasparente: un form nell'app che crea direttamente una Issue su GitHub. La community può poi commentare e votare su GitHub.

**Flusso utente:**
```
Utente → clicca "Feedback" → sceglie tipo (🐛 Bug / 💡 Idea / 💬 Altro)
→ compila form (titolo + descrizione) → invio
→ Backend crea GitHub Issue con label appropriata
→ Utente vede conferma + link alla Issue
```

**Implementazione:**

| Componente | Dove | Descrizione |
|---|---|---|
| `FeedbackPage.jsx` | `src/pages/` | Pagina con form feedback |
| `FeedbackForm.jsx` | `src/components/` | Form: tipo (select), titolo (input), descrizione (textarea), screenshot opzionale |
| Route | `AppRouter.jsx` | `/feedback` (richiede login per evitare spam) |
| Backend endpoint | `server/` | `POST /api/feedback` → crea GitHub Issue via GitHub API |
| Link | Sidebar + BottomNavBar "Altro" | Aggiungere "Feedback" nel menu |

**Categorie feedback:**
- 🐛 **Bug** → label `bug` su GitHub
- 💡 **Idea/Feature Request** → label `enhancement`
- 💬 **Feedback generico** → label `feedback`
- ❓ **Domanda** → label `question`

**Campi del form:**
- **Tipo** (select, obbligatorio): Bug / Idea / Feedback / Domanda
- **Titolo** (input, obbligatorio, max 100 chars)
- **Descrizione** (textarea, obbligatorio, max 1000 chars)
- **Pagina correlata** (select, opzionale): Dashboard / Inserimento / Grafici / ...
- **Priorità percepita** (opzionale): Bassa / Media / Alta
- **Screenshot** (opzionale, upload immagine)

**Privacy:**
- ✅ Il feedback è anonimo su GitHub (il backend lo posta come bot, non espone l'utente)
- ✅ Nessun dato personale incluso nella Issue
- ✅ L'utente può opzionalmente aggiungere il suo username per follow-up

**Alternativa senza backend (fase 0 — rapida):**
- Bottone "Feedback" che apre direttamente `https://github.com/Pacifinance/Pacifinance/issues/new/choose`
- Template di Issue precompilati su GitHub (bug report, feature request)
- Zero sviluppo, attivabile subito
- Svantaggio: l'utente deve avere un account GitHub

**Piano fasi:**
1. **Fase 0 (subito):** Link a GitHub Issues con template precompilati
2. **Fase 1 (~1 giorno):** Form in-app → backend crea Issue su GitHub
3. **Fase 2 (futuro):** Bacheca in-app con lista feedback + upvote + stato

**Stima:** Fase 0: ~15 min | Fase 1: ~1 giorno (frontend + backend) | Fase 2: ~2 giorni