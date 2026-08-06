-- Face-recognition punch in/out.
--
-- IMPORTANT: this repo's own supabase/migrations folder is not what's run against
-- the shared project — per SETUP.md, migrations are authored and run from the
-- penfixads-OS repo. Copy this file there, RENUMBER it to match the next
-- sequential migration number in that repo (049_attendance.sql was the last one
-- referenced from here — confirm the actual current highest number before
-- picking 050), and run it against staging first, then prod.

-- One-time face registration, done while logged in (app/register). Employees
-- get 3 samples each (not averaged — averaging 128-d embeddings degrades
-- accuracy; matching is done against all stored rows, taking the best distance).
-- No uniqueness constraint on user_email: re-registration deletes old rows and
-- inserts fresh ones rather than updating in place.
create table employee_face_descriptors (
  id uuid primary key default gen_random_uuid(),
  user_email text not null references users(user_email) on delete cascade,
  descriptor float4[] not null,
  created_at timestamptz not null default now(),
  constraint employee_face_descriptors_descriptor_length
    check (array_length(descriptor, 1) = 128)
);

create index employee_face_descriptors_user_email_idx
  on employee_face_descriptors(user_email);

alter table employee_face_descriptors enable row level security;

-- Self-service registration: a logged-in employee may insert/view/replace only
-- their own face samples. This is the ONLY write path into this table that goes
-- through a user session (app/actions/register-face.ts) — the public, anonymous
-- punch page never touches it directly.
create policy own_insert_face_descriptor on employee_face_descriptors
  for insert to authenticated
  with check (user_email = (auth.jwt() ->> 'email'));

create policy own_select_face_descriptor on employee_face_descriptors
  for select to authenticated
  using (user_email = (auth.jwt() ->> 'email'));

create policy own_delete_face_descriptor on employee_face_descriptors
  for delete to authenticated
  using (user_email = (auth.jwt() ->> 'email'));

-- Lets Admins see registration coverage across staff from a future admin UI.
-- Not required for matching — the punch-time 1:N match goes through the
-- service-role client (lib/supabase-admin.ts), which bypasses RLS entirely and
-- needs no policy here at all.
create policy admin_select_all_face_descriptors on employee_face_descriptors
  for select to authenticated
  using (
    exists (
      select 1 from users u
      where u.user_email = (auth.jwt() ->> 'email')
        and u.role = 'Admin'
    )
  );

-- No policy exists for the anon role and none is needed: RLS defaults to deny,
-- so an unauthenticated request (the public punch page) cannot read this table
-- under any circumstance except via the service-role key, which is exactly the
-- intended boundary that keeps biometric templates from being scrapeable.

-- Support for the admin manual-punch fallback (app/actions/admin-manual-punch.ts)
-- and match auditing on face-matched punches. These ALTERs are additive and
-- backward-compatible — verify actual current nullability of photo_path /
-- latitude / longitude against the real 049_attendance.sql before running;
-- the DROP NOT NULL calls are no-ops if they're already nullable.
alter table attendance_logs
  alter column photo_path drop not null,
  alter column latitude drop not null,
  alter column longitude drop not null,
  add column if not exists match_distance float4,
  add column if not exists recorded_by text,
  add column if not exists note text;

comment on column attendance_logs.match_distance is
  'Euclidean distance between the probe descriptor and the matched stored descriptor at punch time (face-matched punches only) — kept for auditing/tuning the 0.6 match threshold in app/actions/identify-punch.ts';
comment on column attendance_logs.recorded_by is
  'user_email of the Admin who manually recorded this punch via the /logs fallback; null for self-service face-matched punches';
comment on column attendance_logs.note is
  'Optional free-text reason, populated for admin manual punches';
