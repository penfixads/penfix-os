-- Catch-up for tables that exist in STAGING but were never created in PRODUCTION.
-- Generated 2026-07-09 after diffing staging (xfzjluxvspqwrsspvmrp) vs production
-- (rrocipgacruxsdpifsnq) via the PostgREST schema. Every statement is idempotent
-- (if not exists / drop-then-create for policies). Paste as one block into the
-- PRODUCTION project's Supabase SQL Editor.
--
-- Scope: only the 8 tables staging has that production doesn't. Does NOT touch
-- any existing production table/data. Excludes production's extra
-- subcategory_sop_procedures table (that gap runs the other way — staging is
-- missing it, not production; see supabase/STAGING_CATCHUP.sql section 3).

-- ============================================================
-- 1) PURCHASES + SUPPLIER_DELIVERIES (migrations 018, 019, 020)
--    Built without the `materials` column — merged into `specs` per migration
--    021, and no app code reads/writes `materials` (confirmed via grep).
-- ============================================================
create table if not exists purchases (
  purchase_id text primary key,
  purchase_date date not null,
  supplier_name text not null,
  specs text not null,
  size text,
  amount numeric(10,2) not null default 0,
  quantity numeric(10,2) not null default 1,
  total_amount numeric(10,2) not null default 0,
  remarks text,
  recorded_by text,
  created_at timestamptz default now()
);
create index if not exists idx_purchases_purchase_date on purchases(purchase_date);

create table if not exists supplier_deliveries (
  delivery_id text primary key,
  delivery_date date not null,
  supplier_name text not null,
  specs text not null,
  size text,
  unit_price numeric(10,2) not null default 0,
  quantity numeric(10,2) not null default 1,
  total_amount numeric(10,2) not null default 0,
  remarks text,
  billing_month date not null,
  recorded_by text,
  created_at timestamptz default now()
);
create index if not exists idx_supplier_deliveries_billing_month on supplier_deliveries(billing_month);
create index if not exists idx_supplier_deliveries_delivery_date on supplier_deliveries(delivery_date);

-- Match every other table in this project: access controlled via GRANTs, not RLS.
alter table purchases disable row level security;
alter table supplier_deliveries disable row level security;
grant all on purchases, supplier_deliveries to authenticated, service_role;

-- ============================================================
-- 2) TOOLS INVENTORY SYSTEM (tools/supabase/schema.sql, verbatim)
--    Shares this Supabase project with penfixads-OS but is owned by the
--    separate tools.penfixads.com app.
-- ============================================================
create extension if not exists "uuid-ossp";

