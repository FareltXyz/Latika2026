alter table public.quizzes
  add column if not exists retention_days integer not null default 3,
  add column if not exists expires_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'quizzes_retention_days_check'
  ) then
    alter table public.quizzes
      add constraint quizzes_retention_days_check
      check (retention_days in (3, 5));
  end if;
end $$;

-- Existing quizzes receive a fresh three-day grace period when this migration
-- is first installed, so deploying the feature never deletes old data at once.
update public.quizzes
set expires_at = now() + interval '3 days'
where expires_at is null;

alter table public.quizzes
  alter column expires_at set default (now() + interval '3 days'),
  alter column expires_at set not null;

create index if not exists quizzes_expires_at_idx
  on public.quizzes(expires_at);
