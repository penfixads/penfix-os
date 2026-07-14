import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/user'
import { redirect } from 'next/navigation'
import ItemsClient from './ItemsClient'

const ITEMS_SELECT = `
  item_id, job_order_id, quantity, computed_line_total, job_status, priority,
  date_time_needed, date_time_received, production_specs,
  subcategories(subcategory_name, category_id, categories(category_name)),
  job_orders(received_by, clients(client_name, company_name)),
  job_order_item_status_log(status_name, changed_by_name, changed_by_role, created_at)
`

// PostgREST silently truncates any response at its own server-side default (1000 rows) no
// matter what .limit() is requested — job_order_items passed 1436 after the Jan-Mar
// historical import, so a flat .limit(1000) was quietly hiding the oldest ~436 items (the
// page orders newest-first, so January/February were the ones disappearing). Same trap as
// All Job Orders and Sales Reports — paging through every row instead.
async function fetchAllItems(supabase: ReturnType<typeof createSupabaseServerClient>) {
  const pageSize = 1000
  let all: any[] = []
  let from = 0
  while (true) {
    const { data, error } = await supabase
      .from('job_order_items')
      .select(ITEMS_SELECT)
      .order('date_time_received', { ascending: false })
      .range(from, from + pageSize - 1)
    if (error) { console.error('All Job Order Items query failed:', error.message); break }
    all = all.concat(data || [])
    if (!data || data.length < pageSize) break
    from += pageSize
  }
  return all
}

export default async function AllJobOrderItemsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const supabase = createSupabaseServerClient()
  const items = await fetchAllItems(supabase)

  return <ItemsClient items={items} currentUser={user} />
}
