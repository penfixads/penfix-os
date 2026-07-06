-- Powers a public, shareable "e-Job Order" receipt link (/receipt/[jobOrderId]) that a GA
-- can paste into Messenger/Viber for the client, instead of only a downloadable image.
-- Same anon-safety approach as migration 009 (public tracking): narrow views exposing only
-- the fields the receipt actually shows, not raw table access (JO IDs are guessable).
create or replace view public_job_order_receipt as
select
  jo.job_order_id,
  jo.date_time_received,
  jo.received_by,
  jo.grand_total,
  jo.total_amount_paid,
  jo.balance_due,
  jo.payment_status,
  c.client_name,
  c.company_name,
  c.contact_number
from job_orders jo
left join clients c on c.client_id = jo.client_id;

create or replace view public_job_order_items_receipt as
select
  i.item_id,
  i.job_order_id,
  i.item_preview,
  i.quantity,
  i.width,
  i.height,
  i.production_specs,
  i.notes,
  i.date_time_needed,
  i.job_status,
  s.subcategory_name,
  cat.category_name
from job_order_items i
left join subcategories s on s.subcategory_id = i.subcategory_id
left join categories cat on cat.category_id = s.category_id;

create or replace view public_job_order_payment_methods as
select distinct job_order_id, payment_method
from payments
where payment_method is not null;

-- Just enough to show "Accomplished By" on the receipt — who confirmed the item's current
-- status, not the full internal audit trail (no email/role).
create or replace view public_job_order_item_status_log as
select item_id, status_name, changed_by_name, created_at
from job_order_item_status_log;

grant select on public_job_order_receipt to anon;
grant select on public_job_order_items_receipt to anon;
grant select on public_job_order_payment_methods to anon;
grant select on public_job_order_item_status_log to anon;
