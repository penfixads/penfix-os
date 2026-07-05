-- Records who changed a job_order_item's status to what, and when — the raw data the future
-- "people KPI" system will aggregate. Not building the KPI reporting itself yet, just capturing
-- the attribution now so the history exists once we do.
create table if not exists job_order_item_status_log (
  log_id uuid primary key default uuid_generate_v4(),
  item_id text references job_order_items(item_id) on delete cascade,
  job_order_id text references job_orders(job_order_id) on delete cascade,
  status_name text not null,
  changed_by_email text,
  changed_by_name text,
  changed_by_role text,
  created_at timestamptz not null default now()
);

create index if not exists idx_job_order_item_status_log_item on job_order_item_status_log(item_id);
create index if not exists idx_job_order_item_status_log_user on job_order_item_status_log(changed_by_email);

alter table job_order_item_status_log enable row level security;
create policy "auth_users_status_log" on job_order_item_status_log for all using (auth.role() = 'authenticated');
grant all on job_order_item_status_log to authenticated, service_role;
