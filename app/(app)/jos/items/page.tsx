import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/user'
import { redirect } from 'next/navigation'
import ItemsClient from './ItemsClient'

export default async function AllJobOrderItemsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const supabase = createSupabaseServerClient()

  const { data: items, error } = await supabase
    .from('job_order_items')
    .select(`
      item_id, job_order_id, quantity, computed_line_total, job_status, priority,
      date_time_needed, date_time_received, production_specs,
      subcategories(subcategory_name, category_id, categories(category_name)),
      job_orders(received_by, clients(client_name, company_name)),
      job_order_item_status_log(status_name, changed_by_name, changed_by_role, created_at)
    `)
    .order('date_time_received', { ascending: false })
    .limit(1000)

  if (error) console.error('All Job Order Items query failed:', error.message)

  return <ItemsClient items={items || []} currentUser={user} />
}
