-- Tracks when a feedback link was sent/copied for a JO, so a fully-Done JO can stay
-- visible in Active JOs until someone has actually requested feedback for it.
alter table job_orders add column if not exists feedback_requested_at timestamptz;
