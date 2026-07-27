-- Tracks money fronted for a group (e.g. paying an Uber/dinner for everyone
-- on vacation) that is expected back from other people. The outflow itself
-- is inserted normally with amount = the user's own share only (so category
-- totals/analysis stay correct — the group payment never inflates a single
-- category); this table tracks the remaining "credito verso terzi" the user
-- is still owed, settled independently and without ever creating a fake
-- income record when the money comes back.
--
-- notes is encrypted app-side (AES-256-GCM, see server/src/db/crypto.ts),
-- same convention as expenses.notes.

create table public.shared_expense_receivables (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  occurred_at date not null,
  notes text,
  total_amount numeric not null check (total_amount > 0),
  own_share numeric not null check (own_share >= 0),
  receivable_amount numeric not null check (receivable_amount > 0),
  settled_amount numeric not null default 0 check (settled_amount >= 0),
  created_at timestamptz not null default now()
);

create index shared_expense_receivables_user_idx on public.shared_expense_receivables (user_id);
