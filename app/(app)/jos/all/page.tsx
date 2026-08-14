import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/user'
import { redirect } from 'next/navigation'
import AllJOsClient from './AllJOsClient'

// job_order_item_status_log is deliberately NOT joined here — same reasoning as
// app/(app)/jos/items/page.tsx: it's only shown once a staff member expands a specific JO's
// items, but this query runs for the entire archive (1200+ JOs and growing) on every visit.
// AllJOsClient fetches it lazily per-JO on expand instead.
const JOB_ORDERS_SELECT = `
  job_order_id, client_id, date_time_received, received_by, payment_status, source_channel, public_token,
  grand_total, total_amount_paid, balance_due, discount, is_for_billing, request_override, override_status,
  job_status, feedback_requested_at, feedback_token,
  clients(client_name, company_name, contact_number),
  job_order_items(
    item_id, job_status, quantity,
    subcategories(subcategory_name)
  )
`

// This is the full archive view, so (unlike Active JOs) it genuinely needs every row —
// job_orders passed 1200 after the Jan-Mar historical import, past Supabase's 1000-row-per-
// request cap (same trap as the subcategory_sop bug), so it has to be paged through. A plain
// .limit(5000) does NOT work here — PostgREST silently truncates the response at its own
// server-side default (1000) no matter how high the requested limit is.
async function fetchAllJobOrders(supabase: ReturnType<typeof createSupabaseServerClient>) {
  const pageSize = 1000
  let all: any[] = []
  let from = 0
  while (true) {
    const { data, error } = await supabase
      .from('job_orders')
      .select(JOB_ORDERS_SELECT)
      .order('date_time_received', { ascending: false })
      .range(from, from + pageSize - 1)
    if (error) { console.error('All Job Orders query failed:', error.message); break }
    all = all.concat(data || [])
    if (!data || data.length < pageSize) break
    from += pageSize
  }
  return all
}

export default async function AllJOsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const supabase = createSupabaseServerClient()

  const [jobOrders, { data: categories }, { data: subcategories }] = await Promise.all([
    fetchAllJobOrders(supabase),
    supabase.from('categories').select('*').eq('is_active', true).order('category_name'),
    supabase.from('subcategories').select('*').eq('is_active', true).order('subcategory_name'),
  ])

  return (
    <AllJOsClient
      jobOrders={jobOrders || []}
      categories={categories || []}
      subcategories={subcategories || []}
      currentUser={user}
    />
  )
}
