export const dynamic = 'force-dynamic'

import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/user'
import { redirect } from 'next/navigation'
import FeedbackQueueClient from './FeedbackQueueClient'
import { type Bucket, PAGE_SIZE, NO_RESPONSE_AFTER_DAYS } from './constants'

// Only chase feedback on recent work — a JO finished six months ago isn't worth a follow-up
// message, and without a window this queue would grow without bound.
const WINDOW_DAYS = 90

const BUCKETS: Bucket[] = ['to_send', 'awaiting', 'no_response']

export default async function FeedbackQueuePage({
  searchParams,
}: {
  searchParams: { bucket?: string; page?: string; q?: string }
}) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (!['Admin', 'GA', 'Treasury'].includes(user.role)) redirect('/jos/active')

  const bucket: Bucket = BUCKETS.includes(searchParams.bucket as Bucket)
    ? (searchParams.bucket as Bucket)
    : 'to_send'
  const page = Math.max(1, Number(searchParams.page) || 1)
  const q = (searchParams.q || '').trim()

  const supabase = createSupabaseServerClient()
  const now = Date.now()
  const windowStart = new Date(now - WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString()
  const noResponseCutoff = new Date(now - NO_RESPONSE_AFTER_DAYS * 24 * 60 * 60 * 1000).toISOString()

  // JOs that already came back. Feedback can only be submitted after the JO is done, so
  // restricting to submissions inside the same window is complete for the JOs we're listing —
  // and keeps this list bounded by response volume rather than growing with all history.
  // That matters: these ids go into a `not.in` filter below, and an unbounded list would
  // eventually build a request URL too long to send.
  const { data: responded } = await supabase
    .from('client_feedback')
    .select('jo')
    .gte('created_at', windowStart)
    .not('jo', 'is', null)

  const respondedIds = Array.from(new Set((responded || []).map(r => r.jo))) as string[]

  // Search matches either the JO id or the client's name. Client names live on a joined table,
  // so they're resolved to client_ids first rather than filtering through the embed — two cheap
  // indexed queries instead of one awkward one.
  let matchedClientIds: string[] | null = null
  if (q) {
    const { data: matchedClients } = await supabase
      .from('clients')
      .select('client_id')
      .or(`client_name.ilike.%${q}%,company_name.ilike.%${q}%`)
      .limit(200)
    matchedClientIds = (matchedClients || []).map(c => c.client_id)
  }

  // job_status 'Done' is the JO-level completion flag set by syncJobOrderDoneStatus
  // (lib/jo-completion.ts) — it only rolls a JO to 'Done' once every item is terminal AND the
  // JO is settled, and sends all-Unclaimed JOs to 'Unclaimed' instead. Filtering on it gives
  // us both rules we want for free: never ask a client who hasn't paid, never chase work the
  // client abandoned.
  function baseQuery(select: string, opts?: { count: 'exact'; head: boolean }) {
    let query = supabase
      .from('job_orders')
      .select(select, opts)
      .eq('job_status', 'Done')
      .gte('date_time_received', windowStart)

    if (respondedIds.length > 0) {
      query = query.not('job_order_id', 'in', `(${respondedIds.join(',')})`)
    }
    return query
  }

  function applyBucket(query: any, b: Bucket) {
    if (b === 'to_send') return query.is('feedback_requested_at', null)
    if (b === 'awaiting') return query.gte('feedback_requested_at', noResponseCutoff)
    return query.not('feedback_requested_at', 'is', null).lt('feedback_requested_at', noResponseCutoff)
  }

  function applySearch(query: any) {
    if (!q) return query
    // No client matched the text, so only a JO-id match can succeed.
    if (matchedClientIds && matchedClientIds.length === 0) return query.ilike('job_order_id', `%${q}%`)
    return query.or(`job_order_id.ilike.%${q}%,client_id.in.(${(matchedClientIds || []).join(',')})`)
  }

  // Tab counts are unfiltered by search so the tabs keep showing the true size of each queue.
  const countResults = await Promise.all(
    BUCKETS.map(b => applyBucket(baseQuery('job_order_id', { count: 'exact', head: true }), b))
  )
  const counts = Object.fromEntries(
    BUCKETS.map((b, i) => [b, countResults[i].count || 0])
  ) as Record<Bucket, number>

  const from = (page - 1) * PAGE_SIZE
  const rowsQuery = applySearch(
    applyBucket(
      baseQuery(`
        job_order_id, feedback_requested_at, feedback_token, date_time_received, received_by, client_id,
        clients(client_name, company_name, contact_number),
        job_order_items(subcategories(categories(category_name)))
      `),
      bucket
    )
  )
    .order('date_time_received', { ascending: false })
    .range(from, from + PAGE_SIZE - 1)

  // Only the current page is fetched, so the nested item/category join stays cheap no matter
  // how many completed JOs exist. The filtered total comes from a separate head-only count.
  const [{ data: jobOrders }, filteredCountResult] = await Promise.all([
    rowsQuery,
    applySearch(applyBucket(baseQuery('job_order_id', { count: 'exact', head: true }), bucket)),
  ])

  return (
    <FeedbackQueueClient
      jobOrders={jobOrders || []}
      counts={counts}
      bucket={bucket}
      page={page}
      totalItems={filteredCountResult.count || 0}
      search={q}
    />
  )
}
