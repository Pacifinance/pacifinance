-- Community benchmark source data in one round trip. The application selects
-- anonymous cohorts in memory, so this function returns only numeric totals
-- and official parent-category indexes, never transaction notes or details.
create or replace function public.get_benchmark_metric_rows(
  p_user_ids uuid[],
  p_current_month date default date_trunc('month', now())::date
)
returns table(
  user_id uuid,
  balance_total numeric,
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
      (b.bank + b.cash + b.digital_services + b.stocks + b.etf + b.bitcoin + b.crypto + b.bonds + b.funds + b.commodities + b.emergency_fund) as balance_total
    from public.balances b
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
    where e.occurred_at >= (p_current_month - interval '1 month')
      and e.occurred_at < p_current_month
    group by e.user_id
  ),
  yearly_totals as (
    select e.user_id,
      sum(e.amount) filter (where not e.is_expense) as yearly_income,
      sum(e.amount) filter (where e.is_expense) as yearly_expenses
    from public.expenses e
    join eligible u on u.user_id = e.user_id
    where e.occurred_at >= (p_current_month - interval '12 months')
      and e.occurred_at < p_current_month
    group by e.user_id
  ),
  category_totals as (
    select e.user_id, t.client_index, sum(e.amount) as total_amount
    from public.expenses e
    join eligible u on u.user_id = e.user_id
    join public.tags t on t.id = e.category_tag_id
    where e.is_expense
      and e.occurred_at >= (p_current_month - interval '12 months')
      and e.occurred_at < p_current_month
    group by e.user_id, t.client_index
  ),
  categories as (
    select user_id, jsonb_object_agg(client_index::text, total_amount) as yearly_expenses_by_category
    from category_totals
    group by user_id
  )
  select u.user_id, b.balance_total, m.monthly_income, m.monthly_expenses,
    y.yearly_income, y.yearly_expenses,
    coalesce(c.yearly_expenses_by_category, '{}'::jsonb)
  from eligible u
  left join latest_balances b on b.user_id = u.user_id
  left join monthly_totals m on m.user_id = u.user_id
  left join yearly_totals y on y.user_id = u.user_id
  left join categories c on c.user_id = u.user_id;
$$;
