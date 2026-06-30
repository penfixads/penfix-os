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

  return <ClientsPageClient clients={clients || []} currentUser={user} />
}
