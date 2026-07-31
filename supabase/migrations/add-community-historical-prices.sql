-- Community-verified historical instrument prices.
--
-- Users submit a price they know for an instrument+month they've actually held;
-- it sits as 'pending' until an admin checks it against a real quote and approves
-- it, at which point it becomes visible to everyone and feeds backfillHistoricalPrices
-- as a free fallback source (Finnhub/CoinGecko historical candles are paid-tier for
-- most users/date-ranges).

create table if not exists public.instrument_historical_prices (
    id bigint generated always as identity primary key,
    instrument_id bigint not null references public.investment_instruments(id) on delete cascade,
    month_key text not null, -- "YYYY-MM"
    price_eur numeric not null, -- authoritative, DB-canonical EUR (CLAUDE.md: "DB sempre EUR")
    raw_price numeric not null, -- as typed by the submitter - what the admin actually checks against a real quote
    raw_currency text not null,
    status text not null default 'pending' check (status in ('pending', 'verified', 'rejected')),
    submitted_by uuid not null references auth.users(id) on delete cascade,
    submitted_at timestamptz not null default now(),
    verified_by uuid references auth.users(id),
    verified_at timestamptz,
    rejection_note text
);

-- One ACTIVE (pending/verified) row per instrument+month; a rejected row is kept
-- for the audit trail and a fresh submission afterward is a plain new insert -
-- same "partial unique index, not upsert" shape investment_instruments already
-- uses for its own owner-scoped uniqueness (add-manual-investment-instruments.sql).
drop index if exists instrument_historical_prices_active_uidx;
create unique index instrument_historical_prices_active_uidx
    on public.instrument_historical_prices (instrument_id, month_key)
    where status <> 'rejected';

alter table public.instrument_historical_prices enable row level security;

do $$
begin
    if not exists (
        select 1 from pg_policies
        where schemaname = 'public'
          and tablename = 'instrument_historical_prices'
          and policyname = 'instrument_historical_prices_select_verified_or_own'
    ) then
        create policy "instrument_historical_prices_select_verified_or_own" on public.instrument_historical_prices
            for select to authenticated
            using (status = 'verified' or auth.uid() = submitted_by);
    end if;
end $$;
-- No write policies for `authenticated` - every write goes through the backend's
-- admin-checked routes (service-role client bypasses RLS), same as investment_instruments.

alter table public.profiles add column if not exists is_admin boolean not null default false;
-- Defense in depth: today nothing queries profiles via a direct (non-service-role)
-- Supabase client, but profiles_own_row is a `for all` row-scoped policy with no
-- column restriction - without this, a user could self-grant admin the moment
-- any authenticated-role client ever touches this table directly.
revoke update (is_admin) on public.profiles from authenticated;
-- Making a specific account admin is a one-off manual SQL update, not a self-service flow.
