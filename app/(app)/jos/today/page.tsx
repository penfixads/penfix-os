import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/user'
import { redirect } from 'next/navigation'
import TodayJOsClient from './TodayJOsClient'

export default async function TodayJOsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const supabase = createSupabaseServerClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: jobOrders } = await supabase
    .from('job_orders')
    .select(`*, clients(client_name, company_name), job_order_items(item_id, job_status, computed_line_total)`)
    .gte('date_time_received', `${today}T00:00:00`)
    .lte('date_time_received', `${today}T23:59:59`)
    .order('date_time_received', { ascending: false })

  const { data: clients } = await supabase
    .from('clients')
    .select('client_id, client_name, company_name, client_type, credit_line_status, earned_rewards, claimed_rewards, contact_number')
    .order('client_name')

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('category_name')

  const { data: subcategories } = await supabase
    .from('subcategories')
    .select('*')
    .eq('active', true)
    .order('subcategory_name')

  return (
    <TodayJOsClient
      jobOrders={jobOrders || []}
      clients={clients || []}
      categories={categories || []}
      subcategories={subcategories || []}
      currentUser={user}
    />
  )
}
