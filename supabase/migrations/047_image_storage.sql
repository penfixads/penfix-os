-- Job order item previews/thumbnails and payment-proof screenshots move from base64
-- text columns to real Supabase Storage files — every page touching job_order_items
-- or payment_proofs was dragging embedded image bytes through Vercel's server on every
-- request, which never actually stores the images but pays bandwidth for them anyway.
-- Public bucket (not signed URLs) since item previews already render on the public,
-- unauthenticated /track/[token] page today — same exposure level, just relocated.
insert into storage.buckets (id, name, public)
values ('jo-images', 'jo-images', true)
on conflict (id) do nothing;

-- Staff (authenticated) upload item preview/thumb images from the New JO / Add Item form.
create policy "authenticated_insert_jo_images_items" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'jo-images' and (storage.foldername(name))[1] = 'items');

-- Public tracking page (anon, no session) uploads payment-proof screenshots — mirrors
-- the existing anon_insert_payment_proofs table policy (migration 040).
create policy "anon_insert_jo_images_proofs" on storage.objects
  for insert to anon
  with check (bucket_id = 'jo-images' and (storage.foldername(name))[1] = 'payment-proofs');

-- Staff can also submit a proof on a client's behalf via Edit Job Order.
create policy "authenticated_insert_jo_images_proofs" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'jo-images' and (storage.foldername(name))[1] = 'payment-proofs');

-- Public bucket serves reads to anyone without a policy — no select policy needed.
