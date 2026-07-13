# Open Source Operations Runbook

Questo documento raccoglie i passaggi operativi per aprire PaciFinance come
progetto open source e mantenere una versione hosted senza perdere controllo su
segreti, deploy, governance e distribuzione self-hosted.

Stato consigliato prima di iniziare:

- working tree pulito o branch dedicato `open-source-readiness`;
- `.env*`, dump, backup DB e file di migrazione con dati reali fuori dal repo;
- Supabase, Upstash, Vercel e Turnstile con segreti ruotabili;
- almeno due maintainer fidati nell'organizzazione GitHub.

## 1. Audit segreti nella history Git

Obiettivo: verificare che il repo possa diventare pubblico senza esporre token,
dump, chiavi Supabase, token Upstash, Turnstile, Doppler, Vercel, Mongo legacy o
dati finanziari reali.

### 1.1 Inventario dei segreti attesi

Prima di usare scanner automatici, scrivere una lista dei pattern reali da
cercare:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `TURNSTILE_SECRET_KEY`
- `CRON_SECRET`
- `COINGECKO_API_KEY` / `CG_KEY`
- `OPENFIGI_API_KEY`
- `VERCEL_TOKEN`
- vecchie URI MongoDB / backup legacy
- `migration-final.sql`
- chiavi AES o file tipo `migration-encryption-key.txt`
- dump con user code, hash password, transazioni, note, profili reali

### 1.2 Controllo working tree

```bash
git status --short
find . -maxdepth 4 -type f \
  \( -name ".env*" -o -name "*backup*" -o -name "*dump*" -o -name "*migration-final*" -o -name "*encryption-key*" \)
```

Verificare che i file sensibili siano:

- non tracciati;
- presenti in `.gitignore`;
- sostituiti da `.env.example` con placeholder sicuri.

### 1.3 Grep veloce sulla history

```bash
git grep -n -I "SUPABASE_SERVICE_ROLE_KEY"
git grep -n -I "UPSTASH_REDIS_REST_TOKEN"
git grep -n -I "TURNSTILE_SECRET"
git grep -n -I "CRON_SECRET"
git grep -n -I "mongodb"
git grep -n -I "migration-final"
```

Poi cercare in tutta la history:

```bash
git log --all --full-history --name-only --pretty=format: | sort -u | grep -Ei 'env|secret|token|key|dump|backup|mongo|migration'
git log --all -S"SUPABASE_SERVICE_ROLE_KEY" --pretty=oneline
git log --all -S"UPSTASH_REDIS_REST_TOKEN" --pretty=oneline
git log --all -S"TURNSTILE_SECRET" --pretty=oneline
git log --all -S"mongodb" --pretty=oneline
```

### 1.4 Scanner automatici

Usare almeno due scanner perché hanno euristiche diverse:

```bash
# gitleaks
gitleaks detect --source . --redact --verbose

# trufflehog
trufflehog git file://. --only-verified
```

Se uno scanner segnala un segreto reale:

1. ruotare subito il segreto nel provider;
2. verificare se è ancora usato in produzione;
3. rimuoverlo dalla history solo dopo aver scelto una strategia.

### 1.5 Se ci sono segreti nella history

Opzione preferita prima di aprire il repo: creare un nuovo repository pubblico
pulito importando solo lo snapshot corrente verificato.

Vantaggi:

- elimina il rischio di lasciare segreti nella history;
- evita rewrite distruttivi;
- è semplice da spiegare pubblicamente.

Svantaggi:

- si perde la history pubblica;
- PR/issue/stars del vecchio repo non vengono trasferiti.

Opzione alternativa: riscrivere history con `git filter-repo` o BFG.

Usarla solo se vuoi mantenere la history. Dopo il rewrite:

- tutti i segreti vanno comunque ruotati;
- tutti i collaboratori devono riclonare;
- i vecchi fork possono continuare a contenere i segreti;
- GitHub potrebbe conservare cache o ref non raggiungibili per un periodo.

### 1.6 Gate finale prima della pubblicazione

- `gitleaks detect --source . --redact` senza findings reali.
- `trufflehog git file://. --only-verified` senza findings reali.
- Nessun `.env*` reale tracciato.
- Nessun dump o backup tracciato.
- `.env.example` contiene solo placeholder.
- Tutti i segreti di produzione sono stati ruotati se anche solo sospetti.

## 2. Transfer del repository nell'organizzazione GitHub

Obiettivo: spostare il repo sotto l'organizzazione `PaciFinance` mantenendo
issues, PR, stars, watchers e redirect GitHub.

GitHub documenta che il transfer conserva issues, PR, wiki, stars, watchers e
contributi Git, e che i link al vecchio repository vengono reindirizzati finché
non viene ricreato un repo allo stesso vecchio path.

### 2.1 Prerequisiti

- Creare o verificare l'organizzazione `PaciFinance`.
- Avere almeno due Owner nell'organizzazione.
- Abilitare 2FA obbligatoria per i membri.
- Verificare che nell'organizzazione non esista già un repo con lo stesso nome.
- Decidere nome finale: consigliato `pacifinance` o `pacifinance-serverless`.
- Se il repo diventa pubblico, completare prima l'audit segreti.

