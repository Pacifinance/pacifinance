-- Lets a recurring transaction template (subscription, rent, salary...) carry
-- the same optional balance source a one-off transaction already can (see
-- expense-balance-source.sql) - which account/sub-account the money is taken
-- from or added to. The daily cron (runDueTemplate, server/src/db/models/
-- recurringTransactions.ts) copies it onto the generated transaction row AND
-- applies the balance delta itself when the template fires (no client present
-- to do it, unlike a manually-entered transaction), so an automated rent
-- payment or salary deposit actually moves the selected account's balance.
--
-- All three columns are nullable: existing templates and "no source" ones
-- stay valid and simply never move any balance when they fire, same as today.

alter table public.recurring_transactions
  add column if not exists balance_asset_key text,
  add column if not exists balance_detail_type text,
  add column if not exists balance_detail_id bigint;

alter table public.recurring_transactions
  drop constraint if exists recurring_transactions_balance_asset_key_check,
  add constraint recurring_transactions_balance_asset_key_check
  check (balance_asset_key in ('bank', 'cash', 'digitalServices', 'emergencyFund',
    'stocks', 'etf', 'bitcoin', 'crypto', 'bonds', 'funds', 'commodities'));

alter table public.recurring_transactions
  drop constraint if exists recurring_transactions_balance_detail_type_check,
  add constraint recurring_transactions_balance_detail_type_check
  check (balance_detail_type in ('liquidity', 'investment'));
