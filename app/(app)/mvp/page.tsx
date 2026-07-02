import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/user'
import { redirect } from 'next/navigation'
import MVPClient from './MVPClient'

export default async function MVPPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const supabase = createSupabaseServerClient()
  const today = new Date().toISOString().split('T')[0]

  const [{ data: jobOrders }, { data: payments }] = await Promise.all([
    // JOs received today grouped by received_by
    supabase
      .from('job_orders')
      .select('job_order_id, received_by, grand_total, total_amount_paid, payment_status')
      .gte('date_time_received', `${today}T00:00:00`)
      .lte('date_time_received', `${today}T23:59:59`),
    // Payments collected today grouped by recorded_by
    supabase.from('payments').select('payment_id, recorded_by, amount').eq('payment_date', today),
  ])

  return <MVPClient jobOrders={jobOrders || []} payments={payments || []} today={today} />
}
