-- Makes payroll_loan_ledger regenerate-safe by recording WHICH run wrote each row.
--
-- The bug this fixes (found 2026-08-28 via Jomel Quimson's approved 1,000 cash advance
-- showing as a 0 deduction on the Aug 16-31 run):
--
--   payroll_loan_ledger is payroll's record of "this loan/cash advance has already been
--   charged". Nothing in it says which payroll run did the charging. /api/generate-payroll-run
--   regenerates the CURRENT run in place, so on the second and every later regenerate it
--   reads back the rows its OWN first pass wrote and concludes the money was already taken:
--
--     cash advance -> skipped entirely, deduction silently drops 1,000 -> 0 and stays there.
--     regular loan -> remaining_balance is read as "balance before this run", but it is
--                     already this run's CLOSING balance, so every regenerate amortizes one
--                     more installment. Enough regenerates and the loan reads fully paid,
--                     Vale Due 0, while hr still shows it open.
--
-- Both are the same missing fact, added here as two columns:
--
--   payroll_run_id  which run charged this row. A row belonging to the run currently being
--                   generated is re-charged (it is the same charge, recomputed), not skipped.
--   balance_before  a loan's remaining balance BEFORE that run's amortization, so a
--                   regenerate restarts from the same place instead of compounding.
--
-- Nothing here changes what any already-correct payslip says. See the payroll repo's
-- lib/payslip-compute.ts and app/api/generate-payroll-run/route.ts for the reading side.

begin;

alter table payroll_loan_ledger
  add column if not exists payroll_run_id uuid references payroll_runs(id) on delete set null,
  add column if not exists balance_before numeric(10,2);

comment on column payroll_loan_ledger.payroll_run_id is
  'The payroll run that charged this loan installment / cash advance. Regenerating THAT run recomputes the charge instead of treating it as already collected; any other run treats it as collected and moves on. Null only for pre-068 rows that could not be attributed.';
comment on column payroll_loan_ledger.balance_before is
  'For source_type=loan: remaining_balance BEFORE payroll_run_id''s amortization. Lets a regenerate of that same run recompute from the same starting balance rather than amortizing again on top of its own result. Null on pre-068 rows -- the reader rebuilds it from hr''s original amount and elapsed paydays.';

-- Attribute existing rows to the latest run that already existed when the row was written.
-- Exact, not a guess: a ledger row is only ever written while generating the then-current
-- period, which is always the most recently created run.
update payroll_loan_ledger l
set payroll_run_id = (
  select r.id from payroll_runs r
  where r.created_at <= l.created_at
  order by r.created_at desc
  limit 1
)
where l.payroll_run_id is null;

-- balance_before is deliberately left null on these backfilled rows. For any row belonging
-- to a run that gets regenerated, remaining_balance may already have been over-amortized by
-- the bug above, so it is not a trustworthy basis to reconstruct from. The reader treats a
-- null balance_before on its own run's row as "recompute from scratch" (hr's original amount
-- less payment_per_payday * paydays elapsed since approval), which self-corrects the drift on
-- the next regenerate.

-- The payslip line 056 named "Emergency Loan" is now labelled "Cash Advance" in the payroll
-- app, in both the run editor and the printed payslip. Same column, same single hr source
-- table; only the wording changes, so the line reads as what it actually is instead of
-- looking like a second loan field (2026-08-28, user's call).
comment on column payslips.cash_advance_deduction is
  'Payslip line "Cash Advance" (the workbook and 056 called it "Emergency Loan" -- same product, same column) -- hr cash_advance_requests, deducted in FULL on the first run whose payday falls after approval. Never partially deducted and never carried forward: a cash advance larger than the period can absorb must be refused at approval time in hr, with the employee directed to a regular loan instead.';

commit;
