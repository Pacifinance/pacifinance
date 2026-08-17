-- Lets a liquidity account remember which detected bank/payment-provider
-- export it corresponds to (see utils/dataImport/bankFormats.ts BankFormatId,
-- e.g. 'traderepublic', 'revolut', 'n26', 'paypal'). Set automatically the
-- first time an account is created from the import wizard for a detected
-- provider, or picked manually in LiquidityAccountsPanel for an account that
-- predates this column. Lets subsequent imports from the same provider
-- auto-select the right sub-account instead of asking every time. Null for
-- accounts with no known provider (e.g. plain cash).

alter table public.user_liquidity_accounts
  add column if not exists linked_bank_key text;
