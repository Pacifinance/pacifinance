# Migrazione PaciFinance: Hetzner (Express+MongoDB+Redis) → Vercel + Supabase

## Context

PaciFinance gira oggi su una VM Hetzner con `docker-compose` che orchestra tre servizi: `app` (Express monolitico, TS compilato, serve sia le API sia la build statica del frontend React), `mongo` (replica set singolo nodo) e `redis` (sessioni + cache). Questo documento valuta e pianifica il passaggio a **Vercel** (hosting frontend + funzioni serverless) e **Supabase** (Postgres gestito): parere motivato, mappatura schema Mongo→SQL, blocchi per il deploy serverless, cosa si perde/guadagna, istruzioni operative complete.

Analisi basata sull'esplorazione di `server/src/db/models/*` (5 modelli Mongoose: `users`, `balances`, `expenses`, `tags`, `delqueue`) e di tutta l'architettura Express (`index.ts`, `routes/`, `jobs/`, `cache/`). Punti chiave emersi:
- **Nessuna vera aggregation pipeline MongoDB** — tutta la logica (rankings, medie) è fatta con loop N+1 in JavaScript applicativo. Buona notizia per la conversione a SQL, ma questi loop vanno riscritti come query aggregate per stare nei timeout serverless.
- **Il sistema è pseudonimo**: non esiste un campo email da nessuna parte, per scelta di design intenzionale e privacy-oriented del progetto. Login/registrazione usano solo un `userId` a 6 caratteri generato casualmente + password (bcrypt). Questo impatta direttamente la migrazione a Supabase Auth (vedi sotto).
- **`averages`, `rankings`, `prices` non sono in MongoDB**: sono calcolati runtime e cachati in Redis.
- Nessun upload file, nessun WebSocket, nessun SMTP — meno sorprese rispetto ad altri stack.

**Decisioni architetturali concordate:**
1. **Auth**: migrare a **Supabase Auth** (JWT + RLS), abbandonando bcrypt/express-session custom.
2. **Cache/Redis**: mantenere Redis via **Upstash** (serverless-friendly), usato solo per cache (medie utenti, prezzi crypto) e anti-replay captcha — non più per le sessioni (le gestisce Supabase Auth).
3. **Shape backend**: lift-and-shift, Express avvolto in un'unica funzione serverless Vercel (`api/[...path].ts`) con `serverless-http`.
4. **Migrazione dati**: cutover singolo con breve downtime pianificato (non dual-write).

---

## Il parere

La migrazione è **tecnicamente sensata e a rischio contenuto sul lato dati**: non ci sono transazioni multi-documento, change streams, o feature MongoDB-specifiche indispensabili; gli `ObjectId` sono usati solo come chiavi/riferimenti, facilmente sostituibili con `uuid`. Il grosso del lavoro è altrove:
- **Riscrittura auth** (Supabase Auth non supporta nativamente "user_id + password senza email" — serve un escamotage con email sintetica, vedi sotto).
- **Riscrittura dei pattern N+1** in `rank.ts` e `averages.ts`, che oggi "funzionano" solo perché girano su un processo sempre acceso senza limiti di tempo — su Vercel andrebbero in timeout con l'attuale userbase in crescita.
- **Riconfigurazione infrastrutturale** (cron in-process → Vercel Cron, stato in-memory → Redis).

Consiglio di procedere, ma trattando il refactor delle query di ranking/medie come parte integrante della migrazione (non rimandabile), perché è l'unico punto realmente bloccante a lungo termine per il modello serverless.

---

## Pro e contro

| | Hetzner + Express + Mongo (oggi) | Vercel + Supabase (proposto) |
|---|---|---|
| **Ops** | Gestione manuale OS/Docker/patch/backup, ma controllo totale | Zero-ops: deploy automatici da git, scaling automatico, backup gestiti — ma dipendenza totale dai vendor |
| **Costi** | Fisso (VPS), prevedibile indipendentemente dal traffico | Variabile (usage-based); free tier generosi ai volumi attuali, ma imprevedibile a scala se le query N+1 non vengono sistemate |
| **Schema dati** | Flessibile/schema-less, iterazione rapida | Rigido/relazionale, integrità referenziale reale (FK/constraint), ma ogni nuovo campo richiede una migration SQL |
| **Query aggregate** | Fatte a mano in JS (N+1, lente) | SQL nativo (`GROUP BY`, window functions) molto più performante — occasione di refactor |
| **Sicurezza dati** | Validazione solo applicativa | RLS nativo come ulteriore livello di difesa |
| **Debug locale** | `npm run dev` + `docker-compose up`, ambiente identico alla prod | `vercel dev` emula ma non è identico a prod; più attrito |
| **Deploy** | Manuale/script su VM | Preview deployment automatici per branch/PR, rollback istantaneo |
| **Portabilità** | Stack "vanilla", portabile ovunque | Maggior vendor lock-in (Supabase Auth/RLS, Vercel Cron) |
| **Esecuzione** | Processo persistente, nessun timeout, stato in-memory affidabile | Stateless, timeout per invocazione (10s Hobby/60-300s Pro), niente stato condiviso tra richieste |

