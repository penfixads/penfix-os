export const dynamic = 'force-dynamic'

import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/user'
import { redirect } from 'next/navigation'
import ActiveJOsClient from './ActiveJOsClient'

export default async function ActiveJOsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const supabase = createSupabaseServerClient()

  const [{ data: jobOrders }, { data: categories }, { data: subcategories }] = await Promise.all([
    supabase
      .from('job_orders')
      .select(`
        *,
        clients(client_name, company_name, contact_number),
        job_order_items(item_id, job_status, computed_line_total, date_time_needed, subcategories(subcategory_name))
      `)
      .not('job_status', 'in', '("Done","Cancelled")')
      .order('date_time_received', { ascending: false }),
    supabase.from('categories').select('*').eq('is_active', true).order('category_name'),
    supabase.from('subcategories').select('*').eq('is_active', true).order('subcategory_name'),
  ])

  return (
    <ActiveJOsClient
      jobOrders={jobOrders || []}
      categories={categories || []}
      subcategories={subcategories || []}
      currentUser={user}
    />
  )
}
