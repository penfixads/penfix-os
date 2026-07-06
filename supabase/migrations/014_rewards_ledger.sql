-- rewards_ledger has been referenced by app code (NewJOModal, EditJOModal, DispatchClient,
-- and the rewards-balance displays on Today's/Active JOs, Clients) since at least the
-- previous session, but was never actually created — only rewards_redemptions exists in
-- schema.sql, a different (unused) table. Every "earned"/"redeemed" read and write has been
-- silently failing (PGRST205 "table not found") the whole time. This creates the real table
-- with the exact columns the app already writes: ledger_id, client_id, job_order_id, type
-- ('earned'|'redeemed'), amount, notes.
create table if not exists rewards_ledger (
  ledger_id text primary key,
  client_id text references clients(client_id) on delete cascade,
  job_order_id text references job_orders(job_order_id) on delete set null,
  type text check (type in ('earned','redeemed')) not null,
  amount numeric(10,2) not null,
  notes text,
  created_at timestamptz default now()
);
create index if not exists idx_rewards_ledger_client on rewards_ledger(client_id);

alter table rewards_ledger enable row level security;
create policy "auth_users_rewards_ledger" on rewards_ledger for all using (auth.role() = 'authenticated');
grant all on rewards_ledger to authenticated, service_role;