### 2.2 Transfer via GitHub UI

1. Aprire il repo sorgente su GitHub.
2. `Settings` -> `General` -> `Danger Zone`.
3. Cliccare `Transfer`.
4. Inserire come owner l'organizzazione `PaciFinance`.
5. Confermare digitando il nome del repository.
6. Accettare eventuale invito/confirm se richiesto.

### 2.3 Dopo il transfer

Aggiornare tutti i cloni locali:

```bash
git remote -v
git remote set-url origin git@github.com:PaciFinance/pacifinance-serverless.git
git remote -v
```

Aggiornare:

- README badge e link;
- link nel sito;
- link in `package.json` se aggiungi `repository`;
- Vercel project, se usa Git integration;
- webhook e deploy keys;
- GitHub Actions secrets;
- GitHub Container Registry image name, se resta il workflow Docker.

### 2.4 Repo legacy

Se esiste un vecchio repo o una vecchia versione server:

- archiviarlo;
- mettere un README minimale che punta al nuovo repo;
- non cancellarlo subito, per non rompere link esterni;
- non ricreare un repo nel vecchio path del transfer, altrimenti GitHub può
  perdere i redirect automatici.

## 3. Branch protection e governance

Obiettivo: proteggere `main` senza rendere impossibile contribuire.

GitHub supporta branch protection rules e rulesets. Per un repo piccolo va bene
partire con branch protection su `main`; quando crescerà, valutare rulesets.

### 3.1 Regole consigliate su `main`

In `Settings` -> `Branches` -> `Branch protection rules`:

- branch name pattern: `main`;
- require a pull request before merging;
- required approvals: `1`;
- dismiss stale approvals when new commits are pushed;
- require review from Code Owners: sì, quando `CODEOWNERS` è pronto;
- require status checks to pass before merging;
- require branches to be up to date before merging;
- required checks:
  - `checks` dal workflow `.github/workflows/ci.yml`;
- require conversation resolution before merging;
- block force pushes;
- block deletions.

Per i primi giorni puoi lasciare "Do not allow bypassing" disattivato per gli
Owner, ma l'obiettivo finale è abilitarlo quando il flusso CI è stabile.

### 3.2 CODEOWNERS

Aggiungere `.github/CODEOWNERS` solo quando esiste un team reale:

```text
* @PaciFinance/maintainers
server/ @PaciFinance/backend
src/i18n/ @PaciFinance/i18n
supabase/ @PaciFinance/backend
```

Non aggiungere team inesistenti: GitHub li ignora o mostra errori.

### 3.3 Merge policy

Consigliato:

- squash merge abilitato;
- merge commit disabilitato;
- rebase merge opzionale;
- delete branch after merge abilitato;
- issue templates e PR template obbligatori culturalmente, non tecnicamente.

### 3.4 Security settings

In `Settings` -> `Code security and analysis`:

- Dependabot alerts: on;
- Dependabot security updates: on;
- Secret scanning: on se disponibile;
- Push protection: on se disponibile;
- Private vulnerability reporting: on.

## 4. Deploy Vercel via GitHub Actions

Obiettivo: evitare Git integration diretta con Vercel e deployare da GitHub
Actions con Vercel CLI. Vercel documenta `vercel build` per generare
`.vercel/output` in CI e `vercel deploy --prebuilt` per deployare quell'output.

### 4.1 Secrets GitHub necessari

In `Settings` -> `Secrets and variables` -> `Actions`:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `CRON_SECRET` se i workflow chiamano endpoint cron
- eventuali env build-time solo se davvero necessarie

Gli env runtime dell'app devono restare in Vercel/Doppler, non nel repository.

### 4.2 Setup locale iniziale

Con Vercel CLI installato:

```bash
npx vercel login
npx vercel link
```

Questo genera `.vercel/project.json` con `orgId` e `projectId`.

Non committare token personali. Valutare se committare `.vercel/project.json`:

- sì, se contiene solo `orgId`/`projectId` e vuoi CI più semplice;
- no, se preferisci usare solo secrets.

### 4.3 Workflow produzione

Creare `.github/workflows/vercel-production.yml`:

```yaml
name: Deploy production

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - name: Pull Vercel environment
        run: npx vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

      - name: Build
        run: npx vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

      - name: Deploy prebuilt
        run: npx vercel deploy --prebuilt --prod --archive=tgz --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

### 4.4 Workflow preview PR

Opzionale ma utile:

```yaml
name: Deploy preview

on:
  pull_request:

permissions:
  contents: read
  pull-requests: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: preview
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
      - run: npx vercel build --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
      - run: npx vercel deploy --prebuilt --archive=tgz --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

### 4.5 Passaggio da Git integration a Actions

1. Creare workflow production.
2. Testare manualmente con `workflow_dispatch`.
3. Verificare dominio, env, cron e health endpoint.
4. Disabilitare o scollegare Git integration Vercel.
5. Fare un push su `main` e verificare un deploy completo.
6. Documentare rollback: Vercel dashboard -> Deployments -> Promote/Rollback.

