export const dynamic = 'force-dynamic'

import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/user'
import { redirect } from 'next/navigation'
import ActiveJOsClient from './ActiveJOsClient'

export default async function ActiveJOsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const supabase = createSupabaseServerClient()

  const [{ data: jobOrders, error: jobOrdersError }, { data: categories }, { data: subcategories }, { data: ledger }] = await Promise.all([
    supabase
      .from('job_orders')
      .select(`
        *,
        clients(client_name, company_name, contact_number),
        job_order_items(item_id, job_status, computed_line_total, date_time_needed, subcategories(subcategory_name))
      `)
      // Stay visible here past "Done" until feedback has actually been requested for it
      .neq('job_status', 'Cancelled')
      .or('job_status.neq.Done,feedback_requested_at.is.null')
      .order('date_time_received', { ascending: false }),
    supabase.from('categories').select('*').eq('is_active', true).order('category_name'),
    supabase.from('subcategories').select('*').eq('is_active', true).order('subcategory_name'),
    // Compute rewards balance from ledger for each client
    supabase.from('rewards_ledger').select('client_id, type, amount'),
  ])

  if (jobOrdersError) console.error('Active JOs query failed:', jobOrdersError.message)

  const rewardsMap: Record<string, number> = {}
  for (const row of ledger || []) {
    if (!rewardsMap[row.client_id]) rewardsMap[row.client_id] = 0
    rewardsMap[row.client_id] += row.type === 'earned' ? row.amount : -row.amount
  }

  const jobOrdersWithRewards = (jobOrders || []).map(jo => ({
    ...jo,
    rewards_balance: Math.max(0, rewardsMap[jo.client_id] || 0),
  }))

  return (
    <ActiveJOsClient
      jobOrders={jobOrdersWithRewards}
      categories={categories || []}
      subcategories={subcategories || []}
      currentUser={user}
    />
  )
}
