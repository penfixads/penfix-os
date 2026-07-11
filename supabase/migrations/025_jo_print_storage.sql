-- Adds a private Storage bucket for the original, full-resolution files clients
-- upload for printing (the shop's "Item Preview" upload) — separate from
-- job_order_items.item_preview, which stays a small on-screen compressed
-- thumbnail only. Files land in date-named folders (YYYY-MM-DD/<item_id>-<name>)
-- so staff can browse "today's" prints as they come in.
--
-- Run in the Supabase SQL Editor — staging first, then prod once verified.

insert into storage.buckets (id, name, public)
values ('jo-print-files', 'jo-print-files', false)
on conflict (id) do nothing;

alter table job_order_items
  add column if not exists original_file_path text;
