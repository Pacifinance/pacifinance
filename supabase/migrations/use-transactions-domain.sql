-- Canonical aggregate name: this table stores both income and outflow
-- transactions. PostgreSQL keeps foreign keys, indexes and stored-function
-- dependencies attached to the renamed relation automatically.

do $$
begin
  if to_regclass('public.transactions') is null and to_regclass('public.expenses') is not null then
    alter table public.expenses rename to transactions;
  end if;
end $$;

alter table public.transactions
  add column if not exists direction text
  generated always as (case when is_expense then 'outflow' else 'income' end) stored;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'transactions_direction_check') then
    alter table public.transactions
      add constraint transactions_direction_check check (direction in ('income', 'outflow'));
  end if;
end $$;

comment on table public.transactions is
  'Financial transactions. direction is canonical; is_expense remains the compatibility storage field for existing deployments.';
