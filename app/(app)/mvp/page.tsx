import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/user'
import { redirect } from 'next/navigation'
import { getPhilippineDateStr } from '@/lib/jo-helpers'
import MVPClient from './MVPClient'

export default async function MVPPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const supabase = createSupabaseServerClient()
  const today = getPhilippineDateStr()

  // Pull a 60-day window so the client can slice Today / This Week / This Month locally
  // without another round-trip — plenty of runway for a week or month view either way.
  const since = new Date(`${today}T00:00:00+08:00`)
  since.setUTCDate(since.getUTCDate() - 60)
  const sinceStr = getPhilippineDateStr(since)

  const [{ data: jobOrders }, { data: payments }, { data: feedback }] = await Promise.all([
    // JOs received in the window, grouped by received_by
    supabase
      .from('job_orders')
      .select('job_order_id, received_by, grand_total, total_amount_paid, payment_status, date_time_received')
      .gte('date_time_received', `${sinceStr}T00:00:00`),
    // Payments collected in the window, grouped by recorded_by
    supabase.from('payments').select('payment_id, recorded_by, amount, payment_date').gte('payment_date', sinceStr),
    // All feedback in the window, attributed to whoever received the JO — below-3-star reviews
    // dock MVP points, 4-5 star reviews add points, so speed/volume can't be chased at the
    // expense of quality. Filtered by the underlying JO's date so a late-arriving review still
    // counts against/for the day the job actually happened, not the day it was submitted.
    supabase
      .from('client_feedback')
      .select('id, rating, jo, job_orders!inner(received_by, date_time_received)')
      .gte('job_orders.date_time_received', `${sinceStr}T00:00:00`),
  ])

  return <MVPClient jobOrders={jobOrders || []} payments={payments || []} feedback={feedback || []} today={today} />
}
