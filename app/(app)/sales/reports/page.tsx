import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/user'
import { redirect } from 'next/navigation'
import { getPhilippineDateStr } from '@/lib/jo-helpers'
import SalesReportsClient from './SalesReportsClient'

// Financial report — every row matters. PostgREST silently truncates any response at its own
// server-side default (1000 rows) no matter what .limit() is requested, so job_orders (1200+)
// and payments (1000+) were quietly losing everything after ~May and ~June respectively —
// recent months showed their full expenses with almost none of their real sales/collections,
// which is what was making the report look like a loss. Paging through every table here so
// that can never happen again as the row counts keep growing.
async function fetchAllRows(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  table: string,
  selectExpr: string,
  filterCol: string,
  since: string,
  orderCol: string,
) {
  const pageSize = 1000
  let all: any[] = []
  let from = 0
  while (true) {
    const { data } = await supabase
      .from(table)
      .select(selectExpr)
      .gte(filterCol, since)
      .order(orderCol)
      .range(from, from + pageSize - 1)
    all = all.concat(data || [])
    if (!data || data.length < pageSize) break
    from += pageSize
  }
  return all
}

export default async function SalesReportsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  // Admin-only — this page now pulls Overhead Expenses (includes salary data).
  if (user.role !== 'Admin') redirect('/jos/active')

  const supabase = createSupabaseServerClient()

  // Pull last 365 days of payments and JOs
  const today = getPhilippineDateStr()
  const yearAgo = new Date(`${today}T00:00:00+08:00`)
  yearAgo.setUTCFullYear(yearAgo.getUTCFullYear() - 1)
  const since = getPhilippineDateStr(yearAgo)

  const [payments, jobOrders, expenses, purchases, supplierDeliveries, overheadExpenses] = await Promise.all([
    fetchAllRows(supabase, 'payments', 'payment_date, amount, payment_method', 'payment_date', since, 'payment_date'),
    fetchAllRows(supabase, 'job_orders', 'date_time_received, grand_total, received_by, payment_status', 'date_time_received', `${since}T00:00:00`, 'date_time_received'),
    fetchAllRows(supabase, 'expenses', 'expense_date, date, amount, expense_name', 'expense_date', since, 'expense_date'),
    fetchAllRows(supabase, 'purchases', 'purchase_date, total_amount, supplier_name', 'purchase_date', since, 'purchase_date'),
    // Billed via next month's cheque, so the cash outflow lands in billing_month, not delivery_date.
    fetchAllRows(supabase, 'supplier_deliveries', 'billing_month, total_amount, supplier_name', 'billing_month', since, 'billing_month'),
    fetchAllRows(supabase, 'overhead_expenses', 'month, amount, expense_name', 'month', since, 'month'),
  ])

  return (
    <SalesReportsClient
      payments={payments}
      jobOrders={jobOrders}
      expenses={expenses}
      purchases={purchases}
      supplierDeliveries={supplierDeliveries}
      overheadExpenses={overheadExpenses}
    />
  )
}
