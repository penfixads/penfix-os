import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/user'
import { redirect } from 'next/navigation'
import { getPhilippineDateStr, getPhilippineDayBoundsUTC, type StatusStep } from '@/lib/jo-helpers'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  // Admin-only, same gate as Sales Summary/Reports — GA/Treasury/Fabricator keep their
  // existing landing (Active JOs / Production) rather than seeing company-wide KPIs.
  if (user.role !== 'Admin') redirect('/jos/active')

  const supabase = createSupabaseServerClient()
  const today = getPhilippineDateStr()
  const { startUTC: todayStartUTC, endUTC: todayEndUTC } = getPhilippineDayBoundsUTC(today)
  const monthStartStr = `${today.slice(0, 7)}-01`
  const { startUTC: monthStartUTC } = getPhilippineDayBoundsUTC(monthStartStr)

  const [
    { count: todayJOCount },
    { data: activeJOs },
    { data: monthJOs },
    { data: statusLog },
    { data: recentJOs },
    { data: recentPayments },
  ] = await Promise.all([
    supabase
      .from('job_orders')
      .select('*', { count: 'exact', head: true })
      .gte('date_time_received', todayStartUTC)
      .lte('date_time_received', todayEndUTC),
    // Same "active" definition as /jos/active — excludes Cancelled/Done/Unclaimed.
    supabase
      .from('job_orders')
      .select(`
        job_order_id, date_time_received, grand_total, job_status,
        clients(client_name, company_name),
        job_order_items(item_id, job_status, subcategory_id, subcategories(subcategory_name, job_flow))
      `)
      .neq('job_status', 'Cancelled')
      .neq('job_status', 'Done')
      .neq('job_status', 'Unclaimed')
      .order('date_time_received', { ascending: true }),
    // Month-to-date sales — cancelled JOs don't count as sales.
    supabase
      .from('job_orders')
      .select('grand_total')
      .neq('job_status', 'Cancelled')
      .gte('date_time_received', monthStartUTC),
    supabase
      .from('job_order_item_status_log')
      .select('log_id, job_order_id, status_name, changed_by_name, created_at')
      .order('created_at', { ascending: false })
      .limit(8),
    supabase
      .from('job_orders')
      .select('job_order_id, created_at, clients(client_name, company_name), job_order_items(subcategories(subcategory_name))')
      .order('created_at', { ascending: false })
      .limit(8),
    supabase
      .from('payments')
      .select('payment_id, amount, payment_method, created_at, job_orders(job_order_id, clients(client_name, company_name))')
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  const subcategoryIds = Array.from(
    new Set((activeJOs || []).flatMap(jo => (jo.job_order_items || []).map((i: { subcategory_id: string }) => i.subcategory_id).filter(Boolean)))
  )
  const { data: sopSteps } = subcategoryIds.length > 0
    ? await supabase.from('subcategory_sop').select('*').eq('is_active', true).in('subcategory_id', subcategoryIds).order('sequence')
    : { data: [] }

  const sopBySubcategory: Record<string, StatusStep[]> = {}
  for (const s of sopSteps || []) {
    if (!sopBySubcategory[s.subcategory_id]) sopBySubcategory[s.subcategory_id] = []
    sopBySubcategory[s.subcategory_id].push(s)
  }

  const totalSalesMTD = (monthJOs || []).reduce((sum, jo) => sum + (jo.grand_total || 0), 0)

  return (
    <DashboardClient
      userName={user.name}
      today={today}
      todayJOCount={todayJOCount || 0}
      activeJOs={activeJOs || []}
      sopBySubcategory={sopBySubcategory}
      totalSalesMTD={totalSalesMTD}
      statusLog={statusLog || []}
      recentJOs={recentJOs || []}
      recentPayments={recentPayments || []}
    />
  )
}
