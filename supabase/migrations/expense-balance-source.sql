-- Links each transaction to the balance source it was paid from / credited to
-- (chosen optionally at insert time). Before this, the chosen source was used
-- once client-side to adjust the balance snapshot and then discarded — so
-- deleting a transaction could not know which balance field to restore.
-- All three columns are nullable: older rows and "no source" inserts stay valid.
--
-- balance_asset_key   canonical asset key of the parent balance field
-- balance_detail_type 'liquidity' (user liquidity account) or 'investment'
--                     (user investment holding) when a specific sub-account
--                     was chosen; null when the parent field itself was chosen
-- balance_detail_id   id in user_liquidity_accounts / user_investment_holdings
--                     (soft reference: the row may be deleted later, no FK)

alter table public.expenses
  add column balance_asset_key text,
  add column balance_detail_type text,
  add column balance_detail_id bigint;

alter table public.expenses
  add constraint expenses_balance_asset_key_check
  check (balance_asset_key in ('bank', 'cash', 'digitalServices', 'emergencyFund',
    'stocks', 'etf', 'bitcoin', 'crypto', 'bonds', 'funds', 'commodities'));

alter table public.expenses
  add constraint expenses_balance_detail_type_check
  check (balance_detail_type in ('liquidity', 'investment'));
