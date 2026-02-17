# PaciFinance - TODO

> Ultimo aggiornamento: 17/02/2026
> Per analisi, idee e feature planning vedi [docs/ANALYSES.md](docs/ANALYSES.md)
> Roadmap status rapido: [x] completato · [~] in sviluppo · [ ] pianificato (con marker <!-- roadmap:id -->)

---

## Completati

- [x] BottomNavBar mobile (React Portal, menu popup, indicatore attivo) <!-- roadmap:mobile-nav -->
- [x] Sidebar desktop: fix Link -> LocalizedLink per routing i18n
- [x] useLocalizedNavigate usato ovunque <!-- roadmap:i18n -->
- [x] useScrollNavigation fix con removeLanguageFromPath()
- [x] DashboardPage: navigate() localizzato al posto di window.location.href
- [x] Traduzioni sidebar: dashboard, more, goalsLimits
- [x] Axios interceptor 401 (logout automatico su sessione scaduta)
- [x] ProtectedRoute redirect a / (landing)
- [x] UI/UX mobile dashboard (card 2 per riga, metric cards colonna, grafici ridotti, spacing)
- [x] Animazioni floating disattivate su mobile
- [x] SettingsPage: fix typo, fix toggleLanguage, fix useNavigate, riordino sezioni
- [x] Lazy loading: FinancialInsights, GoalTracker, GamificationSection
- [x] Memoizzazione pie chart con useMemo
- [x] Skeleton loading con shimmer animation
- [x] Test: BottomNavBar (10), useScrollNavigation (10), SettingsPage ordine (2)
- [x] Gamification: 44 badge in 10 categorie, GamificationSection, traduzioni IT/EN <!-- roadmap:gamification -->
- [x] Dashboard personalizzabile: drag-and-drop, compact view, toolbar <!-- roadmap:dashboard-custom -->
- [x] BuyMeACoffee widget: CSS per posizionamento su mobile
- [x] ScrollNavigationIndicator: bottom 74px su mobile
- [x] Avatar generato client-side (1400+ combinazioni, rigenerabile)
- [x] Multi-valuta: CurrencyContext, 19 valute, frankfurter.app API, cache 24h, fallback rates <!-- roadmap:multi-currency -->
- [x] Multi-valuta: sostituzione hardcoded euro, provider tree, test (17+12), traduzioni
- [x] Multi-valuta: preferredCurrency da DB (index -> codice via currency tags)
- [x] Multi-valuta: Settings currency session-only (non persistita), ProfilePage currency persistita nel DB
- [x] Roadmap: pagina pubblica kanban, automazione da todo.md, filtri, traduzioni <!-- roadmap:roadmap-feedback -->
- [x] Feedback: link GitHub Issues in SettingsPage + Info page
- [x] Confronto anonimo utenti simili (rankings patrimonio/entrate/uscite) <!-- roadmap:anonymous-comparison -->
- [x] SettingsPage redesign: layout compatto, Account Preferences, fix dropdown valuta
- [x] Import CSV/Excel: wizard multi-step, colonna duale, fuzzy matching categorie <!-- roadmap:csv-import -->
- [x] Import: fix dropdown bianchi, fix importi negativi, parseExcel padding
- [x] Import: modal overlay, URL diretto (?section=import), landing page card, SEO
- [x] Fix: dashboard caricamento bloccato (error recovery + retry + timeout)
- [x] Fix: toast achievements sopra BottomNavBar su mobile
- [x] Fix: achievements buggati (verifica dati reali, non solo struttura)
- [x] Fix: cambio lingua da impostazioni (doppio prefisso lingua)
- [x] Modifica note dall'excel prima dell'inserimento transazioni
- [x] Fix: pagina bianca dopo registrazione (reset stati autenticazione al logout) <!-- roadmap:stability -->
- [x] Fix: meccanismo retry dopo errore API (retryCounter per forzare re-fetch)
- [x] Schermata di caricamento ridisegnata con branding e contrasto migliorato
- [x] Ottimizzazione performance immagine landing page (LCP preload, fetchpriority)
- [x] Fix: overflow orizzontale su mobile nelle pagine di inserimento
- [x] Prevenzione zoom/pinch accidentale su mobile (viewport + CSS touch-action) <!-- roadmap:mobile-ux -->
- [x] Test stati critici app: 79 nuovi test per autenticazione, caricamento dati, recupero errori
- [x] Architettura Dependency Injection con ServiceContext (refactoring interno)
- [x] Test: axios interceptor 401, auth flow completo, retry errori
- [x] Ranking: backend ora manda la %, adattare il frontend per usarla direttamente
- [x] Dark/Light mode: transizione animata al cambio tema (già implementata)
- [x] Haptic feedback sui tap della nav bar (navigator.vibrate)
- [x] Notifiche/changelog in-app per aggiornamenti e nuove feature (WhatsNewBanner)
- [x] Test per removeLanguageFromPath edge cases (8 test)
- [x] Test per DataImportWizard processRowDual (15 test)
- [x] Undo/rollback ultima importazione (saveLastImport + UI undo)
- [x] Drag and drop file upload (già implementato nel wizard)
- [x] Modifica inline entrate e uscite: edit direttamente nella tabella con delete+reinsert <!-- roadmap:inline-edit -->

