import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/user'
import { redirect } from 'next/navigation'
import ClientsPageClient from './ClientsClient'

export default async function ClientsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const supabase = createSupabaseServerClient()

  const { data: clients } = await supabase
    .from('clients')
    .select('*, job_orders(job_order_id, grand_total, payment_status)')
    .order('client_name')

  // Compute rewards balance from ledger for each client
  const { data: ledger } = await supabase
    .from('rewards_ledger')
    .select('client_id, type, amount')

  const rewardsMap: Record<string, number> = {}
  for (const row of ledger || []) {
    if (!rewardsMap[row.client_id]) rewardsMap[row.client_id] = 0
    rewardsMap[row.client_id] += row.type === 'earned' ? row.amount : -row.amount
  }

  const clientsWithRewards = (clients || []).map(c => ({
    ...c,
    rewards_balance: Math.max(0, rewardsMap[c.client_id] || 0),
  }))

  return <ClientsPageClient clients={clientsWithRewards} currentUser={user} />
}
