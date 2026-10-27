-- Replace the original 3/5-day choices with 7/14 days without shortening the
-- lifetime of existing quizzes. Existing records are upgraded to seven days.
alter table public.quizzes
  drop constraint if exists quizzes_retention_days_check;

update public.quizzes
set
  retention_days = 7,
  expires_at = greatest(
    expires_at,
    created_at + interval '7 days'
  )
where retention_days not in (7, 14);

alter table public.quizzes
  alter column retention_days set default 7,
  alter column expires_at set default (now() + interval '7 days'),
  add constraint quizzes_retention_days_check
    check (retention_days in (7, 14));
