-- Lets a GA/Treasury request permission to backdate a job order (Add Historical Records)
-- without needing an Admin physically present to type credentials into their device — the
-- Admin can approve from their own phone via the Pending Approval page instead.
create table if not exists historical_unlock_requests (
  request_id text primary key,
  requested_by_email text,
  requested_by_name text,
  status text check (status in ('Pending','Approved','Rejected')) default 'Pending',
  approved_by text,
  created_at timestamptz default now(),
  resolved_at timestamptz
);

alter table historical_unlock_requests enable row level security;
create policy "auth_users_historical_unlock_requests" on historical_unlock_requests for all using (auth.role() = 'authenticated');
grant all on historical_unlock_requests to authenticated, service_role;
