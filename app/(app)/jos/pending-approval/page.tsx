import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/user'
import { redirect } from 'next/navigation'
import PendingApprovalClient from './PendingApprovalClient'

export default async function PendingApprovalPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const supabase = createSupabaseServerClient()

  const [{ data: jobOrders }, { data: creditRequests }, { data: unlockRequests }] = await Promise.all([
    supabase
      .from('job_orders')
      .select(`*, clients(client_name, company_name, contact_number), job_order_items(item_id, computed_line_total)`)
      .eq('override_status', 'Pending')
      .order('date_time_received', { ascending: true }),
    supabase
      .from('clients')
      .select('client_id, client_name, company_name, contact_number, credit_line_requested_by')
      .eq('credit_line_request_status', 'Pending')
      .order('client_name'),
    supabase
      .from('historical_unlock_requests')
      .select('*')
      .eq('status', 'Pending')
      .order('created_at', { ascending: true }),
  ])

  return <PendingApprovalClient jobOrders={jobOrders || []} creditRequests={creditRequests || []} unlockRequests={unlockRequests || []} currentUser={user} />
}
