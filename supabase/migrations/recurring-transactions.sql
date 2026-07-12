-- Recurring outflows/incomes (subscriptions, rent, salary, ...): a template
-- that a daily cron turns into a real `expenses` row when due, instead of
-- the user re-entering the same transaction every month.
--
-- Auto-inserted transactions never touch any balance snapshot automatically
-- (same as a manual insert with no balance source chosen) — there's no user
-- present in a cron run to confirm a balance change, and the amount may have
-- drifted since the template was created.

create table public.recurring_transactions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  is_expense boolean not null,
  amount numeric not null,
  notes text,                                       -- cifrato app-side (AES-256-GCM, vedi server/src/db/crypto.ts)
  payment_type_tag_id bigint references public.tags(id),   -- null per le entrate
  category_tag_id bigint not null references public.tags(id),
  user_category_id bigint references public.user_categories(id) on delete set null,
  day_of_month smallint not null check (day_of_month between 1 and 28),  -- 28 evita edge case di febbraio
  active boolean not null default true,
  next_run_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index recurring_transactions_user_idx on public.recurring_transactions (user_id);
create index recurring_transactions_due_idx on public.recurring_transactions (next_run_date) where active;
