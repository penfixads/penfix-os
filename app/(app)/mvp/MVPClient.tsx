'use client'

import { useMemo } from 'react'
import { formatPeso, getPhilippineDateStr } from '@/lib/jo-helpers'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Props {
  jobOrders: any[]
  payments: any[]
  feedback: any[]
  today: string
}

const MEDALS = ['🥇', '🥈', '🥉']
const RANK_COLORS = ['#f1c40f', '#95a5a6', '#cd7f32']
const LINE_COLORS = ['#C9A84C', '#3498db', '#2ecc71', '#e74c3c', '#9b59b6', '#e67e22', '#1abc9c']

// Deliberately weighted toward volume and follow-through rather than deal size — landing a
// big-ticket client is mostly luck, and over-rewarding it risks a GA coasting once they've
// "made quota" for the day. JO count and actually collecting payment reflect consistent effort.
const SALES_WEIGHT = 0.05
const JO_COUNT_WEIGHT = 0.55
const COLLECTED_WEIGHT = 0.40

// Docks/rewards points for client feedback so chasing volume/speed can't come at the expense
// of quality (below-3-star) — and getting clients to actually leave a good review (4-5 star)
// is itself worth encouraging. Floors at 0 rather than letting the score go negative.
const BAD_REVIEW_MAX_RATING = 3 // ratings below this count as "bad" (i.e. 1-2 stars)
const GOOD_REVIEW_MIN_RATING = 4 // ratings at/above this count as "good" (i.e. 4-5 stars)
const PENALTY_PER_BAD_REVIEW = 5
const BONUS_PER_GOOD_REVIEW = 5

// Same blend used everywhere else on this page — kept as one function so the trend chart
// and the leaderboard can never drift out of sync with each other.
function computeScore(stats: { jos: number; grandTotal: number; collected: number; badReviews?: number; goodReviews?: number }, totals: { jos: number; sales: number; collected: number }): number {
  const salesShare = totals.sales > 0 ? stats.grandTotal / totals.sales : 0
  const jobShare = totals.jos > 0 ? stats.jos / totals.jos : 0
  const collectedShare = totals.collected > 0 ? stats.collected / totals.collected : 0
  const base = (salesShare * SALES_WEIGHT + jobShare * JO_COUNT_WEIGHT + collectedShare * COLLECTED_WEIGHT) * 100
  const adjusted = base - (stats.badReviews || 0) * PENALTY_PER_BAD_REVIEW + (stats.goodReviews || 0) * BONUS_PER_GOOD_REVIEW
  return Math.max(0, adjusted)
}

