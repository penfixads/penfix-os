-- Supersedes the original version of this migration (never run). Instead of a shared
-- "process type" grouping — one step list reused by many subcategories — SOP steps now
-- attach directly to each subcategory, since even within one broad process like printing
-- the actual steps genuinely differ by media (tarpaulin vs sticker vs canvas vs flex),
-- so sharing one list per process type was too coarse.

-- Drop the process-type grouping added by migration 006 — no longer needed.
alter table subcategories drop column if exists process_type_id;

-- Re-point the SOP steps table at subcategories directly, and rename it to match.
alter table process_type_sop rename to subcategory_sop;
alter table subcategory_sop add column if not exists subcategory_id text references subcategories(subcategory_id) on delete cascade;
alter table subcategory_sop drop column if exists process_type_id;
alter table subcategory_sop add column if not exists is_production_start boolean default false;

create index if not exists idx_subcategory_sop_subcategory on subcategory_sop(subcategory_id);

-- Nothing references process_types anymore.
drop table if exists process_types;

-- The original policy only allowed SELECT — the admin SOP page inserts/updates/deletes
-- steps directly from the browser client, which that would silently have blocked.
drop policy if exists "auth_users_process_types" on subcategory_sop;
drop policy if exists "auth_users_sop" on subcategory_sop;
create policy "auth_users_subcategory_sop" on subcategory_sop for all using (auth.role() = 'authenticated');