---

## Da Fare

### Bug Noti
- [ ] BuyMeACoffee widget: verificare posizionamento su tutti i dispositivi (CSS !important workaround)
- [ ] Grafici renderCustomizedLabel: verificare sovrapposizione con raggio ridotto su mobile
- [ ] Floating point e centesimi: il DB mandera valori interi (* 100), gestire la conversione

### Sicurezza
- [ ] gestione email per utenze criptate, solo per recupero password e verifiche di sicurezza, no email marketing <!-- roadmap:user-email-crypted> 


### Mobile
- [ ] Testare BottomNavBar su dispositivi con notch/Dynamic Island (safe-area-inset)
- [ ] Scroll navigation: valutare se disabilitare su mobile (interferenza con scroll naturale)
- [ ] Card fondo emergenza sola: ridimensionare come half-width
- [ ] Chart legend su mobile: verificare su schermi ~320px

### Desktop
- [ ] Sidebar: tooltip Goals and Limits
- [ ] Sidebar: verificare highlight link attivi con nuovo routing

### Funzionalita
- [ ] Notifiche push (PWA) per promemoria inserimento dati mensili <!-- roadmap:push-notifications -->
- [ ] Widget riepilogo rapido home: patrimonio + variazione mese precedente
- [ ] Grafici trend storico patrimonio (linea temporale) <!-- roadmap:trend-charts -->
- [ ] Export PDF: migliorare layout con grafici inclusi <!-- roadmap:pdf-reports -->
- [~] Obiettivi e limiti (Goals & Limits con monitoraggio dedicato) (solo frontend fatto manca backend) <!-- roadmap:goals-limits -->
- [~] Onboarding guidato per nuovi utenti: wizard 4 step con progress bar <!-- roadmap:onboarding -->

### Community e Feedback
- [~] Sistema feedback utenti (Fase 1): form in-app -> GitHub Issue via backend <!-- roadmap:feedback-system -->
- [~] Sezione Contribuisci: come donare, segnalare bug, proporre idee <!-- roadmap:contribute-section -->
- [~] Sistema di voto priorita roadmap (richiede backend) <!-- roadmap:roadmap-voting -->

### Performance
- [ ] Verificare bundle size dopo aggiunta BottomNavBar + MUI icons

### Import Dati (Evoluzione)
- [ ] Supporto aggiornamento bilancio tramite import
- [ ] Preview grafico transazioni importate (istogramma per mese/categoria)
- [ ] Template di mappatura per banca (UniCredit, Revolut, N26...) con condivisione community <!-- roadmap:bank-templates -->
- [~] Auto-detect formati bancari noti (Fineco, Intesa, Revolut, N26) <!-- roadmap:auto-detect-bank-format -->
- [~] Supporto file OFX/QIF <!-- roadmap:OFX/QIF-support -->
- [ ] Import ricorrente: ricordare ultimo file e suggerire aggiornamento
