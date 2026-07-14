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
--      so the public receipt page silently omits it when a discount was applied. ──
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
  c.contact_number
from job_orders jo
left join clients c on c.client_id = jo.client_id;
grant select on public_job_order_receipt to anon;

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

-- ── 10) migration 029 — public_job_order_receipt view missing source_channel. ──
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
  jo.source_channel
from job_orders jo
left join clients c on c.client_id = jo.client_id;
grant select on public_job_order_receipt to anon;
