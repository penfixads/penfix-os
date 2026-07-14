-- Same idea as migration 031/033's layout/delivery/installation fees: lets staff bundle a
-- seaming add-on charge directly into an item's line. Clients sometimes want each side of a
-- tarp/sticker seamed — priced at ₱10/sqft, so it's computed from width × height like the
-- item's own area-based pricing, but kept editable in case that needs overriding.
alter table job_order_items add column if not exists seaming_fee numeric(10,2) default 0;
