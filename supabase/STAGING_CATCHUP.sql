-- Consolidated catch-up for migrations that exist in supabase/migrations/ but were
-- never actually run against this database. Safe to paste as one block into the
-- Supabase SQL Editor — every statement is idempotent (if not exists / or replace).
-- Generated 2026-07-08 after auditing all 22 migrations against the live schema.

-- ── 1) migration 020 — purchases/supplier_deliveries RLS was auto-enabled with zero
--      policy when the tables were created via the dashboard, blocking every insert. ──
alter table purchases disable row level security;
alter table supplier_deliveries disable row level security;

-- ── 2) migration 021 — drop the redundant materials column, now merged into Specs. ──
alter table purchases drop column if exists materials;
alter table supplier_deliveries drop column if exists materials;

-- ── 3) migration 011 — subcategory_sop_procedures table was never created at all,
--      breaking "Add SOP Item" on the Subcategory SOPs admin page. ──
create table if not exists subcategory_sop_procedures (
  procedure_id text primary key,
  sop_id text references subcategory_sop(sop_id) on delete cascade,
  sequence integer,
  instruction text not null,
  is_active boolean default true
);
create index if not exists idx_subcategory_sop_procedures_sop on subcategory_sop_procedures(sop_id);
alter table subcategory_sop_procedures enable row level security;
drop policy if exists "auth_users_subcategory_sop_procedures" on subcategory_sop_procedures;
create policy "auth_users_subcategory_sop_procedures" on subcategory_sop_procedures for all using (auth.role() = 'authenticated');
grant all on subcategory_sop_procedures to authenticated, service_role;
-- After this runs, also paste supabase/migrations/012_seed_sop_procedures.sql once —
-- it depends on this table existing and was almost certainly never applied either.

-- ── 4) migration 022 — overhead_expenses table was never created. The entire
--      Overhead Expenses feature is non-functional without this. ──
create table if not exists overhead_expenses (
  overhead_id text primary key,
  month date not null,
  expense_name text not null,
  amount numeric(10,2) not null default 0,
  remarks text,
  recorded_by text,
  created_at timestamptz default now()
);
create index if not exists idx_overhead_expenses_month on overhead_expenses(month);
alter table overhead_expenses enable row level security;
drop policy if exists "admin_only_overhead_expenses" on overhead_expenses;
create policy "admin_only_overhead_expenses" on overhead_expenses for all
  using (exists (select 1 from users u where u.user_email = auth.email() and u.role = 'Admin'))
  with check (exists (select 1 from users u where u.user_email = auth.email() and u.role = 'Admin'));
grant select, insert, update, delete on overhead_expenses to authenticated;
grant all on overhead_expenses to service_role;

-- ── 5) migration 003 — client_feedback's policies never actually took effect (table
--      exists, but anon insert is rejected), breaking the public feedback form. ──
drop policy if exists "anon_insert_client_feedback" on client_feedback;
drop policy if exists "auth_users_client_feedback_select" on client_feedback;
create policy "anon_insert_client_feedback" on client_feedback for insert to anon with check (true);
create policy "auth_users_client_feedback_select" on client_feedback for select using (auth.role() = 'authenticated');
grant insert on client_feedback to anon;
grant all on client_feedback to authenticated, service_role;

-- ── 6) migration 017 — public_job_order_receipt view is missing the discount column,
--      so the public receipt page silently omits it when a discount was applied.
--      SUPERSEDED 2026-07-20 — checked the live view, it already has this column plus
--      everything from migrations 029/034 too (source_channel, public_token). The
--      original CREATE OR REPLACE below only listed 11 columns, which would DROP the
--      already-live source_channel/public_token and fail with "42P16: cannot drop
--      columns from view". See item 10 for the up-to-date, safe version of this view. ──

-- ── 7) Data fix for JO-06262026-001-6a1b — EditJOModal's job_orders update always
--      included balance_due, a generated/computed column, so Postgres rejected the
--      *entire* update statement every time someone saved changes from Edit Job Order
--      (silently — the code never checked the error). This JO had a ₱1,430 Cash
--      payment recorded (real row in payments) that never got reflected in
--      total_amount_paid/payment_status/is_fully_paid. Audited all 451 job_orders
--      against actual payments sums — this is the only row affected. Fixed going
--      forward in components/EditJOModal.tsx (balance_due removed from the update,
--      error now checked/thrown). ──
update job_orders
set total_amount_paid = 1430, payment_status = 'Fully Paid', is_fully_paid = true
where job_order_id = 'JO-06262026-001-6a1b';

-- ── 8) Backfill job_orders.job_status = 'Done' for JOs stuck showing as Active.
--      Bug: items could reach Done via Production or Edit JO checklist without ever
--      triggering the JO-level rollup (that rollup previously only lived in the
--      Dispatch page). Fixed going forward in lib/jo-completion.ts; this one-time
--      backfill catches JOs that already have every item Done/Cancelled and are
--      settled (fully paid or approved For Billing) but were never flipped. ──
update job_orders jo
set job_status = 'Done'
where jo.job_status not in ('Done', 'Cancelled')
  and (jo.is_fully_paid = true or jo.is_for_billing = true)
  and exists (select 1 from job_order_items i where i.job_order_id = jo.job_order_id)
  and not exists (
    select 1 from job_order_items i
    where i.job_order_id = jo.job_order_id
      and i.job_status not in ('Done', 'Cancelled')
  );

-- ── 11) migration 038 — public_job_order_items_receipt view missing computed_line_total,
--      needed for the receipt's new Summary Billing per-item cost breakdown. ──
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

-- ── 12) migration 039 — job_order_items.seaming_fee column, needed for the new
--      "Needs seaming?" (₱10/sqft) add-on on Add/Edit Job Order Item. ──
alter table job_order_items add column if not exists seaming_fee numeric(10,2) default 0;

