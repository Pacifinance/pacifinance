-- RLS advisor remediation (idempotent).
-- Benchmark snapshots/runs are written by trusted server jobs only. Explicit
-- deny policies document that intent while preserving service-role access.
alter table public.benchmark_runs enable row level security;
alter table public.benchmark_profile_snapshots enable row level security;
alter table public.recurring_transactions enable row level security;
alter table public.shared_expense_receivables enable row level security;

drop policy if exists benchmark_runs_no_client_access on public.benchmark_runs;
create policy benchmark_runs_no_client_access on public.benchmark_runs
  for all to anon, authenticated using (false) with check (false);

drop policy if exists benchmark_snapshots_no_client_access on public.benchmark_profile_snapshots;
create policy benchmark_snapshots_no_client_access on public.benchmark_profile_snapshots
  for all to anon, authenticated using (false) with check (false);

drop policy if exists recurring_transactions_own_rows on public.recurring_transactions;
create policy recurring_transactions_own_rows on public.recurring_transactions
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists shared_receivables_own_rows on public.shared_expense_receivables;
create policy shared_receivables_own_rows on public.shared_expense_receivables
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
