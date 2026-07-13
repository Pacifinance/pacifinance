-- Explicit, revocable consent for hosted community benchmarks. Financial data
-- remains in the user's own tables; this flag controls only anonymous
-- contribution to aggregate community statistics.
alter table public.profiles
  add column if not exists benchmark_consent boolean not null default false,
  add column if not exists benchmark_consent_at timestamptz,
  add column if not exists benchmark_consent_revoked_at timestamptz;

create index if not exists profiles_benchmark_consent_idx
  on public.profiles (benchmark_consent) where benchmark_consent;

-- A versioned monthly profile snapshot makes a benchmark reproducible for its
-- whole reference period. It deliberately contains bucket/tag identifiers,
-- never balances, incomes, expenses, notes or free text.
create table if not exists public.benchmark_runs (
  month_start date primary key,
  algorithm_version text not null,
  generated_at timestamptz not null default now(),
  contributor_count integer not null default 0
);

create table if not exists public.benchmark_profile_snapshots (
  month_start date not null references public.benchmark_runs(month_start) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  account_type smallint not null,
  job_country_tag_id bigint references public.tags(id),
  job_tag_id bigint references public.tags(id),
  job_type_tag_id bigint references public.tags(id),
  work_time_tag_id bigint references public.tags(id),
  remote_type_tag_id bigint references public.tags(id),
  living_situation_tag_id bigint references public.tags(id),
  housing_type_tag_id bigint references public.tags(id),
  children_tag_id bigint references public.tags(id),
  country_tag_id bigint references public.tags(id),
  age_tag_id bigint references public.tags(id),
  years_of_experience_tag_id bigint references public.tags(id),
  primary key (month_start, user_id)
);

create index if not exists benchmark_profile_snapshots_month_idx
  on public.benchmark_profile_snapshots (month_start, account_type);
