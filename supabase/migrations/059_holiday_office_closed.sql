-- Whether the office actually closes on a given holiday -- needed to shift payday.
--
-- Company practice: payday is the 14th and the day before the last day of the month, but if
-- that date falls on a Sunday or on a holiday when nobody works, payday moves EARLIER --
-- which is why payroll sometimes lands on the 13th. Money cannot be released on a day the
-- office is shut.
--
-- Sundays are derivable from the date, but "holiday when nobody works" is not. 054 stores
-- holiday_type ('Regular' / 'Special Non-Working'), which is the DOLE pay classification --
-- it says how a worked or unworked day is compensated, NOT whether Penfix opened its doors.
-- The office may well operate through a Special Non-Working holiday to hit a client
-- deadline, and payday would not move.
--
-- Defaulting to true: the common case is that a declared holiday closes the office, and the
-- safe failure is shifting payday a day early rather than scheduling it for a day when
-- nobody is there to release it.
--
-- NOTE for whoever implements the shift in payroll/lib/payday.ts: it must LOOP, not step
-- back once. If the 14th is a Sunday and the 13th is a closed holiday, payday is the 12th.
-- The shift then cascades -- attendance_cutoff is payday minus one day, and the next run's
-- attendance_start is the day after this run's cutoff (055) -- so moving a payday moves both
-- windows. payroll_runs stores all four dates, so once a run exists its dates are the
-- authority and recomputing is never needed.
--
-- Concretely for 2026: paydays land on a Sunday on Jun 14, Aug 30 and Nov 29, so those three
-- runs pay out on Jun 13, Aug 29 and Nov 28 -- before any holiday adjustment.

begin;

alter table payroll_holidays
  add column office_closed boolean not null default true;

comment on column payroll_holidays.office_closed is
  'True when Penfix does not operate on this holiday. Drives the payday shift: a payday falling on a closed holiday (or a Sunday) moves to the nearest earlier open day. Distinct from holiday_type, which is the DOLE pay classification and says nothing about whether the office opened.';

comment on column payroll_holidays.holiday_type is
  'DOLE pay classification, NOT an office-closure flag -- see office_closed. Regular: paid at 100% whether worked or not. Special Non-Working: premium only if worked, nothing if not.';

commit;
