import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/user'
import { redirect } from 'next/navigation'
import AllJOsClient from './AllJOsClient'

export default async function AllJOsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const supabase = createSupabaseServerClient()

  const { data: jobOrders } = await supabase
    .from('job_orders')
    .select(`
      job_order_id, date_time_received, received_by, payment_status,
      grand_total, total_amount_paid, balance_due, job_status, is_for_billing,
      clients(client_name, company_name),
      job_order_items(item_id, job_status)
    `)
    .order('date_time_received', { ascending: false })
    .limit(500)

  return <AllJOsClient jobOrders={jobOrders || []} currentUser={user} />
}
