-- Adds a 'None' role: a person exists in the ecosystem (can log in, can be
-- managed from User Management) but has zero access to jobs.penfixads.com.
-- Used for people who only need another Penfix app, e.g. tools.penfixads.com
-- Custodians who should never be defaulted into GA/Fabricator just because
-- every account needs *some* jobs role today.
alter table users drop constraint if exists users_role_check;
alter table users add constraint users_role_check
  check (role in ('Admin', 'GA', 'Treasury', 'Fabricator', 'None'));