-- ── 9) migration 028 — job_orders.source_channel column never created, so New/Edit
--      JO fails with "Could not find the 'source_channel' column ... in the schema
--      cache" when saving. ──
alter table job_orders add column if not exists source_channel text
  check (source_channel in ('Walk-in', 'Messenger', 'Viber', 'WhatsApp', 'Phone Call', 'Email'));

-- ── 10) migration 029 — public_job_order_receipt view missing source_channel.
--       Updated 2026-07-20 to also include public_token (migration 034) so this
--       matches the view's actual current live definition exactly — a true no-op
--       if already applied, safe if not. ──
create or replace view public_job_order_receipt as
select
  jo.job_order_id,
  jo.date_time_received,
  jo.received_by,
  jo.grand_total,
  jo.total_amount_paid,
  jo.balance_due,
  jo.payment_status,
  jo.discount,
  c.client_name,
  c.company_name,
  c.contact_number,
  jo.source_channel,
  jo.public_token
from job_orders jo
left join clients c on c.client_id = jo.client_id;
grant select on public_job_order_receipt to anon;

-- ── 13) migration 040 — public_job_order_items_receipt view missing the fee columns,
--      needed for the receipt's Summary Billing to break the selected item's own cost
--      into price + add-on fees instead of listing every item in the JO. ──
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
  i.seaming_fee
from job_order_items i
left join subcategories s on s.subcategory_id = i.subcategory_id
left join categories cat on cat.category_id = s.category_id;
grant select on public_job_order_items_receipt to anon;

-- ============================================================
-- Re-audited 2026-07-20 against production's live schema. Items 1-13 above
-- are drafted but confirmed NOT yet applied to staging (checked via live
-- PostgREST schema diff) except items 1, 2, and 4, which are already in
-- effect. Items 14-16 below are new gaps found this pass: two migrations
-- (036, 037) that shipped straight to production without ever touching
-- staging, plus data drift in subcategories.
-- ============================================================

-- ── 14) migration 036 -- client billing statement. clients.public_token +
--      public_client_billing / public_client_billing_jobs views. Live on
--      production; never applied to staging. ──
alter table clients add column if not exists public_token uuid;
update clients set public_token = gen_random_uuid() where public_token is null;
alter table clients alter column public_token set default gen_random_uuid();
alter table clients alter column public_token set not null;
create unique index if not exists clients_public_token_idx on clients(public_token);

create or replace view public_client_billing as
select
  client_id,
  client_name,
  company_name,
  contact_number,
  public_token
from clients;
grant select on public_client_billing to anon;

create or replace view public_client_billing_jobs as
select
  job_order_id,
  client_id,
  date_time_received,
  grand_total,
  total_amount_paid,
  balance_due,
  payment_status
from job_orders;
grant select on public_client_billing_jobs to anon;

-- ── 15) migration 037 -- public_client_billing_items view. Confirmed missing
--      from BOTH staging and production (never applied to either). ──
create or replace view public_client_billing_items as
select
  i.item_id,
  i.job_order_id,
  i.quantity,
  i.job_status,
  i.computed_line_total,
  s.subcategory_name
from job_order_items i
left join subcategories s on s.subcategory_id = i.subcategory_id;
grant select on public_client_billing_items to anon;

-- ── 16) Data catchup -- 4 subcategories added on staging since the last
--      PENFIX_CRM seed sync, never carried over to production (confirmed via
--      row-count diff: staging has 225 subcategories, production has 221). ──
INSERT INTO subcategories (subcategory_id, subcategory_name, category_id, subcategory_type, description, thickness, color, print_type, pricing_model, base_price, unit, job_flow, min_qty, accepted_units, require_specs, spec_fields, roll_widths_ft, active, tags, material_options, print_quality, pass_options, image_link, installation_surcharge) VALUES
  ('BAN-SUBLIPAP-48', 'Pattern Print on Subli Paper', 'CAT_BAN', 'Sublimation Paper', 'Printing 3 pass for sublimation paper', NULL, NULL, NULL, 'area', 10, 'sqft', NULL, 1, NULL, false, NULL, NULL, true, NULL, NULL, NULL, NULL, NULL, NULL),
  ('DSP-SNTR-SQ-05', 'Sintra with Stickers (4-edged, 5mm)', 'CAT_DAD', 'Sintra with Stickers', 'Rectangular shaped sintra boards with stickers, 5mm thickness', NULL, NULL, NULL, 'area', 195, 'sqft', 'Received, For Layout/Vectoring,For Production,For Printing,For Assembly,Packaging, Ready For Pickup/Delivery/Installation,Done,Cancelled', 1, 'ft,cm,in,m', false, 'Height,Width,AcceptedUnits,Qty', NULL, true, 'standee,sintra,table', '["Sintra", "Acrylic"]', '[]', '[]', NULL, NULL),
  ('DTP-CARDBOAR-56', 'Cardboard Tickets', 'CAT_DTP', 'Tickets on Photopaper', 'Perforated 230 GSM Tickets', NULL, NULL, NULL, 'area', 0.45, 'inch', NULL, 1, NULL, false, NULL, NULL, true, NULL, NULL, NULL, NULL, NULL, NULL),
  ('PSVC-SC05', 'Signage Installation', 'CAT_FPS', 'Installation', 'Installation of Billboards and Signages (installation only, no dismantling)', NULL, NULL, NULL, 'starts_with', 2500, 'per service', 'Received,For Production,Installation,Done,Cancelled', 1, '-', false, 'Height,Width,AcceptedUnits,Qty', NULL, true, 'installation,signage,custom,phoenix', '["-"]', '[]', '[]', NULL, NULL)
ON CONFLICT (subcategory_id) DO NOTHING;
