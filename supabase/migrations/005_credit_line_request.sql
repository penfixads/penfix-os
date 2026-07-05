-- Lets GA/Treasury request credit-line status for a client instead of setting it directly;
-- only Admin can approve it (surfaced on the existing Pending Approval page).
alter table clients add column if not exists credit_line_request_status text
  check (credit_line_request_status in ('Pending','Approved','Rejected'));
alter table clients add column if not exists credit_line_requested_by text;
