# PaciFinance - TODO

> Ultimo aggiornamento: 15/02/2026
> Per analisi, idee e feature planning vedi [docs/ANALYSES.md](docs/ANALYSES.md)

---

## Completati

- [x] BottomNavBar mobile (React Portal, menu popup, indicatore attivo)
- [x] Sidebar desktop: fix Link -> LocalizedLink per routing i18n
- [x] useLocalizedNavigate usato ovunque
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
- [x] Gamification: 44 badge in 10 categorie, GamificationSection, traduzioni IT/EN
- [x] Dashboard personalizzabile: drag-and-drop, compact view, toolbar
- [x] BuyMeACoffee widget: CSS per posizionamento su mobile
- [x] ScrollNavigationIndicator: bottom 74px su mobile
- [x] Avatar generato client-side (1400+ combinazioni, rigenerabile)
- [x] Multi-valuta: CurrencyContext, 19 valute, frankfurter.app API, cache 24h, fallback rates
- [x] Multi-valuta: sostituzione hardcoded euro, provider tree, test (17+12), traduzioni
- [x] Multi-valuta: preferredCurrency da DB (index -> codice via currency tags)
- [x] Multi-valuta: Settings currency session-only (non persistita), ProfilePage currency persistita nel DB
- [x] Roadmap: pagina pubblica kanban, automazione da todo.md, filtri, traduzioni
- [x] Feedback: link GitHub Issues in SettingsPage + Info page
- [x] SettingsPage redesign: layout compatto, Account Preferences, fix dropdown valuta
- [x] Import CSV/Excel: wizard multi-step, colonna duale, fuzzy matching categorie
- [x] Import: fix dropdown bianchi, fix importi negativi, parseExcel padding
- [x] Import: modal overlay, URL diretto (?section=import), landing page card, SEO
- [x] Fix: dashboard caricamento bloccato (error recovery + retry + timeout)
- [x] Fix: toast achievements sopra BottomNavBar su mobile
- [x] Fix: achievements buggati (verifica dati reali, non solo struttura)
- [x] Fix: cambio lingua da impostazioni (doppio prefisso lingua)
- [x] Modifica note dall'excel prima dell'inserimento transazioni

---

## Da Fare

### Bug Noti
- [ ] BuyMeACoffee widget: verificare posizionamento su tutti i dispositivi (CSS !important workaround)
- [ ] Grafici renderCustomizedLabel: verificare sovrapposizione con raggio ridotto su mobile
- [ ] Floating point e centesimi: il DB mandera valori interi (* 100), gestire la conversione
- [ ] Ranking: backend ora manda la %, adattare il frontend per usarla direttamente

### Mobile
- [ ] Testare BottomNavBar su dispositivi con notch/Dynamic Island (safe-area-inset)
- [ ] Scroll navigation: valutare se disabilitare su mobile (interferenza con scroll naturale)
- [ ] Card fondo emergenza sola: ridimensionare come half-width
- [ ] Haptic feedback sui tap della nav bar (se supportato)
- [ ] Chart legend su mobile: verificare su schermi ~320px

### Desktop
- [ ] Sidebar: tooltip Goals and Limits
- [ ] Sidebar: verificare highlight link attivi con nuovo routing

### Funzionalita
- [ ] Dark/Light mode: transizione animata al cambio tema
- [ ] Notifiche push (PWA) per promemoria inserimento dati mensili
- [ ] Widget riepilogo rapido home: patrimonio + variazione mese precedente
- [ ] Grafici trend storico patrimonio (linea temporale)
- [ ] Export PDF: migliorare layout con grafici inclusi

### Community e Feedback
- [ ] Sistema feedback utenti (Fase 1): form in-app -> GitHub Issue via backend
- [ ] Notifiche/changelog in-app per aggiornamenti e nuove feature
- [ ] Sezione Contribuisci: come donare, segnalare bug, proporre idee
- [ ] Sistema di voto priorita roadmap (richiede backend)

### Performance
- [ ] Verificare bundle size dopo aggiunta BottomNavBar + MUI icons

### Test
- [ ] Test per axios interceptor 401
- [ ] Test per removeLanguageFromPath edge cases
- [ ] Test per DataImportWizard: parseAmount, processRows, processRowDual, autoDetectColumns

### Import Dati (Evoluzione)
- [ ] Supporto aggiornamento bilancio tramite import
- [ ] Preview grafico transazioni importate (istogramma per mese/categoria)
- [ ] Template di mappatura per banca (UniCredit, Revolut, N26...) con condivisione community
- [ ] Auto-detect formati bancari noti (Fineco, Intesa, Revolut, N26)
- [ ] Undo/rollback ultima importazione
- [ ] Drag and drop file upload
- [ ] Supporto file OFX/QIF
- [ ] Import ricorrente: ricordare ultimo file e suggerire aggiornamento
