-- Same-day cash purchases (shelled out from company budget), distinct from
-- supplier_deliveries (1-month cheque credit terms) — mirrors the "PURCHASES" sheet tab
-- column-for-column so existing records can be imported with no restructuring.
create table if not exists purchases (
  purchase_id text primary key,
  purchase_date date not null,
  supplier_name text not null,
  specs text not null,
  size text,
  materials text,
  amount numeric(10,2) not null default 0,
  quantity numeric(10,2) not null default 1,
  total_amount numeric(10,2) not null default 0,
  remarks text,
  recorded_by text,
  created_at timestamptz default now()
);

create index if not exists idx_purchases_purchase_date on purchases(purchase_date);
