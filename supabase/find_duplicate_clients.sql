-- Read-only. Lists candidate duplicate clients for manual review before any merge.
-- Groups by normalized name (lowercased, whitespace-collapsed) so "Karyl  Santiago" and
-- "karyl santiago" land in the same group even without an exact match. Also flags whether
-- the group shares a contact_number or email -- that's much stronger evidence of being the
-- same person than name alone, since two different real customers can share a name.
--
-- Nothing here modifies data. Review the output, pick the row to KEEP per group (usually the
-- one with more job orders / older client_id), then use merge_clients.sql for that pair.

select
  lower(regexp_replace(trim(client_name), '\s+', ' ', 'g')) as normalized_name,
  count(*) as duplicate_count,
  bool_or(cn.n > 1) as shares_contact_number,
  bool_or(em.n > 1) as shares_email,
  array_agg(
    client_id || ' | ' || client_name
    || coalesce(' | ' || company_name, '')
    || ' | ' || coalesce(contact_number, 'no phone')
    || ' | ' || coalesce(email, 'no email')
    order by client_id
  ) as candidates
from clients c
left join lateral (
  select count(*) as n from clients c2
  where c2.contact_number = c.contact_number and c.contact_number is not null
) cn on true
left join lateral (
  select count(*) as n from clients c2
  where lower(c2.email) = lower(c.email) and c.email is not null
) em on true
group by normalized_name
having count(*) > 1
order by shares_contact_number desc, shares_email desc, duplicate_count desc;