---

## Cosa si perde / a cosa fare attenzione

1. **Controllo infrastrutturale diretto** — niente più SSH/systemd/log locali; debug e osservabilità passano dai dashboard Vercel/Supabase/Upstash.
2. **Stato in-memory affidabile** — oggi `registrationTokensCache` (Set anti-replay Turnstile in `server/src/routes/public/public.ts`) presuppone un solo processo. Su Vercel ogni invocazione può girare su un'istanza diversa: va spostato su Redis con TTL, altrimenti la protezione anti-replay smette di funzionare silenziosamente.
3. **Cron a grana fine** — il job di cache oggi gira ogni minuto (`* * * * *` in `server/src/jobs/jobs.ts`) su un processo sempre acceso. Vercel Cron ha vincoli di frequenza (1x/giorno per cron sul piano Hobby); va ridisegnato sulla scadenza reale della cache (giornaliera per le medie, oraria per i prezzi crypto), non più su un polling al minuto.
4. **Velocità di iterazione sullo schema** — aggiungere un campo a `userData` oggi è "aggiungi una proprietà"; con Postgres serve una migration esplicita ogni volta (più rigore, meno velocità di prototipazione).
5. **User ID come credential "pulito"** — oggi il login è `userId` (6 cifre) + password, senza email, per una scelta di design **intenzionale e privacy-oriented** del progetto (nessun dato personale identificativo raccolto in fase di registrazione). Questo vincolo va preservato nella migrazione. Supabase Auth richiede però un identificativo email/phone per il flusso password standard via API pubblica. La soluzione proposta (email sintetica `{user_code}@users.pacifinance.internal`, vedi schema sotto) **non raccoglie né espone alcuna email reale**: è un identificativo tecnico interno generato dal backend, mai visto dall'utente, mai richiesto in un form, e non riconducibile a un indirizzo email realmente esistente — l'utente continua a interagire solo con `userId` (6 cifre) + password, esattamente come oggi. Resta comunque un'indirection in più da mantenere e un dettaglio implementativo da documentare chiaramente per eventuali audit privacy.
   - **Alternativa più conservativa**, se si preferisce zero dipendenza da un campo "email-shaped" anche a livello interno: rinunciare a Supabase Auth e mantenere la logica custom attuale (bcrypt + sessioni), usando Supabase **solo** come Postgres gestito (opzione scartata nella scelta iniziale, ma riconsiderabile qui in cambio di più codice da mantenere).
6. **Timeout per query pesanti** — `fetchUserAverages()` (in `server/src/cache/items/averages.ts`) fa centinaia di query sequenziali per utente, ripetuto per ogni utente come "riferimento" (quadratico). Oggi è mitigato dal fatto che gira 1 volta/giorno senza limite di tempo; su Vercel **deve** diventare una query SQL aggregata, altrimenti va in timeout.
7. **Vendor lock-in** — Supabase Auth/RLS e Vercel Cron sono meno portabili di Express+Mongo "vanilla".

## Cosa si guadagna

- Deploy automatici, preview per branch/PR, rollback istantaneo, zero manutenzione OS.
- Integrità referenziale reale (FK, constraint) invece di sola validazione applicativa.
- RLS come difesa in profondità nativa del DB.
- Occasione per sostituire i loop N+1 con query SQL performanti.
- Costo iniziale probabilmente più basso ai volumi attuali (free tier Vercel/Supabase/Upstash).

---

## Blocchi per il deploy Vercel — checklist

