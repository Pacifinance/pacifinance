-- One-time data fix for seed-verified-instruments.sql: several symbols in that
-- seed (AAPL first noticed, likely others) already existed in the catalog
-- before the seed ran — inserted earlier by the app itself via OpenFIGI's
-- free-text search (openfigiProvider.searchOpenFigi -> upsertInstrument),
-- back when searchLocalInstruments/searchInstrumentsByIsins were failing on
-- the (at-the-time missing) owner_user_id column and falling through to the
-- provider on every search. Those auto-inserted rows share the exact same
-- FIGI as the seed's rows but were created via free-text search, which never
-- carries an ISIN — so `on conflict do nothing` (keyed off the FIGI unique
-- index) silently skipped the seed's ISIN-bearing insert for every FIGI that
-- collided with one of them, leaving isin null on the row that's actually in
-- the catalog.
--
-- This backfills isin onto exactly those pre-existing rows by FIGI (the same
-- backfill upsertInstrument() does for app-driven upserts, replicated here for
-- the ones the raw seed INSERT couldn't reach). Only touches rows where isin
-- is currently null, so re-running is a no-op past the first successful run.
-- Safe to run before or after re-running seed-verified-instruments.sql.

update public.investment_instruments as i
set isin = v.isin
from (values
  ('BBG000F1ZSQ2', 'US57636Q1040'),
  ('BBG000BCQZS4', 'US0258161092'),
  ('BBG000B9XRY4', 'US0378331005'),
  ('BBG000BTCW45', 'US6544453037'),
  ('BBG0077VNXV6', 'US70450Y1038'),
  ('BBG000N9MNX3', 'US88160R1014'),
  ('BBG000CTQBF3', 'US8552441094'),
  ('BBG000MM2P62', 'US30303M1027'),
  ('BBG000BVPV84', 'US0231351067'),
  ('BBG000BMX289', 'US1912161007'),
  ('BBG000BNSZP1', 'US5801351017'),
  ('BBG000BWXBC2', 'US9311421039'),
  ('BBG000PSKYX7', 'US92826C8394'),
  ('BBG000BPH459', 'US5949181045'),
  ('BBG009S39JX6', 'US02079K3059'),
  ('BBG000BBJQV0', 'US67066G1040'),
  ('BBG000DMBXR2', 'US46625H1005'),
  ('BBG000BMHYD1', 'US4781601046'),
  ('BBG000BR2TH3', 'US7427181091'),
  ('BBG023CY9MM1', 'US30231G1022'),
  ('BBG000CH5208', 'US91324P1021'),
  ('BBG000BKZB36', 'US4370761029'),
  ('BBG000BCTLF6', 'US0605051046'),
  ('BBG000BH4R78', 'US2546871060'),
  ('BBG000CL9VN6', 'US64110L1061'),
  ('BBG000BB5006', 'US00724F1012'),
  ('BBG000BQLTW7', 'US68389X1054'),
  ('BBG000C0G1D1', 'US4581401001'),
  ('BBG000C3J3C9', 'US17275R1023'),
  ('BBG000BR2B91', 'US7170811035'),
  ('BBG000DH7JK6', 'US7134481081'),
  ('BBG000F6H8W8', 'US22160K1051'),
  ('BBG000C5HS04', 'US6541061031'),
  ('BBG000BNBDC2', 'US5324571083'),
  ('BBG00KHY5S69', 'US11135F1012'),
  ('BBG000BLNNH6', 'US4592001014'),
  ('BBG000CGC1X8', 'US7475251036'),
  ('BBG000BVV7G1', 'US8825081040'),
  ('BBG000BBQCY0', 'US0079031078'),
  ('BBG000C6CFJ5', 'US38141G1040'),
  ('BBG000BLZRJ2', 'US6174464486'),
  ('BBG000BWQFY7', 'US9497461015'),
  ('BBG000K4ND22', 'US1667641005'),
  ('BBG000HS77T5', 'US92343V1044'),
  ('BBG000BSJK37', 'US00206R1023'),
  ('BBG000DWG505', 'US0846707026'),
  ('BBG000BDTBL9', 'US78462F1030'),
  ('BBG0015VYNT4', 'US9229083632'),
  ('BBG000BSWKH7', 'US46090E1038'),
  ('BBG000HR9779', 'US9229087690'),
  ('BBG000Q123R0', 'US4642872265'),
  ('BBG000BZZS63', 'US9219378356'),
  ('BBG000P71PV5', 'IE00B4L5Y983'),
  ('BBG00PQQJ374', 'IE00BK5BQT80'),
  ('BBG006B8QQK8', 'IE00BKM4GZ66'),
  ('BBG003241JT8', 'IE00B3XXRP09'),
  ('BBG000FVRTJ1', 'IT0003132476'),
  ('BBG000BK4338', 'IT0003128367'),
  ('BBG000BNSF20', 'IT0000072618'),
  ('BBG000BN0KY4', 'IT0005239360'),
  ('BBG000C1HSN8', 'NL0010273215'),
  ('BBG000BC7PK5', 'FR0000121014'),
  ('BBG000BTVMD6', 'CH0038863350'),
  ('BBG000BDTGP4', 'DE0007164600'),
  ('BBG000C1M473', 'FR0000120271'),
  ('BBG0149N4YB9', 'GB00BP6MXD84')
) as v(figi, isin)
where i.figi = v.figi and i.isin is null;
