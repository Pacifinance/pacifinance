# PaciFinance - TODO & Roadmap

> Ultimo aggiornamento: 10/02/2026

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
- [x] ScrollNavigationIndicator: `bottom: 68px` su mobile per stare sopra la nav bar
- [x] `index.css`: padding-bottom mobile per safe-area + BottomNavBar

### Account

- [x] **Avatar generato client-side**: cerchio colorato con occhi e bocca casuali (7 stili occhi × 10 stili bocca × 20 colori = 1400+ combinazioni)
  - `src/utils/avatarGenerator.js`: generatore canvas con palette colori PaciFinance
  - `src/components/AvatarIcon.jsx`: componente React con rigenerazione (doppio click/tasto destro)
  - Integrato in `Sidebar.jsx` (desktop) e `SidebarMobile.jsx` (mobile)
  - Salvato in localStorage (`pacifinance-avatar`), rigenerabile 1x al giorno
  - Toast notification su rigenerazione

---

## 🔧 Da Fare

### Bug Noti
- [ ] BuyMeACoffee widget: lo script inline imposta stili una sola volta al mount, il CSS `!important` è un workaround — verificare se il widget si posiziona correttamente su tutti i dispositivi
- [ ] Verificare che i grafici con label `renderCustomizedLabel` non si sovrappongano con raggio ridotto su mobile
- [x] ~~A volte all'avvio della dashboard, rimane nella pagina bianca del caricamento e non carica la dashboard~~ → Fix: aggiunto error recovery in `UserContext` (retry su errore API), `setIsLoading(false)` nel catch di `Dashboard.jsx`, e spinner + timeout + pulsante "Riprova" in `DashboardPage.jsx`
- [ ] da mobile la notifica dell' achievements raggiunto finisce sotto i pulsanti della sidebar in basso, spostare la notifica più in alto e renderla più compatta da mobile
- [ ] gli achievements sono buggati, vengono dati cmoe fatti anche per utenti che per esempio non hanno inserito dati negli ultimi mesi. Correggere e guardare nel dettaglio dai dati in userContext (non basta che ci siano, devono esserci i dati)
- [ ] Dalle impostazioni non si può cambiare lingua, farlo funzionare

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
- [ ] Notifiche push (PWA) per promemoria inserimento dati mensili
- [ ] Widget "riepilogo rapido" nella home con patrimonio + variazione mese precedente
- [ ] Import dati da CSV/Excel (inverso dell'export)
- [ ] Grafici trend storico patrimonio (linea temporale)
- [ ] Export PDF: migliorare layout con grafici inclusi nel report

### Performance
- [ ] Verificare bundle size dopo aggiunta BottomNavBar + MUI icons

### Test
- [ ] Test per axios interceptor 401
- [ ] Test per `removeLanguageFromPath` edge cases
- [ ] Eseguire test suite completa (`npm test`) — terminale bloccato al momento

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
- Multi-valuta con conversione automatica in tempo reale
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
- Potrei fare che gli achievements dei traguardi di net worth siano più variabilizzati sul bilancio dell'utente e gli scalini siano coerenti per far si che siano raggiungiblili e sproni veramente l'utente. (caso studio utente con 1000€, l'obbiettivo da 50k€ è too much)
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

## �📋 Note Tecniche

- **Breakpoint mobile**: `max-width: 839px` (MediaQueryContext `isMobileScreen`)
- **Breakpoint CSS**: la maggior parte degli styled-components usa `max-width: 768px`
- **BottomNavBar height**: 60px + safe-area-inset-bottom
- **Routing**: tutte le route hanno prefisso lingua (`/it/dashboard`, `/en/dashboard`)
- **Server folder**: NON modificare — gestito separatamente
