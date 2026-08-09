-- Reconciles payslips with the final intent of 056.
--
-- 056 was edited several times while the payroll rules were still being settled, and staging
-- was run from a copy taken before the last few edits. The result: the base columns landed,
-- but sunday_premium_hours, holiday_pay_note, attendance_reimbursement and
-- attendance_reimbursement_note did not -- and payslips_net_pay_check, if it was created at
-- all, is missing the reimbursement term.
--
-- Written to be safely re-runnable and to converge on the same end state whichever variant of
-- 056 was applied. That matters for production, which has none of this yet: prod will run
-- 054-059 from the current files (which already contain everything) and then this migration,
-- where every statement is a no-op. Constraints use drop-if-exists-then-add rather than a
-- conditional, since Postgres has no "add constraint if not exists" and payslips is empty, so
-- recreating them costs nothing.

begin;

-- ---------------------------------------------------------------------------
-- Columns from the later edits to 056
-- ---------------------------------------------------------------------------
-- Premium hours are a SUBSET of overtime_hours, not an addition: an hour on a Sunday or after
-- 22:00 is paid 100% through overtime_pay and a further 50% here, 150% in total.
alter table payslips
  add column if not exists sunday_premium_hours numeric(6,2) not null default 0;

-- Which holidays make up holiday_pay and at what rate, e.g. "April 9-100%, Pinatubo 30%".
-- A period can contain several at different rates summed into one figure.
alter table payslips
  add column if not exists holiday_pay_note text;

-- Deductions from an earlier run, reversed after the employee produced late evidence and
-- refunded on the following payroll rather than by reopening a finalized payslip.
alter table payslips
  add column if not exists attendance_reimbursement numeric(10,2) not null default 0,
  add column if not exists attendance_reimbursement_note text;

comment on column payslips.sunday_premium_hours is
  'Hours worked on a Sunday, a SUBSET of overtime_hours. Paid 100% through overtime_pay plus 50% through sunday_premium_pay. Never added to overtime_hours -- they are already in it.';
comment on column payslips.night_diff_hours is
  'Overtime hours falling after 22:00, a SUBSET of overtime_hours. Paid 100% through overtime_pay plus 50% through night_diff_pay.';
comment on column payslips.overtime_hours is
  'ALL overtime hours, including any that also qualify for the night-differential or Sunday premium. Paid at 1.0x hourly with no premium; the premium columns carry the extra 50%.';
comment on column payslips.holiday_pay_note is
  'Which holidays make up holiday_pay and at what rate, e.g. "April 9-100%, Pinatubo 30%". Rendered as the payslip line''s label.';
comment on column payslips.attendance_reimbursement is
  'Deductions from an earlier run reversed after late evidence. Added to net_pay, never to gross_pay. Sourced from reversed payroll_day_resolutions rows (057).';
comment on column payslips.attendance_reimbursement_note is
  'Which days are being refunded and why, e.g. "Aug 5 half-day reversed -- logbook confirmed 17:00 logout".';

-- ---------------------------------------------------------------------------
-- Stored totals must equal their components
-- ---------------------------------------------------------------------------
-- gross_pay, total_deduction and net_pay are all derivable from other columns in the same
-- row. They stay stored -- a payslip is a record that must reproduce exactly -- but nothing
-- otherwise stops them drifting from the figures they claim to total.
--
-- Not hypothetical: the company's live spreadsheet has this bug. One employee's gross reads
-- =B55 (the semi-monthly rate alone) where every other sheet reads =sum(...), so 622.60 of
-- overtime and 177.88 of night differential were never added and he was paid 800.48 short on
-- a payslip that looked perfectly well-formed.
--
-- total_deduction deliberately excludes regular_loan_principal and regular_loan_remaining:
-- those are display lines, and including them would deduct an entire loan in one payday.
alter table payslips drop constraint if exists payslips_gross_pay_check;
alter table payslips drop constraint if exists payslips_total_deduction_check;
alter table payslips drop constraint if exists payslips_net_pay_check;

alter table payslips
  add constraint payslips_gross_pay_check
  check (gross_pay = base_pay + overtime_pay + night_diff_pay + sunday_premium_pay + holiday_pay),

  add constraint payslips_total_deduction_check
  check (total_deduction = regular_loan_deduction + cash_advance_deduction
       + late_undertime_deduction + unpaid_leave_deduction
       + sss_deduction + pagibig_deduction + philhealth_deduction),

  add constraint payslips_net_pay_check
  check (net_pay = gross_pay - total_deduction + sick_leave_payout + attendance_reimbursement);

-- ---------------------------------------------------------------------------
-- A payslip requires a payroll profile
-- ---------------------------------------------------------------------------
-- 054 pointed payslips.user_email at users(user_email), which only proves the person has a
-- Penfix OS account -- not that they are set up in payroll. A payslip cannot exist without a
-- monthly_salary to compute it from, so the real parent is payroll_profiles, which is itself
-- a foreign key to users and so preserves the chain.
alter table payslips drop constraint if exists payslips_user_email_fkey;
alter table payslips
  add constraint payslips_user_email_fkey
  foreign key (user_email) references payroll_profiles(user_email);

-- ---------------------------------------------------------------------------
-- One open regular loan per employee
-- ---------------------------------------------------------------------------
-- Company policy: the current loan must be fully paid before a new application is accepted.
-- Enforced at the data layer so a second loan is impossible even via a path that forgets to
-- check. Settled loans (zero balance) leave the index and stop blocking. Cash advances are
-- exempt -- they clear in full on the next run, so holding more than one before it is normal.
create unique index if not exists payroll_loan_ledger_one_open_loan_idx
  on payroll_loan_ledger (user_email)
  where source_type = 'loan' and remaining_balance > 0;

-- ---------------------------------------------------------------------------
-- Employee self-service read
-- ---------------------------------------------------------------------------
-- Lets hr's MyHR show an employee their own payslip. SELECT only and scoped to auth.email():
-- company policy makes discussing pay with co-employees a terminable offence, so a payslip
-- must never be readable by anyone but its owner and payroll staff. Writes remain governed by
-- admin_treasury_all_payslips from 054.
drop policy if exists "employee_read_own_payslips" on payslips;
create policy "employee_read_own_payslips" on payslips for select
  using (user_email = auth.email());

commit;
