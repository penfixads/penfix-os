import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/user'
import { redirect } from 'next/navigation'
import { getPhilippineDateStr } from '@/lib/jo-helpers'
import SalesReportsClient from './SalesReportsClient'

export default async function SalesReportsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (user.role !== 'Admin' && user.role !== 'Treasury') redirect('/jos/active')

  const supabase = createSupabaseServerClient()

  // Pull last 365 days of payments and JOs
  const today = getPhilippineDateStr()
  const yearAgo = new Date(`${today}T00:00:00+08:00`)
  yearAgo.setUTCFullYear(yearAgo.getUTCFullYear() - 1)
  const since = getPhilippineDateStr(yearAgo)

  const [{ data: payments }, { data: jobOrders }, { data: expenses }] = await Promise.all([
    supabase
      .from('payments')
      .select('payment_date, amount, payment_method')
      .gte('payment_date', since)
      .order('payment_date'),
    supabase
      .from('job_orders')
      .select('date_time_received, grand_total, received_by, payment_status')
      .gte('date_time_received', `${since}T00:00:00`)
      .order('date_time_received'),
    supabase
      .from('expenses')
      .select('expense_date, date, amount')
      .gte('expense_date', since)
      .order('expense_date'),
  ])

  return (
    <SalesReportsClient
      payments={payments || []}
      jobOrders={jobOrders || []}
      expenses={expenses || []}
    />
  )
}
