-- Lets a client upload a screenshot of their e-wallet/bank payment straight from the public
-- /track/[token] page instead of sending it over Messenger/Viber for staff to manually match
-- to a job order. Deliberately NOT written straight into `payments` — a wrong claimed amount
-- or a bogus screenshot would otherwise silently move total_amount_paid/balance_due. Instead
-- it lands here as Pending, and an Admin/GA/Treasury confirms it (see /jos/payment-proofs),
-- which is what actually inserts into `payments` and updates the job order.
create table if not exists payment_proofs (
  proof_id uuid primary key default uuid_generate_v4(),
  job_order_id text references job_orders(job_order_id) on delete cascade,
  claimed_amount numeric(10,2) not null,
  payment_method text check (payment_method in (
    'G-Cash','Maya','Bank Transfer via BPI Acct.','Bank Transfer via BDO Acct.'
  )),
  -- Compressed JPEG data URL, same convention as job_order_items.item_preview — no
  -- Supabase Storage bucket in use anywhere else in this app, so not introducing one here.
  proof_image text not null,
  client_note text,
  status text not null default 'Pending' check (status in ('Pending','Confirmed','Rejected')),
  reviewed_by text,
  reviewed_at timestamptz,
  review_remarks text,
  linked_payment_id text references payments(payment_id),
  created_at timestamptz default now()
);
create index if not exists idx_payment_proofs_status on payment_proofs(status);
create index if not exists idx_payment_proofs_jo on payment_proofs(job_order_id);

alter table payment_proofs enable row level security;

-- The public /track/[token] page inserts unauthenticated (anon key), same shape as
-- migration 003's client_feedback — insert-only, no read access.
create policy "anon_insert_payment_proofs" on payment_proofs for insert to anon with check (true);
create policy "auth_users_payment_proofs" on payment_proofs for all using (auth.role() = 'authenticated');

grant insert on payment_proofs to anon;
grant all on payment_proofs to authenticated, service_role;
