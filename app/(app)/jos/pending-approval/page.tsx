import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/user'
import { redirect } from 'next/navigation'
import PendingApprovalClient from './PendingApprovalClient'

export default async function PendingApprovalPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const supabase = createSupabaseServerClient()

  const { data: jobOrders } = await supabase
    .from('job_orders')
    .select(`*, clients(client_name, company_name, contact_number), job_order_items(item_id, computed_line_total)`)
    .eq('override_status', 'Pending')
    .order('date_time_received', { ascending: true })

  return <PendingApprovalClient jobOrders={jobOrders || []} currentUser={user} />
}
