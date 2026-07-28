-- Curated seed of well-known, verified investment instruments (major US
-- mega-caps + the user's own current holdings, major ETFs, and a handful of
-- major European stocks). Every ISIN/FIGI/ticker/name/exchange below was
-- looked up live against OpenFIGI's /v3/mapping endpoint (not guessed) —
-- see the chat session that produced this file for the verification log.
--
-- Why this exists: OpenFIGI's *free-text* /v3/search endpoint (used for
-- ticker/name-only queries — see openfigiProvider.searchOpenFigi) is
-- unreliable and, without an API key, capped at ~4-5 requests/minute —
-- trivial to exhaust during normal use, which is what made a plain "AAPL"
-- search fail. Pre-seeding the shared catalog with the instruments users
-- search for constantly means those lookups resolve from
-- searchLocalInstruments() and never touch the rate-limited provider at all.
--
-- provider='openfigi', verified=true — matches exactly what the app itself
-- would insert had the live OpenFIGI call succeeded (see
-- server/src/libs/providers/openfigiProvider.ts toUpsertInput: currency and
-- country are always null for OpenFIGI-sourced rows, sector/industry are
-- never populated by that path either — intentionally mirrored here, not
-- an oversight).
--
-- Crypto is NOT seeded here on purpose: server/src/cache/items/prices.ts
-- already keeps the top 50 coins by market cap in a live-refreshed cache
-- that searchCoingecko() checks before ever calling the CoinGecko API, so
-- major coins are already covered dynamically.
--
-- on conflict do nothing (no target list): safe to re-run: this skips a row
-- if it collides with ANY of the four unique indexes (figi, isin,
-- coingecko_id, or kind+symbol+coalesce(exchange,'')) — see schema.sql.

insert into public.investment_instruments
  (kind, symbol, exchange, name, currency, country, figi, isin, coingecko_id, provider, verified, active, metadata)
