-- Supplier deliveries received on 1-month cheque terms — distinct from same-day cash
-- "Expenses" in daily_sales_summary. A delivery received this month is billed/paid via
-- next month's cheque, tracked here by billing_month rather than delivery_date.
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
