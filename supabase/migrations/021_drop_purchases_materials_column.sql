-- Specs and Materials were redundant free-text fields with no distinct
-- behavior — merged into Specs alone.
alter table purchases drop column if exists materials;
alter table supplier_deliveries drop column if exists materials;