export default function MVPClient({ jobOrders, payments, feedback, today }: Props) {
  // Leaderboard is always "today" — this is the Daily MVP, the month-to-date trend chart
  // below it is a separate always-visible view, not a toggle.
  const rangeStartStr = today

  const periodJOs = useMemo(
    () => jobOrders.filter(jo => jo.date_time_received && getPhilippineDateStr(new Date(jo.date_time_received)) >= rangeStartStr),
    [jobOrders, rangeStartStr]
  )
  const periodPayments = useMemo(
    () => payments.filter(p => (p.payment_date || '') >= rangeStartStr),
    [payments, rangeStartStr]
  )
  // Feedback in the period, scoped by the underlying JO's date (not when the review was
  // submitted) so a late review still counts against/for the day the job actually happened.
  const periodFeedback = useMemo(
    () => feedback.filter(f => f.job_orders?.date_time_received && getPhilippineDateStr(new Date(f.job_orders.date_time_received)) >= rangeStartStr),
    [feedback, rangeStartStr]
  )

  // Aggregate by GA (received_by / recorded_by)
  const gaStats: Record<string, { jos: number; grandTotal: number; collected: number; badReviews: number; goodReviews: number }> = {}

  for (const jo of periodJOs) {
    const ga = jo.received_by || 'Unknown'
    if (!gaStats[ga]) gaStats[ga] = { jos: 0, grandTotal: 0, collected: 0, badReviews: 0, goodReviews: 0 }
    gaStats[ga].jos += 1
    gaStats[ga].grandTotal += jo.grand_total || 0
  }

  for (const pay of periodPayments) {
    const ga = pay.recorded_by || 'Unknown'
    if (!gaStats[ga]) gaStats[ga] = { jos: 0, grandTotal: 0, collected: 0, badReviews: 0, goodReviews: 0 }
    gaStats[ga].collected += pay.amount || 0
  }

  for (const f of periodFeedback) {
    const ga = f.job_orders?.received_by || 'Unknown'
    if (!gaStats[ga]) gaStats[ga] = { jos: 0, grandTotal: 0, collected: 0, badReviews: 0, goodReviews: 0 }
    if (f.rating < BAD_REVIEW_MAX_RATING) gaStats[ga].badReviews += 1
    else if (f.rating >= GOOD_REVIEW_MIN_RATING) gaStats[ga].goodReviews += 1
  }

  const totalJOs = periodJOs.length
  const totalSales = periodJOs.reduce((s, j) => s + (j.grand_total || 0), 0)
  const totalCollected = periodPayments.reduce((s, p) => s + (p.amount || 0), 0)

  // Score = each GA's share of the team's total for that metric, blended by weight, minus a
  // flat penalty per below-3-star review — so volume/collections can outweigh one GA's lucky
  // big-ticket JO, but chasing speed at the expense of quality still costs points. Out of 100.
  const ranked = Object.entries(gaStats)
    .map(([name, stats]) => ({ name, ...stats, score: computeScore(stats, { jos: totalJOs, sales: totalSales, collected: totalCollected }) }))
    .sort((a, b) => b.score - a.score)

  // Month-to-date score trend — recomputes the same blended score using only data up through
  // each day of the month, so the leaderboard's movement over the month is visible as a race,
  // not just a single end-of-month number.
  const monthlyTrend = useMemo(() => {
    // Build YYYY-MM-DD directly from local calendar fields — going through
    // `new Date(...).toISOString()` shifts local midnight into UTC and silently lands on the
    // wrong day for any timezone ahead of UTC (e.g. PH is UTC+8).
    const toDateStr = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const ref = new Date(today + 'T00:00:00')
    const monthStartStr = toDateStr(ref.getFullYear(), ref.getMonth(), 1)
    const daysSoFar = ref.getDate()

    // Names must come from the whole month's activity, not just today's — otherwise a GA who
    // only worked earlier in the month (but not today) would silently drop off this chart.
    const names = new Set<string>()
    for (const jo of jobOrders) {
      if (!jo.date_time_received) continue
      const d = getPhilippineDateStr(new Date(jo.date_time_received))
      if (d >= monthStartStr && d <= today) names.add(jo.received_by || 'Unknown')
    }
    for (const pay of payments) {
      if ((pay.payment_date || '') >= monthStartStr && (pay.payment_date || '') <= today) names.add(pay.recorded_by || 'Unknown')
    }

    const points = []
    for (let day = 1; day <= daysSoFar; day++) {
      const cutoffStr = toDateStr(ref.getFullYear(), ref.getMonth(), day)
      const dayJOs = jobOrders.filter(jo => {
        if (!jo.date_time_received) return false
        const d = getPhilippineDateStr(new Date(jo.date_time_received))
        return d >= monthStartStr && d <= cutoffStr
      })
      const dayPayments = payments.filter(p => (p.payment_date || '') >= monthStartStr && (p.payment_date || '') <= cutoffStr)
      const dayFeedback = feedback.filter(f => {
        if (!f.job_orders?.date_time_received) return false
        const d = getPhilippineDateStr(new Date(f.job_orders.date_time_received))
        return d >= monthStartStr && d <= cutoffStr
      })

      const dayStats: Record<string, { jos: number; grandTotal: number; collected: number; badReviews: number; goodReviews: number }> = {}
      for (const jo of dayJOs) {
        const ga = jo.received_by || 'Unknown'
        if (!dayStats[ga]) dayStats[ga] = { jos: 0, grandTotal: 0, collected: 0, badReviews: 0, goodReviews: 0 }
        dayStats[ga].jos += 1
        dayStats[ga].grandTotal += jo.grand_total || 0
      }
      for (const pay of dayPayments) {
        const ga = pay.recorded_by || 'Unknown'
        if (!dayStats[ga]) dayStats[ga] = { jos: 0, grandTotal: 0, collected: 0, badReviews: 0, goodReviews: 0 }
        dayStats[ga].collected += pay.amount || 0
      }
      for (const f of dayFeedback) {
        const ga = f.job_orders?.received_by || 'Unknown'
        if (!dayStats[ga]) dayStats[ga] = { jos: 0, grandTotal: 0, collected: 0, badReviews: 0, goodReviews: 0 }
        if (f.rating < BAD_REVIEW_MAX_RATING) dayStats[ga].badReviews += 1
        else if (f.rating >= GOOD_REVIEW_MIN_RATING) dayStats[ga].goodReviews += 1
      }
      const dayTotals = {
        jos: dayJOs.length,
        sales: dayJOs.reduce((s, j) => s + (j.grand_total || 0), 0),
        collected: dayPayments.reduce((s, p) => s + (p.amount || 0), 0),
      }

      const point: Record<string, number | string> = { day }
      for (const name of names) {
        point[name] = Math.round(computeScore(dayStats[name] || { jos: 0, grandTotal: 0, collected: 0, badReviews: 0, goodReviews: 0 }, dayTotals) * 10) / 10
      }
      points.push(point)
    }
    return { points, names: Array.from(names) }
  }, [today, jobOrders, payments, feedback])

  const periodLabel = new Date(today + 'T00:00:00').toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const emptyMessage = 'No activity recorded yet today.'

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ color: '#7A1828', fontSize: '1.4rem', fontWeight: 700 }}>Daily MVP</h1>
        <p style={{ color: '#777', fontSize: '0.8rem', marginTop: 2 }}>{periodLabel}</p>
      </div>

      {/* Period totals */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: '1.5rem' }}>
        {[
          { label: 'Total JOs', value: totalJOs },
          { label: 'Total Sales', value: formatPeso(totalSales) },
          { label: 'Total Collected', value: formatPeso(totalCollected) },
        ].map(c => (
          <div key={c.label} style={{ background: '#FDF5EC', borderRadius: 10, padding: '0.75rem 1rem', border: '1px solid #EDE0CC', textAlign: 'center' }}>
            <div style={{ color: '#999', fontSize: '0.68rem', marginBottom: 4 }}>{c.label}</div>
            <div style={{ color: '#1a1a1a', fontWeight: 700, fontSize: '0.95rem' }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Leaderboard */}
      {ranked.length === 0 ? (
        <div style={{ color: '#aaa', textAlign: 'center', marginTop: '3rem', fontSize: '0.9rem' }}>{emptyMessage}</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {ranked.map((ga, i) => {
            const isTop = i === 0
            return (
              <div key={ga.name} style={{
                background: isTop ? '#5C001F' : '#3a3a3a',
                borderRadius: 12,
                padding: '1rem 1.25rem',
                border: `1px solid ${isTop ? '#7A1828' : '#2a2a2a'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}>
                {/* Rank */}
                <div style={{ fontSize: i < 3 ? '1.6rem' : '1rem', minWidth: 36, textAlign: 'center', color: RANK_COLORS[i] || '#555' }}>
                  {i < 3 ? MEDALS[i] : `#${i + 1}`}
                </div>

                {/* Name + stats */}
                <div style={{ flex: 1 }}>
                  <div style={{ color: isTop ? '#fff' : '#ddd', fontWeight: 700, fontSize: isTop ? '1rem' : '0.9rem' }}>{ga.name}</div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 6, flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#999', fontSize: '0.65rem' }}>JOs</div>
                      <div style={{ color: '#f1c40f', fontWeight: 700, fontSize: '0.88rem' }}>{ga.jos}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#999', fontSize: '0.65rem' }}>Sales</div>
                      <div style={{ color: '#2ecc71', fontWeight: 700, fontSize: '0.88rem' }}>{formatPeso(ga.grandTotal)}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#999', fontSize: '0.65rem' }}>Collected</div>
                      <div style={{ color: '#3498db', fontWeight: 700, fontSize: '0.88rem' }}>{formatPeso(ga.collected)}</div>
                    </div>
                    {ga.goodReviews > 0 && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#999', fontSize: '0.65rem' }}>Good Reviews</div>
                        <div style={{ color: '#2ecc71', fontWeight: 700, fontSize: '0.88rem' }}>{ga.goodReviews} (+{ga.goodReviews * BONUS_PER_GOOD_REVIEW})</div>
                      </div>
                    )}
                    {ga.badReviews > 0 && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#999', fontSize: '0.65rem' }}>Bad Reviews</div>
                        <div style={{ color: '#e74c3c', fontWeight: 700, fontSize: '0.88rem' }}>{ga.badReviews} (-{ga.badReviews * PENALTY_PER_BAD_REVIEW})</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Score bar */}
                <div style={{ minWidth: 80, textAlign: 'right' }}>
                  <div style={{ color: isTop ? '#f1c40f' : '#555', fontSize: '0.68rem', marginBottom: 4 }}>SCORE</div>
                  <div style={{ color: isTop ? '#f1c40f' : '#aaa', fontWeight: 700, fontSize: '0.95rem' }}>{ga.score.toFixed(1)}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Month-to-date race chart */}
      {monthlyTrend.points.length > 1 && (
        <div style={{ background: '#FDF5EC', borderRadius: 12, padding: '1rem', border: '1px solid #EDE0CC', marginTop: '1.5rem' }}>
          <div style={{ color: '#999', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.75rem' }}>Score Trend This Month — who's pulling ahead</div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthlyTrend.points} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="day" tick={{ fill: '#666', fontSize: 10 }} label={{ value: 'Day of month', position: 'insideBottom', offset: -2, fill: '#999', fontSize: 10 }} />
              <YAxis tick={{ fill: '#666', fontSize: 10 }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ background: '#FDF5EC', border: '1px solid #d0d0d0', borderRadius: 8, fontSize: '0.78rem' }}
                labelStyle={{ color: '#1a1a1a', fontWeight: 700 }}
                labelFormatter={(day) => `Day ${day}`}
              />
              <Legend wrapperStyle={{ fontSize: '0.75rem', color: '#666' }} />
              {monthlyTrend.names.map((name, i) => (
                <Line key={name} type="monotone" dataKey={name} stroke={LINE_COLORS[i % LINE_COLORS.length]} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
