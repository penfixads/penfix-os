-- The tracker (/track/[token]) only ever shows the item preview at 56x56 CSS px, but was
-- shipping the full ~20KB staff-facing preview (sized for normal on-screen viewing, not a tiny
-- public thumbnail) just to display it that small — needless weight on a page clients load
-- over mobile data. item_preview_thumb is a much smaller (~5KB, 200px cap) version generated
-- alongside the full preview at upload time (see JOItemForm.tsx).
--
-- item_preview stays in this view too (appended trailing column, not swapped out) — only
-- items uploaded/re-saved after this migration get a thumbnail; existing items have no way to
-- get one without someone re-uploading the same file, so the app falls back to item_preview
-- for those instead of losing their tracker image entirely (see TrackItems.tsx).
alter table job_order_items add column if not exists item_preview_thumb text;

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
  i.computed_line_total,
  i.item_preview_thumb
from job_order_items i
left join subcategories s on s.subcategory_id = i.subcategory_id;

grant select on public_job_order_items_tracking to anon;
