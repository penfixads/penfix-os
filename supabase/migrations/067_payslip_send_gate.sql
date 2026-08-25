-- Gates payslip visibility in hr's MyHR behind an explicit "Send to myHR" action, separate
-- from Finalize. Without this, employee_read_own_payslips (056/060) lets an employee read a
-- payslip the instant the row exists — Draft or Finalized, no distinction — which conflicts
-- directly with the user's 2026-08-26 requirement: "THIS MUST NOT BE AUTOMATIC." Finalizing
-- the numbers and publishing them to the employee must be two separate, deliberate actions.
--
-- Safe as a plain additive change: payslips is empty on staging (no run has ever been
-- generated) and empty on prod (which doesn't even have 054-060 yet, confirm before applying
-- there). No backfill needed either way — see payroll-payslip-computation-spec memory,
-- "nothing to backfill" was an explicit 2026-08-26 decision.

begin;

alter table payslips
  add column sent_to_myhr boolean not null default false,
  add column sent_at timestamptz,
  add column sent_by text references users(user_email);

comment on column payslips.sent_to_myhr is
  'True only after an Admin explicitly clicks "Send to myHR" on this payslip. Never set by Finalize. Gates employee_read_own_payslips below.';
comment on column payslips.sent_at is 'When sent_to_myhr was set true.';
comment on column payslips.sent_by is 'Who clicked Send to myHR.';

drop policy if exists "employee_read_own_payslips" on payslips;
create policy "employee_read_own_payslips" on payslips for select
  using (user_email = auth.email() and sent_to_myhr = true);

commit;
