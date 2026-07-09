-- Replaces the hardcoded "similar = same jobType/jobCountry/workTime" match
-- baked into get_balance_ranking_pool/get_expense_ranking_pool with an
-- explicit user-id list: cohort selection (weighted similarity across all
-- profile fields, adaptive sizing, anonymity floor) now lives in exactly one
-- place, server/src/services/similarUsers.ts, instead of being duplicated
-- between these two SQL functions and the old users.getAllUsersIds() branch.
-- The parameter signature changes (uuid -> uuid[]), so the old overloads are
-- dropped explicitly rather than replaced in place.

drop function if exists public.get_balance_ranking_pool(uuid, boolean);
drop function if exists public.get_expense_ranking_pool(uuid, boolean, date);

-- Pool di saldi totali (ultimo saldo precedente al mese corrente) per il
-- ranking: tutti gli utenti, o solo quelli in p_user_ids se specificato.
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
    (b.bank + b.cash + b.digital_services + b.stocks + b.etf + b.bitcoin + b.crypto + b.bonds + b.funds + b.gold) as total_balance
  from public.balances b
  join eligible e on e.id = b.user_id
  where b.user_date < date_trunc('month', now())::date
  order by b.user_id, b.user_date desc, b.recorded_at desc;
$$;

-- Pool di spese/entrate totali del mese p_month per il ranking, stesso
-- principio di sopra (cohort "tutti" o esplicita per p_user_ids).
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
