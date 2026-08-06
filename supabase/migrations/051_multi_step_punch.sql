-- 4-step daily punch cycle: login / lunchout / afterlunchin / logout.
--
-- IMPORTANT: same as 050_face_registration.sql — this repo's own supabase/migrations
-- folder is not what's run against the shared project. Copy this file into the
-- penfixads-OS repo, RENUMBER it to match the next sequential migration number there,
-- and run it against staging first, then prod.

-- Widen punch_type to allow the 4 new step values while keeping historical 'in'/'out'
-- rows valid. The original CHECK constraint (if any) was defined in 049_attendance.sql
-- in the other repo and isn't visible from here, so this finds and drops whatever
-- constraint currently governs punch_type (by introspecting pg_constraint rather than
-- assuming a name) before adding the widened one.
do $$
declare
  existing_constraint text;
begin
  select conname into existing_constraint
  from pg_constraint
  where conrelid = 'attendance_logs'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) ilike '%punch_type%'
  limit 1;

  if existing_constraint is not null then
    execute format('alter table attendance_logs drop constraint %I', existing_constraint);
  end if;
end $$;

alter table attendance_logs
  add constraint attendance_logs_punch_type_check
  check (punch_type in ('in', 'out', 'login', 'lunchout', 'afterlunchin', 'logout'));

-- Documents a punch that fell outside its expected time window (late, or completing an
-- already-broken sequence) — see lib/attendance-cycle.ts. Admin manual punches
-- (app/actions/admin-manual-punch.ts) leave these false/null; the existing `note`
-- column already covers the admin's explanation.
alter table attendance_logs
  add column if not exists is_flagged boolean not null default false,
  add column if not exists flag_reason text;

comment on column attendance_logs.is_flagged is
  'True when a face-matched punch fell outside its expected time window (lib/attendance-cycle.ts) — surfaced to the employee and Admin as evidence for the half-day-absent policy, not used to block the punch itself.';
comment on column attendance_logs.flag_reason is
  'Human-readable reason for is_flagged, e.g. "Late login — expected ~8:00 AM, punched 2:03 PM".';

-- Lets a logged-in employee read their own attendance_logs rows via the session-scoped
-- client (needed for the new self-service app/my-logs page). Guarded so this is safe to
-- run even if an equivalent policy already exists from 049_attendance.sql under a
-- different name — Postgres just applies both permissive policies.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'attendance_logs'
      and policyname = 'own_select_attendance_logs'
  ) then
    create policy own_select_attendance_logs on attendance_logs
      for select to authenticated
      using (user_email = (auth.jwt() ->> 'email'));
  end if;
end $$;
