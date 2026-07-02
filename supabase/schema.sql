-- ============================================================
-- PaciFinance — Schema Postgres per Supabase
-- Sostituisce le 5 collection MongoDB: users, balances, expenses, tags, deletions
-- Autenticazione gestita da Supabase Auth (auth.users) — email sintetica interna
-- {user_code}@users.pacifinance.internal, mai esposta all'utente (login resta userId+password)
--
-- Vedi docs/VERCEL_SUPABASE_MIGRATION.md per il contesto completo della migrazione.
-- ============================================================

create type tag_type as enum (
  'expense', 'income', 'payment', 'country', 'job', 'job_type',
  'work_time', 'remote_type', 'years_of_experience', 'age',
  'living_situation', 'housing_type', 'children', 'currency'
);

create type account_type as enum ('regular', 'premium', 'test', 'demo');

-- ---------- tags (lookup unificato: categorie, pagamenti, valute, campi profilo enum) ----------
create table public.tags (
  id bigint generated always as identity primary key,
  client_index integer not null,           -- ex "index" Mongo, usato dal frontend
  type tag_type not null,
  label text not null,
  translations jsonb not null default '{}'::jsonb,  -- {"en": "...", "it": "..."}
  unique (client_index, type)
);

-- ---------- profiles (1:1 con auth.users) ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  user_code text not null unique,          -- ex "userId" a 6 cifre, esposto all'utente
  nickname text not null default '',
  account_type account_type not null default 'regular',
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

  expenses_limit numeric not null default 0,
  savings_percent numeric not null default 0,
  emergency_fund_goal numeric not null default 0
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

-- ---------- expenses (outflows + incomes, discriminati da is_expense) ----------
create table public.expenses (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  occurred_at timestamptz not null default now(),  -- ex "date"
  amount numeric not null,
  is_expense boolean not null,                     -- true = outflow, false = income
  notes text,
  payment_type_tag_id bigint not null references public.tags(id),
  category_tag_id bigint not null references public.tags(id)
);

create index expenses_user_date_idx on public.expenses (user_id, occurred_at desc);
create index expenses_user_isexpense_idx on public.expenses (user_id, is_expense, occurred_at desc);

-- ---------- deletions (coda cancellazione differita GDPR) ----------
create table public.deletions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  scheduled_for timestamptz not null
);

-- ============================================================
-- Row Level Security (difesa in profondità — il backend userà
-- comunque la service_role key che bypassa RLS)
-- ============================================================
alter table public.tags enable row level security;
alter table public.profiles enable row level security;
alter table public.balances enable row level security;
alter table public.expenses enable row level security;
alter table public.deletions enable row level security;

create policy "tags_select_authenticated" on public.tags
  for select to authenticated using (true);

create policy "profiles_own_row" on public.profiles
  for all to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create policy "balances_own_rows" on public.balances
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "expenses_own_rows" on public.expenses
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "deletions_own_row" on public.deletions
  for select to authenticated using (auth.uid() = user_id);

-- ============================================================
-- Esempio di funzione aggregata per sostituire i loop N+1 di rank.ts
-- (adattare/estendere per expenses/averages con lo stesso pattern,
-- invocabile da supabase-js con supabase.rpc('get_balance_ranking'))
-- ============================================================
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
