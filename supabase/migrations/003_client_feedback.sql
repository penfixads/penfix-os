-- CLIENT FEEDBACK — submitted via the public /feedback/[token] form
create table if not exists client_feedback (
  id uuid primary key default uuid_generate_v4(),
  token text not null,
  jo text references job_orders(job_order_id) on delete set null,
  client_name text,
  service text,
  rating integer not null check (rating between 1 and 5),
  best_areas text[] default '{}',
  improve_areas text[] default '{}',
  comments text,
  recommend text,
  testimonial_consent text,
  created_at timestamptz not null default now()
);

create index if not exists idx_client_feedback_jo on client_feedback(jo);

alter table client_feedback enable row level security;

-- The public feedback form runs unauthenticated (anon key), so it can only insert, never read.
create policy "anon_insert_client_feedback" on client_feedback for insert to anon with check (true);
create policy "auth_users_client_feedback_select" on client_feedback for select using (auth.role() = 'authenticated');

grant insert on client_feedback to anon;
grant all on client_feedback to authenticated, service_role;
