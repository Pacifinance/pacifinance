-- instrument_historical_prices.submitted_by was ON DELETE CASCADE (and NOT
-- NULL), unlike verified_by (already fixed to SET NULL in
-- fix-community-price-verified-by-cascade.sql). This meant deleting a user's
-- account cascaded away every community price they had ever submitted -
-- including ones already verified and actively relied on by OTHER users'
-- backfillHistoricalPrices (see getVerifiedCommunityPricesForInstrument).
-- A contributor deleting their account shouldn't take community data other
-- people depend on down with them.
--
-- submitted_by must become nullable before its FK can be SET NULL - the
-- application already treats it as nullable everywhere (see
-- server/src/db/models/investments.ts's CommunityPriceRow.submitted_by type
-- and saveCanonicalProviderPrices, which already inserts submitted_by: null
-- for provider-sourced rows sharing this table), so this is a schema-only
-- catch-up, not an application change.

alter table public.instrument_historical_prices
  alter column submitted_by drop not null;

alter table public.instrument_historical_prices
  drop constraint if exists instrument_historical_prices_submitted_by_fkey;
alter table public.instrument_historical_prices
  add constraint instrument_historical_prices_submitted_by_fkey
  foreign key (submitted_by) references auth.users(id) on delete set null;
