-- Powers a public, shareable billing statement for "For Billing" (credit-line) clients —
-- a running list of every job order they still have a balance on, with a grand summary —
-- so Treasury doesn't have to send separate receipts per JO for clients billed periodically.
--
-- Uses the same unguessable public_token pattern as migration 034 (job_orders) instead of
-- the sequential client_id, for the same reason: client_id isn't secret info itself, but it
-- shouldn't be usable as the public lookup key.
alter table clients add column if not exists public_token uuid;
update clients set public_token = gen_random_uuid() where public_token is null;
alter table clients alter column public_token set default gen_random_uuid();
alter table clients alter column public_token set not null;
create unique index if not exists clients_public_token_idx on clients(public_token);

create or replace view public_client_billing as
select
  client_id,
  client_name,
  company_name,
  contact_number,
  public_token
from clients;

grant select on public_client_billing to anon;

create or replace view public_client_billing_jobs as
select
  job_order_id,
  client_id,
  date_time_received,
  grand_total,
  total_amount_paid,
  balance_due,
  payment_status
from job_orders;

grant select on public_client_billing_jobs to anon;
