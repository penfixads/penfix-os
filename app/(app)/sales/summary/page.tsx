import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/user'
import { redirect } from 'next/navigation'
import SalesSummaryClient from './SalesSummaryClient'

export default async function DailySalesSummaryPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const supabase = createSupabaseServerClient()
  const today = new Date().toISOString().split('T')[0]

  // Today's payments
  const { data: payments } = await supabase
    .from('payments')
    .select(`*, job_orders(client_id, clients(client_name, company_name))`)
    .eq('payment_date', today)
    .order('created_at', { ascending: false })

  // Today's expenses
  const { data: expenses } = await supabase
    .from('expenses')
    .select('*')
    .eq('expense_date', today)
    .order('created_at', { ascending: false })

  // Today's summary record
  const { data: summary } = await supabase
    .from('daily_sales_summary')
    .select('*')
    .eq('summary_date', today)
    .maybeSingle()

  // Today's JOs count
  const { count: joCount } = await supabase
    .from('job_orders')
    .select('*', { count: 'exact', head: true })
    .gte('date_time_received', `${today}T00:00:00`)
    .lte('date_time_received', `${today}T23:59:59`)

  return (
    <SalesSummaryClient
      payments={payments || []}
      expenses={expenses || []}
      summary={summary}
      joCount={joCount || 0}
      today={today}
      currentUser={user}
    />
  )
}
