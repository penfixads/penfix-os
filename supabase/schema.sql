-- ============================================================
-- PENFIX OS — Job Order System Schema
-- Run this in Supabase SQL Editor
-- ============================================================

create extension if not exists "uuid-ossp";

-- USERS
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  user_email text unique not null,
  name text not null,
  role text not null check (role in ('Admin', 'GA', 'Treasury', 'Fabricator', 'None')),
  is_active boolean default true,
  created_at timestamptz default now()
);

-- CLIENTS
create table if not exists clients (
  client_id text primary key,
  client_type text check (client_type in ('Individual', 'Company')),
  company_name text,
  client_name text not null,
  contact_number text,
  email text,
  messenger text,
  viber text,
  whatsapp text,
  address text,
  credit_line_status boolean default false,
  earned_rewards numeric(10,2) default 0,
  claimed_rewards numeric(10,2) default 0,
  password_hash text,
  created_at timestamptz default now()
);

-- CATEGORIES
create table if not exists categories (
  category_id text primary key,
  category_name text not null,
  description text,
  is_active boolean default true
);

-- SUBCATEGORIES
create table if not exists subcategories (
  subcategory_id text primary key,
  subcategory_name text not null,
  category_id text references categories(category_id),
  subcategory_type text,
  description text,
  thickness text,
  color text,
  print_type text,
  pricing_model text not null check (pricing_model in (
    'per_piece','area','dimension','per_set','fixed',
    'area_cube','per_sheet','per_minute','starts_with','per_lettersqft'
  )),
  base_price numeric(10,2) default 0,
  unit text,
  job_flow text,
  min_qty numeric default 1,
  accepted_units text,
  require_specs boolean default false,
  spec_fields text,
  roll_widths_ft text,
  active boolean default true,
  tags text,
  material_options text,
  print_quality text,
  pass_options text,
  image_link text,
  installation_surcharge numeric(10,2)
);

-- JOB ORDERS
create table if not exists job_orders (
  job_order_id text primary key,
  user_email text,
  client_id text references clients(client_id),
  date_time_received timestamptz default now(),
  payment_status text check (payment_status in (
    'Pending Payment','Downpayment Received','Below 50% Downpayment',
    'Fully Paid','For Billing'
  )),
  grand_total numeric(10,2) default 0,
  total_amount_paid numeric(10,2) default 0,
  discount numeric(10,2) default 0,
  cashback_discount numeric(10,2) default 0,
  balance_due numeric(10,2) generated always as (grand_total - total_amount_paid - discount - cashback_discount) stored,
  received_by text,
  request_override text,
  override_status text check (override_status in ('Pending','Approved','Rejected')),
  is_for_billing boolean default false,
  is_fully_paid boolean default false,
  -- How the client reached us for this JO — see migration 028 for why it's nullable.
  source_channel text check (source_channel in ('Walk-in', 'Messenger', 'Viber', 'WhatsApp', 'Phone Call', 'Email')),
  created_at timestamptz default now()
);

-- JOB ORDER ITEMS
create table if not exists job_order_items (
  item_id text primary key,
  job_order_id text references job_orders(job_order_id) on delete cascade,
  category_id text references categories(category_id),
  subcategory_id text references subcategories(subcategory_id),
  item_preview text,
  pricing_model text,
  base_price numeric(10,2) default 0,
  width numeric(10,3),
  height numeric(10,3),
  depth numeric(10,3),
  accepted_unit text,
  quantity integer default 1,
  print_quality text,
  total_area numeric(10,4),
  no_of_mins numeric(10,2),
  sqft numeric(10,4),
  letter_count integer,
  discount numeric(10,2) default 0,
  computed_line_total numeric(10,2) default 0,
  date_needed date,
  time_needed time,
  date_time_needed timestamptz,
  priority text check (priority in ('LOW','HIGH','URGENT')),
  job_status text not null default 'Received' check (job_status in (
    'Received','For Layout/Vectoring','For Production',
    'Ready For Pickup/Delivery/Installation','Done','Cancelled'
  )),
  notes text,
  proponents text,
  date_time_received timestamptz default now(),
  production_specs text,
  overlap_warning text
);

