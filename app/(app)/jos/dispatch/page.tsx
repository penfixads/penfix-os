import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/user'
import { redirect } from 'next/navigation'
import DispatchClient from './DispatchClient'

export default async function DispatchPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const supabase = createSupabaseServerClient()

  // Terminal statuses that mean the item is done with production
  const terminalStatuses = [
    'Approved','Ready for Pickup','Ready for Installation','Installed',
    'Delivered','Done','Paid','Released',
  ]

  const { data: items } = await supabase
    .from('job_order_items')
    .select(`
      *,
      job_orders(
        job_order_id, payment_status, balance_due, grand_total,
        clients(client_name, company_name, contact_number)
      ),
      subcategories(subcategory_name, process_type_id)
    `)
    .in('job_status', terminalStatuses)
    .order('date_time_done', { ascending: false })

  return <DispatchClient items={items || []} currentUser={user} />
}
