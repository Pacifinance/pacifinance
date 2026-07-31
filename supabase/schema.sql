-- ============================================================
-- Pacifinance — Schema Postgres per Supabase
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
  benchmark_consent boolean not null default false,
  benchmark_consent_at timestamptz,
  benchmark_consent_revoked_at timestamptz,
  seen_badges jsonb not null default '[]'::jsonb,
  is_admin boolean not null default false,

  expenses_limit numeric not null default -1,
  savings_percent numeric not null default -1,
  emergency_fund_goal numeric not null default -1,
  expenses_limit_percent numeric check (expenses_limit_percent is null or expenses_limit_percent between 0 and 100),
  expenses_limit_percent_enabled boolean not null default true,
  savings_amount_goal numeric check (savings_amount_goal is null or savings_amount_goal >= 0),
  savings_amount_goal_enabled boolean not null default true,
  emergency_fund_months numeric check (emergency_fund_months is null or emergency_fund_months >= 0),
  emergency_fund_months_enabled boolean not null default true,
  fixed_expenses_percent numeric check (fixed_expenses_percent is null or fixed_expenses_percent between 0 and 100),
  category_spending_limits jsonb not null default '{}'::jsonb,
  debt_reduction_goal numeric check (debt_reduction_goal is null or debt_reduction_goal >= 0),
  position_concentration_limit numeric check (position_concentration_limit is null or position_concentration_limit between 0 and 100),
  asset_category_concentration_limit numeric check (asset_category_concentration_limit is null or asset_category_concentration_limit between 0 and 100),
  annual_passive_income_goal numeric check (annual_passive_income_goal is null or annual_passive_income_goal >= 0)
);

create index profiles_benchmark_consent_idx on public.profiles (benchmark_consent) where benchmark_consent;

-- Monthly, versioned profile buckets used by community benchmarks. These
-- snapshots intentionally exclude every financial value and free-text field.
create table public.benchmark_runs (
  month_start date primary key,
  algorithm_version text not null,
  generated_at timestamptz not null default now(),
  contributor_count integer not null default 0
);

create table public.benchmark_profile_snapshots (
  month_start date not null references public.benchmark_runs(month_start) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  account_type smallint not null,
  job_country_tag_id bigint references public.tags(id), job_tag_id bigint references public.tags(id),
  job_type_tag_id bigint references public.tags(id), work_time_tag_id bigint references public.tags(id),
  remote_type_tag_id bigint references public.tags(id), living_situation_tag_id bigint references public.tags(id),
  housing_type_tag_id bigint references public.tags(id), children_tag_id bigint references public.tags(id),
  country_tag_id bigint references public.tags(id), age_tag_id bigint references public.tags(id),
  years_of_experience_tag_id bigint references public.tags(id),
  primary key (month_start, user_id)
);

create index benchmark_profile_snapshots_month_idx on public.benchmark_profile_snapshots (month_start, account_type);

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
  commodities numeric not null default 0,
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
  asset_key text not null check (asset_key in ('stocks', 'etf', 'bitcoin', 'crypto', 'bonds', 'funds', 'commodities')),
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

-- ---------- user_liquidity_accounts (sotto-conti opzionali per bank/cash/digitalServices/emergencyFund) ----------
-- Come user_investment_holdings ma senza catalogo condiviso: qui l'etichetta è testo
-- libero (es. "Intesa Sanpaolo", "Satispay"), non c'è nulla da verificare con provider
-- esterni. La somma dei sotto-conti di un asset_key sostituisce il valore aggregato
-- inserito manualmente in balances per quell'asset, quando ne esiste almeno uno.
create table public.user_liquidity_accounts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  asset_key text not null check (asset_key in ('bank', 'cash', 'digitalServices', 'emergencyFund')),
  label text not null,
  current_value numeric not null default 0,
  currency text not null default 'EUR',
  notes text not null default '',
  updated_at timestamptz not null default now()
);

create index user_liquidity_accounts_user_idx on public.user_liquidity_accounts (user_id, asset_key, updated_at desc);

