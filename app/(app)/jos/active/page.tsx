import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/user'
import { redirect } from 'next/navigation'
import ActiveJOsClient from './ActiveJOsClient'

export default async function ActiveJOsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const supabase = createSupabaseServerClient()

  const { data: jobOrders } = await supabase
    .from('job_orders')
    .select(`
      *,
      clients(client_name, company_name, contact_number),
      job_order_items(item_id, job_status, computed_line_total, date_time_needed, subcategories(subcategory_name))
    `)
    .not('job_status', 'in', '("Done","Cancelled")')
    .order('date_time_received', { ascending: false })

  return <ActiveJOsClient jobOrders={jobOrders || []} currentUser={user} />
}
