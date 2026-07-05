-- The public /track/[joId] page needs anonymous visitors to read a job order's basic info,
-- but job_orders/clients/job_order_items only ever had an "authenticated" RLS policy — so
-- real anonymous requests were silently returning zero rows this whole time (it only looked
-- like it worked earlier in testing because of a lingering logged-in session in the browser).
--
-- Rather than granting anon broad SELECT on the underlying tables directly (job order IDs are
-- sequential/guessable, so that would let anyone enumerate every client's name, contact info,
-- and full order/payment history via the REST API), expose two narrow read-only views with
-- only the fields the public tracker actually shows.

create or replace view public_job_order_tracking as
select
  jo.job_order_id,
  jo.date_time_received,
  jo.received_by,
  c.client_name,
  c.company_name
from job_orders jo
left join clients c on c.client_id = jo.client_id;

create or replace view public_job_order_items_tracking as
select
  i.item_id,
  i.job_order_id,
  i.job_status,
  i.production_specs,
  i.date_time_needed,
  i.date_time_done,
  i.quantity,
  s.subcategory_name
from job_order_items i
left join subcategories s on s.subcategory_id = i.subcategory_id;

grant select on public_job_order_tracking to anon;
grant select on public_job_order_items_tracking to anon;
