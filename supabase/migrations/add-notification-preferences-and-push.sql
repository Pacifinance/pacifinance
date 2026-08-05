-- Granular, explicit-opt-in reminder preferences and Web Push endpoints.
-- Apply once through the Supabase SQL editor or CLI. The service-role backend
-- manages these rows; RLS also protects direct authenticated access.

create table if not exists public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  enabled boolean not null default false,
  monthly_summary boolean not null default true,
  data_update_reminder boolean not null default true,
  recurring_due boolean not null default true,
  shared_expense_updates boolean not null default true,
  community_price_updates boolean not null default true,
  reminder_day smallint not null default 1 check (reminder_day between 1 and 28),
  reminder_hour smallint not null default 18 check (reminder_hour between 0 and 23),
  timezone text not null default 'UTC' check (char_length(timezone) between 1 and 80),
  language text not null default 'it' check (char_length(language) between 2 and 10),
  last_sent jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.push_subscriptions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists push_subscriptions_user_idx on public.push_subscriptions (user_id);
create index if not exists notification_preferences_enabled_idx on public.notification_preferences (enabled) where enabled;

alter table public.notification_preferences enable row level security;
alter table public.push_subscriptions enable row level security;

create policy "Users read own notification preferences" on public.notification_preferences
  for select using (auth.uid() = user_id);
create policy "Users update own notification preferences" on public.notification_preferences
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users read own push subscriptions" on public.push_subscriptions
  for select using (auth.uid() = user_id);
create policy "Users delete own push subscriptions" on public.push_subscriptions
  for delete using (auth.uid() = user_id);

comment on table public.notification_preferences is 'Explicit user choices for optional reminders; enabled=false means no push is sent.';
comment on column public.notification_preferences.last_sent is 'Idempotency timestamps keyed by reminder type, maintained by send-reminders.';
