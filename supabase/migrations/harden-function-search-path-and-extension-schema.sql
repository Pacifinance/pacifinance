-- Supabase Security Advisor remediation (idempotent).
--
-- 1. Pin search_path on the 5 SQL functions the advisor flagged as
--    "Function Search Path Mutable" - without it, a role that can create
--    objects earlier in a caller's search_path could shadow an unqualified
--    reference inside the function. All 5 already fully qualify every
--    table as public.*, so this is a hardening no-op behaviorally.
alter function public.get_balance_history(uuid, integer) set search_path to 'public';
alter function public.get_balance_ranking_pool(uuid[], boolean) set search_path to 'public';
alter function public.get_benchmark_metric_rows(uuid[], date) set search_path to 'public';
alter function public.get_expense_ranking_pool(uuid[], boolean, date) set search_path to 'public';
alter function public.get_monthly_totals(uuid, integer) set search_path to 'public';

-- 2. rls_auto_enable() is a SECURITY DEFINER event-trigger handler (see
--    schema.sql) meant only to fire automatically on CREATE TABLE, never to
--    be called directly. It was still GRANTed to anon/authenticated, making
--    it reachable via POST /rest/v1/rpc/rls_auto_enable - revoke that.
revoke execute on function public.rls_auto_enable() from anon, authenticated;

-- 3. pg_net (installed by supabase/migrations/schedule-send-reminders.sql)
--    landed in the public schema, which the advisor flags as bad practice
--    (public-schema objects are part of the PostgREST-exposed API surface
--    by default). Move it to the dedicated `extensions` schema Supabase
--    provisions for exactly this - a no-op if it's already there or not
--    installed at all (self-hosted instances that never applied the
--    reminders migration).
--
-- Wrapped in exception handling on purpose: pg_net's functions are always
-- called as net.http_post(...) (see schedule-send-reminders.sql), and on
-- some pg_net versions the extension isn't actually relocatable, so
-- ALTER EXTENSION ... SET SCHEMA can fail outright. If that happens here,
-- log a notice and move on rather than fail the whole migration - the
-- schema-location advisor warning is lower severity than breaking the
-- hourly reminders cron job.
create schema if not exists extensions;

do $$
begin
  if exists (
    select 1
    from pg_extension e
    join pg_namespace n on n.oid = e.extnamespace
    where e.extname = 'pg_net' and n.nspname = 'public'
  ) then
    begin
      alter extension pg_net set schema extensions;
    exception
      when others then
        raise notice 'Could not move pg_net to the extensions schema (%); leaving it in public. net.http_post() calls are unaffected either way.', sqlerrm;
    end;
  end if;
end $$;
