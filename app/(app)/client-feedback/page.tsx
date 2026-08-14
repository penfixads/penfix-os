export const dynamic = 'force-dynamic'

import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/user'
import { redirect } from 'next/navigation'
import ClientFeedbackClient from './ClientFeedbackClient'
import { periodBoundsUTC, currentPeriodKey, periodKeyOf, isValidKey, type Period } from './period'

// How far back the period picker and the trend strip reach.
const TREND_DAYS = 730

export default async function ClientFeedbackPage({
  searchParams,
}: {
  searchParams: { period?: string; key?: string }
}) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  // The sidebar hides this entry for other roles, but that's presentation only — without this
  // check any signed-in user could read every client's feedback by typing the URL.
  if (!['Admin', 'GA', 'Treasury'].includes(user.role)) redirect('/jos/active')

  const period: Period = searchParams.period === 'week' ? 'week' : 'month'
  const key = isValidKey(searchParams.key || '', period) ? searchParams.key! : currentPeriodKey(period)

  const supabase = createSupabaseServerClient()
  const { startUTC, endUTC } = periodBoundsUTC(key, period)
  const trendStart = new Date(Date.now() - TREND_DAYS * 24 * 60 * 60 * 1000).toISOString()

  const [{ data: periodFeedback, count: periodCount }, { data: trendRows }, { data: respondedAll }, { data: sentThisPeriod }] =
    await Promise.all([
      // The only query pulling the heavy columns (comments, the two text[] arrays), and it's
      // capped to a single week or month — so this page costs the same in year five as today.
      supabase
        .from('client_feedback')
        .select('id, jo, client_name, service, rating, best_areas, improve_areas, comments, recommend, created_at, job_orders(received_by)', { count: 'exact' })
        .gte('created_at', startUTC)
        .lt('created_at', endUTC)
        .order('created_at', { ascending: false }),
      // Two narrow columns only — cheap to scan even at tens of thousands of rows, and enough
      // to build the period picker and the trend strip.
      supabase
        .from('client_feedback')
        .select('created_at, rating')
        .gte('created_at', trendStart)
        .order('created_at', { ascending: false }),
      // Every JO that has ever replied, ids only — so a link sent late in a period still counts
      // as answered when the client responds in the next one.
      supabase.from('client_feedback').select('jo').not('jo', 'is', null),
      supabase
        .from('job_orders')
        .select('job_order_id, received_by')
        .eq('job_status', 'Done')
        .gte('feedback_requested_at', startUTC)
        .lt('feedback_requested_at', endUTC),
    ])

  const respondedIds = Array.from(new Set((respondedAll || []).map(r => r.jo).filter(Boolean))) as string[]

  // Periods that actually have data, newest first, so the picker never offers an empty one.
  const keysWithData = Array.from(new Set((trendRows || []).map(r => periodKeyOf(r.created_at, period)))).sort().reverse()

  const trend = keysWithData.map(k => {
    const rows = (trendRows || []).filter(r => periodKeyOf(r.created_at, period) === k)
    const total = rows.reduce((s, r) => s + (r.rating || 0), 0)
    return { key: k, count: rows.length, avg: rows.length > 0 ? total / rows.length : 0 }
  })

  return (
    <ClientFeedbackClient
      period={period}
      periodKey={key}
      keyOptions={Array.from(new Set([currentPeriodKey(period), ...keysWithData])).sort().reverse()}
      feedback={periodFeedback || []}
      periodCount={periodCount || 0}
      sentThisPeriod={sentThisPeriod || []}
      respondedIds={respondedIds}
      trend={trend}
    />
  )
}