values
  -- ── Already in this user's own Trading 212 holdings (real ISINs from their CSV export) ──
  ('stock', 'MA',    'US', 'MASTERCARD INC - A',          null, null, 'BBG000F1ZSQ2', 'US57636Q1040', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'AXP',   'US', 'AMERICAN EXPRESS CO',         null, null, 'BBG000BCQZS4', 'US0258161092', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'AAPL',  'US', 'APPLE INC',                   null, null, 'BBG000B9XRY4', 'US0378331005', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'NTDOY', 'US', 'NINTENDO CO LTD-UNSPONS ADR', null, null, 'BBG000BTCW45', 'US6544453037', null, 'openfigi', true, true, '{"securityType":"ADR","marketSector":"Equity"}'::jsonb),
  ('stock', 'PYPL',  'US', 'PAYPAL HOLDINGS INC',         null, null, 'BBG0077VNXV6', 'US70450Y1038', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'TSLA',  'US', 'TESLA INC',                   null, null, 'BBG000N9MNX3', 'US88160R1014', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'SBUX',  'US', 'STARBUCKS CORP',              null, null, 'BBG000CTQBF3', 'US8552441094', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'META',  'US', 'META PLATFORMS INC-CLASS A',  null, null, 'BBG000MM2P62', 'US30303M1027', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'AMZN',  'US', 'AMAZON.COM INC',              null, null, 'BBG000BVPV84', 'US0231351067', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'KO',    'US', 'COCA-COLA CO/THE',            null, null, 'BBG000BMX289', 'US1912161007', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'MCD',   'US', 'MCDONALD''S CORP',            null, null, 'BBG000BNSZP1', 'US5801351017', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'WMT',   'US', 'WALMART INC',                 null, null, 'BBG000BWXBC2', 'US9311421039', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'V',     'US', 'VISA INC-CLASS A SHARES',     null, null, 'BBG000PSKYX7', 'US92826C8394', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'MSFT',  'US', 'MICROSOFT CORP',              null, null, 'BBG000BPH459', 'US5949181045', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),

  -- ── Other major US mega-caps ──
  ('stock', 'GOOGL', 'US', 'ALPHABET INC-CL A',           null, null, 'BBG009S39JX6', 'US02079K3059', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'NVDA',  'US', 'NVIDIA CORP',                 null, null, 'BBG000BBJQV0', 'US67066G1040', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'JPM',   'US', 'JPMORGAN CHASE & CO',         null, null, 'BBG000DMBXR2', 'US46625H1005', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'JNJ',   'US', 'JOHNSON & JOHNSON',           null, null, 'BBG000BMHYD1', 'US4781601046', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'PG',    'US', 'PROCTER & GAMBLE CO/THE',     null, null, 'BBG000BR2TH3', 'US7427181091', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'XOM',   'US', 'EXXONMOBIL HOLDINGS CORP',    null, null, 'BBG023CY9MM1', 'US30231G1022', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'UNH',   'US', 'UNITEDHEALTH GROUP INC',      null, null, 'BBG000CH5208', 'US91324P1021', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'HD',    'US', 'HOME DEPOT INC',              null, null, 'BBG000BKZB36', 'US4370761029', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'BAC',   'US', 'BANK OF AMERICA CORP',        null, null, 'BBG000BCTLF6', 'US0605051046', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'DIS',   'US', 'WALT DISNEY CO/THE',          null, null, 'BBG000BH4R78', 'US2546871060', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'NFLX',  'US', 'NETFLIX INC',                 null, null, 'BBG000CL9VN6', 'US64110L1061', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'ADBE',  'US', 'ADOBE INC',                   null, null, 'BBG000BB5006', 'US00724F1012', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'ORCL',  'US', 'ORACLE CORP',                 null, null, 'BBG000BQLTW7', 'US68389X1054', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'INTC',  'US', 'INTEL CORP',                  null, null, 'BBG000C0G1D1', 'US4581401001', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'CSCO',  'US', 'CISCO SYSTEMS INC',           null, null, 'BBG000C3J3C9', 'US17275R1023', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'PFE',   'US', 'PFIZER INC',                  null, null, 'BBG000BR2B91', 'US7170811035', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'PEP',   'US', 'PEPSICO INC',                 null, null, 'BBG000DH7JK6', 'US7134481081', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'COST',  'US', 'COSTCO WHOLESALE CORP',       null, null, 'BBG000F6H8W8', 'US22160K1051', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'NKE',   'US', 'NIKE INC -CL B',              null, null, 'BBG000C5HS04', 'US6541061031', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'LLY',   'US', 'ELI LILLY & CO',              null, null, 'BBG000BNBDC2', 'US5324571083', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'AVGO',  'US', 'BROADCOM INC',                null, null, 'BBG00KHY5S69', 'US11135F1012', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'IBM',   'US', 'INTL BUSINESS MACHINES CORP', null, null, 'BBG000BLNNH6', 'US4592001014', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'QCOM',  'US', 'QUALCOMM INC',                null, null, 'BBG000CGC1X8', 'US7475251036', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'TXN',   'US', 'TEXAS INSTRUMENTS INC',       null, null, 'BBG000BVV7G1', 'US8825081040', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'AMD',   'US', 'ADVANCED MICRO DEVICES',      null, null, 'BBG000BBQCY0', 'US0079031078', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'GS',    'US', 'GOLDMAN SACHS GROUP INC',     null, null, 'BBG000C6CFJ5', 'US38141G1040', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'MS',    'US', 'MORGAN STANLEY',              null, null, 'BBG000BLZRJ2', 'US6174464486', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'WFC',   'US', 'WELLS FARGO & CO',            null, null, 'BBG000BWQFY7', 'US9497461015', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'CVX',   'US', 'CHEVRON CORP',                null, null, 'BBG000K4ND22', 'US1667641005', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'VZ',    'US', 'VERIZON COMMUNICATIONS INC',  null, null, 'BBG000HS77T5', 'US92343V1044', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'T',     'US', 'AT&T INC',                    null, null, 'BBG000BSJK37', 'US00206R1023', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'BRK/B', 'US', 'BERKSHIRE HATHAWAY INC-CL B', null, null, 'BBG000DWG505', 'US0846707026', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),

  -- ── Major ETFs (US-listed + UCITS commonly used by EU investors) ──
  ('etf', 'SPY',  'US', 'SS SPDR S&P 500 ETF TRUST-US',   null, null, 'BBG000BDTBL9', 'US78462F1030', null, 'openfigi', true, true, '{"securityType":"ETP","marketSector":"Equity"}'::jsonb),
  ('etf', 'VOO',  'US', 'VANGUARD S&P 500 ETF',           null, null, 'BBG0015VYNT4', 'US9229083632', null, 'openfigi', true, true, '{"securityType":"ETP","marketSector":"Equity"}'::jsonb),
  ('etf', 'QQQ',  'US', 'INVESCO QQQ TRUST SERIES 1',     null, null, 'BBG000BSWKH7', 'US46090E1038', null, 'openfigi', true, true, '{"securityType":"ETP","marketSector":"Equity"}'::jsonb),
  ('etf', 'VTI',  'US', 'VANGUARD TOTAL STOCK MKT ETF',   null, null, 'BBG000HR9779', 'US9229087690', null, 'openfigi', true, true, '{"securityType":"ETP","marketSector":"Equity"}'::jsonb),
  ('etf', 'AGG',  'US', 'ISHARES CORE U.S. AGGREGATE',    null, null, 'BBG000Q123R0', 'US4642872265', null, 'openfigi', true, true, '{"securityType":"ETP","marketSector":"Equity"}'::jsonb),
  ('etf', 'BND',  'US', 'VANGUARD TOTAL BOND MARKET',     null, null, 'BBG000BZZS63', 'US9219378356', null, 'openfigi', true, true, '{"securityType":"ETP","marketSector":"Equity"}'::jsonb),
  ('etf', 'IWDA', 'NA', 'ISHARES CORE MSCI WORLD',        null, null, 'BBG000P71PV5', 'IE00B4L5Y983', null, 'openfigi', true, true, '{"securityType":"ETP","marketSector":"Equity"}'::jsonb),
  ('etf', 'VWCE', 'GR', 'VANG FTSE AW USDA',              null, null, 'BBG00PQQJ374', 'IE00BK5BQT80', null, 'openfigi', true, true, '{"securityType":"ETP","marketSector":"Equity"}'::jsonb),
  ('etf', 'EIMI', 'LN', 'ISHARES CORE EM IMI ACC',        null, null, 'BBG006B8QQK8', 'IE00BKM4GZ66', null, 'openfigi', true, true, '{"securityType":"ETP","marketSector":"Equity"}'::jsonb),
  ('etf', 'VUSA', 'LN', 'VANG S&P500 USDD',               null, null, 'BBG003241JT8', 'IE00B3XXRP09', null, 'openfigi', true, true, '{"securityType":"ETP","marketSector":"Equity"}'::jsonb),

  -- ── Major European stocks (Italian/EU market relevance) ──
  ('stock', 'ENI',   'IM', 'ENI SPA',                      null, null, 'BBG000FVRTJ1', 'IT0003132476', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'ENEL',  'IM', 'ENEL SPA',                      null, null, 'BBG000BK4338', 'IT0003128367', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'ISP',   'IM', 'INTESA SANPAOLO',               null, null, 'BBG000BNSF20', 'IT0000072618', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'UCG',   'IM', 'UNICREDIT SPA',                 null, null, 'BBG000BN0KY4', 'IT0005239360', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'ASML',  'NA', 'ASML HOLDING NV',               null, null, 'BBG000C1HSN8', 'NL0010273215', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'MC',    'FP', 'LVMH MOET HENNESSY LOUIS VUI',  null, null, 'BBG000BC7PK5', 'FR0000121014', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'NESN',  'GR', 'NESTLE SA-REG',                 null, null, 'BBG000BTVMD6', 'CH0038863350', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'SAP',   'SW', 'SAP SE',                        null, null, 'BBG000BDTGP4', 'DE0007164600', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'TTE',   'FP', 'TOTALENERGIES SE',              null, null, 'BBG000C1M473', 'FR0000120271', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  ('stock', 'SHEL',  'LN', 'SHELL PLC',                     null, null, 'BBG0149N4YB9', 'GB00BP6MXD84', null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb),
  -- Novo Nordisk: ticker/FIGI confirmed live via OpenFIGI, but no ISIN could
  -- be confirmed the same way in this pass (a guessed DK-prefixed ISIN came
  -- back with no match) — left null rather than risk a wrong identifier.
  ('stock', 'NOVOB', 'DC', 'NOVO NORDISK A/S-B',            null, null, 'BBG000F8TYC6', null, null, 'openfigi', true, true, '{"securityType":"Common Stock","marketSector":"Equity"}'::jsonb)
on conflict do nothing;
