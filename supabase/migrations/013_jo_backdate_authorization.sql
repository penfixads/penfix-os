-- Add Historical Records lets Treasury/GA backdate a job order's date_time_received, but
-- only after an Admin unlocks the date field (credential check done client-side against
-- Supabase Auth + the users table, never establishing a session for the Admin). This column
-- records which Admin authorized the backdating, for audit purposes. Null for every normal
-- (same-day) job order created via Today's Received JOs.
alter table job_orders add column if not exists date_override_authorized_by text;
