-- Feedback links used to carry the JO id, client name, and service category as URL query
-- params (buildFeedbackUrl) because the link itself was the only place that data lived —
-- there was nothing to look it up by. That made the pasted link long (and, stacked five times
-- for the old one-link-per-star design, scam-looking) and put the client's name in plain text
-- in a link that gets forwarded through Messenger/Viber.
--
-- feedback_token replaces that: a single unguessable value generated once per JO (client-side,
-- lib/jo-helpers.ts generateFeedbackToken) and persisted here the first time a feedback link is
-- copied. The link becomes just /feedback/<token> — the feedback page looks up the JO, client,
-- and service server-side via this column instead of trusting query params. Re-copying reuses
-- the same token (see FeedbackQueueClient.copyLink) so a link already sent to a client keeps
-- working even after a follow-up copy.
--
-- Nullable: most job orders never have feedback requested, so most rows never get a token.
-- Unique (partial, ignoring nulls) so two JOs can never collide on the same link.
--
-- Idempotent: safe to re-run.

begin;

alter table job_orders add column if not exists feedback_token text;

do $$
begin
  if not exists (
    select 1 from pg_indexes
    where indexname = 'job_orders_feedback_token_key'
  ) then
    create unique index job_orders_feedback_token_key
      on job_orders (feedback_token)
      where feedback_token is not null;
  end if;
end $$;

commit;
