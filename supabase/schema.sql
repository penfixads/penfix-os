-- ============================================================
-- PENFIX OS — Full Database Schema
-- Supabase (PostgreSQL)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- LOOKUP / REFERENCE TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subcategories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  pricing_model TEXT CHECK (pricing_model IN ('area', 'per_piece', 'per_set')) NOT NULL,
  base_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  min_qty INT DEFAULT 1,
  materials TEXT,
  job_flow TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS process_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS process_type_sop (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  process_type_id UUID REFERENCES process_types(id) ON DELETE CASCADE,
  step_order INT NOT NULL,
  step_name TEXT NOT NULL,
  visible_to_client BOOLEAN DEFAULT FALSE,
  is_terminal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS raw_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  unit TEXT,
  cost_per_unit NUMERIC(10,2) DEFAULT 0,
  wastage_percent NUMERIC(5,2) DEFAULT 0,
  sheet_area NUMERIC(10,4),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE IF NOT EXISTS users_crm (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE,
  role TEXT CHECK (role IN ('admin', 'ga', 'fabricator', 'toolkeeper', 'hr')) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users_tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE,
  role TEXT CHECK (role IN ('admin', 'toolkeeper', 'fabricator')) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CLIENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  messenger TEXT,
  viber TEXT,
  whatsapp TEXT,
  address TEXT,
  rewards_balance NUMERIC(10,2) DEFAULT 0,
  credit_line_status BOOLEAN DEFAULT FALSE,
  is_for_billing BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- JOB ORDERS
-- ============================================================

CREATE TABLE IF NOT EXISTS job_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jo_number TEXT UNIQUE NOT NULL, -- JO-MMDDYYYY-SEQ
  client_id UUID REFERENCES clients(id) ON DELETE RESTRICT,
  ga_id UUID REFERENCES users_crm(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('pending', 'in_production', 'ready_for_pickup', 'released', 'cancelled')) DEFAULT 'pending',
  dp_status TEXT CHECK (dp_status IN ('paid', 'override_pending', 'override_approved', 'override_rejected', 'billing')) DEFAULT 'paid',
  override_reason TEXT,
  override_approved_by UUID REFERENCES users_crm(id),
  override_approved_at TIMESTAMPTZ,
  total_amount NUMERIC(10,2) DEFAULT 0,
  total_paid NUMERIC(10,2) DEFAULT 0,
  balance NUMERIC(10,2) GENERATED ALWAYS AS (total_amount - total_paid) STORED,
  is_rush BOOLEAN DEFAULT FALSE,
  is_discounted BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_order_id UUID REFERENCES job_orders(id) ON DELETE CASCADE,
  subcategory_id UUID REFERENCES subcategories(id) ON DELETE RESTRICT,
  description TEXT,
  width NUMERIC(8,2),
  height NUMERIC(8,2),
  quantity INT DEFAULT 1,
  unit_price NUMERIC(10,2) DEFAULT 0,
  total_price NUMERIC(10,2) DEFAULT 0,
  sop_stage TEXT,
  status TEXT CHECK (status IN ('pending', 'in_layout', 'for_client_review', 'layout_approved', 'in_production', 'done')) DEFAULT 'pending',
  layout_proof_url TEXT,
  layout_approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PAYMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_order_id UUID REFERENCES job_orders(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  method TEXT CHECK (method IN ('cash', 'gcash', 'bank_transfer', 'rewards')) NOT NULL,
  reference_number TEXT,
  collected_by UUID REFERENCES users_crm(id),
  daily_summary_id UUID, -- FK added after daily_sales_summary
  rewards_used NUMERIC(10,2) DEFAULT 0,
  rewards_earned NUMERIC(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DAILY SALES
-- ============================================================

CREATE TABLE IF NOT EXISTS daily_sales_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  summary_date DATE UNIQUE NOT NULL,
  total_cash NUMERIC(10,2) DEFAULT 0,
  total_ewallet NUMERIC(10,2) DEFAULT 0,
  total_bank_transfer NUMERIC(10,2) DEFAULT 0,
  total_expenses NUMERIC(10,2) DEFAULT 0,
  expected_cash_on_hand NUMERIC(10,2) DEFAULT 0,
  actual_cash_on_hand NUMERIC(10,2) DEFAULT 0,
  cash_variance NUMERIC(10,2) GENERATED ALWAYS AS (actual_cash_on_hand - expected_cash_on_hand) STORED,
  prepared_by UUID REFERENCES users_crm(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add FK from payments to daily_sales_summary now that it exists
ALTER TABLE payments
  ADD CONSTRAINT fk_payments_daily_summary
  FOREIGN KEY (daily_summary_id) REFERENCES daily_sales_summary(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  daily_summary_id UUID REFERENCES daily_sales_summary(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  category TEXT,
  recorded_by UUID REFERENCES users_crm(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CLIENT TRACKING (Rewards History)
-- ============================================================

CREATE TABLE IF NOT EXISTS client_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  job_order_id UUID REFERENCES job_orders(id) ON DELETE SET NULL,
  type TEXT CHECK (type IN ('earned', 'redeemed', 'expired', 'adjusted')) NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  balance_after NUMERIC(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TOOLS INVENTORY
-- ============================================================

CREATE TABLE IF NOT EXISTS tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  specifications TEXT,
  photo_url TEXT,
  qty_available INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tools_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
  qty_owned INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tools_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
  requested_by UUID REFERENCES users_tools(id),
  approved_by UUID REFERENCES users_tools(id),
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'returned')) DEFAULT 'pending',
  qty INT DEFAULT 1,
  borrowed_at TIMESTAMPTZ,
  returned_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_job_orders_client ON job_orders(client_id);
CREATE INDEX IF NOT EXISTS idx_job_orders_status ON job_orders(status);
CREATE INDEX IF NOT EXISTS idx_job_orders_created ON job_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_order_items_jo ON job_order_items(job_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_jo ON payments(job_order_id);
CREATE INDEX IF NOT EXISTS idx_client_tracking_client ON client_tracking(client_id);
CREATE INDEX IF NOT EXISTS idx_tools_logs_tool ON tools_logs(tool_id);
CREATE INDEX IF NOT EXISTS idx_daily_sales_date ON daily_sales_summary(summary_date DESC);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_job_orders_updated
  BEFORE UPDATE ON job_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_job_order_items_updated
  BEFORE UPDATE ON job_order_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