-- ---------- user_investment_holding_history / user_liquidity_account_history ----------
-- Storico append-only, stesso principio di "balances": ogni volta che l'utente
-- aggiorna il bilancio mensile (POST /balances/add), si scatta uno snapshot degli
-- holding/conti correnti. holding_id/account_id usano "on delete set null" (non
-- cascade): se l'utente elimina un holding, lo storico resta — per questo
-- symbol/name/label sono denormalizzati qui, per restare leggibili anche se lo
-- strumento/holding live cambia o sparisce. In futuro l'aggiornamento automatico
-- dei prezzi potrà scrivere qui con la sua cadenza (es. giornaliera), senza
-- bisogno di modificare lo schema.
create table public.user_investment_holding_history (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  holding_id bigint references public.user_investment_holdings(id) on delete set null,
  instrument_id bigint not null references public.investment_instruments(id),
  asset_key text not null,
  symbol text not null,
  name text not null,
  quantity numeric,
  average_price numeric,
  current_value numeric,
  invested_amount numeric,
  currency text not null default 'EUR',
  user_date date not null,
  recorded_at timestamptz not null default now()
);

create index user_investment_holding_history_user_idx
  on public.user_investment_holding_history (user_id, asset_key, user_date desc, recorded_at desc);

-- Un solo valore per (holding, mese): rende possibile l'upsert sia per lo
-- snapshot automatico sia per il backfill manuale di un mese passato. Parziale
-- perché holding_id diventa null quando l'holding live viene eliminato (on
-- delete set null) — quelle righe orfane non devono mai collidere tra loro.
create unique index user_investment_holding_history_uidx
  on public.user_investment_holding_history (user_id, holding_id, user_date)
  where holding_id is not null;

create table public.user_liquidity_account_history (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id bigint references public.user_liquidity_accounts(id) on delete set null,
  asset_key text not null,
  label text not null,
  current_value numeric not null,
  currency text not null default 'EUR',
  user_date date not null,
  recorded_at timestamptz not null default now()
);

create index user_liquidity_account_history_user_idx
  on public.user_liquidity_account_history (user_id, asset_key, user_date desc, recorded_at desc);

create unique index user_liquidity_account_history_uidx
  on public.user_liquidity_account_history (user_id, account_id, user_date)
  where account_id is not null;

-- ---------- user_goals (obiettivi personalizzati) ----------
-- goal_type è solo la categoria/icona mostrata in UI (invariata rispetto al modal
-- già esistente lato frontend). linked_asset_key è la parte nuova: se valorizzato,
-- il goal è "collegato" e current_value viene ricalcolato lato server dal saldo
-- corrente (vedi server/src/db/models/goals.ts) invece di essere letto dalla
-- colonna; se null, resta un goal manuale (l'utente scrive current_value a mano —
-- utile per risparmi "accantonati mentalmente" che non corrispondono a un conto
-- tracciato, es. una parte di un conto bancario non suddiviso in sotto-conti).
create table public.user_goals (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  goal_type text not null default 'savings' check (goal_type in ('savings', 'purchase', 'investment', 'debt')),
  target_value numeric not null,
  target_percent_of_net_worth numeric check (target_percent_of_net_worth is null or target_percent_of_net_worth between 0 and 100),
  current_value numeric not null default 0,
  linked_asset_key text check (linked_asset_key is null or linked_asset_key in (
    'bank', 'cash', 'digitalServices', 'emergencyFund',
    'stocks', 'etf', 'bitcoin', 'crypto', 'bonds', 'funds', 'commodities'
  )),
  deadline date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index user_goals_user_idx on public.user_goals (user_id, updated_at desc);

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
  user_category_id bigint references public.user_categories(id) on delete set null,  -- etichetta personalizzata opzionale (solo visualizzazione)
  -- fonte di bilancio scelta all'inserimento (opzionale): permette a eliminazione/modifica
  -- di proporre in automatico lo storno/ri-accredito sul campo esatto
  balance_asset_key text check (balance_asset_key in ('bank', 'cash', 'digitalServices', 'emergencyFund',
    'stocks', 'etf', 'bitcoin', 'crypto', 'bonds', 'funds', 'commodities')),
  balance_detail_type text check (balance_detail_type in ('liquidity', 'investment')),  -- valorizzato solo se è stato scelto un sotto-conto specifico
  balance_detail_id bigint  -- soft reference a user_liquidity_accounts / user_investment_holdings (nessuna FK: il sotto-conto può essere eliminato)
);

