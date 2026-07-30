-- The public tracker (/track/[token]) only shows SOP steps flagged visible_to_client
-- (see 027_client_visible_tracking_steps.sql -> public_subcategory_sop_tracking view).
-- Every subcategory was seeded (010_seed_subcategory_sops.sql) with only its first
-- ("Received") and terminal step visible by default -- every in-between production
-- step defaulted to false, so most categories' trackers collapsed to just 2 dots.
-- 027 later opened up Banners/Tarpaulin's middle steps only, which is why Banners
-- JOs show full progress and everything else doesn't.
--
-- This flips the default the other way: every step is client-visible unless an
-- Admin explicitly marks it private. Per-step privacy still works exactly as before --
-- the "Visible to client" checkbox in /admin/subcategory-sops lets an Admin flip any
-- individual step back to invisible for genuinely internal-only steps.
update subcategory_sop
set visible_to_client = true
where visible_to_client = false;

alter table subcategory_sop alter column visible_to_client set default true;
