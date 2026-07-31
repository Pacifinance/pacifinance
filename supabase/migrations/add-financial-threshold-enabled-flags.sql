alter table public.profiles
  add column if not exists expenses_limit_percent_enabled boolean not null default true,
  add column if not exists savings_amount_goal_enabled boolean not null default true,
  add column if not exists emergency_fund_months_enabled boolean not null default true;
