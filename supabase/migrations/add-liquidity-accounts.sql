-- Optional detailed sub-accounts for liquidity assets (bank/cash/digitalServices/emergencyFund).
-- Same idea as user_investment_holdings, but with a free-text label instead of a
-- shared catalog reference: there's nothing to verify against an external provider here.

create table if not exists public.user_liquidity_accounts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  asset_key text not null check (asset_key in ('bank', 'cash', 'digitalServices', 'emergencyFund')),
  label text not null,
  current_value numeric not null default 0,
  currency text not null default 'EUR',
  notes text not null default '',
  updated_at timestamptz not null default now()
);

create index if not exists user_liquidity_accounts_user_idx
  on public.user_liquidity_accounts (user_id, asset_key, updated_at desc);

alter table public.user_liquidity_accounts enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'user_liquidity_accounts'
      and policyname = 'user_liquidity_accounts_own_rows'
  ) then
    create policy "user_liquidity_accounts_own_rows" on public.user_liquidity_accounts
      for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;