create index expenses_user_date_idx on public.expenses (user_id, occurred_at desc);
create index expenses_user_isexpense_idx on public.expenses (user_id, is_expense, occurred_at desc);

-- ---------- recurring_transactions (abbonamenti, affitto, stipendio ...) ----------
-- Template che un cron giornaliero trasforma in una riga expenses reale quando dovuto.
-- Non tocca mai automaticamente un bilancio (nessun utente presente per confermare
-- in un cron run, e l'importo potrebbe essere cambiato dall'ultima esecuzione).
create table public.recurring_transactions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  is_expense boolean not null,
  amount numeric not null,
  notes text,                                       -- cifrato app-side (AES-256-GCM)
  payment_type_tag_id bigint references public.tags(id),   -- null per le entrate
  category_tag_id bigint not null references public.tags(id),
  user_category_id bigint references public.user_categories(id) on delete set null,
  day_of_month smallint not null check (day_of_month between 1 and 28),
  active boolean not null default true,
  next_run_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index recurring_transactions_user_idx on public.recurring_transactions (user_id);
create index recurring_transactions_due_idx on public.recurring_transactions (next_run_date) where active;

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
alter table public.user_liquidity_accounts enable row level security;
alter table public.user_investment_holding_history enable row level security;
alter table public.user_liquidity_account_history enable row level security;
alter table public.user_goals enable row level security;
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

create policy "user_liquidity_accounts_own_rows" on public.user_liquidity_accounts
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "user_investment_holding_history_select_own" on public.user_investment_holding_history
  for select to authenticated using (auth.uid() = user_id);

create policy "user_investment_holding_history_insert_own" on public.user_investment_holding_history
  for insert to authenticated with check (auth.uid() = user_id);

create policy "user_investment_holding_history_update_own" on public.user_investment_holding_history
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "user_liquidity_account_history_select_own" on public.user_liquidity_account_history
  for select to authenticated using (auth.uid() = user_id);

create policy "user_liquidity_account_history_insert_own" on public.user_liquidity_account_history
  for insert to authenticated with check (auth.uid() = user_id);

create policy "user_liquidity_account_history_update_own" on public.user_liquidity_account_history
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "user_goals_own_rows" on public.user_goals
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
  bitcoin numeric, crypto numeric, bonds numeric, funds numeric, commodities numeric, emergency_fund numeric,
  recorded_at timestamptz
)
language sql stable as $$
  with monthly as (
    select
      date_trunc('month', user_date)::date as month_start,
      bank, cash, digital_services, stocks, etf, bitcoin, crypto, bonds, funds, commodities, emergency_fund,
      recorded_at,
      row_number() over (
        partition by date_trunc('month', user_date)
        order by user_date desc, recorded_at desc
      ) as rn
    from public.balances
    where user_id = p_user_id
      and (p_months is null or user_date >= (date_trunc('month', now()) - (p_months || ' months')::interval)::date)
  )
  select month_start, bank, cash, digital_services, stocks, etf, bitcoin, crypto, bonds, funds, commodities, emergency_fund, recorded_at
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
-- ranking: tutti gli utenti, o solo quelli in p_user_ids se specificato.
-- Cohort membership ("simili" = similarità pesata su tutti i campi profilo,
-- non solo jobType/jobCountry/workTime) è risolta lato applicativo in
-- server/src/services/similarUsers.ts - unica fonte di verità, sia per questo
-- ranking sia per le medie giornaliere (averages.ts). Il calcolo del
-- percentile resta lato applicativo (server/src/routes/private/rank.ts),
-- qui si ottimizza solo il fetch (1 query invece di N).
create or replace function public.get_balance_ranking_pool(
  p_user_ids uuid[] default null,
  p_ignore_test_demo boolean default true
)
returns table(user_id uuid, total_balance numeric)
language sql stable as $$
  with eligible as (
    select p.id from public.profiles p
    where (not p_ignore_test_demo or p.account_type < 2)
      and (p_user_ids is null or p.id = any(p_user_ids))
  )
  select distinct on (b.user_id) b.user_id,
    (b.bank + b.cash + b.digital_services + b.stocks + b.etf + b.bitcoin + b.crypto + b.bonds + b.funds + b.commodities) as total_balance
  from public.balances b
  join eligible e on e.id = b.user_id
  where b.user_date < date_trunc('month', now())::date
  order by b.user_id, b.user_date desc, b.recorded_at desc;
