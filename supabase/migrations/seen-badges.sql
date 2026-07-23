-- Server-side tracking of which gamification badges a user has already been
-- notified about. Badges themselves stay computed client-side (see
-- useGamification.ts) — this column is only the "already notified" bookkeeping,
-- moved off per-device localStorage so the achievement toast doesn't replay
-- the full "already unlocked" summary on every new device/browser.
alter table public.profiles
  add column if not exists seen_badges jsonb not null default '[]'::jsonb;
