-- Restricts categories/subcategories writes (insert/update/delete) to Admin only.
-- The old blanket "for all" policy let any authenticated role (GA/Treasury/Fabricator)
-- write via a direct Supabase client call even though the /admin/categories page itself
-- is Admin-gated in the app layer — this closes that gap at the database level, same
-- pattern as migration 022's overhead_expenses policy. Reads stay open to everyone
-- authenticated since JOItemForm etc. need to list categories/subcategories for every JO.
drop policy if exists "auth_users_categories" on categories;
create policy "auth_users_select_categories" on categories for select using (auth.role() = 'authenticated');
create policy "admin_insert_categories" on categories for insert
  with check (exists (select 1 from users u where u.user_email = auth.email() and u.role = 'Admin'));
create policy "admin_update_categories" on categories for update
  using (exists (select 1 from users u where u.user_email = auth.email() and u.role = 'Admin'))
  with check (exists (select 1 from users u where u.user_email = auth.email() and u.role = 'Admin'));
create policy "admin_delete_categories" on categories for delete
  using (exists (select 1 from users u where u.user_email = auth.email() and u.role = 'Admin'));

drop policy if exists "auth_users_subcategories" on subcategories;
create policy "auth_users_select_subcategories" on subcategories for select using (auth.role() = 'authenticated');
create policy "admin_insert_subcategories" on subcategories for insert
  with check (exists (select 1 from users u where u.user_email = auth.email() and u.role = 'Admin'));
create policy "admin_update_subcategories" on subcategories for update
  using (exists (select 1 from users u where u.user_email = auth.email() and u.role = 'Admin'))
  with check (exists (select 1 from users u where u.user_email = auth.email() and u.role = 'Admin'));
create policy "admin_delete_subcategories" on subcategories for delete
  using (exists (select 1 from users u where u.user_email = auth.email() and u.role = 'Admin'));
