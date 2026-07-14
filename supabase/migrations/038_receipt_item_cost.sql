-- The client-facing receipt now shows a Summary Billing breakdown (every item + its own
-- cost, not just the JO-wide total tied to whichever item happens to be selected), so the
-- narrow anon-safe items view (migration 016) needs computed_line_total exposed too.
-- Appended at the end, not inserted where it "belongs" — CREATE OR REPLACE VIEW rejects
-- reordering existing columns (see migration 027/029 for the same gotcha).
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
  cat.category_name,
  i.computed_line_total
from job_order_items i
left join subcategories s on s.subcategory_id = i.subcategory_id
left join categories cat on cat.category_id = s.category_id;

grant select on public_job_order_items_receipt to anon;
