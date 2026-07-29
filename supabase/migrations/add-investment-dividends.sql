-- Ledger of individual dividend payments imported from broker CSVs (see
-- src/utils/investmentImport/parsers.ts). One row per real-world payment,
-- not an aggregate — lets "total dividends per instrument" and "dividends
-- vs invested" be computed by summing, and (crucially) lets re-importing
-- the same file be a no-op instead of double-counting: external_id, when
-- the broker provides one, is the dedup key (same principle already used
-- for buy/sell transaction dedup in dedupeTransactions and for balance/
-- expense idempotency elsewhere in this schema).
--
-- holding_id uses "on delete set null" (not cascade): closing/deleting the
-- live holding must not erase the dividend history that was actually paid.

create table if not exists public.user_investment_dividends (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  instrument_id bigint not null references public.investment_instruments(id),
  holding_id bigint references public.user_investment_holdings(id) on delete set null,
  -- Amount actually received, converted to EUR (DB is always EUR, see CLAUDE.md).
  amount numeric not null,
  -- Original currency/amount before EUR conversion, kept for reference/debugging only.
  currency text,
  gross_amount numeric,
  paid_date date not null,
  -- Broker's own transaction id, when the export provides one (Trading 212 does,
  -- Directa/generic exports may not) - null-safe dedup via the partial unique index below.
  external_id text,
  source text not null,
  recorded_at timestamptz not null default now()
);

create index if not exists user_investment_dividends_user_idx
  on public.user_investment_dividends (user_id, instrument_id, paid_date desc);

-- Only enforced when the broker actually provided an id — rows without one
-- (see above) rely on the CSV-side dedupeTransactions-style pass instead,
-- same tradeoff already accepted for buy/sell rows without an externalId.
create unique index if not exists user_investment_dividends_external_id_uidx
  on public.user_investment_dividends (user_id, instrument_id, external_id)
  where external_id is not null;

alter table public.user_investment_dividends enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'user_investment_dividends'
      and policyname = 'user_investment_dividends_own_rows'
  ) then
    create policy "user_investment_dividends_own_rows" on public.user_investment_dividends
      for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;
