-- Referral program: a client can name who referred them at registration on
-- shop.penfixads.com, or have it linked afterward by staff in the Clients page here.
-- referred_by_raw keeps whatever was typed (a Messenger name, a phone number -- most of
-- our client history is traced by Messenger, not mobile number, so this often won't
-- resolve automatically) even when it doesn't immediately match an existing client, so a
-- typo or an unrecognized name doesn't permanently lose the referral. Staff can link
-- referred_by_client_id from that raw text at any time and the +20 referral bonus still
-- gets credited retroactively -- see lib/referral-rewards.ts.
alter table clients add column if not exists referred_by_client_id text references clients(client_id) on delete set null;
alter table clients add column if not exists referred_by_raw text;
