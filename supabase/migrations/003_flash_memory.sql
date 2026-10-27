create table if not exists public.flash_memory_sets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 140),
  description text not null default '',
  source_name text not null,
  difficulty text not null default 'sedang' check (difficulty in ('mudah', 'sedang', 'sulit')),
  best_score integer not null default 0 check (best_score >= 0),
  best_time_seconds integer check (best_time_seconds is null or best_time_seconds >= 0),
  plays_count integer not null default 0 check (plays_count >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.flash_memory_cards (
  id uuid primary key default gen_random_uuid(),
  set_id uuid not null references public.flash_memory_sets(id) on delete cascade,
  position integer not null check (position >= 0),
  term text not null check (char_length(term) between 1 and 160),
  definition text not null check (char_length(definition) between 1 and 400),
  category text not null default 'Konsep',
  memory_tip text not null default '',
  unique (set_id, position)
);

create index if not exists flash_memory_sets_owner_created_idx
  on public.flash_memory_sets(owner_id, created_at desc);

create index if not exists flash_memory_cards_set_idx
  on public.flash_memory_cards(set_id, position);

alter table public.flash_memory_sets enable row level security;
alter table public.flash_memory_cards enable row level security;

-- Intentionally no public RLS policies. Flash Memory data is accessed through
-- authenticated server routes that validate owner_id.
