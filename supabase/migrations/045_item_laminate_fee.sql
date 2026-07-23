-- Same idea as migration 039's seaming fee — lets staff bundle a laminate add-on charge
-- directly into an item's line, priced at ₱20/sqft and computed from width × height like the
-- item's own area-based pricing, but kept editable in case that needs overriding.
alter table job_order_items add column if not exists laminate_fee numeric(10,2) default 0;

-- Appended at the end, not inserted where it "belongs" — CREATE OR REPLACE VIEW rejects
-- reordering existing columns (see migration 027/029/038/040 for the same gotcha).
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
  i.computed_line_total,
  i.layout_fee,
  i.delivery_fee,
  i.installation_fee,
  i.seaming_fee,
  i.laminate_fee
from job_order_items i
left join subcategories s on s.subcategory_id = i.subcategory_id
left join categories cat on cat.category_id = s.category_id;

grant select on public_job_order_items_receipt to anon;
