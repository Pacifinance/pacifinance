-- Keep the exact date represented by a community price. Existing monthly
-- submissions are conservatively assigned to that month's final day.
alter table public.instrument_historical_prices
    add column if not exists reference_date date;

update public.instrument_historical_prices
set reference_date = (month_key || '-01')::date + interval '1 month - 1 day'
where reference_date is null;

alter table public.instrument_historical_prices
    alter column reference_date set not null;
