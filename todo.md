# Pacifinance - TODO

> Ultimo aggiornamento: 17/04/2026
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
- [x] Guida installazione PWA: istruzioni auto-detect dispositivo (iOS/Android/Desktop) in Impostazioni e Info <!-- roadmap:pwa-install-guide -->
- [x] Fix: i18n colori categorie: fallback robusto con reverse-lookup per tag tradotti <!-- roadmap:i18n-category-colors -->
- [x] Mock data allineati con file i18n per consistenza demo/dev/prod 
- [x] Mock data CoinGecko per pagina Market Prices in dev mode
- [x] Pagina prezzi di mercato crypto con dati e sparkline 7 giorni <!-- roadmap:market-prices -->
- [x] Inserimento multiplo: uscite, entrate e bilanci in un'unica operazione (MultiOutflowInsert, MultiIncomeInsert, MultiBalanceInsert) <!-- roadmap:multi-insert -->
- [x] Analisi dettagliata uscite: categorie, metodi di pagamento, pattern ricorrenti con confronti mensili <!-- roadmap:detailed-outflow-analysis -->
- [x] Fix: categorie uscite tradotte in tutte le lingue (i18n category names in DetailedOutflowsAnalysis) <!-- roadmap:i18n-category-colors -->
- [x] Scelta utente su impatto bilancio per inserimenti datati in mesi passati (past date balance choice) con modale, preferenza persistente e toggle in Impostazioni <!-- roadmap:past-date-balance-choice -->
- [x] Rilevamento duplicati anche sull'inserimento manuale di uscite/entrate (stessa euristica dell'import CSV), con modale di conferma <!-- roadmap:manual-duplicate-check -->
- [x] Spese condivise: "ho pagato per il gruppo" su una uscita registra solo la propria quota come spesa reale e traccia il resto come credito verso terzi, recuperabile senza generare un'entrata fittizia <!-- roadmap:shared-expenses -->
- [x] Prezzi di mercato live per azioni/ETF via Finnhub: pulsante "Aggiorna prezzi" nel pannello holding, converte la quotazione nella valuta di scambio in EUR e aggiorna il valore corrente <!-- roadmap:live-stock-prices -->
---

## Piano strategico (luglio 2026)

> Direzione decisa: progetto open source privacy-first per la nicchia europea/italiana,
> con opzione hosted. Non startup che compete su open banking. Il confronto anonimo
> tra utenti simili è il differenziante di lungo termine (nessun self-hosted può copiarlo).
> Metrica guida: utenti che inseriscono dati per 3+ mesi consecutivi (retention), non iscritti.