create table if not exists tool_users (
  id uuid primary key default uuid_generate_v4(),
  user_email text unique not null,
  name text not null,
  role text not null check (role in ('Admin', 'Custodian', 'Fabricator')),
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists tool_catalog (
  id uuid primary key default uuid_generate_v4(),
  tool_name text not null,
  specifications text,
  image_urls text[] not null default '{}',
  total_qty integer not null default 0 check (total_qty >= 0),
  status text not null default 'Active' check (status in ('Active', 'Broken', 'Retired')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists tool_borrow_requests (
  id uuid primary key default uuid_generate_v4(),
  tool_id uuid not null references tool_catalog(id),
  qty integer not null check (qty > 0),
  status text not null default 'Request' check (status in ('Request', 'Borrowed', 'Returned')),
  requested_by uuid not null references tool_users(id),
  requested_at timestamptz not null default now(),
  approved_by uuid references tool_users(id),
  approved_at timestamptz,
  returned_by uuid references tool_users(id),
  returned_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists tool_borrow_proponents (
  borrow_request_id uuid not null references tool_borrow_requests(id) on delete cascade,
  user_id uuid not null references tool_users(id),
  primary key (borrow_request_id, user_id)
);

create table if not exists tool_borrow_logs (
  id uuid primary key default uuid_generate_v4(),
  borrow_request_id uuid not null references tool_borrow_requests(id) on delete cascade,
  status text not null,
  changed_by uuid references tool_users(id),
  changed_at timestamptz not null default now()
);

create or replace function log_tool_borrow_status_change()
returns trigger
language plpgsql
as $$
begin
  if (tg_op = 'INSERT') then
    insert into tool_borrow_logs (borrow_request_id, status, changed_by, changed_at)
    values (new.id, new.status, new.requested_by, new.requested_at);
  elsif (tg_op = 'UPDATE' and new.status is distinct from old.status) then
    insert into tool_borrow_logs (borrow_request_id, status, changed_by, changed_at)
    values (
      new.id,
      new.status,
      case new.status when 'Borrowed' then new.approved_by when 'Returned' then new.returned_by end,
      coalesce(case new.status when 'Borrowed' then new.approved_at when 'Returned' then new.returned_at end, now())
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_log_tool_borrow_status on tool_borrow_requests;
create trigger trg_log_tool_borrow_status
  after insert or update on tool_borrow_requests
  for each row execute function log_tool_borrow_status_change();

create or replace view tool_catalog_availability as
select
  t.*,
  t.total_qty - coalesce((
    select sum(br.qty) from tool_borrow_requests br
    where br.tool_id = t.id and br.status = 'Borrowed'
  ), 0) as available_qty
from tool_catalog t;

alter table tool_users enable row level security;
alter table tool_catalog enable row level security;
alter table tool_borrow_requests enable row level security;
alter table tool_borrow_proponents enable row level security;
alter table tool_borrow_logs enable row level security;

drop policy if exists "auth_users_tool_users" on tool_users;
drop policy if exists "auth_users_tool_catalog" on tool_catalog;
drop policy if exists "auth_users_tool_borrow_requests" on tool_borrow_requests;
drop policy if exists "auth_users_tool_borrow_proponents" on tool_borrow_proponents;
drop policy if exists "auth_users_tool_borrow_logs" on tool_borrow_logs;

create policy "auth_users_tool_users" on tool_users for all using (auth.role() = 'authenticated');
create policy "auth_users_tool_catalog" on tool_catalog for all using (auth.role() = 'authenticated');
create policy "auth_users_tool_borrow_requests" on tool_borrow_requests for all using (auth.role() = 'authenticated');
create policy "auth_users_tool_borrow_proponents" on tool_borrow_proponents for all using (auth.role() = 'authenticated');
create policy "auth_users_tool_borrow_logs" on tool_borrow_logs for all using (auth.role() = 'authenticated');

grant usage on schema public to anon, authenticated, service_role;
grant all on tool_users, tool_catalog, tool_borrow_requests, tool_borrow_proponents, tool_borrow_logs to anon, authenticated, service_role;
grant select on tool_catalog_availability to anon, authenticated, service_role;

-- ============================================================
-- Re-audited 2026-07-20 against migrations 023-042 (previous pass only covered
-- up to 022). Sections 1-2 above were already live on production by this point.
-- Sections 3-8 below are new gaps found this pass.
-- ============================================================

-- ============================================================
-- 3) OVERHEAD_EXPENSES (migration 022)
--    Monthly fixed overhead used to compute final Profit in Sales Reports.
--    Carries real salary data, so it's the one table with an actual
--    role-based RLS policy instead of a blanket authenticated-user policy.
-- ============================================================
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

-- ============================================================
-- 4) JO PRINT STORAGE (migration 025)
--    Private bucket for full-resolution client print files, separate from
--    job_order_items.item_preview's compressed on-screen thumbnail.
-- ============================================================
insert into storage.buckets (id, name, public)
values ('jo-print-files', 'jo-print-files', false)
on conflict (id) do nothing;

alter table job_order_items
  add column if not exists original_file_path text;

-- ============================================================
-- 5) ITEM SEAMING FEE (migration 039)
--    Seaming add-on charge (P10/sqft), computed from width x height like the
--    item's own area-based pricing but kept editable.
-- ============================================================
alter table job_order_items add column if not exists seaming_fee numeric(10,2) default 0;

-- ============================================================
-- 6) RECEIPT ITEM FEE BREAKDOWN (migration 040)
--    Recreates the anon-safe receipt items view with computed_line_total and
--    the layout/delivery/installation/seaming fee columns -- production's copy
--    of this view predates all of them. Must run after section 5 above (needs
--    job_order_items.seaming_fee to exist).
-- ============================================================
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
-- 7) DAILY SUMMARY LOCK (migration 042)
-- ============================================================
alter table daily_sales_summary
  add column if not exists is_locked boolean not null default false;

-- ============================================================
-- 8) CLIENT BILLING STATEMENT ITEM DETAIL (migration 037)
--    Never applied to either project -- the per-item detail view for the
--    billing statement (migration 036, already live on production via
--    public_client_billing / public_client_billing_jobs).
-- ============================================================
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
