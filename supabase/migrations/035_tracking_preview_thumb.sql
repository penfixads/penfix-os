-- The tracker (/track/[token]) only ever shows item_preview at 56x56 CSS px, but migration
-- 030 wired it to the full ~20KB staff-facing preview (compressed for on-screen viewing at
-- normal size, not for a tiny public thumbnail) — needlessly heavy for a page clients load
-- over mobile data. item_preview_thumb is a much smaller (~5KB, 200px cap) version generated
-- alongside the full preview at upload time (see JOItemForm.tsx); the tracker now uses that
-- instead. The full-size item_preview is unchanged and still used everywhere internal
-- (Edit JO, Production, receipt).
alter table job_order_items add column if not exists item_preview_thumb text;

-- CREATE OR REPLACE VIEW can't drop an existing output column (only append new ones), and
-- dropping item_preview from this view's output is the whole point here — drop and recreate
-- instead. No other view/object depends on this one, so this is safe.
drop view if exists public_job_order_items_tracking;

create view public_job_order_items_tracking as
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
  i.computed_line_total,
  i.item_preview_thumb
from job_order_items i
left join subcategories s on s.subcategory_id = i.subcategory_id;

grant select on public_job_order_items_tracking to anon;
