-- Fills the gaps between 054's payslips table and the payslip Penfix actually issues,
-- plus the RLS policy that lets an employee read their own payslip in hr's MyHR.
--
-- Every rule below was established against the company's GENERAL POLICY document and the
-- live "PENFIX PAYROLL 2026" workbook (one sheet per employee, each pay period a repeating
-- ~46-row block). Where the two disagreed, the workbook's formulas won -- they are what has
-- actually been paying people.
--
-- PAYSLIP LINE -> COLUMN MAPPING. The column names do not match the payslip labels, so this
-- is the authoritative key. Rates: daily = monthly/26 (six-day week, Sunday is the rest day),
-- hourly = monthly/26/8.
--
--   MONTHLY RATE                            monthly_rate
--   SEMI-MONTHLY RATE                       base_pay             monthly/2, FLAT -- not
--                                                                attendance-derived
--   Overtime (n hrs)                        overtime_*           hourly * hrs at 1.0x, NO
--                                                                premium (company practice;
--                                                                statutory is 125%)
--   Night Differential/Sunday Premium (n)   night_diff_*,        hourly * 0.5 * hrs. Kept as
--                                           sunday_premium_pay   separate columns but rendered
--                                                                as ONE combined line, matching
--                                                                the workbook
--   Holiday Pay                             holiday_pay          daily * holiday count
--   Gross Pay                               gross_pay
--
--   Regular Loan                            regular_loan_principal   DISPLAY ONLY  (new)
--   Remaining Loan                          regular_loan_remaining   DISPLAY ONLY  (new)
--   Vale Due                                regular_loan_deduction   <- THE AMOUNT DEDUCTED
--   Emergency Loan                          cash_advance_deduction   deducted in full
--   Late/Undertime (n hrs)                  late_undertime_*         hourly * (late + undertime)
--   <unpaid days, variable label>           unpaid_leave_*           daily * days
--   SSS / PAG-IBIG / PHILHEALTH             *_deduction
--   Total Deduction                         total_deduction
--   Net Pay                                 net_pay
--   LATE FOR REPRIMAND ACTION               late_sanction_count      (new)
--   Prepared by                             prepared_by              (new)
--
-- CRITICAL: total_deduction must include Vale Due and Emergency Loan but NEVER
-- regular_loan_principal or regular_loan_remaining. Those two are shown for the employee's
-- reference only. Summing them would deduct the entire loan on the first payday. The live
-- workbook gets this right by starting its SUM at the Vale Due row.

begin;

-- ---------------------------------------------------------------------------
-- Sunday premium hours
-- ---------------------------------------------------------------------------
-- 054 gave night differential both hours and pay but Sunday premium only pay, so the two
-- halves of a single payslip line could not be populated symmetrically. Adding the missing
-- counterpart.
--
-- How these relate to overtime, which is not obvious from the column names: premium hours
-- are a SUBSET of overtime_hours, not an addition to them. Every hour worked on a Sunday or
-- after 22:00 is overtime by construction -- the office day ends at 17:00 and the /26
-- divisor covers Mon-Sat only -- so such hours are paid 100% via overtime_pay and then a
-- further 50% of the hourly rate via night_diff_pay or sunday_premium_pay. 150% in total.
--
-- Verified against the workbook: Jomel's Feb 16-28 has 31.38 OT hours (PHP 2,791.01) of which
-- 11.38 carried the premium (PHP 506.08). 11.38 * 88.9423 * 1.5 + 20 * 88.9423 = 3,297.09,
-- which is exactly the two figures summed. Double-counting those hours as separate overtime
-- would overpay by 50%.
--
-- The 50% applies ONCE per hour. An hour that is both a Sunday and after 22:00 earns 150%
-- total, not 200% -- record it under one column, not both.
alter table payslips
  add column sunday_premium_hours numeric(6,2) not null default 0;