| # | Blocco | Severità | Soluzione |
|---|---|---|---|
| 1 | Cron in-process (`cron` package, `jobs.ts`) | **Hard** | Vercel Cron → endpoint HTTP `/api/cron/*` protetti da secret |
| 2 | Stato in-memory (`registrationTokensCache`) | **Hard** | Spostare su Redis/Upstash con TTL |
| 3 | Server Express serve anche il frontend statico (`express.static` + catch-all SPA) | **Medium** | Rimuovere da Express; frontend servito da Vercel CDN, `vercel.json` fa i rewrite per `/api/*` |
| 4 | Nessun CORS esplicito (oggi funziona perché stesso host) | **Medium** | Restare sullo stesso dominio Vercel (rewrites) per evitare di dover gestire cookie cross-site |
| 5 | Query N+1 in `rank.ts` / `averages.ts` | **Medium** (diventa hard a scala) | Riscrivere come query SQL aggregate/RPC Postgres |
| 6 | Bootstrap sincrono a livello di modulo (connessione DB "always-on", mai chiusa) | **Medium** | Con `@supabase/supabase-js` (client REST via PostgREST) non serve gestire pool TCP lato funzione — elimina il problema alla radice |
| 7 | `process.exit(1)` su `uncaughtException`/`unhandledRejection` | **Low** | Rimuovere: il runtime serverless isola già ogni invocazione |
| 8 | Body size limit Express default (100kb) | **Low** | Verificare che nessun payload (es. import CSV lato client → invio batch) lo superi |

---

## Schema SQL per Supabase

Lo schema completo è in [`supabase/schema.sql`](../supabase/schema.sql), pronto per essere eseguito nel SQL Editor di Supabase.

Mappatura dalle 5 collection Mongo. Note di design:
- `users.password`/`users.session` **spariscono**: gestiti da `auth.users` (Supabase Auth).
- `users.goals` (subdocument embedded) → appiattito in colonne su `profiles`.
- Gli 11 campi `ObjectId ref "Tag"` del profilo → colonne `bigint references tags(id)`, nullable (niente più placeholder "ObjectId nullo").
- `tags.type` e `profiles.account_type` sono `smallint` (non enum Postgres): restano 1:1 compatibili con le costanti numeriche `TagType`/`UserType` già usate in tutto il codice server e nel frontend, evitando una conversione enum↔numero in ogni query.
- `tags.translations` resta `jsonb` (non split in colonne `label_en`/`label_it`) per non dover fare una migration ogni volta che si aggiunge una lingua in `src/i18n/languagesConfig.js`.
- `expenses` resta un'unica tabella per outflows+incomes (`is_expense boolean`), fedele all'originale.
- `balances` non ha vincolo unique su `(user_id, user_date)`: preservato lo storico multiplo esistente (la logica applicativa prende la riga più recente).
- `deletions.user_id` con `references auth.users(id) on delete cascade`: cancellare l'utente via Auth Admin API elimina automaticamente a cascata profilo, balances, expenses e la entry di coda — semplifica molto `usersdel.ts`.

**Esempio di query aggregata** (per sostituire il loop N+1 di `rank.ts` — da adattare, mostra il pattern da usare per tutte le funzioni di ranking/medie tramite `supabase.rpc(...)`):

```sql
create or replace function public.get_balance_ranking()
returns table(user_id uuid, total_balance numeric, rank bigint)
language sql stable as $$
  with latest as (
    select distinct on (user_id) user_id,
      bank + cash + digital_services + stocks + etf + bitcoin + crypto + bonds + funds + gold + emergency_fund as total
    from public.balances
    order by user_id, user_date desc, recorded_at desc
  )
  select user_id, total, rank() over (order by total desc)
  from latest;
$$;
```

---

## Istruzioni operative complete

### Fase 0 — Setup account (nessun downtime)
1. **Supabase** (già creato): recuperare da Project Settings → API: `Project URL`, `anon key`, `service_role key`. Da Project Settings → Database: connection string.
2. **Upstash**: creare un database Redis (regione vicina alla region Vercel scelta), recuperare `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` (o la connection string classica se si preferisce il client `redis` esistente in modalità TCP — verificare compatibilità con `connect-redis`/uso attuale).
3. **Vercel**: collegare il repository Git, non fare ancora il primo deploy prod finché backend/schema non sono pronti.

