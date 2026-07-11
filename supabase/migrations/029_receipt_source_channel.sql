-- Shows the source channel (Walk-in/Messenger/Viber/WhatsApp/Phone Call/Email) on the
-- Job Order receipt — both the in-app "Generate Receipt" modal (already reads job_orders
-- directly) and the public /receipt/[jobOrderId] link, which needs it added to its narrow
-- anon-safe view. Appended at the end, not inserted where it "belongs" — CREATE OR REPLACE
-- VIEW rejects reordering existing columns (see migration 027 for the same gotcha).
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