$$;

-- Pool di spese/entrate totali del mese p_month per il ranking, stesso
-- principio di sopra (cohort "tutti" o esplicita per p_user_ids - vedi nota sopra).
create or replace function public.get_expense_ranking_pool(
  p_user_ids uuid[] default null,
  p_is_expense boolean default true,
  p_month date default null
)
returns table(user_id uuid, total_amount numeric)
language sql stable as $$
  with eligible as (
    select p.id from public.profiles p
    where p.account_type < 2
      and (p_user_ids is null or p.id = any(p_user_ids))
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

-- Source rows for all community benchmarks. The application selects cohorts
-- from profile fields, then aggregates these compact numeric rows in memory;
-- a refresh therefore needs one SQL round trip, not one query per month/user.
create or replace function public.get_benchmark_metric_rows(
  p_user_ids uuid[],
  p_current_month date default date_trunc('month', now())::date
)
returns table(
  user_id uuid,
  balance_total numeric,
  asset_allocation jsonb,
  monthly_income numeric,
  monthly_expenses numeric,
  yearly_income numeric,
  yearly_expenses numeric,
  yearly_expenses_by_category jsonb
)
language sql stable as $$
  with eligible as (
    select unnest(p_user_ids) as user_id
  ),
  latest_balances as (
    select distinct on (b.user_id)
      b.user_id,
      totals.balance_total,
      case when totals.balance_total > 0 then jsonb_build_object(
        'liquid', round(totals.liquid / totals.balance_total * 100, 2),
        'investments', round(totals.investments / totals.balance_total * 100, 2),
        'crypto', round(totals.crypto / totals.balance_total * 100, 2)
      ) end as asset_allocation
    from public.balances b
    cross join lateral (select
      b.bank + b.cash + b.digital_services + b.emergency_fund as liquid,
      b.stocks + b.etf + b.bonds + b.funds + b.commodities as investments,
      b.bitcoin + b.crypto as crypto,
      b.bank + b.cash + b.digital_services + b.emergency_fund + b.stocks + b.etf + b.bonds + b.funds + b.commodities + b.bitcoin + b.crypto as balance_total
    ) totals
    join eligible e on e.user_id = b.user_id
    where b.user_date < p_current_month
    order by b.user_id, b.user_date desc, b.recorded_at desc
  ),
  monthly_totals as (
    select e.user_id,
      sum(e.amount) filter (where not e.is_expense) as monthly_income,
      sum(e.amount) filter (where e.is_expense) as monthly_expenses
    from public.expenses e
    join eligible u on u.user_id = e.user_id
    where e.occurred_at >= (p_current_month - interval '1 month') and e.occurred_at < p_current_month
    group by e.user_id
  ),
  yearly_totals as (
    select e.user_id,
      sum(e.amount) filter (where not e.is_expense) as yearly_income,
      sum(e.amount) filter (where e.is_expense) as yearly_expenses
    from public.expenses e
    join eligible u on u.user_id = e.user_id
    where e.occurred_at >= (p_current_month - interval '12 months') and e.occurred_at < p_current_month
    group by e.user_id
  ),
  category_totals as (
    select e.user_id, t.client_index, sum(e.amount) as total_amount
    from public.expenses e
    join eligible u on u.user_id = e.user_id
    join public.tags t on t.id = e.category_tag_id
    where e.is_expense and e.occurred_at >= (p_current_month - interval '12 months') and e.occurred_at < p_current_month
    group by e.user_id, t.client_index
  ),
  categories as (
    select user_id, jsonb_object_agg(client_index::text, total_amount) as yearly_expenses_by_category
    from category_totals group by user_id
  )
  select u.user_id, b.balance_total, b.asset_allocation, m.monthly_income, m.monthly_expenses,
    y.yearly_income, y.yearly_expenses, coalesce(c.yearly_expenses_by_category, '{}'::jsonb)
  from eligible u
  left join latest_balances b on b.user_id = u.user_id
  left join monthly_totals m on m.user_id = u.user_id
  left join yearly_totals y on y.user_id = u.user_id
  left join categories c on c.user_id = u.user_id;
$$;
