-- The client-facing receipt summary now shows Discount alongside Grand Total/Paid/Balance/Status,
-- so the public view needs to expose it too (narrow view, same anon-safety approach as migration 016).
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