comment on column payslips.sunday_premium_hours is
  'Hours worked on a Sunday, a SUBSET of overtime_hours. Paid 100% through overtime_pay plus 50% through sunday_premium_pay. Never added to overtime_hours -- they are already in it.';
comment on column payslips.night_diff_hours is
  'Overtime hours falling after 22:00, a SUBSET of overtime_hours. Paid 100% through overtime_pay plus 50% through night_diff_pay.';
comment on column payslips.overtime_hours is
  'ALL overtime hours, including any that also qualify for the night-differential or Sunday premium. Paid at 1.0x hourly with no premium; the premium columns carry the extra 50%.';

-- ---------------------------------------------------------------------------
-- Loan display lines
-- ---------------------------------------------------------------------------
-- The workbook computes Remaining Loan as (principal - one amortization), so it shows the
-- same figure every period and never counts down -- Jomel's January sheet reads 7,000/6,000
-- in both halves of the month. Snapshotting the real ledger balance here fixes that: the
-- employee sees an actual payoff. Snapshotted rather than joined live to payroll_loan_ledger
-- so reprinting an old payslip shows the balance as it stood then, consistent with every
-- other frozen field on this table.
alter table payslips
  add column regular_loan_principal numeric(10,2) not null default 0,
  add column regular_loan_remaining numeric(10,2) not null default 0;

comment on column payslips.regular_loan_principal is
  'Payslip line "Regular Loan" -- the original loan amount, DISPLAY ONLY. Never part of total_deduction.';
comment on column payslips.regular_loan_remaining is
  'Payslip line "Remaining Loan" -- balance after this period''s amortization, DISPLAY ONLY. Never part of total_deduction.';
comment on column payslips.regular_loan_deduction is
  'Payslip line "Vale Due" -- the per-payday loan amortization actually deducted, from hr loan_requests.payment_per_payday. Minimum PHP 500, except a final settlement smaller than that.';
comment on column payslips.cash_advance_deduction is
  'Payslip line "Emergency Loan" -- hr cash_advance_requests, deducted in FULL on the first run whose payday falls after approval. Never partially deducted and never carried forward: a cash advance larger than the period can absorb must be refused at approval time in hr, with the employee directed to a regular loan instead.';

-- 054 created both cash_advance_deduction and emergency_loan_deduction, but hr has exactly
-- one source table for this (cash_advance_requests, which has no payment_per_payday and so
-- is always a single full deduction). "Vale", "cash advance" and "emergency loan" are the
-- same product under three names. Dropping the duplicate rather than leaving an always-zero
-- column for whoever writes the compute module to trip over.
alter table payslips
  drop column emergency_loan_deduction;

-- ---------------------------------------------------------------------------
-- One open regular loan per employee
-- ---------------------------------------------------------------------------
-- Company policy: an employee cannot hold two regular loans at once -- the current one must
-- be fully paid before a new application is accepted. Enforced here as a partial unique
-- index rather than left to hr's request form, so a second loan is impossible at the data
-- layer even if approved through some other path or by a direct client call. Rows with a
-- zero remaining_balance are excluded, so a settled loan does not block the next one.
--
-- Cash advances are deliberately NOT covered: they are settled in full on the next run, so
-- an employee may hold more than one before that run happens.
create unique index payroll_loan_ledger_one_open_loan_idx
  on payroll_loan_ledger (user_email)
  where source_type = 'loan' and remaining_balance > 0;

comment on index payroll_loan_ledger_one_open_loan_idx is
  'Company policy: only one unsettled regular loan per employee at a time. Cash advances are exempt -- they clear on the next payroll.';

