-- Admin classification of an attendance day that payroll cannot compute on its own.
--
-- Payroll refuses to generate a payslip while any day in the run's window is unresolved.
-- A day is unresolved when it has 1-3 punches (incomplete -- see GENERAL POLICY: "NO
-- COMPLETE LOG = NO FULL DAY") or zero punches on a working day. Without this table the
-- only way to clear such a day would be for an Admin to invent punch times, which corrupts
-- the attendance record to unblock payroll -- exactly backwards.
--
-- So there are two ways to clear a blocked day:
--   1. Add the genuinely missing punches in hr (logbook or CCTV evidence, per policy the
--      employee must produce it themselves). The day then has 4 punches and computes
--      normally -- no row here is needed, the punch and its note ARE the record.
--   2. Classify the day here, when no evidence exists. A deduction is recorded and the
--      attendance log stays honest about what was actually captured.
--
-- Days with all four punches never need a row. Sundays never need a row -- the office runs
-- a six-day week and Sunday is the rest day. Holidays never need a row -- payroll_holidays
-- already covers them.

begin;

create table payroll_day_resolutions (
  id uuid primary key default gen_random_uuid(),
  user_email text not null references payroll_profiles(user_email),
  work_date date not null,

  -- 'Half-day absent'      1-3 punches and no evidence to complete them. 4 hours deducted.
  --                        The policy's default for an incomplete log, and it applies even
  --                        when the employee was demonstrably present and working.
  -- 'Absent - AWOL'        No attendance, no notification and no filed leave. Full day
  --                        deducted. Counts toward the escalation in GENERAL POLICY:
  --                        3 AWOL -> 3-day suspension, another after that -> termination.
  --                        Cumulative and does NOT reset annually, so the count is simply
  --                        every row of this type for the employee, all time.
  -- 'Absent - unpaid leave' Leave was filed but is not payable -- filed outside the window
  --                        (vacation needs 3 days' notice, sick within 3 days of return) or
  --                        the employee had insufficient credits. Full day deducted, but it
  --                        is NOT an AWOL: the employee did notify.
  -- 'Absent - paid leave'  Approved leave with sufficient credits. No deduction; draws down
  --                        the sick or vacation balance instead.
  resolution text not null check (resolution in (
    'Half-day absent',
    'Absent - AWOL',
    'Absent - unpaid leave',
    'Absent - paid leave'
  )),

  -- Why the Admin decided this -- surfaced on the payslip via payslips.unpaid_leave_note,
  -- e.g. "no CCTV footage available", "SL filed 5 days late", "insufficient leave credits".
  note text,

  resolved_by text not null references users(user_email),
  resolved_at timestamptz not null default now(),
  created_at timestamptz not null default now(),

  -- What this decision actually cost, snapshotted when the payslip was generated, plus which
  -- payslip carried it. Stored rather than recomputed because a reversal must refund the
  -- exact peso amount that was taken -- if the employee's monthly_salary changed in between,
  -- recomputing from today's rate would refund the wrong figure.
  deducted_amount numeric(10,2),
  payslip_id uuid references payslips(id) on delete set null,

  -- Reversal. Company practice: the employee may report a forgotten punch after the run has
  -- gone out; once verified, the deduction is refunded on the FOLLOWING payroll rather than
  -- by reopening a finalized payslip. Setting reversed_at makes the row eligible to be picked
  -- up as payslips.attendance_reimbursement on the next run, which then stamps
  -- reimbursed_in_payslip_id so it can never be refunded twice.
  reversed_at timestamptz,
  reversed_by text references users(user_email),
  reversal_note text,
  reimbursed_in_payslip_id uuid references payslips(id) on delete set null,

  -- A row cannot be marked refunded without having been reversed first.
  constraint payroll_day_resolutions_reimbursement_check
    check (reimbursed_in_payslip_id is null or reversed_at is not null),

  -- One decision per employee-day. Re-deciding updates the row rather than stacking.
  unique (user_email, work_date)
);

create index payroll_day_resolutions_user_email_idx on payroll_day_resolutions (user_email);
create index payroll_day_resolutions_work_date_idx on payroll_day_resolutions (work_date);

-- The next run's "what do I owe people back?" query. Partial, so it stays tiny however many
-- resolutions accumulate -- a row leaves the index the moment it is refunded.
create index payroll_day_resolutions_pending_refund_idx
  on payroll_day_resolutions (user_email)
  where reversed_at is not null and reimbursed_in_payslip_id is null;

alter table payroll_day_resolutions enable row level security;

create policy "admin_treasury_all_payroll_day_resolutions" on payroll_day_resolutions for all
  using (exists (select 1 from users u where u.user_email = auth.email() and u.role in ('Admin', 'Treasury')))
  with check (exists (select 1 from users u where u.user_email = auth.email() and u.role in ('Admin', 'Treasury')));

-- Employees see why a day of theirs was docked, in MyHR alongside the payslip. Read-only and
-- scoped to themselves, same reasoning as employee_read_own_payslips in 056: a deduction the
-- employee cannot see the reason for is exactly the payroll dispute this system exists to
-- prevent ("Prevent payroll disputes caused by missing or assumed logs" -- ATTENDANCE
-- MANAGEMENT SOP).
create policy "employee_read_own_day_resolutions" on payroll_day_resolutions for select
  using (user_email = auth.email());

grant select, insert, update, delete on payroll_day_resolutions to authenticated;
grant all on payroll_day_resolutions to service_role;

-- No updated_at trigger here on purpose: the other payroll tables reuse
-- update_payroll_profiles_updated_at(), which sets new.updated_at, and this table has no such
-- column. resolved_at is the decision timestamp and the application sets it explicitly when a
-- day is re-decided, so the row always records who decided and when -- not merely when the row
-- was last touched.

comment on table payroll_day_resolutions is
  'Admin decision on an attendance day payroll cannot compute: incomplete punches with no evidence, or a working day with no attendance at all. Absence of a row means the day needs no decision (4 punches, a Sunday, or a holiday).';

commit;
