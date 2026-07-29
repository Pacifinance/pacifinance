-- Ledger of individual buy/sell transactions imported from broker CSVs (see
-- src/utils/investmentImport/parsers.ts) — the counterpart to
-- user_investment_dividends, for the same reason: one row per real trade,
-- not an aggregate, deduplicated by the broker's own transaction id when
-- available (same principle as dedupeTransactions client-side).
--
-- Why this exists: the CSV import wizard used to reconcile "is this position
-- now fully closed?" using only whatever files were loaded in the CURRENT
-- browser session. A broker export capped to one period (Trading 212: 365
-- days) means a multi-year portfolio is necessarily built from several
-- separately-uploaded files - reconciling within a single session already
-- got fixed by always merging every file loaded in that session before
-- computing anything (see recomputeFromMerged in InvestmentImportWizard.tsx),
-- but a file uploaded in a LATER, separate session still had no way to see
-- transactions from files imported in an EARLIER session. Persisting every
-- transaction here (as it's imported) means a future session can fetch the
-- complete history and reconcile correctly regardless of which files were
-- ever uploaded, in which sessions, in which order.
--
-- holding_id uses "on delete set null" (not cascade): closing/deleting the
-- live holding must not erase the trade history that actually happened.

create table if not exists public.user_investment_transactions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  instrument_id bigint not null references public.investment_instruments(id),
  holding_id bigint references public.user_investment_holdings(id) on delete set null,
  side text not null check (side in ('buy', 'sell')),
  quantity numeric not null,
  -- Price per unit and its currency, kept for reference/debugging only - the
  -- fields that matter for reconciliation (side, quantity, trade_date) never
  -- need conversion.
  price numeric,
  currency text,
  -- Total, converted to EUR (DB is always EUR, see CLAUDE.md).
  total numeric,
  -- Original currency/amount before EUR conversion, reference only.
  total_currency text,
  trade_date date not null,
  -- Broker's own transaction id, when the export provides one (Trading 212
  -- does, Directa/generic exports may not) - null-safe dedup via the partial
  -- unique index below, same tradeoff already accepted for dividends.
  external_id text,
  source text not null,
  recorded_at timestamptz not null default now()
);

create index if not exists user_investment_transactions_user_idx
  on public.user_investment_transactions (user_id, instrument_id, trade_date desc);

create unique index if not exists user_investment_transactions_external_id_uidx
  on public.user_investment_transactions (user_id, instrument_id, external_id)
  where external_id is not null;

alter table public.user_investment_transactions enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'user_investment_transactions'
      and policyname = 'user_investment_transactions_own_rows'
  ) then
    create policy "user_investment_transactions_own_rows" on public.user_investment_transactions
      for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;
