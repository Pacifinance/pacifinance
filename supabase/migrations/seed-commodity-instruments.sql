-- Curated catalog of commodities searchable for the "commodities" investment
-- asset key (see src/constants/investmentSchema.ts - ASSET_KEY_TO_KIND.commodities
-- = 'commodity', KIND_TO_SEARCH_SOURCE.commodity = 'internal'). Unlike
-- stocks/ETFs/crypto, these are never verified live against an external API -
-- this fixed list IS the catalog. provider='internal' distinguishes them from
-- 'openfigi'/'coingecko'/'manual' rows. on conflict do nothing: safe to re-run,
-- and matches the existing (kind, symbol, coalesce(exchange,'')) unique index.

insert into public.investment_instruments (kind, symbol, exchange, name, currency, country, provider, verified, active, metadata)
values
  ('commodity', 'XAU', null, 'Gold', null, null, 'internal', true, true, '{}'::jsonb),
  ('commodity', 'XAG', null, 'Silver', null, null, 'internal', true, true, '{}'::jsonb),
  ('commodity', 'XPT', null, 'Platinum', null, null, 'internal', true, true, '{}'::jsonb),
  ('commodity', 'XPD', null, 'Palladium', null, null, 'internal', true, true, '{}'::jsonb),
  ('commodity', 'WTI', null, 'Crude Oil WTI', null, null, 'internal', true, true, '{}'::jsonb),
  ('commodity', 'BRENT', null, 'Crude Oil Brent', null, null, 'internal', true, true, '{}'::jsonb),
  ('commodity', 'NATGAS', null, 'Natural Gas', null, null, 'internal', true, true, '{}'::jsonb),
  ('commodity', 'COPPER', null, 'Copper', null, null, 'internal', true, true, '{}'::jsonb),
  ('commodity', 'ALUMINUM', null, 'Aluminum', null, null, 'internal', true, true, '{}'::jsonb),
  ('commodity', 'CORN', null, 'Corn', null, null, 'internal', true, true, '{}'::jsonb),
  ('commodity', 'WHEAT', null, 'Wheat', null, null, 'internal', true, true, '{}'::jsonb),
  ('commodity', 'SOYBEANS', null, 'Soybeans', null, null, 'internal', true, true, '{}'::jsonb),
  ('commodity', 'COFFEE', null, 'Coffee', null, null, 'internal', true, true, '{}'::jsonb),
  ('commodity', 'COTTON', null, 'Cotton', null, null, 'internal', true, true, '{}'::jsonb),
  ('commodity', 'SUGAR', null, 'Sugar', null, null, 'internal', true, true, '{}'::jsonb),
  ('commodity', 'COCOA', null, 'Cocoa', null, null, 'internal', true, true, '{}'::jsonb)
on conflict (kind, symbol, coalesce(exchange, '')) do nothing;
