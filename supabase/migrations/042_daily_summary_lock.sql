-- While the Jan-to-present daily sales records are being corrected against the AppSheet
-- migration, Cash On Hand/Remitted Cash/Remark on past days need to be editable by whoever
-- is helping reconcile them (not just Admin) — this flag lets Admin freeze a day (or every
-- day) back down once that reconciliation pass is confirmed done.
alter table daily_sales_summary
  add column if not exists is_locked boolean not null default false;
