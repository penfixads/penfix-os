import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/user'
import { redirect } from 'next/navigation'
import { getPhilippineDateStr, getPhilippineDayBoundsUTC } from '@/lib/jo-helpers'
import SalesSummaryClient from './SalesSummaryClient'

export default async function DailySalesSummaryPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (user.role !== 'Admin' && user.role !== 'Treasury') redirect('/jos/active')

  const supabase = createSupabaseServerClient()
  const today = getPhilippineDateStr()
  const { startUTC, endUTC } = getPhilippineDayBoundsUTC(today)

  const [{ data: payments }, { data: expenses }, { data: jobOrders }, { data: summary }, { data: previousSummary }, { data: recentSummaries }] = await Promise.all([
    // Today's payments
    supabase
      .from('payments')
      .select(`*, job_orders(client_id, clients(client_name, company_name))`)
      .eq('payment_date', today)
      .order('created_at', { ascending: false }),
    // Today's expenses
    supabase.from('expenses').select('*').eq('expense_date', today).order('created_at', { ascending: false }),
    // Today's JOs (Philippine-Time bounds) — grand_total needed to compute total_sales,
    // the rest (client, items, status) is for the "Job Orders Received Today" detail table
    supabase
      .from('job_orders')
      .select(`
        job_order_id, grand_total, balance_due, date_time_received, received_by, payment_status,
        clients(client_name, company_name),
        job_order_items(item_id, quantity, subcategories(subcategory_name))
      `)
      .gte('date_time_received', startUTC)
      .lte('date_time_received', endUTC)
      .order('date_time_received', { ascending: false }),
    // Today's summary record, if already saved
    supabase.from('daily_sales_summary').select('*').eq('date', today).maybeSingle(),
    // Most recent prior summary — source of carry-forward initial_fund (not necessarily
    // "yesterday": Sundays/holidays are skipped irregularly, so we chain off whatever the last
    // real entry was)
    supabase.from('daily_sales_summary').select('*').lt('date', today).order('date', { ascending: false }).limit(1).maybeSingle(),
    // Recent history for the collapsible list
    supabase.from('daily_sales_summary').select('*').lte('date', today).order('date', { ascending: false }).limit(30),
  ])

  return (
    <SalesSummaryClient
      payments={payments || []}
      expenses={expenses || []}
      jobOrders={jobOrders || []}
      summary={summary}
      previousSummary={previousSummary}
      recentSummaries={recentSummaries || []}
      today={today}
      currentUser={user}
    />
  )
}
