-- Optional fixed-denomination support for a liquidity account — e.g. meal
-- vouchers issued in fixed units (Edenred-style, €8/voucher). When unit_value
-- is set, the account is spent in whole-unit increments instead of a
-- continuous balance; fallback_account_id names the account (another
-- liquidity account) that absorbs the remainder when a purchase isn't an
-- exact multiple of unit_value, or exceeds the available balance — see
-- utils/voucherSplit.ts (client-side split computation) and the
-- transactions.balance_*_2 columns (add-transaction-balance-split.sql).
-- Both columns nullable: an ordinary account (the vast majority) leaves them
-- null, unchanged from before this migration.

alter table public.user_liquidity_accounts
  add column if not exists unit_value numeric,
  add column if not exists fallback_account_id bigint references public.user_liquidity_accounts(id) on delete set null;

alter table public.user_liquidity_accounts
  drop constraint if exists user_liquidity_accounts_unit_value_check,
  add constraint user_liquidity_accounts_unit_value_check check (unit_value is null or unit_value > 0);
