-- Makes user_investment_holding_history / user_liquidity_account_history
-- upsertable: one row per (holding/account, month), instead of the append-only
-- log they started as. Partial index (only where the FK is non-null) so
-- orphaned rows left behind by a deleted live holding/account (holding_id /
-- account_id -> null via "on delete set null") never collide with each other
-- or with new rows.

create unique index if not exists user_investment_holding_history_uidx
  on public.user_investment_holding_history (user_id, holding_id, user_date)
  where holding_id is not null;

create unique index if not exists user_liquidity_account_history_uidx
  on public.user_liquidity_account_history (user_id, account_id, user_date)
  where account_id is not null;

-- Parity with user_investment_holdings' policy style (writes actually go
-- through the service-role client, which bypasses RLS - see
-- server/src/db/supabase.ts - but keep the policy set consistent/documented
-- for anyone reading the schema).
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'user_investment_holding_history'
      and policyname = 'user_investment_holding_history_insert_own'
  ) then
    create policy "user_investment_holding_history_insert_own" on public.user_investment_holding_history
      for insert to authenticated with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'user_investment_holding_history'
      and policyname = 'user_investment_holding_history_update_own'
  ) then
    create policy "user_investment_holding_history_update_own" on public.user_investment_holding_history
      for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'user_liquidity_account_history'
      and policyname = 'user_liquidity_account_history_insert_own'
  ) then
    create policy "user_liquidity_account_history_insert_own" on public.user_liquidity_account_history
      for insert to authenticated with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'user_liquidity_account_history'
      and policyname = 'user_liquidity_account_history_update_own'
  ) then
    create policy "user_liquidity_account_history_update_own" on public.user_liquidity_account_history
      for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;
