-- Detailed investment portfolio support.
-- Canonical instruments are shared/verified; user holdings are private rows
-- pointing to those instruments so anonymous aggregate stats stay comparable.

create table if not exists public.investment_instruments (
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

create unique index if not exists investment_instruments_symbol_exchange_uidx
  on public.investment_instruments (kind, symbol, coalesce(exchange, ''));
create unique index if not exists investment_instruments_figi_uidx
  on public.investment_instruments (figi) where figi is not null;
create unique index if not exists investment_instruments_isin_uidx
  on public.investment_instruments (isin) where isin is not null;
create unique index if not exists investment_instruments_coingecko_uidx
  on public.investment_instruments (coingecko_id) where coingecko_id is not null;
create index if not exists investment_instruments_search_idx
  on public.investment_instruments using gin (
    to_tsvector('simple', symbol || ' ' || name || ' ' || coalesce(isin, '') || ' ' || coalesce(coingecko_id, ''))
  );
create index if not exists investment_instruments_kind_idx
  on public.investment_instruments (kind, active);

create table if not exists public.user_investment_holdings (
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

create index if not exists user_investment_holdings_user_idx
  on public.user_investment_holdings (user_id, updated_at desc);
create index if not exists user_investment_holdings_instrument_idx
  on public.user_investment_holdings (instrument_id);

alter table public.investment_instruments enable row level security;
alter table public.user_investment_holdings enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'investment_instruments'
      and policyname = 'investment_instruments_select_authenticated'
  ) then
    create policy "investment_instruments_select_authenticated" on public.investment_instruments
      for select to authenticated using (active = true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'user_investment_holdings'
      and policyname = 'user_investment_holdings_own_rows'
  ) then
    create policy "user_investment_holdings_own_rows" on public.user_investment_holdings
      for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;
