alter table public.quizzes
  add column if not exists duration_minutes integer not null default 20,
  add column if not exists started_at timestamptz,
  add column if not exists ends_at timestamptz;

alter table public.participants
  add column if not exists violations integer not null default 0;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'quizzes_duration_minutes_check'
  ) then
    alter table public.quizzes
      add constraint quizzes_duration_minutes_check
      check (duration_minutes between 5 and 180);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'participants_violations_check'
  ) then
    alter table public.participants
      add constraint participants_violations_check
      check (violations >= 0);
  end if;
end $$;
