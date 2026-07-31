-- Optional dual-threshold financial controls. Existing fixed goals remain
-- valid; null means the additional threshold/control is disabled.
alter table public.profiles
  add column if not exists expenses_limit_percent numeric,
  add column if not exists savings_amount_goal numeric,
  add column if not exists emergency_fund_months numeric,
  add column if not exists fixed_expenses_percent numeric,
  add column if not exists category_spending_limits jsonb not null default '{}'::jsonb,
  add column if not exists debt_reduction_goal numeric,
  add column if not exists position_concentration_limit numeric,
  add column if not exists asset_category_concentration_limit numeric,
  add column if not exists annual_passive_income_goal numeric;

alter table public.profiles
  drop constraint if exists profiles_expenses_limit_percent_check,
  add constraint profiles_expenses_limit_percent_check check (expenses_limit_percent is null or expenses_limit_percent between 0 and 100),
  drop constraint if exists profiles_savings_amount_goal_check,
  add constraint profiles_savings_amount_goal_check check (savings_amount_goal is null or savings_amount_goal >= 0),
  drop constraint if exists profiles_emergency_fund_months_check,
  add constraint profiles_emergency_fund_months_check check (emergency_fund_months is null or emergency_fund_months >= 0),
  drop constraint if exists profiles_fixed_expenses_percent_check,
  add constraint profiles_fixed_expenses_percent_check check (fixed_expenses_percent is null or fixed_expenses_percent between 0 and 100),
  drop constraint if exists profiles_debt_reduction_goal_check,
  add constraint profiles_debt_reduction_goal_check check (debt_reduction_goal is null or debt_reduction_goal >= 0),
  drop constraint if exists profiles_position_concentration_limit_check,
  add constraint profiles_position_concentration_limit_check check (position_concentration_limit is null or position_concentration_limit between 0 and 100),
  drop constraint if exists profiles_asset_category_concentration_limit_check,
  add constraint profiles_asset_category_concentration_limit_check check (asset_category_concentration_limit is null or asset_category_concentration_limit between 0 and 100),
  drop constraint if exists profiles_annual_passive_income_goal_check,
  add constraint profiles_annual_passive_income_goal_check check (annual_passive_income_goal is null or annual_passive_income_goal >= 0);

alter table public.user_investment_settings
  add column if not exists monthly_target_percent numeric;

alter table public.user_investment_settings
  drop constraint if exists user_investment_settings_monthly_target_percent_check,
  add constraint user_investment_settings_monthly_target_percent_check
    check (monthly_target_percent is null or monthly_target_percent between 0 and 100);

alter table public.user_goals
  add column if not exists target_percent_of_net_worth numeric;

alter table public.user_goals
  drop constraint if exists user_goals_target_percent_of_net_worth_check,
  add constraint user_goals_target_percent_of_net_worth_check
    check (target_percent_of_net_worth is null or target_percent_of_net_worth between 0 and 100);
