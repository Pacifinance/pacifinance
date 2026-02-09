# PaciFinance - TODO & Roadmap

> Ultimo aggiornamento: 09/02/2026

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
- [x] Hook `useGamification`: calcolo client-side di 17 badge in 5 categorie (consistenza dati, risparmio, patrimonio, diversificazione, fondo emergenza + crescita)
- [x] Componente `GamificationSection`: griglia badge, barra livello, tab sbloccati/bloccati, stats
- [x] Traduzioni IT/EN per tutti i badge, titoli e label

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

---

## 🔧 Da Fare

### Bug Noti
- [ ] BuyMeACoffee widget: lo script inline imposta stili una sola volta al mount, il CSS `!important` è un workaround — verificare se il widget si posiziona correttamente su tutti i dispositivi
- [ ] Verificare che i grafici con label `renderCustomizedLabel` non si sovrappongano con raggio ridotto su mobile

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
- Classifica opzionale tra utenti anonimi della stessa fascia

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

## 📋 Note Tecniche

- **Breakpoint mobile**: `max-width: 839px` (MediaQueryContext `isMobileScreen`)
- **Breakpoint CSS**: la maggior parte degli styled-components usa `max-width: 768px`
- **BottomNavBar height**: 60px + safe-area-inset-bottom
- **Routing**: tutte le route hanno prefisso lingua (`/it/dashboard`, `/en/dashboard`)
- **Server folder**: NON modificare — gestito separatamente
