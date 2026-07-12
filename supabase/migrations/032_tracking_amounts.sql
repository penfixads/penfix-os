-- Adds per-item pricing and the job order's overall Total/Paid/Balance Due to the public
-- tracker (/track/[joId]) — same fields the public receipt view (migration 029) already
-- exposes on a similarly anon-safe, unauthenticated page, so this isn't a new category of
-- exposure, just extending it to the tracker.
--
-- Appended at the end, not inserted where it "belongs" — CREATE OR REPLACE VIEW rejects
-- reordering existing columns (see migration 027 for the same gotcha).
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
  jo.payment_status
from job_orders jo
left join clients c on c.client_id = jo.client_id;

grant select on public_job_order_tracking to anon;

create or replace view public_job_order_items_tracking as
select
  i.item_id,
  i.job_order_id,
  i.job_status,
  i.production_specs,
  i.date_time_needed,
  i.date_time_done,
  i.quantity,
  s.subcategory_name,
  i.subcategory_id,
  i.item_preview,
  i.computed_line_total
from job_order_items i
left join subcategories s on s.subcategory_id = i.subcategory_id;

grant select on public_job_order_items_tracking to anon;
