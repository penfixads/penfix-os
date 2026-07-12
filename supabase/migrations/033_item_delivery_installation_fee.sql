-- Same idea as migration 031's layout_fee: lets staff bundle a delivery or installation
-- add-on charge directly into an item's line, instead of needing a separate line item just
-- to charge for it. No default amount (unlike the ₱150 layout fee) since delivery/
-- installation cost genuinely varies by distance/complexity — staff enter it per job order.
alter table job_order_items add column if not exists delivery_fee numeric(10,2) default 0;
alter table job_order_items add column if not exists installation_fee numeric(10,2) default 0;
