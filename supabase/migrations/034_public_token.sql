-- job_order_id is sequential (JO-MMDDYYYY-001, -002, ...), and both /track/[joId] and
-- /receipt/[jobOrderId] used it directly as the URL lookup key. That means anyone — not
-- just someone a link was shared with — could enumerate nearby IDs and view any other
-- client's items, prices, payment status, and (on the receipt) contact number, just by
-- editing the URL. Migration 009's own comment flagged this same risk and mitigated it with
-- narrow views, but never addressed the guessable key itself.
--
-- Adds a random, unguessable public_token per job order. The public routes now look up by
-- this token instead of job_order_id — job_order_id itself isn't secret and still appears
-- in the page content, it's just no longer usable as the entry key.
alter table job_orders add column if not exists public_token uuid;
update job_orders set public_token = gen_random_uuid() where public_token is null;
alter table job_orders alter column public_token set default gen_random_uuid();
alter table job_orders alter column public_token set not null;
create unique index if not exists job_orders_public_token_idx on job_orders(public_token);

create or replace view public_job_order_tracking as
select
  jo.job_order_id,
  jo.date_time_received,
  jo.received_by,
  c.client_name,
  c.company_name,
  jo.grand_total,
  jo.total_amount_paid,
  jo.balance_due,
  jo.payment_status,
  jo.public_token
from job_orders jo
left join clients c on c.client_id = jo.client_id;

grant select on public_job_order_tracking to anon;

create or replace view public_job_order_receipt as
select
  jo.job_order_id,
  jo.date_time_received,
  jo.received_by,
  jo.grand_total,
  jo.total_amount_paid,
  jo.balance_due,
  jo.payment_status,
  jo.discount,
  c.client_name,
  c.company_name,
  c.contact_number,
  jo.source_channel,
  jo.public_token
from job_orders jo
left join clients c on c.client_id = jo.client_id;

grant select on public_job_order_receipt to anon;
