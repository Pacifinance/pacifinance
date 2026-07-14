# Changelog - Pacifinance

Tutte le modifiche rilevanti al progetto sono documentate in questo file.
Il formato segue [Keep a Changelog](https://keepachangelog.com/it/1.1.0/) e il progetto aderisce a [Semantic Versioning](https://semver.org/).

---

## [0.9.9] - 2026-04-17

### Aggiunto
- **Inserimento multiplo**: inserisci più uscite, entrate o voci di bilancio in un'unica operazione (MultiOutflowInsert, MultiIncomeInsert, MultiBalanceInsert)
- **Analisi dettagliata uscite**: analisi approfondita per categoria, metodi di pagamento e pattern ricorrenti con confronti mensili e media 12 mesi
- **Prezzi crypto in tempo reale**: pagina Market Prices con dati CoinGecko e sparkline a 7 giorni
- **Guida installazione PWA**: istruzioni auto-detect dispositivo (iOS, Android, Desktop) in Impostazioni e Info
- **Modifica inline transazioni**: modifica entrate e uscite direttamente nella tabella con delete+reinsert
- **Scelta impatto bilancio per date passate**: quando inserisci spese o entrate con data di un mese passato, una modale ti chiede se vuoi aggiornare anche lo snapshot del bilancio di quel mese. La preferenza è salvabile (Chiedi ogni volta / Nessun impatto / Aggiorna bilancio del mese) e modificabile dalle Impostazioni. Hook `usePastDateBalancePref`, selettore `getBalanceForMonth`, componente `PastDateBalanceChoiceModal`.
- Mock data CoinGecko per pagina Market Prices in modalità dev
- Mock data allineati con file i18n per consistenza demo/dev/prod
- Changelog file per tracciare la storia del progetto

### Corretto
- Categorie in inglese hardcoded nell'analisi dettagliata uscite: ora traducibili in tutte le lingue
- Colori e icone delle categorie non allineati al file centralizzato nelle sezioni ricorrenti
- i18n colori categorie: fallback robusto con reverse-lookup per tag tradotti
- App più stabile: risolti problemi di caricamento post-registrazione e migliorato recupero errori di rete
- Esperienza mobile migliorata: eliminato zoom accidentale, layout ottimizzato

### Modificato
- Aggiornata roadmap con feature recenti (multi-insert, analisi dettagliata uscite, i18n colors)
- Aggiornate istruzioni Copilot: obbligo di aggiornare roadmap ad ogni feature user-facing

---

## [0.9.8] - 2026-02

### Aggiunto
- **App più stabile e affidabile**: fix caricamento post-registrazione, recupero automatico errori di rete
- **Esperienza mobile migliorata**: eliminato zoom/pinch accidentale, layout ottimizzato, caricamento più veloce
- **Modifica inline transazioni**: edit direttamente nella tabella senza uscire dalla vista elenco
- **Guida installazione PWA**: istruzioni passo-passo con rilevamento automatico dispositivo
- **Prezzi crypto in tempo reale**: monitoraggio prezzi con sparkline a 7 giorni
- Test stati critici app: 79 nuovi test per autenticazione, caricamento dati, recupero errori
- Test: axios interceptor 401, auth flow completo, retry errori

---

## [0.9.7] - 2025-02

### Aggiunto
- **Import CSV/Excel**: wizard multi-step con mappatura automatica colonne e riconoscimento categorie fuzzy
- **Supporto multi-valuta**: 19 valute con conversione automatica (frankfurter.app API, cache 24h, fallback rates)
- **Roadmap pubblica**: pagina kanban auto-generata da todo.md con filtri e traduzioni
- **Feedback**: link a GitHub Issues in Impostazioni e pagina Info
- Undo/rollback ultima importazione (saveLastImport + UI undo)
- Drag and drop file upload nel wizard di importazione
- Modifica note dall'excel prima dell'inserimento transazioni
- Import: fix dropdown bianchi, fix importi negativi, parseExcel padding
- Import: modal overlay, URL diretto (?section=import), landing page card, SEO
- Multi-valuta: Settings currency session-only (non persistita), ProfilePage currency persistita nel DB
- Multi-valuta: preferredCurrency da DB (index → codice via currency tags)
- Ranking: backend ora manda la %, frontend adattato per usarla direttamente

### Corretto
- Fix: pagina bianca dopo registrazione (reset stati autenticazione al logout)
- Fix: meccanismo retry dopo errore API (retryCounter per forzare re-fetch)
- Fix: cambio lingua da impostazioni (doppio prefisso lingua)
- Fix: dashboard caricamento bloccato (error recovery + retry + timeout)
- Fix: toast achievements sopra BottomNavBar su mobile
- Fix: achievements buggati (verifica dati reali, non solo struttura)

---

## [0.9.6] - 2025-01

### Aggiunto
- **Dashboard personalizzabile**: drag-and-drop sezioni, compact view, toolbar
- **Gamification**: 44 badge in 10 categorie con GamificationSection e traduzioni IT/EN
- **Navigazione mobile nativa**: BottomNavBar con React Portal, menu popup, indicatore attivo
- **Obiettivi e Limiti di Spesa**: frontend monitoraggio dedicato (backend in sviluppo)
- **Confronto anonimo**: rankings patrimonio/entrate/uscite con utenti simili
- Avatar generato client-side (1400+ combinazioni, rigenerabile)
- Notifiche/changelog in-app (WhatsNewBanner) per aggiornamenti e nuove feature
- Dark/Light mode: transizione animata al cambio tema
- Haptic feedback sui tap della nav bar (navigator.vibrate)
- Skeleton loading con shimmer animation
- Lazy loading: FinancialInsights, GoalTracker, GamificationSection
- Memoizzazione pie chart con useMemo
- Architettura Dependency Injection con ServiceContext (refactoring interno)
- SettingsPage redesign: layout compatto, Account Preferences, fix dropdown valuta
- BuyMeACoffee widget: CSS per posizionamento su mobile
- ScrollNavigationIndicator: bottom 74px su mobile

### Corretto
- Fix overflow orizzontale su mobile nelle pagine di inserimento
- Prevenzione zoom/pinch accidentale su mobile (viewport + CSS touch-action)

---

## [0.9.5] - 2024-12

### Aggiunto
- **Supporto multilingua**: interfaccia in italiano e inglese con rilevamento automatico lingua
- **URL-based language routing**: tutte le route con prefisso lingua (/it/, /en/)
- useLocalizedNavigate e LocalizedLink usati ovunque
- Sidebar desktop: fix Link → LocalizedLink per routing i18n
- DashboardPage: navigate() localizzato al posto di window.location.href
- Traduzioni sidebar: dashboard, more, goalsLimits

---

## [0.9.4] - 2024-11

### Aggiunto
- **Esportazione dati**: export in formato CSV, Excel, JSON e PDF

---

## [0.9.3] - 2024-10

### Aggiunto
- **Confronto anonimo**: confronta patrimonio, entrate e uscite con utenti simili in modo completamente anonimo
- Axios interceptor 401 (logout automatico su sessione scaduta)
- ProtectedRoute redirect a / (landing)
- UI/UX mobile dashboard (card 2 per riga, metric cards colonna, grafici ridotti, spacing)
- Animazioni floating disattivate su mobile
- SettingsPage: fix typo, fix toggleLanguage, fix useNavigate, riordino sezioni

---

## [0.9.0] - 2024 (Early)

### Aggiunto
- Lancio iniziale Pacifinance
- Registrazione anonima (solo password, userId auto-generato)
- Tracking patrimonio multi-piattaforma (bank, stocks, ETF, crypto, cash, etc.)
- Categorizzazione entrate e uscite
- Dashboard con grafici interattivi (Recharts)
- PWA-ready con service worker
- Cloudflare Turnstile per protezione bot
- Styled-components con supporto dark/light theme
- Schermata di caricamento con branding
- Ottimizzazione performance immagine landing page (LCP preload, fetchpriority)
- Test: BottomNavBar (10), useScrollNavigation (10), SettingsPage ordine (2)
- Test per removeLanguageFromPath edge cases (8 test)
- Test per DataImportWizard processRowDual (15 test)