### Fase 1 — Frizione di inserimento (priorità massima)
- [x] Quick-add veloce da dashboard/PWA: floating action button + popup, inserire un'uscita in <10 secondi (importo + categoria, il resto opzionale) <!-- roadmap:quick-add -->
- [x] Spese ricorrenti/abbonamenti: ricorrenza automatica mensile end-to-end (DB + backend + UI gestione) <!-- roadmap:recurring-transactions -->
- [x] Incolla-e-riconosci: parsing client-side (smartPasteParser.ts) di testo libero in importo+categoria, dentro il quick-add — 100% client-side, zero server
- [x] Input vocale = dettatura OS nel campo incolla-e-riconosci (il microfono di tastiera del telefono trascrive, il nostro parser riconosce; l'audio non passa MAI dai nostri server)
- [ ] Collegare automaticamente le uscite ricorrenti create dal payment type "abbonamento/pagamento periodico" (prompt "rendi ricorrente" al salvataggio) — non fatto in questo round, per ora si creano solo dal pannello dedicato
- [ ] Template di mappatura per banca nell'import (Fineco, Intesa, Revolut, N26) — sostituto privacy-friendly dell'open banking
- [ ] Foto scontrino: OCR client-side con tesseract.js (WASM nel browser) → precompila quick-add; l'immagine non lascia mai il dispositivo. NON fatto in questo round: richiede una nuova dipendenza pesante (tesseract.js, alcuni MB di WASM+traineddata) — merita un round dedicato per valutare l'impatto sul bundle, non un'aggiunta improvvisata
- [ ] NO bot Telegram/WhatsApp per inserimento (i dati finanziari passerebbero da server terzi — contro il posizionamento privacy; riaprire solo come bridge opzionale esplicito in futuro)

### Fase 2 — Coerenza dati (richieste luglio 2026)
- [ ] Uscite/entrate: selezione della fonte a livello di sotto-conto, con dropdown annidato (sotto-conti indentati sotto il conto madre, non voci piatte "Banca / Revolut")
- [ ] Collegamento transazione→fonte persistito a DB: eliminando un'uscita (o entrata) con fonte specificata, proporre in automatico il ri-accredito/storno su quel campo esatto, con conferma utente
- [ ] Vista compatta dashboard: % di ogni sotto-conto rispetto al conto madre
- [ ] Vista compatta: espandere "Riepilogo per Categoria" e "Entrate|Uscite" con più dettagli (%, variazione vs mese precedente, saving rate — una fotografia rapida della situazione finanziaria)
- [ ] Market Prices: fix valori a 0 (media 7g, in rialzo/ribasso), disclaimer "mostriamo i primi N per capitalizzazione", aumentare N oltre 10, ricerca on-demand di coin non in cache (fetch singolo via CoinGecko /search + /coins/{id}) — fix minimo, non investire oltre

### Fase 3 — Apertura (open source)
- [ ] Audit segreti/credenziali nella history git prima di aprire il repo
- [x] Scegliere licenza: AGPLv3 — obbliga i fork hostati a ripubblicare le modifiche
- [x] Trasferire il repo serverless nell'organizzazione GitHub Pacifinance (transfer, non copia: GitHub crea i redirect automatici); archiviare il repo legacy con README che punta al nuovo
- [x] Deploy Vercel da repo in org SENZA Vercel Pro: workflow `.github/workflows/deploy-vercel.yml` (Vercel CLI, non l'import nativo — l'import da org spinge verso Team a pagamento, il deploy via CLI+token personale no). Push su `main` → produzione, PR → preview con commento URL. Resta da: creare i 3 secrets (VERCEL_TOKEN/VERCEL_ORG_ID/VERCEL_PROJECT_ID via `vercel link` locale) e scollegare la Git integration nativa su Vercel per non deployare due volte
- [ ] Org GitHub: 2FA obbligatoria per i membri, branch protection su main (PR + review), CODEOWNERS, secrets SOLO negli env di deploy (Vercel/Supabase), mai nel repo
- [x] Co-owner: aggiungere un secondo maintainer come Owner dell'organizzazione (bus factor ≥ 2)
- [x] Rimosso il widget BuyMeACoffee floating globale (script iniettato fuori dall'albero React, restava visibile su ogni pagina inclusa l'app autenticata dopo la prima visita a Landing/Pricing/Info — invasivo e incoerente col posizionamento privacy-first); sostituito con un link statico "☕ Support Pacifinance" solo dove c'è già una sezione di supporto dedicata
- [x] FUNDING.yml: link BuyMeACoffee come canale statico iniziale; GitHub Sponsors aggiungibile quando attivo
- [x] README + CONTRIBUTING in inglese, CI pubblica (GitHub Actions: lint+test+build su PR — gratis per repo pubblici)
- [ ] Landing "self-host in 10 minuti" con Docker (docker-compose: frontend statico + server Express + Postgres; Redis opzionale)
- [ ] Demo account con mock data senza richieste DB (già pianificato sotto, diventa prerequisito del lancio)
- [ ] Lancio: Hacker News, r/selfhosted, r/ItaliaPersonalFinance

### Fase 3b — Architettura hosted + self-hosted
- [ ] Doppia distribuzione: web hosted (pacifinance.com, gratuita) + self-hosted gratuito (AGPL) — il codice è lo stesso; la concorrenza NON è hosted-vs-self-hosted (chi self-hosta non avrebbe mai pagato: contribuisce con codice/bug/credibilità)
- [ ] Confronto anonimo per self-hosted: servizio "community stats" opt-in — l'istanza self-hosted invia SOLO aggregati anonimi (bucket profilo: fascia età/lavoro/nazione + totali mensili arrotondati), MAI transazioni; riceve i percentili. Chi non aderisce ha tutto tranne il confronto. È il network effect che resta al progetto anche con codice aperto
- [ ] Monetizzazione (SOLO quando ci sarà retention dimostrata, non prima): tier "Sostenitore" ~€2-3/mese = donazione strutturata con piccoli perk (badge, early access, voto priorità roadmap) — non un paywall su feature; eventuali feature Pro vere solo su cose che costano per-utente o richiedono lavoro dedicato: coorti di confronto personalizzate, spazi famiglia/condivisi, report email/push automatici
- [ ] Nota Vercel: il piano Hobby vieta uso commerciale — il giorno in cui parte un tier a pagamento serve comunque Vercel Pro (o migrazione host); metterlo a budget in quel momento, non prima

### Fase 4 — Confronto anonimo (differenziante)
- [x] Trasparenza benchmark v1: dimensione coorte, fattori usati, soglia privacy e percentili reali visibili nella pagina confronto
- [x] Escludere account demo/test da medie e ranking della community
- [x] Consenso esplicito separato per contribuire ai benchmark hosted e possibilità di revoca/cancellazione <!-- roadmap:benchmark-consent -->
- [x] Mediana, quartili e numero effettivo di contribuenti per metrica (non affidarsi solo alla media) <!-- roadmap:benchmark-distributions -->
- [x] Personalizzazione coorte: selezione dinamica di lavoro/carriera, area geografica, fase di vita e nucleo familiare; cache Redis breve, calcolo aggregato on-demand, anteprima live della numerosità e blocco rigoroso sotto soglia privacy <!-- roadmap:custom-cohort -->
- [x] Snapshot mensile delle coorti standard: salvare i bucket profilo e la versione dell'algoritmo al refresh mensile, così ogni benchmark resta riproducibile per tutto il mese senza reagire a modifiche successive del profilo. Non includere mai saldi, entrate o uscite nella definizione di similarità. <!-- roadmap:benchmark-snapshots -->
- [~] Insight derivati: evidenziare la categoria madre con il maggiore scostamento economico dalla coorte; aggiungere trend e contributo percentuale al gap
- [x] Benchmark longitudinali 3/6/12 mesi usando un gruppo stabile, con data di aggiornamento, numerosità e indicatore di affidabilità <!-- roadmap:benchmark-longitudinal -->
- [ ] Benchmark runway emergenza, costi fissi/reddito, saving rate e diversificazione patrimoniale
- [ ] Confronti per lavoro, esperienza, regione di lavoro, lavoro remoto e composizione familiare; mostrare sempre range e numerosità
- [ ] Normalizzazione costo della vita per area geografica, mantenendo visibile anche il confronto nominale
- [ ] Simulatore cambio lavoro/luogo come scenario osservazionale con assunzioni esplicite, senza presentarlo come consiglio o causalità
- [~] Protocollo community stats opt-in per self-host: invio di soli bucket e aggregati mensili arrotondati, mai transazioni — specifica v1 in `docs/COMMUNITY_STATS_PROTOCOL.md`; endpoint e firma da implementare
- [ ] Snapshot benchmark firmati/versionati per istanze self-hosted, retention breve dei contributi e revoca verificabile
- [ ] Protezioni anti-differencing/Sybil, quality score dei contributi e audit bias per coorti rare
- [ ] Referral e badge per inviti (già in server/todo.md)

### Fuori scope (deciso, non riaprire senza motivo forte)
- Offerte di lavoro in piattaforma (two-sided market, fuori focus, rischio privacy)
- Espansione Market Prices oltre il fix minimo (commodity, non differenziante)
- Nuove lingue oltre le 6 attuali / asset esotici

---

## Da Fare

### Bug Noti
- [ ] BuyMeACoffee widget: verificare posizionamento su tutti i dispositivi (CSS !important workaround)
- [ ] Grafici renderCustomizedLabel: verificare sovrapposizione con raggio ridotto su mobile
- [ ] Floating point e centesimi: il DB mandera valori interi (* 100), gestire la conversione

### Sicurezza
- [ ] gestione email per utenze criptate, solo per recupero password e verifiche di sicurezza, no email marketing <!-- roadmap:user-email-crypted -->


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
- [x] Obiettivi e limiti (Goals & Limits con monitoraggio dedicato, backend + UI) <!-- roadmap:goals-limits -->
- [~] Onboarding guidato per nuovi utenti: wizard 4 step con progress bar <!-- roadmap:onboarding -->
- [ ] Rendere l'account demo che non faccia richieste al db e usi dei mockData in modo da mostrare rapidamente tutte le funzionalità dell'applicazione e convincere l'utente a registrarsi (ora è un account che fa richieste al db ma non è scalabile con tanti utenti)

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
