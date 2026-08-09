-- Payroll foundation: employee pay setup, holidays, gov't contribution brackets,
-- payroll runs, payslips, and a loan/cash-advance running-balance ledger.
--
-- Authored in the payroll repo (payroll/supabase/migrations/001_payroll_foundation.sql)
-- and copied here renumbered, same as attendance's 050/051 — this folder is what
-- actually gets run against the shared project. Run against staging first, then prod.
--
-- Payroll lives in the OS project (not a 4th separate Supabase project) per the
-- ecosystem's "one database" decision already stated in 049_attendance.sql — payroll
-- keys every table by user_email against the existing `users` table, same as
-- attendance_logs.
--
-- Wrapped in a transaction so a mid-migration failure rolls back cleanly instead of
-- leaving a half-applied schema to unpick by hand.

begin;

create table payroll_profiles (
  id uuid primary key default gen_random_uuid(),
  user_email text not null unique references users(user_email),

  -- Snapshotted from hr's employees table at registration time (hr's own separate
  -- Supabase project — see payroll/lib/hr-client.ts) rather than a live cross-project
  -- join on every payslip run. Admin can re-sync manually if hr's record changes.
  full_name text not null,
  employee_number text,
  position text,
  department text,
  date_joined date,

  -- Government numbers, also pulled from hr's onboarding record at registration.
  sss_number text,
  pagibig_number text,
  philhealth_number text,

  -- Employees sometimes opt out of a given government deduction — each is
  -- independently toggleable by an Admin/Treasury user, defaulting to on.
  sss_deduction_enabled boolean not null default true,
  pagibig_deduction_enabled boolean not null default true,
  philhealth_deduction_enabled boolean not null default true,

  monthly_salary numeric(10,2) not null check (monthly_salary > 0),
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index payroll_profiles_user_email_idx on payroll_profiles (user_email);

alter table payroll_profiles enable row level security;

create policy "admin_treasury_all_payroll_profiles" on payroll_profiles for all
  using (exists (select 1 from users u where u.user_email = auth.email() and u.role in ('Admin', 'Treasury')))
  with check (exists (select 1 from users u where u.user_email = auth.email() and u.role in ('Admin', 'Treasury')));

grant select, insert, update, delete on payroll_profiles to authenticated;
grant all on payroll_profiles to service_role;

create or replace function update_payroll_profiles_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger payroll_profiles_updated_at
  before update on payroll_profiles
  for each row execute function update_payroll_profiles_updated_at();