-- ---------------------------------------------------------------------------
-- Unpaid days: the label carries the detail, not just the count
-- ---------------------------------------------------------------------------
-- Real examples from the workbook:
--   "No login and leave without filing (1/26-halfday, 1/19-20, 1/22)"  3.5 days
--   "Unpaid Sick leave (Jan 2-4, Jan 9-insufficient leave credits)"      4 days
-- Without the text an employee sees a peso figure and no way to tell which days it covers.
--
-- Half-days land here too. Per GENERAL POLICY, a day missing ANY of the four required
-- punches is automatically half-day absent (4 hours) even if the employee was demonstrably
-- present -- "NO COMPLETE LOG = NO FULL DAY" -- so unpaid_leave_days carries .5 increments,
-- which numeric(4,1) already allows.
alter table payslips
  add column unpaid_leave_note text;

-- Holiday pay needs the same treatment, and for the same reason: a period may contain more
-- than one holiday at different rates, summed into a single figure. The live workbook labels
-- them "April 9-100%", "Pinatubo 30%", and where two fall in one period, "2/17 -30%,
-- 2/25-100%" against a combined daily * 1.3.
alter table payslips
  add column holiday_pay_note text;

comment on column payslips.holiday_pay_note is
  'Which holidays make up holiday_pay and at what rate, e.g. "April 9-100%, Pinatubo 30%". Rendered as the payslip line''s label.';

comment on column payslips.unpaid_leave_note is
  'Human-readable dates and reasons behind unpaid_leave_days, e.g. "1/26-halfday, 1/19-20, 1/22". Rendered as the payslip line''s label.';
comment on column payslips.unpaid_leave_days is
  'Unpaid days including half-days (.5) from incomplete punch records. Deducted at the daily rate.';

-- ---------------------------------------------------------------------------
-- Leave: accrual, and the December sick-leave conversion
-- ---------------------------------------------------------------------------
-- 5 sick + 5 vacation per CALENDAR year, accruing 5/12 = 0.4167 days per month, credited on
-- the 1st. Unusable until the employee has 3 months' tenure; leave taken before that falls to
-- the unpaid line above. At year end unused SICK leave is paid out as a December cash bonus
-- (this column); unused VACATION leave is simply forfeited and resets to zero, so it needs no
-- payout column. Balances cap at 5 -- 12 x 0.4167 = 5.004 would otherwise overshoot.
alter table payslips
  add column sick_leave_payout numeric(10,2) not null default 0;

comment on column payslips.sick_leave_payout is
  'December only: unused sick-leave balance converted to cash. Added to net_pay, not to gross_pay. Vacation leave has no equivalent -- it is forfeited at year end.';

-- ---------------------------------------------------------------------------
-- Attendance reimbursement (a correction, not an earning)
-- ---------------------------------------------------------------------------
-- Company practice: an employee can see their own attendance record, so noticing and
-- reporting a forgotten punch before payroll runs is their responsibility. Miss that window
-- and the day is docked as half-day absent. They may still report it AFTER the run, and once
-- verified the deduction is paid back on the FOLLOWING payroll rather than by reopening a
-- finalized one -- which keeps issued payslips immutable and the accountability intact.
--
-- Deliberately separate from gross_pay: this is money returned from a previous period, not
-- something earned in this one. Folding it into gross would inflate the basic-salary figure
-- that 13th month pay is computed from.
alter table payslips
  add column attendance_reimbursement numeric(10,2) not null default 0,
  add column attendance_reimbursement_note text;

comment on column payslips.attendance_reimbursement is
  'Deductions from an earlier run reversed after the employee produced late evidence. Added to net_pay, never to gross_pay. Sourced from reversed payroll_day_resolutions rows (see 057).';
comment on column payslips.attendance_reimbursement_note is
  'Which days are being refunded and why, e.g. "Aug 5 half-day reversed -- logbook confirmed 17:00 logout".';

