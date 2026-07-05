import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/user'
import { redirect } from 'next/navigation'
import DailyRecordClient from './DailyRecordClient'

export default async function DailyRecordPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const supabase = createSupabaseServerClient()

  const { data: jobOrders, error } = await supabase
    .from('job_orders')
    .select(`
      job_order_id, date_time_received, received_by,
      clients(client_name, company_name),
      job_order_items(
        item_id, job_status, quantity,
        subcategories(subcategory_name),
        job_order_item_status_log(status_name, changed_by_name, changed_by_role, created_at)
      )
    `)
    .order('date_time_received', { ascending: false })
    .limit(500)

  if (error) console.error('Daily Job Order Record query failed:', error.message)

  return <DailyRecordClient jobOrders={jobOrders || []} />
}