### Fase 1 — Creare lo schema su Supabase
4. Aprire il SQL Editor di Supabase ed eseguire [`supabase/schema.sql`](../supabase/schema.sql) (crea `tags`, `profiles`, `balances`, `expenses`, `deletions`, indici, RLS policies).
5. Popolare `tags` con i dati attuali (vedi Fase 2 — l'ordine conta: `tags` va popolata prima di `expenses`/`profiles` per rispettare le FK).

### Fase 2 — Migrazione dati (cutover)
6. Comunicare/attivare una finestra di manutenzione breve (banner frontend o blocco temporaneo delle route di scrittura).
7. Esportare le 5 collection Mongo (`mongoexport` per `users`, `balances`, `expenses`, `tags`, `deletions` in JSON, oppure `mongodump`).
8. Scrivere ed eseguire uno script di trasformazione (Node/TS, one-off, non fa parte del codice applicativo) che:
   - importa i `tags` per primi (mappa `index`→`client_index`, `type` numerico→enum, `translations` invariato);
   - per ogni `users`: chiama `supabase.auth.admin.createUser({ email: `${userId}@users.pacifinance.internal`, password: <placeholder, va resettata>, email_confirm: true })` — **nota critica**: gli hash bcrypt esistenti non sono riutilizzabili da Supabase Auth (usa un proprio schema di hashing), quindi le password esistenti **non sono migrabili automaticamente**. Serve una strategia di comunicazione agli utenti (reset password obbligatorio al primo login post-migrazione, o flusso "set new password" via link); salva la mappatura `vecchio userId → nuovo uuid Supabase`;
   - inserisce la riga `profiles` corrispondente (con gli `_tag_id` risolti tramite la mappatura tag);
   - inserisce `balances`, `expenses`, `deletions` usando l'uuid mappato al posto del vecchio `userRef`.
9. Verifiche di integrità: conteggio righe per tabella vs conteggio documenti Mongo; controllo a campione su alcuni utenti (saldo totale, categorie, tag).

### Fase 3 — Riscrittura backend
10. Aggiungere `@supabase/supabase-js` come client sia per le chiamate Auth Admin (registrazione/cancellazione utenti) sia per le query dati (via PostgREST) — evita di dover gestire un pool di connessioni TCP Postgres lato funzione serverless (blocco #6 della checklist).
11. Sostituire `server/src/db/mongo.ts` e i modelli in `server/src/db/models/*` con moduli equivalenti basati su query `supabase-js` (`.from('balances').select(...)`, ecc.) o su `.rpc(...)` per le aggregazioni.
12. Riscrivere `server/src/routes/public/public.ts`:
    - registrazione → `supabase.auth.admin.createUser(...)` + insert `profiles`;
    - login → `supabase.auth.signInWithPassword({ email: syntheticEmail, password })`, poi settare i token ricevuti come cookie httpOnly (sostituisce `req.session.userId` + `connect-redis`).
13. Riscrivere il middleware in `server/src/routes/routes.ts`: verificare il JWT Supabase dal cookie (`supabase.auth.getUser(token)`) invece di `req.session.userId`.
14. Aggiornare tutte le route private (`balances.ts`, `expenses.ts`, `tags.ts`, `user.ts`, `rank.ts`, `stats.ts`, `prices.ts`) per usare `req.user.id` (uuid) al posto del vecchio `userRef`.
15. Sostituire `registrationTokensCache` (Set in-memory in `public.ts`) con chiavi Redis/Upstash (`SETEX token 180 "1"`, check con `EXISTS`).
16. Riscrivere `server/src/jobs/functions/usersdel.ts` come endpoint HTTP `/api/cron/delete-users`, protetto da header secret, che per ogni riga scaduta in `deletions` chiama `supabase.auth.admin.deleteUser(uuid)` (il cascade SQL elimina automaticamente profilo/balances/expenses/coda).
17. Riscrivere `server/src/jobs/functions/cacheup.ts` in due endpoint separati: `/api/cron/refresh-crypto-prices` (orario) e `/api/cron/refresh-user-averages` (giornaliero).
18. Riscrivere la logica di `rank.ts` e `averages.ts` come funzioni SQL (`create or replace function ...`) invocate via `.rpc(...)`, sul modello dell'esempio sopra — necessario per stare nei timeout Vercel.
19. Rimuovere da `index.ts` `express.static` e il catch-all SPA; avvolgere il router Express in un unico handler `api/[...path].ts` con `serverless-http`.
20. Rimuovere `process.on('uncaughtException'/'unhandledRejection', ... process.exit(1))`.

### Fase 4 — Configurazione Vercel
21. `vercel.json`: rewrites per instradare `/api/*` alla function, `crons` per i job periodici (`/api/cron/refresh-crypto-prices`, `/api/cron/refresh-user-averages`, `/api/cron/delete-users`), redirect/rewrite per il prefisso lingua (oggi gestito da middleware Express in `index.ts` righe 52-60).
22. Variabili d'ambiente su Vercel (via sync Doppler, vedi sezione dedicata): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `TURNSTILE_SECRET_KEY`, `CG_KEY`, `CRON_SECRET`, `DB_ENCRYPTION_KEY`. (`SALT_ROUNDS`/bcrypt non più necessari lato server — l'hashing lo fa Supabase Auth.)
23. Build settings: framework Vite, output `build/`, build command coerente con `npm run build` (che include `prebuild`/roadmap generation esistente).

### Fase 5 — Test e go-live
24. Testare su un Preview Deployment Vercel puntato a Supabase (idealmente un secondo progetto Supabase di staging, se disponibile).
25. Cutover DNS: puntare `pacifinance.com`/`www.pacifinance.com` a Vercel; spegnere il reverse proxy su Hetzner.
26. Monitorare log Vercel Functions + dashboard Supabase/Upstash nelle prime ore.
27. Tenere la VM Hetzner (spenta ma non distrutta) per un periodo di rollback di sicurezza prima di decommissionare definitivamente VPS/Mongo/Redis.

---

## Funzionalità aggiuntive implementate su questo branch

Oltre al lift-and-shift, sul branch `migration/vercel-supabase` sono state aggiunte quattro funzionalità, approfittando del cambio di database.

### Cifratura di `expenses.notes`

App-level, `AES-256-GCM` via il modulo nativo `crypto` di Node (`server/src/db/crypto.ts`), chiave a 32 byte in `DB_ENCRYPTION_KEY` (Doppler → Vercel, mai nel DB). Cifrato/decifrato in modo trasparente in `server/src/db/models/expenses.ts`. Solo `notes` è cifrato (unico campo a testo libero); importi/categorie/date restano in chiaro per poter continuare ad aggregarli in SQL. Formato salvato: `v1:<iv>:<authTag>:<ciphertext>` (versionato, per rotazione futura della chiave).

### Categorie personalizzate

Tabella `user_categories` (figlia di un tag ufficiale `tags`), colonna opzionale `expenses.user_category_id`. Le statistiche/ranking continuano a raggruppare sempre su `expenses.category_tag_id` (mai toccato): la categoria personalizzata è solo un'etichetta di visualizzazione. API: `POST /categories/get|add|delete` (`server/src/routes/private/categories.ts`). Lato frontend è pronto il livello dati (`financeService.getCustomCategories/addCustomCategory/deleteCustomCategory`, `userData.customCategories` popolato da `UserContext`) — l'integrazione nel picker di categoria del form di inserimento spesa è un follow-up.

### Storico multi-anno nei grafici

Gli stub UI "2Y"/"ALL" già presenti (disabilitati) in `BalancesChart.tsx`/`InOutChart.tsx` sono stati sbloccati:
- `GET /balances/get` accetta `{months: N}` o `{months: "all"}` (default 24, invariato per i chiamanti esistenti).
- `GET /expenses/monthly-totals` (nuovo): totali entrate/uscite aggregati per mese via SQL `SUM`/`GROUP BY`, **nessun dettaglio di transazione trasferito** — pensato apposta per non pesare sull'egress quando si guardano anni di storico.
- Fetch lazy: il caricamento pagina resta sui 24 mesi di default; lo storico completo viene richiesto solo al click su "ALL" (una volta, poi cachato in `userData` per la sessione).

### Query ottimizzate (RPC Postgres)

Sostituiti i loop N+1 con funzioni SQL aggregate, invocate via `supabase.rpc(...)`:
- `get_balance_history` — sostituisce le 24 query di `getYearlyBalanceByUserId` con una sola query a finestra, e supporta range arbitrario/all-time.
- `get_monthly_totals` — somme mensili entrate/uscite in un'unica query.
- `get_balance_ranking_pool` / `get_expense_ranking_pool` — sostituiscono il loop "una query per utente" di `rank.ts` con un'unica query per l'intero pool (tutti gli utenti o solo quelli "simili"); il calcolo del percentile resta identico, lato applicativo.
- `averages.ts` (medie utenti, cron giornaliero) resta com'era: non è nel path di richiesta interattivo e beneficia dei 300s di Fluid Compute — ottimizzabile in futuro se la userbase cresce molto.

Tutte le nuove funzioni SQL sono in [`supabase/schema.sql`](../supabase/schema.sql).

---

## Verifica

- Dopo l'esecuzione dello schema SQL: verificare in Supabase Studio che tutte le tabelle/indici/policy siano stati creati senza errori.
- Dopo lo script di migrazione dati: query di conteggio (`select count(*) from ...`) confrontate con i conteggi Mongo originali; test manuale di login su 2-3 account reali post-reset password.
- Dopo la riscrittura backend: eseguire in locale con `vercel dev` contro il progetto Supabase (o uno di staging), testare manualmente registrazione, login, aggiunta balance/expense, visualizzazione ranking/medie, cancellazione account (coda + cron).
- `npm run lint && npm test && npm run build` prima di ogni deploy, come da convenzione del progetto.
- Load test leggero sugli endpoint `rank`/`stats` riscritti per confermare che restano sotto i timeout Vercel anche a userbase cresciuta.
