create extension if not exists pgcrypto;

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 140),
  description text not null default '',
  source_name text not null,
  join_code text not null unique check (join_code ~ '^[A-Z0-9]{6}$'),
  status text not null default 'waiting' check (status in ('waiting', 'live', 'finished')),
  duration_minutes integer not null default 20 check (duration_minutes between 5 and 180),
  started_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  position integer not null check (position >= 0),
  prompt text not null,
  options jsonb not null check (jsonb_typeof(options) = 'array' and jsonb_array_length(options) = 4),
  correct_index integer not null check (correct_index between 0 and 3),
  explanation text not null default '',
  unique (quiz_id, position)
);

create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 40),
  access_token uuid not null unique default gen_random_uuid(),
  score integer check (score is null or score >= 0),
  violations integer not null default 0 check (violations >= 0),
  answered_at timestamptz,
  joined_at timestamptz not null default now()
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null unique references public.participants(id) on delete cascade,
  answers jsonb not null check (jsonb_typeof(answers) = 'array'),
  score integer not null check (score >= 0),
  created_at timestamptz not null default now()
);

create index if not exists quizzes_owner_created_idx on public.quizzes(owner_id, created_at desc);
create index if not exists quizzes_join_code_idx on public.quizzes(join_code);
create index if not exists participants_quiz_idx on public.participants(quiz_id, joined_at);

alter table public.quizzes enable row level security;
alter table public.questions enable row level security;
alter table public.participants enable row level security;
alter table public.submissions enable row level security;

-- Intentionally no public RLS policies. All quiz data is accessed through
-- authenticated server routes that validate ownership or participant tokens.
