-- Makes user_investment_holding_history / user_liquidity_account_history
-- upsertable: one row per (holding/account, month), instead of the append-only
-- log they started as.
--
-- NOT a partial index (no "where holding_id is not null"), even though
-- orphaned rows exist (holding_id / account_id -> null via "on delete set
-- null"). A first version of this migration used a partial index for that
-- reason, but it silently broke every upsert: the Supabase JS client's
-- `.upsert(rows, {onConflict: "user_id,holding_id,user_date"})` always emits
-- a plain `ON CONFLICT (col, col, col)` with no WHERE clause, and Postgres
-- only lets a bare column list infer a *partial* unique index when the
-- statement's own ON CONFLICT clause repeats that index's WHERE predicate
-- verbatim - which the JS client has no way to do. Every upsert therefore
-- failed with 42P10 ("no unique or exclusion constraint matching the ON
-- CONFLICT specification"), even though the index existed and looked correct
-- in `pg_indexes`. A plain (non-partial) unique index doesn't need the
-- predicate to protect orphaned rows anyway: Postgres unique indexes already
-- treat every NULL as distinct from every other NULL, so any number of rows
-- with holding_id/account_id NULL for the same user_id+user_date coexist
-- without conflicting - the partial predicate was solving a problem that
-- plain SQL NULL semantics already solve.

drop index if exists public.user_investment_holding_history_uidx;
create unique index user_investment_holding_history_uidx
  on public.user_investment_holding_history (user_id, holding_id, user_date);

drop index if exists public.user_liquidity_account_history_uidx;
create unique index user_liquidity_account_history_uidx
  on public.user_liquidity_account_history (user_id, account_id, user_date);

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
