-- This migration originally linked subcategories to a process_types table (created via ad-hoc
-- SQL that predates this migrations folder) as an intermediate step before migration 007
-- replaced it with direct per-subcategory SOP. schema.sql now bakes in that final shape
-- directly, so the process_types/process_type_id plumbing is omitted here — replaying it on a
-- fresh database would create structure that migration 007 immediately tears down anyway.

-- job_status used to be a fixed 6-value enum, but the Fabricator's Production panel drives
-- status advancement from each item's process_type_sop steps (many more granular names than
-- the old 6). Drop the hard-coded check — validity is now enforced in the app against that
-- item's process type's SOP steps instead of a fixed DB list.
alter table job_order_items drop constraint if exists job_order_items_job_status_check;

-- DispatchClient.tsx, ProductionClient.tsx, and the /track page all already write/read this
-- column, but it was never actually created — every "mark dispatched" / "mark step complete"
-- update has been silently failing (whole update rejected, item never actually flips to Done).
alter table job_order_items add column if not exists date_time_done timestamptz;
