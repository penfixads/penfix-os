-- Lets clients log in on shop.penfixads.com from a new device/browser (where
-- localStorage no longer remembers them) instead of being stuck re-registering.
-- Nullable: existing clients and anyone staff-created directly in penfixads-OS
-- have no password until they register/set one through the shop.
alter table clients add column if not exists password_hash text;
