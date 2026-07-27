-- Lets a user add a holding for an instrument that couldn't be verified via
-- OpenFIGI/CoinGecko (no ISIN/ticker match) — kept private to that user
-- rather than joining the shared, community-searchable catalog: with no
-- ISIN/FIGI to dedupe on, a shared "manual" row would accumulate typos and
-- duplicates that nobody could ever clean up. Unverified holdings must also
-- never be usable for cross-user comparisons — see routes/private/investments.ts.

alter table public.investment_instruments
  add column if not exists owner_user_id uuid references auth.users(id) on delete cascade;

create index if not exists investment_instruments_owner_idx
  on public.investment_instruments (owner_user_id) where owner_user_id is not null;

-- The original symbol+exchange uniqueness only makes sense for the shared,
-- verified catalog (owner_user_id is null there) — two different users must
-- each be free to privately name a manual instrument the same symbol.
drop index if exists investment_instruments_symbol_exchange_uidx;
create unique index if not exists investment_instruments_symbol_exchange_uidx
  on public.investment_instruments (kind, symbol, coalesce(exchange, ''))
  where owner_user_id is null;
