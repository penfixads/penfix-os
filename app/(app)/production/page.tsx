import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/user'
import { redirect } from 'next/navigation'
import ProductionClient from './ProductionClient'

export default async function ProductionPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (user.role !== 'Production' && user.role !== 'Admin') redirect('/jos/active')

  const supabase = createSupabaseServerClient()

  const { data: items } = await supabase
    .from('job_order_items')
    .select(`
      *,
      job_orders(
        job_order_id, payment_status, override_status, client_id, is_for_billing,
        clients(client_name, company_name)
      ),
      subcategories(subcategory_name, process_type_id)
    `)
    .not('job_status', 'in', '("Done","Cancelled")')
    .order('date_time_needed', { ascending: true, nullsFirst: false })

  const { data: sopSteps } = await supabase
    .from('process_type_sop')
    .select('*')
    .eq('is_active', true)
    .order('sequence')

  return (
    <ProductionClient
      items={items || []}
      sopSteps={sopSteps || []}
      currentUser={user}
    />
  )
}