-- Admin-editable holiday list. Payout rule (enforced in application code, not SQL):
--   Regular, worked        -> per_day_rate * 100% additional (on top of that day's base pay)
--   Regular, not worked    -> per_day_rate * 100% (still paid, per DOLE)
--   Special Non-Working, worked     -> per_day_rate * pay_percentage additional
--   Special Non-Working, not worked -> 0 (no premium, no base pay for that day)
create table payroll_holidays (
  id uuid primary key default gen_random_uuid(),
  holiday_date date not null,
  name text not null,
  holiday_type text not null check (holiday_type in ('Regular', 'Special Non-Working')),
  -- Regular holidays are always 100% by law; stored anyway so the payslip engine
  -- never special-cases it — Special Non-Working defaults to 30% but is editable
  -- since some locally-declared holidays carry a different rate.
  pay_percentage numeric(5,2) not null,
  created_at timestamptz not null default now(),

  unique (holiday_date)
);

alter table payroll_holidays enable row level security;

create policy "admin_treasury_all_payroll_holidays" on payroll_holidays for all
  using (exists (select 1 from users u where u.user_email = auth.email() and u.role in ('Admin', 'Treasury')))
  with check (exists (select 1 from users u where u.user_email = auth.email() and u.role in ('Admin', 'Treasury')));

grant select, insert, update, delete on payroll_holidays to authenticated;
grant all on payroll_holidays to service_role;

-- Government contribution brackets — editable defaults, not verified against the
-- latest official circular. Update these rows (or insert a new effective_year) when
-- SSS/PhilHealth/Pag-IBIG publish new tables; the payslip engine looks up whichever
-- bracket's [min_salary, max_salary) contains the employee's monthly_salary for the
-- current year.
create table payroll_contribution_brackets (
  id uuid primary key default gen_random_uuid(),
  contribution_type text not null check (contribution_type in ('SSS', 'PhilHealth', 'Pag-IBIG')),
  min_salary numeric(10,2) not null,
  max_salary numeric(10,2),  -- null = no upper bound
  employee_contribution numeric(10,2) not null,
  effective_year integer not null,
  created_at timestamptz not null default now()
);

alter table payroll_contribution_brackets enable row level security;

create policy "admin_treasury_all_payroll_contribution_brackets" on payroll_contribution_brackets for all
  using (exists (select 1 from users u where u.user_email = auth.email() and u.role in ('Admin', 'Treasury')))
  with check (exists (select 1 from users u where u.user_email = auth.email() and u.role in ('Admin', 'Treasury')));

grant select, insert, update, delete on payroll_contribution_brackets to authenticated;
grant all on payroll_contribution_brackets to service_role;

-- One row per semi-monthly pay period. attendance_cutoff = payday - 1 day (see
-- payroll/lib/payday.ts's getAttendanceCutoff), distinct from period_end, which stays
-- the nominal calendar label (15th / last day) for display purposes only.
create table payroll_runs (
  id uuid primary key default gen_random_uuid(),
  period_start date not null,
  period_end date not null,
  payday date not null,
  attendance_cutoff date not null,
  status text not null default 'Draft' check (status in ('Draft', 'Finalized')),
  created_at timestamptz not null default now(),

  unique (period_start, period_end)
);

alter table payroll_runs enable row level security;

create policy "admin_treasury_all_payroll_runs" on payroll_runs for all
  using (exists (select 1 from users u where u.user_email = auth.email() and u.role in ('Admin', 'Treasury')))
  with check (exists (select 1 from users u where u.user_email = auth.email() and u.role in ('Admin', 'Treasury')));

grant select, insert, update, delete on payroll_runs to authenticated;
grant all on payroll_runs to service_role;

-- One payslip per employee per payroll run. Every employee-identifying and rate
-- field here is a snapshot taken at generation time (not a live join against
-- payroll_profiles), so editing an employee's salary later doesn't rewrite history.
create table payslips (
  id uuid primary key default gen_random_uuid(),
  payroll_run_id uuid not null references payroll_runs(id) on delete cascade,
  user_email text not null references users(user_email),

  employee_name text not null,
  monthly_rate numeric(10,2) not null,
  per_day_rate numeric(10,2) not null,
  hourly_rate numeric(10,2) not null,

  base_pay numeric(10,2) not null default 0,
  overtime_hours numeric(6,2) not null default 0,
  overtime_pay numeric(10,2) not null default 0,
  holiday_pay numeric(10,2) not null default 0,
  sunday_premium_pay numeric(10,2) not null default 0,
  night_diff_hours numeric(6,2) not null default 0,
  night_diff_pay numeric(10,2) not null default 0,
  gross_pay numeric(10,2) not null default 0,

  regular_loan_deduction numeric(10,2) not null default 0,
  cash_advance_deduction numeric(10,2) not null default 0,
  emergency_loan_deduction numeric(10,2) not null default 0,
  late_undertime_hours numeric(6,2) not null default 0,
  late_undertime_deduction numeric(10,2) not null default 0,
  unpaid_leave_days numeric(4,1) not null default 0,
  unpaid_leave_deduction numeric(10,2) not null default 0,
  sss_deduction numeric(10,2) not null default 0,
  pagibig_deduction numeric(10,2) not null default 0,
  philhealth_deduction numeric(10,2) not null default 0,
  total_deduction numeric(10,2) not null default 0,

  net_pay numeric(10,2) not null default 0,

  sick_leave_credit numeric(4,2),
  sick_leave_used numeric(4,2),
  sick_leave_remaining numeric(4,2),
  vacation_leave_credit numeric(4,2),
  vacation_leave_used numeric(4,2),
  vacation_leave_remaining numeric(4,2),

  created_at timestamptz not null default now(),

  unique (payroll_run_id, user_email)
);

create index payslips_user_email_idx on payslips (user_email);

alter table payslips enable row level security;

create policy "admin_treasury_all_payslips" on payslips for all
  using (exists (select 1 from users u where u.user_email = auth.email() and u.role in ('Admin', 'Treasury')))
  with check (exists (select 1 from users u where u.user_email = auth.email() and u.role in ('Admin', 'Treasury')));

grant select, insert, update, delete on payslips to authenticated;
grant all on payslips to service_role;

-- Running-balance ledger for loan/cash-advance deductions. Neither hr's
-- loan_requests nor cash_advance_requests tracks partial payments themselves
-- (confirmed against hr/supabase/schema.sql — both are cross-project reads from
-- payroll, see payroll/lib/hr-client.ts), so this table is payroll's own record of
-- what's been paid down so far against each approved request.
create table payroll_loan_ledger (
  id uuid primary key default gen_random_uuid(),
  source_type text not null check (source_type in ('loan', 'cash_advance')),
  source_id uuid not null,  -- hr's loan_requests.id / cash_advance_requests.id (cross-project, no FK possible)
  user_email text not null references users(user_email),
  original_amount numeric(10,2) not null,
  remaining_balance numeric(10,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (source_type, source_id)
);

alter table payroll_loan_ledger enable row level security;

create policy "admin_treasury_all_payroll_loan_ledger" on payroll_loan_ledger for all
  using (exists (select 1 from users u where u.user_email = auth.email() and u.role in ('Admin', 'Treasury')))
  with check (exists (select 1 from users u where u.user_email = auth.email() and u.role in ('Admin', 'Treasury')));

grant select, insert, update, delete on payroll_loan_ledger to authenticated;
grant all on payroll_loan_ledger to service_role;

-- Reuses payroll_profiles' trigger function — it only touches new.updated_at, so it's
-- generic despite the name.
create trigger payroll_loan_ledger_updated_at
  before update on payroll_loan_ledger
  for each row execute function update_payroll_profiles_updated_at();

-- Seed default government contribution brackets for the current year. These are
-- editable defaults transcribed from the last published SSS/PhilHealth/Pag-IBIG
-- circulars at the time this migration was authored (2026) — NOT re-verified against
-- the latest official issuance. An Admin should confirm/update these against the
-- current circulars before relying on them for real payroll.
insert into payroll_contribution_brackets (contribution_type, min_salary, max_salary, employee_contribution, effective_year) values
  -- Pag-IBIG: 1% employee share for monthly compensation <= 1,500; 2% above that,
  -- capped at a 5,000 contribution base (max employee share = 100).
  ('Pag-IBIG', 0, 1500, 15.00, 2026),
  ('Pag-IBIG', 1500.01, null, 100.00, 2026),
  -- PhilHealth: flat 5% of monthly basic salary, split 50/50 employee/employer,
  -- so employee share = 2.5%, floored at a 10,000 salary base and capped at 100,000.
  ('PhilHealth', 0, 10000, 250.00, 2026),
  ('PhilHealth', 100000.01, null, 2500.00, 2026);
  -- Salaries strictly between 10,000 and 100,000 are 2.5% of actual monthly salary —
  -- computed in application code (payroll/lib/payslip-compute.ts, next pass), not a
  -- bracket row here, since it's a continuous percentage rather than a fixed amount
  -- per band.

-- SSS employee-share brackets are a much longer step table (30+ salary bands) than
-- fits cleanly as hand-authored seed rows here — left for an Admin to populate via
-- the contribution-brackets admin page (next pass) using the official SSS
-- Contribution Schedule, rather than transcribing it into this migration by hand
-- and risking a transcription error in real payroll deductions.

commit;
