-- Persist the accounting meaning of imported shared expenses without mixing it
-- with their real cash movement. `amount` remains the user's personal share;
-- `cash_amount` is the amount that actually moved on the selected account.
-- Reimbursements remain auditable transactions but are excluded from income
-- statistics and linked to the receivable they settle.

alter table public.expenses
  add column if not exists cash_amount numeric,
  add column if not exists exclude_from_statistics boolean not null default false;

alter table public.shared_expense_receivables
  add column if not exists expense_id bigint references public.expenses(id) on delete cascade;

create unique index if not exists shared_expense_receivables_expense_idx
  on public.shared_expense_receivables (expense_id)
  where expense_id is not null;

create table if not exists public.shared_expense_reimbursements (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  receivable_id bigint not null references public.shared_expense_receivables(id) on delete cascade,
  expense_id bigint not null references public.expenses(id) on delete cascade,
  amount numeric not null check (amount > 0),
  created_at timestamptz not null default now(),
  unique (expense_id)
);

create index if not exists shared_expense_reimbursements_receivable_idx
  on public.shared_expense_reimbursements (user_id, receivable_id);

alter table public.shared_expense_reimbursements enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'shared_expense_reimbursements'
      and policyname = 'shared_expense_reimbursements_own_rows'
  ) then
    create policy "shared_expense_reimbursements_own_rows"
      on public.shared_expense_reimbursements
      for all to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

-- Keep historical charts aligned with the personal cost of shared expenses and
-- omit repayments, which restore liquidity but are not earned income.
create or replace function public.get_monthly_totals(p_user_id uuid, p_months integer default null)
returns table(month_start date, total_outflows numeric, total_incomes numeric)
language sql stable as $$
  select
    date_trunc('month', occurred_at)::date as month_start,
    coalesce(sum(amount) filter (where is_expense and not exclude_from_statistics), 0) as total_outflows,
    coalesce(sum(amount) filter (where not is_expense and not exclude_from_statistics), 0) as total_incomes
  from public.expenses
  where user_id = p_user_id
    and (p_months is null or occurred_at >= (date_trunc('month', now()) - (p_months || ' months')::interval))
  group by date_trunc('month', occurred_at)
  order by month_start desc;
$$;
