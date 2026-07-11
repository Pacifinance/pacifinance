-- Broadens the "gold" asset from a single manual-only value into a full
-- "commodities" investment category with verified/curated holdings (see
-- seed-commodity-instruments.sql). Renaming the underlying identifier
-- (not just its i18n label) keeps the codebase's naming honest long-term.

alter table public.balances rename column gold to commodities;

alter table public.user_investment_holdings
  drop constraint if exists user_investment_holdings_asset_key_check;
alter table public.user_investment_holdings
  add constraint user_investment_holdings_asset_key_check
  check (asset_key in ('stocks', 'etf', 'bitcoin', 'crypto', 'bonds', 'funds', 'commodities'));

-- Safety only: no commodity holdings could exist before this migration
-- (the asset key wasn't verifiable/holdings-enabled until now), but this
-- keeps any stray row consistent instead of silently violating the new check.
update public.user_investment_holdings set asset_key = 'commodities' where asset_key = 'gold';
update public.user_investment_holding_history set asset_key = 'commodities' where asset_key = 'gold';

-- Re-point the two RPCs that reference the renamed column by name.
-- get_balance_history's return row shape changed (gold -> commodities), and
-- Postgres refuses to CREATE OR REPLACE a function when its OUT parameters
-- differ, so the old signature must be dropped first.
drop function if exists public.get_balance_history(uuid, integer);

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
