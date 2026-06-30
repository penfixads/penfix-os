-- Bring expenses table in line with the app requirements
alter table expenses
  add column if not exists expense_date date,
  add column if not exists description text,
  add column if not exists category text default 'Operations',
  add column if not exists recorded_by text;

-- Back-fill expense_date from existing date column
update expenses set expense_date = date where expense_date is null;

-- Also add override_reject_note to job_orders (used in pending approval)
alter table job_orders
  add column if not exists override_reject_note text;

-- Add remark to daily_sales_summary
alter table daily_sales_summary
  add column if not exists remark text;
