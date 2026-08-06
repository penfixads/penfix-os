-- Attendance monitoring (attendance.penfixads.com): staff punch in/out with a selfie +
-- geolocation, logged for manager review — not automated enforcement. Lives in this same
-- project (not a separate one) so it can share the `users` table and RLS conventions
-- directly, per the decision to run all Penfix internal apps as one ecosystem/database
-- rather than splitting each app's data into its own project.

create table if not exists attendance_logs (
  id uuid primary key default uuid_generate_v4(),
  user_email text not null references users(user_email),
  punch_type text not null check (punch_type in ('in', 'out')),
  photo_path text not null,   -- path within the private attendance-photos bucket
  latitude double precision not null,
  longitude double precision not null,
  place_name text,            -- reverse-geocoded label, nullable if geocoding fails
  created_at timestamptz not null default now()
);

create index if not exists attendance_logs_user_email_idx on attendance_logs (user_email);
create index if not exists attendance_logs_created_at_idx on attendance_logs (created_at desc);

alter table attendance_logs enable row level security;

-- Staff can log and read their own punches; Admin can read everyone's — matches the
-- attendance app's own /logs admin page, enforced here too so it can't be bypassed by a
-- direct Supabase client call (same reasoning as the categories/subcategories policies).
create policy "own_insert_attendance_logs" on attendance_logs for insert
  with check (user_email = auth.email());
create policy "own_select_attendance_logs" on attendance_logs for select
  using (user_email = auth.email());
create policy "admin_select_attendance_logs" on attendance_logs for select
  using (exists (select 1 from users u where u.user_email = auth.email() and u.role = 'Admin'));

-- Private bucket — unlike jo-images, these are employee selfies + location, not meant
-- for public/anon reads. Path convention: {user_email}/{timestamp}.jpg.
insert into storage.buckets (id, name, public)
values ('attendance-photos', 'attendance-photos', false)
on conflict (id) do nothing;

create policy "own_insert_attendance_photos" on storage.objects for insert to authenticated
  with check (bucket_id = 'attendance-photos' and (storage.foldername(name))[1] = auth.email());
create policy "own_select_attendance_photos" on storage.objects for select to authenticated
  using (bucket_id = 'attendance-photos' and (storage.foldername(name))[1] = auth.email());
create policy "admin_select_attendance_photos" on storage.objects for select to authenticated
  using (bucket_id = 'attendance-photos' and exists (select 1 from users u where u.user_email = auth.email() and u.role = 'Admin'));
