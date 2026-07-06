-- Nested SOP checklist per Job Flow step. `subcategory_sop` is the Job Flow (the sequence of
-- statuses an item moves through, e.g. Received -> For Layout/Design -> For Printing -> ...).
-- This table is the actual SOP: a structured, ordered checklist of considerations/procedures
-- for how to do one specific step well (e.g. under "For Layout/Design": file-resolution checks,
-- how client approval is obtained, etc.). Content is added later, subcategory by subcategory —
-- this migration only adds the structure.
create table if not exists subcategory_sop_procedures (
  procedure_id text primary key,
  sop_id text references subcategory_sop(sop_id) on delete cascade,
  sequence integer,
  instruction text not null,
  is_active boolean default true
);
create index if not exists idx_subcategory_sop_procedures_sop on subcategory_sop_procedures(sop_id);

alter table subcategory_sop_procedures enable row level security;
create policy "auth_users_subcategory_sop_procedures" on subcategory_sop_procedures for all using (auth.role() = 'authenticated');
grant all on subcategory_sop_procedures to authenticated, service_role;
