-- Lets an Admin manually add a MISSING punch (e.g. an employee forgot to log out) from the
-- hr app — companion to 052_attendance_admin_edit_delete.sql's update/delete policies, which
-- only cover correcting/removing an EXISTING row. Until now there was no way for an Admin to
-- insert a row on another employee's behalf: own_insert_attendance_logs (049_attendance.sql)
-- only allows `user_email = auth.email()`, i.e. self-punches from the kiosk/face-match flow.
--
-- IMPORTANT: same as 050/051/052 — this repo's own supabase/migrations folder is not what's
-- run against the shared project. Copy this file into the penfixads-OS repo, RENUMBER it to
-- match the next sequential migration number there, and run it against staging first, then
-- prod.

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'attendance_logs' and policyname = 'admin_insert_attendance_logs'
  ) then
    create policy admin_insert_attendance_logs on attendance_logs
      for insert to authenticated
      with check (exists (select 1 from users u where u.user_email = (auth.jwt() ->> 'email') and u.role = 'Admin'));
  end if;
end $$;
