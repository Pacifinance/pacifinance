-- One shared monthly price catalog for every investment kind. Asset metadata
-- remains normalized in investment_instruments; this table only stores price
-- observations and their provenance.
alter table public.instrument_historical_prices
    add column if not exists source text not null default 'community',
    add column if not exists is_final boolean not null default true;

alter table public.instrument_historical_prices
    alter column submitted_by drop not null;

alter table public.instrument_historical_prices
    drop constraint if exists instrument_historical_prices_status_check;
alter table public.instrument_historical_prices
    add constraint instrument_historical_prices_status_check
    check (status in ('pending', 'verified', 'rejected', 'superseded'));

alter table public.instrument_historical_prices
    drop constraint if exists instrument_historical_prices_source_check;
alter table public.instrument_historical_prices
    add constraint instrument_historical_prices_source_check
    check (source in ('community', 'coingecko', 'finnhub'));

-- Pending/verified is the single canonical candidate. Rejected and superseded
-- observations remain as audit history and do not block a provider replacement.
drop index if exists public.instrument_historical_prices_active_uidx;
create unique index if not exists instrument_historical_prices_active_uidx
    on public.instrument_historical_prices (instrument_id, month_key)
    where status in ('pending', 'verified');

create index if not exists instrument_historical_prices_canonical_lookup_idx
    on public.instrument_historical_prices (instrument_id, month_key, source)
    where status = 'verified';

comment on table public.instrument_historical_prices is
    'Shared canonical monthly prices for all investment instruments; provider rows take precedence and community rows are fallback/audit.';