## 5. Docker self-host

Obiettivo: permettere a un utente tecnico di provare PaciFinance localmente con
Postgres, app e Redis opzionale.

### 5.1 Target della prima versione

Non deve replicare l'hosted al 100%. Deve permettere:

- registrazione/login;
- dashboard;
- inserimento dati;
- categorie custom;
- goals/limits;
- import/export;
- niente confronto anonimo globale, oppure confronto disabilitato/mock;
- Redis opzionale.

### 5.2 File da aggiungere

Consigliati:

```text
Dockerfile
docker-compose.yml
.env.selfhost.example
docs/SELF_HOSTING.md
scripts/selfhost/apply-schema.sh
```

### 5.3 Dockerfile iniziale

```Dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/build ./build
COPY --from=build /app/api ./api
COPY --from=build /app/server ./server
COPY package.json ./
EXPOSE 3000
CMD ["node", "server/src/index.ts"]
```

Nota: il comando runtime sopra potrebbe richiedere una build server dedicata o
`tsx` in produzione. Prima di pubblicarlo, scegliere una delle due strade:

- compilare `server/src` in JS e lanciare `node server/build/index.js`;
- mantenere `tsx` come runtime esplicito.

La prima è più pulita per self-host.

### 5.4 docker-compose iniziale

```yaml
services:
  postgres:
    image: supabase/postgres:15.1.1.78
    restart: unless-stopped
    environment:
      POSTGRES_PASSWORD: pacifinance
      POSTGRES_DB: pacifinance
    ports:
      - "54322:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    ports:
      - "6379:6379"

  app:
    build: .
    restart: unless-stopped
    depends_on:
      - postgres
      - redis
    ports:
      - "3000:3000"
    env_file:
      - .env.selfhost

volumes:
  pgdata:
```

### 5.5 Supabase Auth: decisione importante

Il codice usa Supabase Auth. Per self-host ci sono due strade:

1. documentare Supabase Cloud come requisito anche per self-host app;
2. fornire uno stack Supabase local completo.

Per una prima release semplice: usare Supabase Cloud anche in self-host. È meno
"puro", ma riduce molto complessità e supporto.

Per una release più matura:

- usare `supabase start`;
- documentare Studio/Auth/API;
- applicare schema e migrations;
- capire bene URL interne tra container.

### 5.6 Variabili `.env.selfhost.example`

```bash
NODE_ENV=production
PORT=3000

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

CRON_SECRET=change-me
TURNSTILE_SECRET_KEY=
CG_KEY=
OPENFIGI_API_KEY=

DEPENDENCY_HEALTH_TIMEOUT_MS=3000
SUPABASE_FETCH_TIMEOUT_MS=10000
```

### 5.7 Community stats per self-host

Non includere raw transactions.

Schema futuro:

- opt-in esplicito;
- inviare solo aggregati mensili arrotondati;
- bucket profilo non identificanti;
- soglia k-anonymity prima di restituire benchmark;
- endpoint hosted separato, documentato.

## 6. Dominio Web3 `pacifinance.x`

Consiglio: tenerlo come asset di branding, ma non farlo diventare parte critica
dell'architettura.

Motivi per tenerlo:

- è già acquistato;
- può essere un redirect sperimentale al sito principale;
- può essere utile come prova di ownership/brand in community Web3;
- costa poco mantenerlo se non richiede manutenzione.

Motivi per non investirci troppo:

- i domini Web3 sono poco usati rispetto a DNS tradizionale;
- possono creare confusione se l'app è privacy-first e non "crypto-first";
- browser e resolver non li supportano universalmente senza estensioni/gateway;
- non deve essere requisito per login, deploy, SEO o documentazione principale.

Uso consigliato:

- `pacifinance.x` -> redirect a `https://pacifinance.com`;
- pagina minimale statica, niente JS pesante;
- nessun dato utente;
- nessuna dipendenza dal dominio Web3 per funzioni core.

Se esisteva una cartella `Web3/` con file di redirect, può essere mantenuta in
repo solo se documentata e non contiene segreti. In alternativa, meglio spostare
le istruzioni qui e gestire il redirect dalla dashboard Unstoppable Domains.

## 7. Sequenza consigliata

1. Chiudere PR di cleanup codice morto/documentazione.
2. Eseguire audit segreti completo.
3. Ruotare qualunque segreto sospetto.
4. Decidere: transfer con history o nuovo repo pubblico pulito.
5. Preparare organizzazione GitHub e secondo owner.
6. Trasferire o creare repo pubblico.
7. Abilitare branch protection e security settings.
8. Verificare CI su PR.
9. Collegare deploy Vercel via Actions.
10. Pubblicare una prima guida self-host minima.
11. Annunciare soft launch a community ristrette.

## Fonti operative

- GitHub repository transfer: https://docs.github.com/en/repositories/creating-and-managing-repositories/transferring-a-repository
- GitHub protected branches: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
- Vercel CLI deploy: https://vercel.com/docs/cli/deploy
- Vercel CLI build: https://vercel.com/docs/cli/build
