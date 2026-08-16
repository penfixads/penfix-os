import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/user'
import { redirect } from 'next/navigation'
import { getPhilippineDateStr, getPhilippineDayBoundsUTC, isLifetimeEligible } from '@/lib/jo-helpers'
import TodayJOsClient from './TodayJOsClient'

export default async function TodayJOsPage({ searchParams }: { searchParams: { client?: string } }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const supabase = createSupabaseServerClient()
  const today = getPhilippineDateStr()
  const { startUTC, endUTC } = getPhilippineDayBoundsUTC(today)

  const [{ data: jobOrders }, { data: clients }, { data: categories }, { data: subcategories }, { data: ledger }] = await Promise.all([
    supabase
      .from('job_orders')
      .select(`*, clients(client_name, company_name), job_order_items(item_id, job_status, computed_line_total, item_preview_thumb)`)
      .gte('date_time_received', startUTC)
      .lte('date_time_received', endUTC)
      .order('date_time_received', { ascending: false }),
    supabase
      .from('clients')
      .select('client_id, client_name, company_name, client_type, credit_line_status, earned_rewards, claimed_rewards, contact_number, email')
      .order('client_name'),
    supabase.from('categories').select('*').eq('is_active', true).order('category_name'),
    supabase.from('subcategories').select('*').eq('active', true).order('subcategory_name'),
    // Compute rewards balance from ledger for each client
    supabase.from('rewards_ledger').select('client_id, type, amount'),
  ])

  const rewardsMap: Record<string, number> = {}
  for (const row of ledger || []) {
    if (!rewardsMap[row.client_id]) rewardsMap[row.client_id] = 0
    rewardsMap[row.client_id] += row.type === 'earned' ? row.amount : -row.amount
  }

  // Lifetime total (Done + fully paid + on/after the May 1 rewards start date) per client, same
  // rule as Active JOs and the Clients page -- see isLifetimeEligible in lib/jo-helpers.ts for why.
  const todayClientIds = Array.from(new Set((jobOrders || []).map(jo => jo.client_id).filter(Boolean)))
  const { data: lifetimeJOs } = todayClientIds.length > 0
    ? await supabase.from('job_orders').select('client_id, grand_total, job_status, is_fully_paid, date_time_received').in('client_id', todayClientIds)
    : { data: [] as any[] }

  const lifetimeTotalMap: Record<string, number> = {}
  for (const row of (lifetimeJOs || []).filter(isLifetimeEligible)) {
    lifetimeTotalMap[row.client_id] = (lifetimeTotalMap[row.client_id] || 0) + (row.grand_total || 0)
  }

  const jobOrdersWithRewards = (jobOrders || []).map(jo => ({
    ...jo,
    rewards_balance: Math.max(0, rewardsMap[jo.client_id] || 0),
    client_lifetime_total: lifetimeTotalMap[jo.client_id] || 0,
  }))

  return (
    <TodayJOsClient
      jobOrders={jobOrdersWithRewards}
      clients={clients || []}
      categories={categories || []}
      subcategories={subcategories || []}
      currentUser={user}
      initialClientId={searchParams.client}
    />
  )
}
