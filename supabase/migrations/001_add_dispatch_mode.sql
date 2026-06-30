-- Add dispatch_mode column to job_order_items
alter table job_order_items
  add column if not exists dispatch_mode text check (dispatch_mode in ('Pickup','Delivery','Installation'));

-- Add job_status to job_orders (overall JO completion status)
alter table job_orders
  add column if not exists job_status text not null default 'Active' check (job_status in ('Active','Done','Cancelled'));
