-- Tracks which platform/broker export last contributed a holding's current
-- totals (see insertHolding in server/src/db/models/investments.ts). Without
-- this, the CSV import wizard can't tell "re-importing the same platform's
-- export, now with more history" (safe to overwrite the holding's totals)
-- apart from "a different platform's position in the same instrument" (must
-- be added to the existing holding, never silently overwrite it — e.g. the
-- same stock held on both Trading 212 and Degiro). Manually-added holdings
-- (InvestmentHoldingsPanel's "add holding" form) leave this null.

alter table public.user_investment_holdings
  add column if not exists import_source text;
