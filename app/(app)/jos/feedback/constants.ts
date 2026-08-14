// Shared by the server page and the client component. These must live in a plain module, not
// in the 'use client' file: Next turns a client module's exports into client references, so a
// constant imported from there reads as undefined on the server (it silently became NaN in the
// date math and threw "Invalid time value").

export const PAGE_SIZE = 10

// A link that's gone unanswered this long isn't coming back. The JO stops being work and
// becomes a record, so it moves out of the follow-up list — otherwise the queue only ever
// grows and staff stop opening it. Derived from feedback_requested_at, so there's no
// "dismissed" column to maintain and no backfill.
export const NO_RESPONSE_AFTER_DAYS = 14

export type Bucket = 'to_send' | 'awaiting' | 'no_response'

export const BUCKET_LABELS: Record<Bucket, string> = {
  to_send: 'To send',
  awaiting: 'Awaiting reply',
  no_response: 'No response',
}
