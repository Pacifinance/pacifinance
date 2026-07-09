-- ============================================================
-- PaciFinance — Schema Postgres per Supabase
-- Sostituisce le 5 collection MongoDB: users, balances, expenses, tags, deletions
-- Autenticazione gestita da Supabase Auth (auth.users) — email sintetica interna
-- {user_code}@users.pacifinance.internal, mai esposta all'utente (login resta userId+password)
--
-- Nota: "type"/"account_type" sono smallint (non enum Postgres) per restare
-- 1:1 compatibili con le costanti numeriche TagType/UserType già usate in
-- tutto il codice server (server/src/db/models/tags.ts, users.ts) e nel
-- frontend, evitando una conversione enum<->numero in ogni query.
--
-- Vedi docs/VERCEL_SUPABASE_MIGRATION.md per il contesto completo della migrazione.
-- ============================================================

-- ---------- tags (lookup unificato: categorie, pagamenti, valute, campi profilo enum) ----------
-- type: 0 expense, 1 income, 2 payment, 3 country, 4 job, 5 jobType, 6 workTime,
--       7 remoteType, 8 yearsOfExperience, 9 age, 10 livingSituation, 11 housingType,
--       12 children, 13 currency (vedi TagType in server/src/db/models/tags.ts)
-- Le traduzioni delle label NON vivono più a DB: il frontend le risolve dai
-- locale i18n (src/i18n/locales/*.json, sezione tags.<tipo>.<label>) per tutte
-- le lingue supportate; le valute (type 13) si mostrano via currencyConfig.ts.
create table public.tags (
  id bigint generated always as identity primary key,
  client_index integer not null,           -- ex "index" Mongo, usato dal frontend
  type smallint not null,
  label text not null,
  unique (client_index, type)
);

-- ---------- profiles (1:1 con auth.users) ----------
-- account_type: 0 regular, 1 premium, 2 test, 3 demo (vedi UserType in server/src/db/models/users.ts)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  user_code text not null unique,          -- ex "userId" a 6 cifre, esposto all'utente
  nickname text not null default '',
  account_type smallint not null default 0,
  created_at timestamptz not null default now(),

  age_tag_id bigint references public.tags(id),
  living_situation_tag_id bigint references public.tags(id),
  housing_type_tag_id bigint references public.tags(id),
  children_tag_id bigint references public.tags(id),
  country_tag_id bigint references public.tags(id),
  job_tag_id bigint references public.tags(id),
  job_type_tag_id bigint references public.tags(id),
  job_country_tag_id bigint references public.tags(id),
  work_time_tag_id bigint references public.tags(id),
  remote_type_tag_id bigint references public.tags(id),
  years_of_experience_tag_id bigint references public.tags(id),
  preferred_currency_tag_id bigint references public.tags(id),

  expenses_limit numeric not null default -1,
  savings_percent numeric not null default -1,
  emergency_fund_goal numeric not null default -1
);

-- ---------- balances ----------
create table public.balances (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  recorded_at timestamptz not null default now(),  -- ex "date" (data di sistema)
  user_date date not null,                          -- ex "userDate" (mese scelto dall'utente)

  bank numeric not null default 0,
  cash numeric not null default 0,
  digital_services numeric not null default 0,
  stocks numeric not null default 0,
  etf numeric not null default 0,
  bitcoin numeric not null default 0,
  crypto numeric not null default 0,
  bonds numeric not null default 0,
  funds numeric not null default 0,
  gold numeric not null default 0,
  emergency_fund numeric not null default 0
);

create index balances_user_date_idx on public.balances (user_id, user_date desc, recorded_at desc);

-- ---------- user_categories (sotto-categorie personalizzate, figlie di un tag ufficiale) ----------
-- L'utente crea etichette proprie ("Cena con amici") agganciate a una categoria
-- "ufficiale" esistente (parent_tag_id, tipo expense o income). Le statistiche/
-- rankings continuano a raggruppare sempre per il tag ufficiale (expenses.category_tag_id,
-- mai toccato): user_category_id è solo un layer di visualizzazione personale.
create table public.user_categories (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  parent_tag_id bigint not null references public.tags(id),
  label text not null,
  created_at timestamptz not null default now(),
  unique (user_id, parent_tag_id, label)
);

create index user_categories_user_idx on public.user_categories (user_id);

-- ---------- investment_instruments (catalogo canonico strumenti verificati) ----------
-- Strumenti confrontabili tra utenti. Le posizioni utente devono referenziare
-- questo catalogo invece di salvare testo libero: così "AAPL", "Apple" e
-- "NASDAQ:AAPL" diventano lo stesso strumento per statistiche anonime e analisi.
create table public.investment_instruments (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('stock', 'etf', 'crypto', 'bond', 'fund', 'commodity', 'other')),
  symbol text not null,
  exchange text,
  name text not null,
  currency text,
  country text,
  sector text,
  industry text,
  figi text,
  isin text,
  coingecko_id text,
  provider text not null default 'manual',
  verified boolean not null default true,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create unique index investment_instruments_symbol_exchange_uidx
  on public.investment_instruments (kind, symbol, coalesce(exchange, ''));
create unique index investment_instruments_figi_uidx on public.investment_instruments (figi) where figi is not null;
create unique index investment_instruments_isin_uidx on public.investment_instruments (isin) where isin is not null;
create unique index investment_instruments_coingecko_uidx on public.investment_instruments (coingecko_id) where coingecko_id is not null;
create index investment_instruments_search_idx
  on public.investment_instruments using gin (
    to_tsvector('simple', symbol || ' ' || name || ' ' || coalesce(isin, '') || ' ' || coalesce(coingecko_id, ''))
  );
create index investment_instruments_kind_idx on public.investment_instruments (kind, active);

-- ---------- user_investment_holdings (dettaglio opzionale portafoglio) ----------
-- Layer più specifico dei saldi mensili: il saldo "ETF" resta aggregato in balances,
-- mentre qui l'utente può indicare strumenti specifici verificati. Gli aggregati
-- pubblici vanno sempre calcolati su instrument_id e con soglie minime privacy.
create table public.user_investment_holdings (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  instrument_id bigint not null references public.investment_instruments(id),
  asset_key text not null check (asset_key in ('stocks', 'etf', 'bitcoin', 'crypto', 'bonds', 'funds', 'gold')),
  position_type text not null default 'single' check (position_type in ('single', 'pac', 'other')),
  quantity numeric,
  average_price numeric,
  current_value numeric,
  invested_amount numeric,
  currency text not null default 'EUR',
  notes text not null default '',
  updated_at timestamptz not null default now(),
  unique (user_id, instrument_id)
);

create index user_investment_holdings_user_idx on public.user_investment_holdings (user_id, updated_at desc);
create index user_investment_holdings_instrument_idx on public.user_investment_holdings (instrument_id);

-- ---------- expenses (outflows + incomes, discriminati da is_expense) ----------
create table public.expenses (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  occurred_at timestamptz not null default now(),  -- ex "date"
  amount numeric not null,
  is_expense boolean not null,                     -- true = outflow, false = income
  notes text,                                       -- cifrato app-side (AES-256-GCM, vedi server/src/db/crypto.ts) — mai testo in chiaro nel DB
  payment_type_tag_id bigint not null references public.tags(id),
  category_tag_id bigint not null references public.tags(id),  -- categoria "ufficiale": SEMPRE valorizzata, usata per stats/rank
  user_category_id bigint references public.user_categories(id) on delete set null  -- etichetta personalizzata opzionale (solo visualizzazione)
);

create index expenses_user_date_idx on public.expenses (user_id, occurred_at desc);
create index expenses_user_isexpense_idx on public.expenses (user_id, is_expense, occurred_at desc);

-- ---------- deletions (coda cancellazione differita GDPR) ----------
create table public.deletions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  scheduled_for timestamptz not null
);

-- ============================================================
-- Row Level Security (difesa in profondità — il backend usa
-- comunque la service_role key che bypassa RLS)
-- ============================================================
alter table public.tags enable row level security;
alter table public.profiles enable row level security;
alter table public.balances enable row level security;
alter table public.expenses enable row level security;
alter table public.user_categories enable row level security;
alter table public.investment_instruments enable row level security;
alter table public.user_investment_holdings enable row level security;
alter table public.deletions enable row level security;

create policy "tags_select_authenticated" on public.tags
  for select to authenticated using (true);

create policy "profiles_own_row" on public.profiles
  for all to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create policy "balances_own_rows" on public.balances
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "expenses_own_rows" on public.expenses
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "user_categories_own_rows" on public.user_categories
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "investment_instruments_select_authenticated" on public.investment_instruments
  for select to authenticated using (active = true);

create policy "user_investment_holdings_own_rows" on public.user_investment_holdings
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "deletions_own_row" on public.deletions
  for select to authenticated using (auth.uid() = user_id);

-- ============================================================
-- Funzioni RPC — sostituiscono i loop N+1 lato applicativo con query
-- aggregate/finestre in una singola chiamata, sia per lo storico multi-anno
-- dei grafici sia per i ranking (invocate via supabase.rpc(...)).
-- ============================================================

-- Storico saldi: un valore per mese (l'ultimo inserito in quel mese), per
-- gli ultimi p_months mesi, o per tutta la storia se p_months è NULL.
-- Sostituisce il loop di 24 query in balances.ts::getYearlyBalanceByUserId.
create or replace function public.get_balance_history(p_user_id uuid, p_months integer default null)
returns table(
  month_start date,
  bank numeric, cash numeric, digital_services numeric, stocks numeric, etf numeric,
  bitcoin numeric, crypto numeric, bonds numeric, funds numeric, gold numeric, emergency_fund numeric,
  recorded_at timestamptz
)
language sql stable as $$
  with monthly as (
    select
      date_trunc('month', user_date)::date as month_start,
      bank, cash, digital_services, stocks, etf, bitcoin, crypto, bonds, funds, gold, emergency_fund,
      recorded_at,
      row_number() over (
        partition by date_trunc('month', user_date)
        order by user_date desc, recorded_at desc
      ) as rn
    from public.balances
    where user_id = p_user_id
      and (p_months is null or user_date >= (date_trunc('month', now()) - (p_months || ' months')::interval)::date)
  )
  select month_start, bank, cash, digital_services, stocks, etf, bitcoin, crypto, bonds, funds, gold, emergency_fund, recorded_at
  from monthly
  where rn = 1
  order by month_start desc;
$$;

-- Totali entrate/uscite per mese, aggregati direttamente in SQL (nessun
-- dettaglio di singola transazione restituito: usato per i grafici storici
-- multi-anno senza dover trasferire anni di transazioni al client).
create or replace function public.get_monthly_totals(p_user_id uuid, p_months integer default null)
returns table(month_start date, total_outflows numeric, total_incomes numeric)
language sql stable as $$
  select
    date_trunc('month', occurred_at)::date as month_start,
    coalesce(sum(amount) filter (where is_expense), 0) as total_outflows,
    coalesce(sum(amount) filter (where not is_expense), 0) as total_incomes
  from public.expenses
  where user_id = p_user_id
    and (p_months is null or occurred_at >= (date_trunc('month', now()) - (p_months || ' months')::interval))
  group by date_trunc('month', occurred_at)
  order by month_start desc;
$$;

-- Pool di saldi totali (ultimo saldo precedente al mese corrente) per il
-- ranking: tutti gli utenti, o solo quelli "simili" a p_reference_user
-- (stesso jobType/jobCountry/workTime) se specificato. Il calcolo del
-- percentile resta lato applicativo (server/src/routes/private/rank.ts),
-- qui si ottimizza solo il fetch (1 query invece di N).
create or replace function public.get_balance_ranking_pool(
  p_reference_user uuid default null,
  p_ignore_test_demo boolean default true
)
returns table(user_id uuid, total_balance numeric)
language sql stable as $$
  with reference as (
    select job_type_tag_id, job_country_tag_id, work_time_tag_id
    from public.profiles where id = p_reference_user
  ),
  eligible as (
    select p.id from public.profiles p
    where (not p_ignore_test_demo or p.account_type < 2)
      and (p_reference_user is null or (
        p.job_type_tag_id is not distinct from (select job_type_tag_id from reference) and
        p.job_country_tag_id is not distinct from (select job_country_tag_id from reference) and
        p.work_time_tag_id is not distinct from (select work_time_tag_id from reference)
      ))
  )
  select distinct on (b.user_id) b.user_id,
    (b.bank + b.cash + b.digital_services + b.stocks + b.etf + b.bitcoin + b.crypto + b.bonds + b.funds + b.gold) as total_balance
  from public.balances b
  join eligible e on e.id = b.user_id
  where b.user_date < date_trunc('month', now())::date
  order by b.user_id, b.user_date desc, b.recorded_at desc;
$$;

-- Pool di spese/entrate totali del mese p_month per il ranking, stesso
-- principio di sopra (cohort "tutti" o "simili").
create or replace function public.get_expense_ranking_pool(
  p_reference_user uuid default null,
  p_is_expense boolean default true,
  p_month date default null
)
returns table(user_id uuid, total_amount numeric)
language sql stable as $$
  with reference as (
    select job_type_tag_id, job_country_tag_id, work_time_tag_id
    from public.profiles where id = p_reference_user
  ),
  eligible as (
    select p.id from public.profiles p
    where p.account_type < 2
      and (p_reference_user is null or (
        p.job_type_tag_id is not distinct from (select job_type_tag_id from reference) and
        p.job_country_tag_id is not distinct from (select job_country_tag_id from reference) and
        p.work_time_tag_id is not distinct from (select work_time_tag_id from reference)
      ))
  ),
  target_month as (
    select coalesce(p_month, (date_trunc('month', now()) - interval '1 month')::date) as m
  )
  select e.user_id, sum(e.amount) as total_amount
  from public.expenses e
  join eligible el on el.id = e.user_id
  cross join target_month tm
  where e.is_expense = p_is_expense
    and e.occurred_at >= tm.m
    and e.occurred_at < (tm.m + interval '1 month')
  group by e.user_id;
$$;

-- ============================================================
-- NOTA PERFORMANCE: averages.ts (medie utenti, cron giornaliero) resta
-- basato su loop applicativo — è fuori dal path di richiesta interattivo
-- (gira 1 volta/giorno via /api/cron/refresh-user-averages, con 300s di
-- budget grazie a Fluid Compute) e non è stato quindi la priorità di questa
-- ottimizzazione. Da rivedere se la userbase crescesse molto.
-- ============================================================
