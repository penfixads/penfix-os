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
        job_order_items(item_id, job_status, computed_line_total, date_time_needed, item_preview_thumb, subcategories(subcategory_name))
      `)
      .neq('job_status', 'Cancelled')
      .neq('job_status', 'Done')
      .neq('job_status', 'Unclaimed')
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

  // Lifetime total of every service the client has actually completed AND paid (all their
  // Done job orders, not just this active one), so staff can eyeball whether Earned Rewards
  // looks right at a glance. Filtered at the query level to the exact same "Done + fully paid"
  // gate as lib/jo-helpers.ts isLifetimeEligible (used by the Clients page's own Lifetime
  // Total) -- kept as .eq() calls here rather than fetching-then-filtering with that helper
  // since this is a separate query already scoped to just the client_ids on this page, but the
  // definition must stay identical between the two screens or "lifetime total" means something
  // different depending which page you're looking at. A JO still in progress (like the one
  // this card is showing) hasn't been paid off or earned any reward yet, so counting it here
  // would inflate the total against a rewards_balance that hasn't caught up. This still doesn't
  // filter out billing JOs or ones received before the loyalty program's May 1 start date
  // (see REWARDS_START_DATE in lib/jo-completion.ts), both of which also don't earn rewards --
  // so it's a close sanity anchor, not an exact recomputation of the reward-eligible amount.
  const activeClientIds = Array.from(new Set((jobOrders || []).map(jo => jo.client_id).filter(Boolean)))
  const { data: lifetimeJOs } = activeClientIds.length > 0
    ? await supabase.from('job_orders').select('client_id, grand_total').in('client_id', activeClientIds).eq('job_status', 'Done').eq('is_fully_paid', true)
    : { data: [] as any[] }

  const lifetimeTotalMap: Record<string, number> = {}
  for (const row of lifetimeJOs || []) {
    lifetimeTotalMap[row.client_id] = (lifetimeTotalMap[row.client_id] || 0) + (row.grand_total || 0)
  }

  const jobOrdersWithRewards = (jobOrders || []).map(jo => ({
    ...jo,
    rewards_balance: Math.max(0, rewardsMap[jo.client_id] || 0),
    client_lifetime_total: lifetimeTotalMap[jo.client_id] || 0,
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
