-- Lets the public /track/[joId] page show real step-by-step progress (Received, For
-- Layout, For Printing, Trimming & Eyelets, Quality Check, Ready for Dispatch) instead of
-- just a generic "In Progress"/"Completed" badge — driven by each item's own subcategory_sop
-- steps, same steps GA/Fabricator already advance through in ProductionClient.tsx.
--
-- Scope: Banners/Tarpaulin only for now (its already-seeded SOP steps match what was asked
-- for). Other categories keep showing the generic badge until their steps are explicitly
-- marked visible_to_client too — see app/(app)/admin/subcategory-sops.

-- 1) Reveal the 4 middle steps for every Banners subcategory (Received and the terminal
--    "Ready For Pickup/Delivery/Installation" step were already visible_to_client).
update subcategory_sop
set visible_to_client = true
where subcategory_id in (select subcategory_id from subcategories where category_id = 'CAT_BAN')
  and status_name in ('For Layout/Design', 'For Printing', 'Trimming & Eyelets', 'Quality Check');

-- 2) Add subcategory_id to the public item-tracking view (needed to look up that item's
--    step list) — not sensitive, same trust level as the subcategory_name already exposed.
-- subcategory_id is appended at the end, not inserted where it "belongs" — Postgres'
-- CREATE OR REPLACE VIEW only allows adding trailing columns, not reordering existing
-- ones (it treats that as renaming a column, which it rejects). Column order doesn't
-- matter to the app either way since Supabase returns rows keyed by column name.
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
  i.subcategory_id
from job_order_items i
left join subcategories s on s.subcategory_id = i.subcategory_id;

grant select on public_job_order_items_tracking to anon;

-- 3) New narrow view: only the SOP steps a subcategory's owner has explicitly marked
--    visible_to_client — keeps every other (internal-only) step name unexposed to anon.
create or replace view public_subcategory_sop_tracking as
select subcategory_id, status_name, sequence, is_terminal
from subcategory_sop
where visible_to_client = true and is_active = true;

grant select on public_subcategory_sop_tracking to anon;
