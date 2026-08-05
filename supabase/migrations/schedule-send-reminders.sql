-- Schedules server/src/routes/cron/cron.ts's POST /api/cron/send-reminders
-- endpoint to run hourly via pg_cron + pg_net, instead of Vercel Cron: Vercel
-- Hobby caps cron jobs at 2 (already used by delete-users and
-- refresh-user-averages) and doesn't allow more-than-daily schedules, which
-- can't honor a user's per-hour reminderHour preference. pg_cron's schedule
-- is independent of that limit.
--
-- Apply once through the Supabase SQL editor or CLI, THEN — outside of this
-- file, since it's a secret that must never be committed:
--   1. select vault.create_secret('<same value as your CRON_SECRET env var>', 'cron_secret');
--   2. If your deployed origin isn't https://pacifinance.com, edit app_base_url
--      below (or update the scheduled job afterwards with cron.alter_job).
--   3. Confirm pg_cron and pg_net show as enabled under Database -> Extensions.

create extension if not exists pg_cron;
create extension if not exists pg_net;

do $$
declare
  app_base_url text := 'https://pacifinance.com';
begin
  perform cron.schedule(
    'send-reminders-hourly',
    '5 * * * *', -- 5 minutes past every hour
    format(
      $sql$
      select net.http_post(
        url := %L,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || (
            select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret'
          )
        ),
        body := '{}'::jsonb
      );
      $sql$,
      app_base_url || '/api/cron/send-reminders'
    )
  );
end $$;

comment on extension pg_cron is 'Schedules send-reminders-hourly (see cron.job) and any future periodic jobs.';
