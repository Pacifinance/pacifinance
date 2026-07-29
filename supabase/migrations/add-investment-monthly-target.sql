-- A single "how much would I like to invest each month" € target per user,
-- surfaced in Portfolio Insights next to the actual month-by-month
-- contribution already reconstructed from history (see
-- src/utils/investmentAnalytics.ts). One row per user (user_id is the primary
-- key, not a separate index) so the upsert in saveInvestmentSettings targets
-- it unambiguously - no partial-index pitfalls like add-holdings-history-uniqueness.sql.

create table if not exists public.user_investment_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  monthly_target numeric,
  updated_at timestamptz not null default now()
);

alter table public.user_investment_settings enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'user_investment_settings'
      and policyname = 'user_investment_settings_own_rows'
  ) then
    create policy "user_investment_settings_own_rows" on public.user_investment_settings
      for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;
