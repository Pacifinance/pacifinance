-- Custom user goals. goal_type is only the display category/icon (matches the
-- pre-existing frontend modal). linked_asset_key is the new part: when set, the
-- goal is "linked" and its current_value is recomputed server-side from the
-- current balance instead of the stored column; when null, it's a manual goal
-- (the user types current_value by hand — useful for money mentally set aside
-- that isn't tracked as its own account, e.g. part of an undivided bank balance).

create table if not exists public.user_goals (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  goal_type text not null default 'savings' check (goal_type in ('savings', 'purchase', 'investment', 'debt')),
  target_value numeric not null,
  current_value numeric not null default 0,
  linked_asset_key text check (linked_asset_key is null or linked_asset_key in (
    'bank', 'cash', 'digitalServices', 'emergencyFund',
    'stocks', 'etf', 'bitcoin', 'crypto', 'bonds', 'funds', 'commodities'
  )),
  deadline date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_goals_user_idx on public.user_goals (user_id, updated_at desc);

alter table public.user_goals enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'user_goals'
      and policyname = 'user_goals_own_rows'
  ) then
    create policy "user_goals_own_rows" on public.user_goals
      for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;
