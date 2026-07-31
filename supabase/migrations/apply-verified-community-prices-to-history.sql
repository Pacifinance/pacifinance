-- Backfill approvals created before verified community prices were propagated
-- into users' monthly holding history. Safe to rerun: rows already sourced
-- from a provider or the community are deliberately left untouched.
update public.user_investment_holding_history as history
set
  current_value = round(price.price_eur * history.quantity, 2),
  price_source = 'community'
from public.instrument_historical_prices as price
where price.status = 'verified'
  and history.instrument_id = price.instrument_id
  and to_char(history.user_date, 'YYYY-MM') = price.month_key
  and history.quantity is not null
  and history.quantity > 0
  and coalesce(history.price_source, '') not in ('provider', 'community');
