-- Backfill: January 2026 daily_sales_summary (cash_on_hand / remitted_cash only)
-- Source: JANUARY 2026 SALES_updated.xlsx, "SALES REPORT SUMMARY" tab (AppSheet-era records).
-- Applied to production 2026-07-24 via REST upsert (on_conflict=date); mirrored here for the record.
-- Sundays and 2026-01-01 excluded (shop closed). Only cash_on_hand/remitted_cash are set here;
-- other columns stay at their schema defaults until job orders/payments for Jan are migrated.
-- Safe to re-run: on conflict (date), only cash_on_hand/remitted_cash are overwritten.

insert into daily_sales_summary (summary_id, date, cash_on_hand, remitted_cash) values
  ('DSS-2026-01-02', '2026-01-02', 1050.00, 1000.00),
  ('DSS-2026-01-03', '2026-01-03', 2947.00, 2400.00),
  ('DSS-2026-01-05', '2026-01-05', 1653.00, 1550.00),
  ('DSS-2026-01-06', '2026-01-06', 6653.00, 6600.00),
  ('DSS-2026-01-07', '2026-01-07', 2464.00, 2450.00),
  ('DSS-2026-01-08', '2026-01-08', 1084.00, 1000.00),
  ('DSS-2026-01-09', '2026-01-09', 9111.00, 9000.00),
  ('DSS-2026-01-10', '2026-01-10', 1303.00, 1250.00),
  ('DSS-2026-01-12', '2026-01-12', 3145.00, 3100.00),
  ('DSS-2026-01-13', '2026-01-13', 4981.00, 4970.00),
  ('DSS-2026-01-14', '2026-01-14', 583.00, 550.00),
  ('DSS-2026-01-15', '2026-01-15', 4054.00, 4050.00),
  ('DSS-2026-01-16', '2026-01-16', 7140.00, 7100.00),
  ('DSS-2026-01-17', '2026-01-17', 2106.00, 2100.00),
  ('DSS-2026-01-19', '2026-01-19', 4976.00, 4850.00),
  ('DSS-2026-01-20', '2026-01-20', 1017.00, 900.00),
  ('DSS-2026-01-21', '2026-01-21', 5313.00, 5120.00),
  ('DSS-2026-01-22', '2026-01-22', 5108.00, 5000.00),
  ('DSS-2026-01-23', '2026-01-23', 3163.00, 3100.00),
  ('DSS-2026-01-24', '2026-01-24', 5056.00, 5050.00),
  ('DSS-2026-01-26', '2026-01-26', 4522.00, 4450.00),
  ('DSS-2026-01-27', '2026-01-27', 6219.00, 6200.00),
  ('DSS-2026-01-28', '2026-01-28', 4551.00, 4550.00),
  ('DSS-2026-01-29', '2026-01-29', 4944.00, 4920.00),
  ('DSS-2026-01-30', '2026-01-30', 7189.00, 7150.00),
  ('DSS-2026-01-31', '2026-01-31', 1650.00, 1650.00)
on conflict (date) do update set
  cash_on_hand = excluded.cash_on_hand,
  remitted_cash = excluded.remitted_cash;
