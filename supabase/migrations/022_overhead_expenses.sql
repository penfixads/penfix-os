-- Monthly fixed overhead (utilities, employee salaries, BIR, team building, etc.) used
-- to compute final Profit in Sales Reports, on top of Net Profit from Sales/Purchases/
-- Deliveries. Unlike every other table in this project (which only checks
-- auth.role() = 'authenticated' and relies on the app's UI/middleware to hide things),
-- this one carries real salary data that must never reach Treasury even via a direct
-- Supabase client call from the browser — so it's the first table with an actual
-- role-based RLS policy instead of a blanket authenticated-user policy.
create table if not exists overhead_expenses (
  overhead_id text primary key,
  month date not null,
  expense_name text not null,
  amount numeric(10,2) not null default 0,
  remarks text,
  recorded_by text,
  created_at timestamptz default now()
);

create index if not exists idx_overhead_expenses_month on overhead_expenses(month);

alter table overhead_expenses enable row level security;

create policy "admin_only_overhead_expenses" on overhead_expenses for all
  using (exists (select 1 from users u where u.user_email = auth.email() and u.role = 'Admin'))
  with check (exists (select 1 from users u where u.user_email = auth.email() and u.role = 'Admin'));

grant select, insert, update, delete on overhead_expenses to authenticated;
grant all on overhead_expenses to service_role;
