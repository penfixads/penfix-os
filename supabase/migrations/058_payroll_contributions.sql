-- Government contributions become per-employee amounts entered by an Admin, replacing the
-- salary-bracket lookup 054 started.
--
-- Why the change: 054 modelled SSS/PhilHealth/Pag-IBIG as salary brackets, but deliberately
-- shipped SSS unseeded because its official schedule is a 30+ band step table and
-- hand-transcribing it into a migration risked a typo landing in real deductions. With a
-- headcount in single digits, three Admin-entered figures per employee are both simpler and
-- likelier to be correct than a transcribed table that must be re-transcribed every time a
-- rate is revised. The bracket machinery only pays for itself at a scale Penfix is nowhere
-- near.
--
-- The amounts live in payroll_profiles rather than in hr's employees table on purpose. hr
-- lets any active employee sign in (it only gates /admin), whereas payroll gates every route
-- to Admin/Treasury precisely because it carries salary data -- see payroll/middleware.ts.
-- A contribution amount is derived from salary and effectively discloses it, and company
-- policy makes disclosing salary to co-employees a terminable offence. So it belongs beside
-- monthly_salary, on the screen that already edits it.

begin;

-- ---------------------------------------------------------------------------
-- Per-employee contribution amounts
-- ---------------------------------------------------------------------------
-- Monthly figures, taken by the Admin from the SSS / Pag-IBIG / PhilHealth portals.
-- Nullable on purpose: null means "not yet established", which is different from zero
-- ("established, and the employee contributes nothing"). Payslip generation refuses to run
-- for an employee whose toggle is enabled but whose amount is still null, so nobody is
-- silently deducted 0.00 -- see the note on the generation guard below.
--
-- Not enforced as a CHECK constraint because the existing registration flow
-- (payroll/app/api/register-employee/route.ts) ticks the three toggles on by default and has
-- no amount fields; a constraint would break registration until that form is extended. The
-- guard therefore lives at payslip generation, where the cost of a wrong figure actually
-- lands.
alter table payroll_profiles
  add column sss_contribution numeric(10,2),
  add column pagibig_contribution numeric(10,2),
  add column philhealth_contribution numeric(10,2);

comment on column payroll_profiles.sss_contribution is
  'Monthly SSS employee share, entered by an Admin. NULL means not yet established -- payslip generation blocks rather than deducting 0.00. Whether it applies at all is governed by sss_deduction_enabled.';
comment on column payroll_profiles.pagibig_contribution is
  'Monthly Pag-IBIG employee share, entered by an Admin. NULL means not yet established.';
comment on column payroll_profiles.philhealth_contribution is
  'Monthly PhilHealth employee share, entered by an Admin. NULL means not yet established.';

-- ---------------------------------------------------------------------------
-- Which half of the month each contribution is taken on
-- ---------------------------------------------------------------------------
-- The amounts above are MONTHLY but payroll runs semi-monthly, so each has to land on one
-- half or the other -- deducting on both would double the employee's contribution.
--
-- That is not hypothetical. The live workbook does exactly this: Renato was deducted SSS on
-- both March 1-15 and March 16-31 (PHP 1,400 against a PHP 700 monthly contribution), and
-- PhilHealth on both halves of February. Alvin was deducted Pag-IBIG on both halves of May.
-- Meanwhile Renato has no Pag-IBIG deduction recorded anywhere at all.
--
-- The rule seeded here follows the consistent pattern in the older (2021) sheets:
-- Pag-IBIG and PhilHealth on the first half, SSS on the second. A table rather than
-- constants in application code so the rule is auditable and can be changed without a
-- deploy -- and one row per type, since the timing depends on the contribution type and not
-- on any individual employee.
create table payroll_contribution_settings (
  contribution_type text primary key check (contribution_type in ('SSS', 'PhilHealth', 'Pag-IBIG')),
  -- 1 = the 1st-15th run, 2 = the 16th-end-of-month run. Deducted once per month, on that run only.
  deduct_on_half smallint not null check (deduct_on_half in (1, 2)),
  updated_at timestamptz not null default now()
);

insert into payroll_contribution_settings (contribution_type, deduct_on_half) values
  ('SSS', 2),
  ('Pag-IBIG', 1),
  ('PhilHealth', 1);

alter table payroll_contribution_settings enable row level security;

create policy "admin_treasury_all_payroll_contribution_settings" on payroll_contribution_settings for all
  using (exists (select 1 from users u where u.user_email = auth.email() and u.role in ('Admin', 'Treasury')))
  with check (exists (select 1 from users u where u.user_email = auth.email() and u.role in ('Admin', 'Treasury')));

grant select, insert, update, delete on payroll_contribution_settings to authenticated;
grant all on payroll_contribution_settings to service_role;

create trigger payroll_contribution_settings_updated_at
  before update on payroll_contribution_settings
  for each row execute function update_payroll_profiles_updated_at();

-- ---------------------------------------------------------------------------
-- Retire the bracket table
-- ---------------------------------------------------------------------------
-- Dropped rather than left in place: keeping brackets alongside per-employee amounts would
-- leave two competing sources for the same peso figure, and this ecosystem already loses
-- time to exactly that class of drift. If bracket-driven automation is wanted later it
-- should return as something that POPULATES payroll_profiles' amounts, not as a second
-- authority that silently disagrees with them.
--
-- Safe to drop: the table holds only 054's four seed rows, no employee has been registered
-- yet, and no application code reads it.
drop table payroll_contribution_brackets;

-- ---------------------------------------------------------------------------
-- Employees see their own deductions in MyHR
-- ---------------------------------------------------------------------------
-- Read-only, own row only -- the same shape as employee_read_own_payslips (056) and
-- employee_read_own_day_resolutions (057). This is what lets hr's MyHR show an employee what
-- is being taken from them and why, without granting hr any ability to change it: every
-- write is still governed by the Admin/Treasury policy from 054.
--
-- Exposing monthly_salary to the employee via this policy is intended. It is their own
-- salary and already appears on every payslip they receive; company policy forbids
-- discussing pay with CO-EMPLOYEES, which a row-scoped self-read cannot enable.
create policy "employee_read_own_payroll_profile" on payroll_profiles for select
  using (user_email = auth.email());

commit;
