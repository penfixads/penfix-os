-- The billing statement (migration 036) originally only showed each JO's rolled-up total —
-- now it lists every job order's own line items as detail, since a client may have several
-- items per JO and a single total doesn't explain the amount. Narrow view, same anon-safety
-- pattern as every other public_* view (only the fields the statement actually shows).
create or replace view public_client_billing_items as
select
  i.item_id,
  i.job_order_id,
  i.quantity,
  i.job_status,
  i.computed_line_total,
  s.subcategory_name
from job_order_items i
left join subcategories s on s.subcategory_id = i.subcategory_id;

grant select on public_client_billing_items to anon;
