-- Narrow payroll's admin-side RLS from "any Admin or Treasury" down to ONE account:
-- penfix.biz@gmail.com. Payroll is a single-account app by explicit decision
-- (2026-08-10) -- not Treasury, not the other Penfix OS Admin (penfixads@gmail.com),
-- one person. The app layer enforces the same pair of conditions
-- (lib/allowed-account.ts + the Admin role check in middleware.ts and
-- lib/admin-auth.ts); this closes the DB layer so a leaked anon key can't read
-- salaries as some other Admin either.
--
-- DELIBERATELY LEFT ALONE: the three employee self-read policies --
-- employee_read_own_payslips (056/060), employee_read_own_day_resolutions (057) and
-- employee_read_own_payroll_profile (058). They are SELECT-only and row-scoped to
-- auth.email(), and they are what lets hr's MyHR show an employee their own payslip,
-- deductions and salary. Confirmed 2026-08-10 that this must keep working. "Single
-- account" governs payroll's ADMIN surface, not an employee reading their own row.
--
-- REPLACES an earlier draft of this file (and a 002_admin_only_rls.sql, now deleted)
-- that was written against payroll's inert supabase/migrations/001_payroll_foundation.sql
-- rather than the live OS chain 054->060. That draft targeted
-- payroll_contribution_brackets, which 058 DROPS, and missed payroll_day_resolutions
-- (057) and payroll_contribution_settings (058) entirely.
--
-- SCHEMA DRIFT: as of 2026-08-10 staging is at 060 while production has only 054, so
-- the two databases have different payroll tables. Every statement here is therefore
-- guarded by to_regclass and skips tables the target database doesn't have, which
-- makes this file safe to run against either. That is a workaround, not a fix -- prod
-- still needs 055->060 to reach parity, and this migration should be re-run afterwards
-- so the tables those migrations create get the narrowed policy too.
--
-- Idempotent: safe to re-run, and re-running after a schema catch-up is expected.
--
-- IMPORTANT: this repo's supabase/migrations folder is not what runs against the
-- shared project -- see the header of 001_payroll_foundation.sql. The live copy of
-- this file is penfixads-OS/supabase/migrations/061_payroll_single_account_rls.sql.

begin;

do $$
declare
  t text;
  -- payroll_contribution_brackets is included for production only, where 058 has not
  -- yet dropped it. On staging to_regclass returns null and it is skipped.
  tables text[] := array[
    'payroll_profiles',
    'payroll_holidays',
    'payroll_contribution_brackets',
    'payroll_contribution_settings',
    'payroll_runs',
    'payslips',
    'payroll_loan_ledger',
    'payroll_day_resolutions'
  ];
  cond text := 'lower(auth.email()) = ''penfix.biz@gmail.com'' and exists '
            || '(select 1 from users u where u.user_email = auth.email() and u.role = ''Admin'')';
begin
  foreach t in array tables loop
    if to_regclass(t) is null then
      raise notice 'skipping %: not present in this database', t;
      continue;
    end if;

    -- 054/057/058 all name their admin policy admin_treasury_all_<table>. The old name
    -- is dropped rather than altered so nothing is left claiming Treasury access.
    execute format('drop policy if exists %I on %I', 'admin_treasury_all_' || t, t);
    execute format('drop policy if exists %I on %I', 'single_account_all_' || t, t);
    execute format(
      'create policy %I on %I for all using (%s) with check (%s)',
      'single_account_all_' || t, t, cond, cond
    );
  end loop;
end $$;

commit;

-- Verify afterwards -- expect single_account_all_* on every payroll table, plus the
-- three employee_read_own_* policies still present:
--
--   select tablename, policyname from pg_policies
--    where tablename like 'payroll%' or tablename = 'payslips'
--    order by tablename, policyname;
