-- Tracks how the client reached us for each Job Order (Walk-in, Messenger, Viber,
-- WhatsApp, Phone Call, Email) — lets staff trace back which channel a JO came through
-- when investigating an issue. Nullable since the ~450 historical/migrated JOs predate
-- this field; captured going forward via the New Job Order / Add Historical Records form.
alter table job_orders add column if not exists source_channel text
  check (source_channel in ('Walk-in', 'Messenger', 'Viber', 'WhatsApp', 'Phone Call', 'Email'));
