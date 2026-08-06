-- Separates cash-flow direction from the economic purpose of a transaction.
-- Existing investment-category outflows can be classified deterministically;
-- ambiguous historical movements remain ordinary expenses/incomes until the
-- user explicitly reclassifies them.

alter table public.transactions
  add column if not exists purpose text;

update public.transactions tx
set purpose = case
  when tx.is_expense = false then 'income'
  when exists (
    select 1 from public.tags tag
    where tag.id = tx.category_tag_id
      and tag.type = 0
      and tag.client_index = 8
  ) then 'investment'
  when exists (
    select 1 from public.tags tag
    where tag.id = tx.category_tag_id
      and tag.type = 0
      and tag.client_index = 10
  ) then 'tax'
  else 'expense'
end
where tx.purpose is null;

alter table public.transactions
  alter column purpose set not null;

alter table public.transactions
  alter column purpose set default 'other';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'transactions_purpose_check') then
    alter table public.transactions add constraint transactions_purpose_check
      check (purpose in ('income', 'expense', 'investment', 'transfer', 'debt', 'tax', 'refund', 'other'));
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'transactions_direction_purpose_check') then
    alter table public.transactions add constraint transactions_direction_purpose_check check (
      (direction = 'outflow' and purpose not in ('income', 'refund'))
      or (direction = 'income' and purpose not in ('expense', 'tax'))
    );
  end if;
end $$;

create index if not exists transactions_user_purpose_date_idx
  on public.transactions (user_id, purpose, occurred_at desc);

alter table public.recurring_transactions
  add column if not exists purpose text;

update public.recurring_transactions recurring
set purpose = case
  when recurring.is_expense = false then 'income'
  when exists (
    select 1 from public.tags tag
    where tag.id = recurring.category_tag_id
      and tag.type = 0
      and tag.client_index = 8
  ) then 'investment'
  when exists (
    select 1 from public.tags tag
    where tag.id = recurring.category_tag_id
      and tag.type = 0
      and tag.client_index = 10
  ) then 'tax'
  else 'expense'
end
where recurring.purpose is null;

alter table public.recurring_transactions
  alter column purpose set not null;

alter table public.recurring_transactions
  alter column purpose set default 'other';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'recurring_transactions_purpose_check') then
    alter table public.recurring_transactions add constraint recurring_transactions_purpose_check
      check (purpose in ('income', 'expense', 'investment', 'transfer', 'debt', 'tax', 'refund', 'other'));
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'recurring_transactions_direction_purpose_check') then
    alter table public.recurring_transactions add constraint recurring_transactions_direction_purpose_check check (
      (is_expense and purpose not in ('income', 'refund'))
      or (not is_expense and purpose not in ('expense', 'tax'))
    );
  end if;
end $$;

comment on column public.transactions.purpose is
  'Economic purpose, independent from income/outflow direction. Transfers and investments can therefore be excluded from spending.';
