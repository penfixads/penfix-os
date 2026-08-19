-- Merges one or more duplicate clients into a kept client. Run per confirmed group, after
-- reviewing find_duplicate_clients.sql -- this does not decide which rows are duplicates,
-- you do.
--
-- Runs as a single do $$ ... $$ block deliberately, not a series of top-level statements --
-- Supabase's SQL Editor gives each query tab its own DB connection/session, so a temp table
-- (or any state) created by one statement isn't guaranteed visible to a later one if they end
-- up on different tabs/sessions. A single anonymous PL/pgSQL block is one atomic statement
-- from the editor's point of view regardless of that, so it can't be split apart by accident.
-- Paste this WHOLE block into ONE query tab and run it once.
--
-- Before running, edit just the two lines marked below:
--   1. keep_id     -- the client_id to keep.
--   2. remove_ids  -- one element for a simple 2-account merge, or several for 3+ accounts
--      merging into one, e.g. array['C070726-4915022','C081026-1122334']
--
-- What it does, in order:
--   1. Reassigns job_orders, payments, rewards_redemptions, rewards_ledger from every
--      removed client to the kept one. This must happen before the delete -- rewards_ledger
--      has ON DELETE CASCADE, so deleting a duplicate first would silently wipe its reward
--      history instead of moving it.
--   2. Adds every removed client's earned_rewards/claimed_rewards onto the kept one's
--      (they're stored balances, not computed) instead of just dropping them.
--   3. Deletes the now-empty duplicate client rows.
--
-- A do block runs in its own implicit transaction: if any statement inside errors, the whole
-- thing rolls back automatically and nothing is applied. Double-check the client_id values
-- below before running -- once it succeeds, it's applied for real. Check the SELECT result
-- at the bottom afterward to confirm the merge looks right.

do $$
declare
  keep_id text := 'KEEP_ID_HERE';
  remove_ids text[] := array['REMOVE_ID_HERE']; -- add more elements for 3+ duplicates
begin
  -- Catch the two easy typo mistakes before anything is touched -- a wrong/misspelled
  -- keep_id would otherwise silently reassign every duplicate's history to nothing (the
  -- UPDATEs below just match zero rows) and then delete the real duplicates anyway; a
  -- keep_id accidentally left in remove_ids would delete the very client you meant to keep.
  if not exists (select 1 from clients where client_id = keep_id) then
    raise exception 'keep_id % does not exist in clients -- check for a typo.', keep_id;
  end if;

  if keep_id = any(remove_ids) then
    raise exception 'keep_id % also appears in remove_ids -- that would delete the client you meant to keep.', keep_id;
  end if;

  update job_orders set client_id = keep_id where client_id = any(remove_ids);
  update payments set client_id = keep_id where client_id = any(remove_ids);
  update rewards_redemptions set client_id = keep_id where client_id = any(remove_ids);
  update rewards_ledger set client_id = keep_id where client_id = any(remove_ids);

  update clients k
  set
    earned_rewards = k.earned_rewards + coalesce((select sum(r.earned_rewards) from clients r where r.client_id = any(remove_ids)), 0),
    claimed_rewards = k.claimed_rewards + coalesce((select sum(r.claimed_rewards) from clients r where r.client_id = any(remove_ids)), 0)
  where k.client_id = keep_id;

  delete from clients where client_id = any(remove_ids);
end $$;

-- Sanity check -- confirm the kept client now shows the combined JO count and rewards.
select client_id, client_name, company_name, earned_rewards, claimed_rewards,
       (select count(*) from job_orders where client_id = 'KEEP_ID_HERE') as jo_count
from clients where client_id = 'KEEP_ID_HERE';
