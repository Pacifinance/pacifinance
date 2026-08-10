-- One vote per user per roadmap item. item_id is the stable id from
-- scripts/roadmap-items.json (e.g. "roadmap-voting") — no foreign key, since
-- roadmap items live in a JSON file, not the DB. Vote counts are our own,
-- not GitHub reactions (see docs/FUTURE_DESIGNS.md discussion): anonymous
-- users have no GitHub identity to react as.

create table if not exists public.roadmap_votes (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, item_id)
);

create index if not exists roadmap_votes_item_idx on public.roadmap_votes (item_id);

alter table public.roadmap_votes enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'roadmap_votes'
      and policyname = 'roadmap_votes_own_rows'
  ) then
    create policy "roadmap_votes_own_rows" on public.roadmap_votes
      for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;
