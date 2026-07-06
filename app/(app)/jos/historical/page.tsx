import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/user'
import { redirect } from 'next/navigation'
import HistoricalRecordsClient from './HistoricalRecordsClient'

export default async function AddHistoricalRecordsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const supabase = createSupabaseServerClient()

  const [{ data: clients }, { data: categories }, { data: subcategories }, { data: backdatedJOs }] = await Promise.all([
    supabase
      .from('clients')
      .select('client_id, client_name, company_name, client_type, credit_line_status, earned_rewards, claimed_rewards, contact_number, email')
      .order('client_name'),
    supabase.from('categories').select('*').eq('is_active', true).order('category_name'),
    supabase.from('subcategories').select('*').eq('active', true).order('subcategory_name'),
    // Audit trail — every JO ever backdated through this page, newest first
    supabase
      .from('job_orders')
      .select(`job_order_id, date_time_received, received_by, date_override_authorized_by, grand_total, payment_status, created_at, clients(client_name, company_name)`)
      .not('date_override_authorized_by', 'is', null)
      .order('created_at', { ascending: false })
      .limit(100),
  ])

  return (
    <HistoricalRecordsClient
      clients={clients || []}
      categories={categories || []}
      subcategories={subcategories || []}
      backdatedJOs={backdatedJOs || []}
      currentUser={user}
    />
  )
}