-- ---------------------------------------------------------------------------
-- Late sanction counter (distinct from the late deduction)
-- ---------------------------------------------------------------------------
-- GENERAL POLICY runs two different thresholds off the same punches:
--   deduction  -- ANY minute past 08:00, pro-rated (late_undertime_hours / _deduction)
--   sanction   -- only lates over a 15-minute grace period count toward escalation, and the
--                 count RESETS EVERY QUARTER: 3 lates verbal reprimand, 5 written memo,
--                 7 one-day suspension, 9 two-day, 11 three-day, beyond that termination.
-- This column is the payslip's "LATE FOR REPRIMAND ACTION" reminder. It never affects pay.
alter table payslips
  add column late_sanction_count integer not null default 0;

comment on column payslips.late_sanction_count is
  'Payslip line "LATE FOR REPRIMAND ACTION" -- count of lates over the 15-minute grace period in the CURRENT QUARTER. Informational; does not affect net_pay. Distinct from late_undertime_hours, which counts any minute late.';

-- ---------------------------------------------------------------------------
-- Signatory
-- ---------------------------------------------------------------------------
-- Stored per payslip rather than hardcoded so a reprint keeps whoever actually signed it.
alter table payslips
  add column prepared_by text;

comment on column payslips.prepared_by is
  'Signatory shown at the foot of the payslip, e.g. "Maria Allen J. Quiambao / Executive Manager". Snapshotted so a reprint keeps the original signer.';

-- ---------------------------------------------------------------------------
-- Referential integrity: a payslip requires a payroll profile
-- ---------------------------------------------------------------------------
-- 054 pointed payslips.user_email at users(user_email), which only proves the person has a
-- Penfix OS account -- not that they have been set up in payroll. A payslip cannot exist
-- without a monthly_salary to compute it from, so the real parent is payroll_profiles.
-- Re-pointing the FK there; payroll_profiles.user_email is itself a FK to users, so the
-- chain to the OS account is preserved.
alter table payslips
  drop constraint payslips_user_email_fkey;

alter table payslips
  add constraint payslips_user_email_fkey
  foreign key (user_email) references payroll_profiles(user_email);

-- (054's payroll_contribution_brackets had no guard against overlapping salary bands, which
-- would have made bracket lookup ambiguous and silently mis-deducted pay. Rather than
-- constrain it here, 058 replaces the whole bracket approach with Admin-entered per-employee
-- amounts and drops the table -- so the fix lives there.)

-- ---------------------------------------------------------------------------
-- Stored totals must equal their components
-- ---------------------------------------------------------------------------
-- gross_pay, total_deduction and net_pay are all derivable from other columns in the same
-- row -- the textbook derived-value denormalization. They stay stored (a payslip is a legal
-- record and must reproduce exactly), but nothing stopped them drifting from the figures
-- they claim to total.
--
-- This is not hypothetical. The live workbook has exactly this bug: Jomel's Jan 16-31 gross
-- reads =B55 (the semi-monthly rate alone) where every other sheet reads =sum(...), so his
-- 622.60 overtime and 177.88 night differential were never added. He was paid 800.48 short
-- and the payslip looked perfectly well-formed. These constraints make that impossible.
--
-- Every column is numeric(10,2), so the sums are exact -- no floating-point tolerance needed.
-- Note total_deduction deliberately excludes regular_loan_principal and
-- regular_loan_remaining: those are display lines, and including them would deduct the whole
-- loan in one payday.
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
-- Employee self-service read
-- ---------------------------------------------------------------------------
-- 054 gave payslips a single Admin/Treasury policy, so hr's MyHR (app/my-records) could not
-- show an employee their own payslip at all. This adds a read-only self policy; the existing
-- admin_treasury_all_payslips policy still governs every write.
--
-- Deliberately SELECT-only and scoped to auth.email(): the company's own policy makes
-- discussing salary with co-employees a terminable offence, so a payslip must never be
-- readable by anyone but its owner and payroll staff. This is also why payslips are surfaced
-- through an authenticated MyHR page rather than the public token links used for JO receipts
-- -- a forwardable link would defeat the policy outright.
create policy "employee_read_own_payslips" on payslips for select
  using (user_email = auth.email());

commit;
