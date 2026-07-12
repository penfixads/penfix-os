import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/user'
import { redirect } from 'next/navigation'
import AllJOsClient from './AllJOsClient'

export default async function AllJOsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const supabase = createSupabaseServerClient()

  const { data: jobOrders, error } = await supabase
    .from('job_orders')
    .select(`
      job_order_id, date_time_received, received_by, payment_status, source_channel, public_token,
      grand_total, total_amount_paid, balance_due, job_status, is_for_billing, feedback_requested_at,
      clients(client_name, company_name, contact_number),
      job_order_items(
        item_id, job_status, quantity,
        subcategories(subcategory_name),
        job_order_item_status_log(status_name, changed_by_name, changed_by_role, created_at)
      )
    `)
    .order('date_time_received', { ascending: false })
    .limit(500)

  if (error) console.error('All Job Orders query failed:', error.message)

  return <AllJOsClient jobOrders={jobOrders || []} currentUser={user} />
}
