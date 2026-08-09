-- The attendance window a payroll run actually counts days for.
--
-- 054 stored attendance_cutoff (payday - 1 day) but nothing stored where the window STARTS.
-- The obvious reading -- count from period_start (the 1st / 16th) through attendance_cutoff --
-- silently loses every day between the previous run's cutoff and this run's period_start.
--
-- Worked through 2026's actual dates:
--   Jul 16-31 run: payday Jul 30, cutoff Jul 29
--   Aug 1-15 run:  payday Aug 14, cutoff Aug 13
-- Counting Aug 1 -> Aug 13 would never pay Jul 30 or Jul 31. The correct window is
-- Jul 30 -> Aug 13: the day after the previous run's cutoff, through this run's cutoff.
-- Left unfixed this loses one or two days of pay per employee, every single period.
--
-- Stored rather than derived from the preceding row so that a historical payslip stays
-- auditable, the value survives a run being deleted or a period skipped, and the first-ever
-- run -- which has no predecessor to derive from -- can have its start set explicitly.
--
-- Safe as a plain NOT NULL add: payroll_runs is empty (054 created it and no run has been
-- generated yet). If that ever stops being true, add nullable, backfill, then set NOT NULL.

begin;

alter table payroll_runs
  add column attendance_start date not null;

alter table payroll_runs
  add constraint payroll_runs_attendance_window_check
  check (attendance_start <= attendance_cutoff);

comment on column payroll_runs.attendance_start is
  'First day attendance counts toward this run -- the day after the previous run''s attendance_cutoff. Set explicitly for the first run, which has no predecessor.';

comment on column payroll_runs.attendance_cutoff is
  'Last day attendance counts toward this run (payday - 1 day). Distinct from period_end, which stays the nominal 15th/last-day label used for display only.';

comment on column payroll_runs.period_start is
  'Nominal period label only (1st or 16th) -- NOT the attendance window start. Use attendance_start for that.';

commit;
