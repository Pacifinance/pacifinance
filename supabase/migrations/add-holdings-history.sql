-- Append-only history for investment holdings and liquidity accounts, same
-- principle as "balances": every time the user updates their monthly balance
-- (POST /balances/add), a snapshot of the current holdings/accounts is taken.
--
-- holding_id/account_id use "on delete set null" (not cascade): deleting a live
-- holding must not erase its history — symbol/name/label are denormalized here
-- so the history stays readable even if the live row changes or disappears.

create table if not exists public.user_investment_holding_history (
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

create index if not exists user_investment_holding_history_user_idx
  on public.user_investment_holding_history (user_id, asset_key, user_date desc, recorded_at desc);

create table if not exists public.user_liquidity_account_history (
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

create index if not exists user_liquidity_account_history_user_idx
  on public.user_liquidity_account_history (user_id, asset_key, user_date desc, recorded_at desc);

alter table public.user_investment_holding_history enable row level security;
alter table public.user_liquidity_account_history enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'user_investment_holding_history'
      and policyname = 'user_investment_holding_history_select_own'
  ) then
    create policy "user_investment_holding_history_select_own" on public.user_investment_holding_history
      for select to authenticated using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'user_liquidity_account_history'
      and policyname = 'user_liquidity_account_history_select_own'
  ) then
    create policy "user_liquidity_account_history_select_own" on public.user_liquidity_account_history
      for select to authenticated using (auth.uid() = user_id);
  end if;
end $$;
