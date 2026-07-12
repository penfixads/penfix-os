-- Clients on the public /track/[joId] page only see item names/specs as text, making it
-- hard to tell which card is which when a JO has several similar-sounding items (e.g. two
-- "Tarpaulin Print (12oz)" rows). Expose the already-uploaded item_preview image (same one
-- staff see in Edit JO/Production) so the tracker can show a thumbnail per item.
--
-- Appended at the end, not inserted where it "belongs" — CREATE OR REPLACE VIEW rejects
-- reordering existing columns (see migration 027 for the same gotcha).
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
  i.item_preview
from job_order_items i
left join subcategories s on s.subcategory_id = i.subcategory_id;

grant select on public_job_order_items_tracking to anon;
