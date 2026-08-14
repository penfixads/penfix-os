-- Close the rls_disabled_in_public hole on purchases and supplier_deliveries, flagged
-- CRITICAL by Supabase's security advisor on 2026-08-09 against BOTH projects
-- (Penfix-OS Production rrocipgacruxsdpifsnq and Penfix-OS Staging xfzjluxvspqwrsspvmrp).
--
-- 018_supplier_deliveries.sql and 019_purchases.sql create their table and indexes and
-- stop -- no RLS, no policies, no grants. Every other table in this chain enables RLS in
-- the migration that creates it; these two were the only misses. PROD_CATCHUP.sql:52 later
-- granted them to authenticated and service_role, but a grant is not RLS and it never
-- revoked the anon access Supabase hands out by default on public-schema tables.
--
-- Why that is critical rather than cosmetic: the app reaches Supabase from the browser
-- with the anon key (lib/supabase-browser.ts), and that key ships inside the public JS
-- bundle -- it is not a secret. RLS is the only thing between it and the data. Until this
-- runs, anyone who opens DevTools on the site can read every supplier name, unit price and
-- total in these two tables, and can also INSERT and DELETE rows -- which would corrupt
-- expense reporting silently rather than merely leak it.
--
-- Access granted here matches the app: Admin and Treasury, the same pair that can reach
-- /purchases and /purchases/deliveries (components/Sidebar.tsx:116 and :120). Policy shape
-- follows 022_overhead_expenses.sql; policy naming follows the more recent 054->061 chain
-- (admin_treasury_all_<table>). service_role is unaffected -- it bypasses RLS by design,
-- so any server-side or import tooling keeps working.
--
-- The revoke from anon is belt-and-braces. With RLS on and no anon-satisfiable policy the
-- anon role already gets nothing, but dropping the grant states the intent and means a
-- future policy added without thinking about anon cannot silently re-expose the table.
--
-- Guarded by to_regclass so the file is safe to run against either database regardless of
-- how far along its migration chain is, same approach as 061.
--
-- Idempotent: safe to re-run.

begin;

do $$
declare
  t text;
  tables text[] := array[
    'purchases',
    'supplier_deliveries'
  ];
  cond text := 'exists (select 1 from users u where u.user_email = auth.email() '
            || 'and u.role in (''Admin'', ''Treasury''))';
begin
  foreach t in array tables loop
    if to_regclass(t) is null then
      raise notice 'skipping %: not present in this database', t;
      continue;
    end if;

    execute format('alter table %I enable row level security', t);

    execute format('drop policy if exists %I on %I', 'admin_treasury_all_' || t, t);
    execute format(
      'create policy %I on %I for all using (%s) with check (%s)',
      'admin_treasury_all_' || t, t, cond, cond
    );

    execute format('revoke all on %I from anon', t);
    execute format('grant select, insert, update, delete on %I to authenticated', t);
  end loop;
end $$;

commit;

-- Verify afterwards -- expect rls_enabled true and anon_select false on both rows:
--
--   select c.relname as table_name, c.relrowsecurity as rls_enabled,
--          has_table_privilege('anon', c.oid, 'SELECT') as anon_select
--     from pg_class c join pg_namespace n on n.oid = c.relnamespace
--    where n.nspname = 'public' and c.relname in ('purchases', 'supplier_deliveries');
--
-- And that the policy landed on each:
--
--   select tablename, policyname, cmd from pg_policies
--    where tablename in ('purchases', 'supplier_deliveries');
--
-- Then re-run the full sweep from the advisory to confirm nothing else is exposed:
--
--   select c.relname, c.relrowsecurity,
--          has_table_privilege('anon', c.oid, 'SELECT') as anon_select
--     from pg_class c join pg_namespace n on n.oid = c.relnamespace
--    where n.nspname = 'public' and c.relkind = 'r'
--    order by c.relrowsecurity, c.relname;
