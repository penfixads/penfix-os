-- Lets staff bundle a layout/design add-on fee directly into any job order item (e.g. a
-- client needs a quick layout done on their Tarpaulin Print) instead of having to add a
-- separate "Layout & Design" line item just to charge for it. Defaults to null/0 — most
-- items never use this.
alter table job_order_items add column if not exists layout_fee numeric(10,2) default 0;
