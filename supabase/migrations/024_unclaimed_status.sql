-- Add 'Unclaimed' as a valid job_orders.job_status value. An item is marked Unclaimed
-- (see lib/jo-completion.ts, app/(app)/jos/active/ActiveJOsClient.tsx) when a client never
-- comes back to claim/pay for it — once every item on a JO is terminal (Done/Cancelled/
-- Unclaimed) and at least one is Unclaimed, the whole JO rolls up to 'Unclaimed' so it drops
-- off Active JOs the same way 'Done' does, without waiting on a settlement that will never come.
alter table job_orders drop constraint if exists job_orders_job_status_check;
alter table job_orders add constraint job_orders_job_status_check
  check (job_status in ('Active','Done','Cancelled','Unclaimed'));
