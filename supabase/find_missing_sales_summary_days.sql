-- Read-only. Lists any of the last N days that has NO daily_sales_summary row at all --
-- i.e. nobody hit "Save Summary" on /sales/summary for that date. Adjust the `30` below to
-- widen/narrow the window. Changes nothing.

select d::date as missing_date
from generate_series(current_date - 29, current_date, interval '1 day') as d
left join daily_sales_summary s on s.date = d::date
where s.summary_id is null
order by missing_date;
