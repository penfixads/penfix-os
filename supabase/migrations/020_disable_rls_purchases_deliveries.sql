-- Supabase auto-enables RLS on tables created via the dashboard SQL editor, with no
-- policies attached — that makes SELECT silently return zero rows for anon/authenticated
-- instead of erroring, which is why the Purchases/Supplier Deliveries pages loaded but
-- showed nothing despite data existing. Every other table in this project controls access
-- purely via the blanket GRANTs in schema.sql, not RLS policies, so match that here.
alter table purchases disable row level security;
alter table supplier_deliveries disable row level security;
