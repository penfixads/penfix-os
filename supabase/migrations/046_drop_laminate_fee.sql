-- Laminate fee add-on (migration 045) was reverted in code (d70d217) because staging's DB
-- never picked up the column, and it never actually reached production usage either — every
-- job_order_items row in prod still has laminate_fee at its 0 default. Dropping it outright
-- instead of leaving an orphaned, unused column around.
--
-- The view has to be repointed BEFORE the column drop, not after — dropping a column that a
-- view still selects fails with "cannot drop column ... because other objects depend on it"
-- (Postgres error 2BP01), since the view's dependency on it is still live at that point.

-- Revert the view to its pre-045 shape (see migration 040) — but unlike adding a trailing
-- column, CREATE OR REPLACE VIEW refuses to remove one ("cannot drop columns from view",
-- 42P16), so the view has to be dropped and recreated from scratch rather than replaced.
drop view if exists public_job_order_items_receipt;

create view public_job_order_items_receipt as
select
  i.item_id,
  i.job_order_id,
  i.item_preview,
  i.quantity,
  i.width,
  i.height,
  i.production_specs,
  i.notes,
  i.date_time_needed,
  i.job_status,
  s.subcategory_name,
  cat.category_name,
  i.computed_line_total,
  i.layout_fee,
  i.delivery_fee,
  i.installation_fee,
  i.seaming_fee
from job_order_items i
left join subcategories s on s.subcategory_id = i.subcategory_id
left join categories cat on cat.category_id = s.category_id;

grant select on public_job_order_items_receipt to anon;

alter table job_order_items drop column if exists laminate_fee;
