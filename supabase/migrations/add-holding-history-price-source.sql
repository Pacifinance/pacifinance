-- Records how a historical market value was obtained so the UI can
-- distinguish verified provider/community data from user/imported values.
alter table public.user_investment_holding_history
  add column if not exists price_source text;

alter table public.user_investment_holding_history
  drop constraint if exists user_investment_holding_history_price_source_check;

alter table public.user_investment_holding_history
  add constraint user_investment_holding_history_price_source_check
  check (price_source is null or price_source in ('provider', 'community', 'manual', 'imported'));
