-- Lets an Admin correct or remove a duplicate/mis-tagged attendance_logs punch from the
-- hr app (components/AttendancePunchRowActions.tsx, app/api/attendance-log/route.ts) —
-- employees are still getting used to the multi-step punch flow (051_multi_step_punch.sql)
-- and duplicate punches are expected while that settles.
--
-- IMPORTANT: same as 050_face_registration.sql / 051_multi_step_punch.sql — this repo's
-- own supabase/migrations folder is not what's run against the shared project. Copy this
-- file into the penfixads-OS repo, RENUMBER it to match the next sequential migration
-- number there, and run it against staging first, then prod.

-- Lightweight audit trail for edits (no equivalent is needed for deletes — the row is
-- just gone, same as the rest of this table's hard-delete-free history up to now).
alter table attendance_logs
  add column if not exists edited_by text,
  add column if not exists edited_at timestamptz;

comment on column attendance_logs.edited_by is
  'Admin email who last corrected this punch (hr app), e.g. after a duplicate/wrong-step punch. Null if never edited.';
comment on column attendance_logs.edited_at is
  'When edited_by last corrected this punch. Null if never edited.';

-- No UPDATE or DELETE policy existed on this table before now (only insert/select from
-- 049_attendance.sql and 051_multi_step_punch.sql) — Admins could not correct or remove a
-- punch even from the Supabase dashboard's RLS-respecting client. Guarded with
-- if-not-exists checks so this is safe to re-run.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'attendance_logs' and policyname = 'admin_update_attendance_logs'
  ) then
    create policy admin_update_attendance_logs on attendance_logs
      for update to authenticated
      using (exists (select 1 from users u where u.user_email = (auth.jwt() ->> 'email') and u.role = 'Admin'));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'attendance_logs' and policyname = 'admin_delete_attendance_logs'
  ) then
    create policy admin_delete_attendance_logs on attendance_logs
      for delete to authenticated
      using (exists (select 1 from users u where u.user_email = (auth.jwt() ->> 'email') and u.role = 'Admin'));
  end if;
end $$;
