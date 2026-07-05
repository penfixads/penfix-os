-- Links each subcategory to the process type whose SOP steps it should follow in production
-- (subcategories.job_flow was the old freeform-text version of this; nothing in the app reads
-- it anymore, so this supersedes it).
alter table subcategories add column if not exists process_type_id text references process_types(process_type_id);

-- job_status used to be a fixed 6-value enum, but the Fabricator's Production panel drives
-- status advancement from each item's process_type_sop steps (many more granular names than
-- the old 6). Drop the hard-coded check — validity is now enforced in the app against that
-- item's process type's SOP steps instead of a fixed DB list.
alter table job_order_items drop constraint if exists job_order_items_job_status_check;

-- DispatchClient.tsx, ProductionClient.tsx, and the /track page all already write/read this
-- column, but it was never actually created — every "mark dispatched" / "mark step complete"
-- update has been silently failing (whole update rejected, item never actually flips to Done).
alter table job_order_items add column if not exists date_time_done timestamptz;