-- PAYMENTS
create table if not exists payments (
  payment_id text primary key,
  summary_id text,
  job_order_id text references job_orders(job_order_id) on delete cascade,
  client_id text references clients(client_id),
  grand_total numeric(10,2),
  amount numeric(10,2) not null,
  payment_method text check (payment_method in (
    'Cash','G-Cash','Maya','Bank Transfer via BPI Acct.',
    'Bank Transfer via BDO Acct.','Cheque'
  )),
  payment_date date default current_date,
  recorded_by text,
  remarks text,
  created_at timestamptz default now()
);

-- DAILY SALES SUMMARY
create table if not exists daily_sales_summary (
  summary_id text primary key,
  date date unique not null,
  initial_fund numeric(10,2) default 0,
  cash numeric(10,2) default 0,
  ewallet_bank numeric(10,2) default 0,
  total_sales numeric(10,2) default 0,
  total_expenses numeric(10,2) default 0,
  expected_cash_on_hand numeric(10,2) default 0,
  cash_on_hand numeric(10,2) default 0,
  remitted_cash numeric(10,2) default 0,
  excess_deficit numeric(10,2) default 0,
  next_day_fund numeric(10,2) default 0,
  remark text,
  created_at timestamptz default now()
);

-- EXPENSES
create table if not exists expenses (
  expense_id uuid primary key default uuid_generate_v4(),
  summary_id text references daily_sales_summary(summary_id) on delete cascade,
  date date,
  expense_name text not null,
  amount numeric(10,2) not null,
  created_at timestamptz default now()
);

-- REWARDS REDEMPTIONS
create table if not exists rewards_redemptions (
  redemption_id uuid primary key default uuid_generate_v4(),
  client_id text references clients(client_id),
  job_order_id text references job_orders(job_order_id),
  amount_redeemed numeric(10,2) not null,
  redemption_date date default current_date,
  created_at timestamptz default now()
);

-- RAW MATERIALS (future COGS/quote pricing)
create table if not exists raw_materials (
  media_id text primary key,
  name text not null,
  description text,
  price_unit text,
  size_options text,
  material_options text,
  base_price numeric(10,2),
  currency text default 'PHP',
  price_note text,
  sheet_area_sqft numeric(10,4),
  raw_price_per_sqft numeric(10,4),
  default_wastage_pct numeric(5,2),
  active boolean default true
);

-- SUBCATEGORY SOP — each subcategory owns its own ordered production step chain
-- (even similar items like tarpaulin vs sticker printing often need different steps,
-- so this is intentionally per-subcategory rather than a shared "process type" grouping)
create table if not exists subcategory_sop (
  sop_id text primary key,
  subcategory_id text references subcategories(subcategory_id) on delete cascade,
  status_name text,
  sequence integer,
  is_active boolean default true,
  is_terminal boolean default false,
  is_production_start boolean default false,
  visible_to_client boolean default false,
  description text
);
create index if not exists idx_subcategory_sop_subcategory on subcategory_sop(subcategory_id);

-- INDEXES
create index if not exists idx_job_orders_client on job_orders(client_id);
create index if not exists idx_job_orders_date on job_orders(date_time_received);
create index if not exists idx_job_order_items_jo on job_order_items(job_order_id);
create index if not exists idx_job_order_items_status on job_order_items(job_status);
create index if not exists idx_job_order_items_date_needed on job_order_items(date_time_needed);
create index if not exists idx_payments_jo on payments(job_order_id);
create index if not exists idx_payments_date on payments(payment_date);
create index if not exists idx_expenses_summary on expenses(summary_id);
create index if not exists idx_subcategories_category on subcategories(category_id);

-- ROW LEVEL SECURITY
alter table users enable row level security;
alter table clients enable row level security;
alter table categories enable row level security;
alter table subcategories enable row level security;
alter table job_orders enable row level security;
alter table job_order_items enable row level security;
alter table payments enable row level security;
alter table daily_sales_summary enable row level security;
alter table expenses enable row level security;
alter table rewards_redemptions enable row level security;
alter table raw_materials enable row level security;
alter table subcategory_sop enable row level security;

-- Authenticated users have full access (role-based logic handled in app layer)
create policy "auth_users_users" on users for select using (auth.role() = 'authenticated');
create policy "auth_users_clients" on clients for all using (auth.role() = 'authenticated');
-- Categories/subcategories are the pricing catalog every JO is built from — everyone
-- authenticated can read them, but only Admin can add/edit/remove entries (matches the
-- /admin/categories page's own role gate, enforced here too so it can't be bypassed by
-- a direct Supabase client call).
create policy "auth_users_select_categories" on categories for select using (auth.role() = 'authenticated');
create policy "admin_insert_categories" on categories for insert
  with check (exists (select 1 from users u where u.user_email = auth.email() and u.role = 'Admin'));
create policy "admin_update_categories" on categories for update
  using (exists (select 1 from users u where u.user_email = auth.email() and u.role = 'Admin'))
  with check (exists (select 1 from users u where u.user_email = auth.email() and u.role = 'Admin'));
create policy "admin_delete_categories" on categories for delete
  using (exists (select 1 from users u where u.user_email = auth.email() and u.role = 'Admin'));

create policy "auth_users_select_subcategories" on subcategories for select using (auth.role() = 'authenticated');
create policy "admin_insert_subcategories" on subcategories for insert
  with check (exists (select 1 from users u where u.user_email = auth.email() and u.role = 'Admin'));
create policy "admin_update_subcategories" on subcategories for update
  using (exists (select 1 from users u where u.user_email = auth.email() and u.role = 'Admin'))
  with check (exists (select 1 from users u where u.user_email = auth.email() and u.role = 'Admin'));
create policy "admin_delete_subcategories" on subcategories for delete
  using (exists (select 1 from users u where u.user_email = auth.email() and u.role = 'Admin'));
create policy "auth_users_job_orders" on job_orders for all using (auth.role() = 'authenticated');
create policy "auth_users_job_order_items" on job_order_items for all using (auth.role() = 'authenticated');
create policy "auth_users_payments" on payments for all using (auth.role() = 'authenticated');
create policy "auth_users_daily_summary" on daily_sales_summary for all using (auth.role() = 'authenticated');
create policy "auth_users_expenses" on expenses for all using (auth.role() = 'authenticated');
create policy "auth_users_redemptions" on rewards_redemptions for all using (auth.role() = 'authenticated');
create policy "auth_users_raw_materials" on raw_materials for select using (auth.role() = 'authenticated');
create policy "auth_users_subcategory_sop" on subcategory_sop for all using (auth.role() = 'authenticated');

-- ============================================================
-- GRANTS — required for PostgREST (anon / authenticated / service_role)
-- RLS policies above still gate ROW access; these grant TABLE access.
-- Without these, a fresh SQL-created project returns
-- "42501 permission denied for table ..." on every API query.
-- ============================================================
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;

-- ============================================================
-- AUTO-PROFILE — create a public.users row whenever an auth user
-- is created (via the Supabase dashboard OR the in-app register page).
-- Name/role come from user metadata if provided; role defaults to 'GA'.
-- This means: add a user once in Auth and they can log in immediately.
-- Valid roles: Admin, GA, Treasury, Fabricator, None (no jobs.penfixads.com
-- access at all — used for people who only need access to other Penfix
-- apps, e.g. tools.penfixads.com Custodians/Fabricators).
--
-- This is also the identity provider for the rest of the Penfix ecosystem
-- (e.g. the Tools Inventory system at tools.penfixads.com, see
-- project-tools-inventory memory) — every person is created once here via
-- SSO, then separately granted access to other apps via their own
-- authorization tables (e.g. tool_users). Every auth.users signup gets a
-- row here regardless of which app's admin UI created it.
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (user_email, name, role, is_active)
  values (
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'GA'),
    true
  )
  on conflict (user_email) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
