'use client'

import { useRouter } from 'next/navigation'
import { IconStar } from '@/components/icons'
import { periodLabel, periodShortLabel, type Period, type PeriodKey } from './period'

interface TrendPoint { key: PeriodKey; count: number; avg: number }

interface Props {
  period: Period
  periodKey: PeriodKey
  keyOptions: PeriodKey[]
  feedback: any[]
  periodCount: number
  // Done JOs whose feedback link was sent during the selected period — the denominator for
  // that period's reply rate.
  sentThisPeriod: any[]
  // Every JO that has ever replied, so a link sent late in the period still counts as answered
  // when the client responds in the next one.
  respondedIds: string[]
  trend: TrendPoint[]
  // Current User Management roster — used only to keep the GA leaderboard below from surfacing
  // someone whose account has since been removed (received_by is stamped from currentUser.name
  // at JO-creation time, so it can outlive the account). Doesn't touch the review feed, overall
  // average, or area tallies elsewhere on this page — those stay attributed to whoever actually
  // received the JO regardless of their account status.
  knownStaffNames: string[]
}

const MEDALS = ['🥇', '🥈', '🥉']
const RANK_COLORS = ['#f1c40f', '#95a5a6', '#cd7f32']

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <IconStar key={n} width={size} height={size} style={{ color: rating >= n ? '#f1c40f' : '#555' }} />
      ))}
    </span>
  )
}

function Tile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ background: '#FDF5EC', borderRadius: 10, padding: '0.75rem 1rem', border: '1px solid #EDE0CC', textAlign: 'center' }}>
      <div style={{ color: '#999', fontSize: '0.68rem', marginBottom: 4 }}>{label}</div>
      <div style={{ color: '#1a1a1a', fontWeight: 700, fontSize: '0.95rem' }}>{value}</div>
      {sub && <div style={{ color: '#999', fontSize: '0.65rem', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

// Tallies how often each option was picked. The chips are a fixed list on the form
// (FeedbackForm.tsx), so counting them gives a ranked read of what clients consistently
// notice — the part the team can act on, unlike a star average.
function tallyAreas(feedback: any[], field: 'best_areas' | 'improve_areas'): { area: string; count: number }[] {
  const counts: Record<string, number> = {}
  for (const f of feedback) {
    for (const area of f[field] || []) counts[area] = (counts[area] || 0) + 1
  }
  return Object.entries(counts)
    .map(([area, count]) => ({ area, count }))
    .sort((a, b) => b.count - a.count || a.area.localeCompare(b.area))
}

function AreaBreakdown({ title, subtitle, areas, color, emptyText }: {
  title: string; subtitle: string; areas: { area: string; count: number }[]; color: string; emptyText: string
}) {
  // Bars scale against the top item, not the response total — with few responses a
  // percentage-of-all bar renders as a sliver and hides the ranking we care about.
  const max = areas.length > 0 ? areas[0].count : 0
  return (
    <div style={{ background: '#FDF5EC', borderRadius: 12, padding: '1rem 1.15rem', border: '1px solid #EDE0CC' }}>
      <div style={{ color: '#1a1a1a', fontWeight: 700, fontSize: '0.9rem' }}>{title}</div>
      <div style={{ color: '#999', fontSize: '0.7rem', marginTop: 2, marginBottom: '0.85rem' }}>{subtitle}</div>
      {areas.length === 0 ? (
        <div style={{ color: '#aaa', fontSize: '0.78rem' }}>{emptyText}</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          {areas.map(({ area, count }) => (
            <div key={area}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 3 }}>
                <span style={{ color: '#444', fontSize: '0.78rem', fontWeight: 600 }}>{area}</span>
                <span style={{ color: '#888', fontSize: '0.75rem' }}>{count}</span>
              </div>
              <div style={{ background: '#EDE0CC', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                <div style={{ background: color, height: '100%', width: `${max > 0 ? (count / max) * 100 : 0}%`, borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default function ClientFeedbackClient({
  period, periodKey, keyOptions, feedback, periodCount, sentThisPeriod, respondedIds, trend, knownStaffNames,
}: Props) {
  const validStaff = new Set(knownStaffNames)
  const router = useRouter()
  const responded = new Set(respondedIds)
  const label = periodLabel(periodKey, period)
  const unit = period === 'week' ? 'week' : 'month'

  function go(next: { period?: Period; key?: PeriodKey }) {
    const p = next.period ?? period
    // Switching the unit invalidates the key (a Monday date isn't a valid month), so fall back
    // to that unit's current period rather than carrying an incompatible key across.
    const k = next.key ?? (next.period && next.period !== period ? '' : periodKey)
    const params = new URLSearchParams()
    if (p !== 'month') params.set('period', p)
    if (k) params.set('key', k)
    const qs = params.toString()
    router.push(qs ? `/client-feedback?${qs}` : '/client-feedback')
  }

  const bestAreas = tallyAreas(feedback, 'best_areas')
  const improveAreas = tallyAreas(feedback, 'improve_areas')

  const avg = feedback.length > 0 ? feedback.reduce((s, f) => s + (f.rating || 0), 0) / feedback.length : 0
  const sent = sentThisPeriod.length
  const answered = sentThisPeriod.filter(jo => responded.has(jo.job_order_id)).length
  const replyRate = sent > 0 ? (answered / sent) * 100 : 0

  // Period-over-period movement, so a tally reads as a direction rather than a bare number.
  const idx = trend.findIndex(t => t.key === periodKey)
  const prev = idx >= 0 ? trend[idx + 1] : undefined
  const current = idx >= 0 ? trend[idx] : undefined
  const avgDelta = prev && current && prev.count > 0 && current.count > 0 ? current.avg - prev.avg : null

  const gaStats: Record<string, { total: number; count: number; sent: number; answered: number }> = {}
  function bucket(name: string) {
    if (!gaStats[name]) gaStats[name] = { total: 0, count: 0, sent: 0, answered: 0 }
    return gaStats[name]
  }
  for (const f of feedback) {
    const receivedBy = Array.isArray(f.job_orders) ? f.job_orders[0]?.received_by : f.job_orders?.received_by
    if (!validStaff.has(receivedBy)) continue
    const s = bucket(receivedBy)
    s.total += f.rating || 0
    s.count += 1
  }
  for (const jo of sentThisPeriod) {
    if (!validStaff.has(jo.received_by)) continue
    const s = bucket(jo.received_by)
    s.sent += 1
    if (responded.has(jo.job_order_id)) s.answered += 1
  }
  const ranked = Object.entries(gaStats)
    .map(([name, s]) => ({ name, count: s.count, avg: s.count > 0 ? s.total / s.count : 0, sent: s.sent, answered: s.answered }))
    // Anyone with no reviews sorts below everyone who has some — otherwise a GA who simply
    // hasn't been rated lands at #1 with a gold medal and a blank average.
    .sort((a, b) => (b.count > 0 ? 1 : 0) - (a.count > 0 ? 1 : 0) || b.avg - a.avg || b.count - a.count || b.sent - a.sent)

  const maxTrendCount = Math.max(1, ...trend.map(t => t.count))
  const recentTrend = trend.slice(0, 12).reverse()

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ color: '#7A1828', fontSize: '1.4rem', fontWeight: 700 }}>Client Feedback</h1>
          <p style={{ color: '#777', fontSize: '0.8rem', marginTop: 2 }}>
            {period === 'week' ? 'Weekly' : 'Monthly'} record of what to retain and what to improve — {label}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1.5px solid #d0d0d0' }}>
            {(['week', 'month'] as Period[]).map(p => (
              <button
                key={p}
                onClick={() => go({ period: p })}
                style={{
                  background: period === p ? '#7A1828' : '#FDF5EC',
                  color: period === p ? '#fff' : '#7A1828',
                  border: 'none', padding: '0.5rem 0.85rem', fontSize: '0.78rem',
                  fontWeight: 700, cursor: 'pointer',
                }}
              >
                {p === 'week' ? 'Weekly' : 'Monthly'}
              </button>
            ))}
          </div>
          <select
            value={periodKey}
            onChange={e => go({ key: e.target.value })}
            style={{ background: '#FDF5EC', border: '1.5px solid #d0d0d0', borderRadius: 8, padding: '0.5rem 0.85rem', color: '#1a1a1a', fontSize: '0.82rem', outline: 'none', fontWeight: 600 }}
          >
            {keyOptions.map(k => <option key={k} value={k}>{periodLabel(k, period)}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: '1.25rem' }}>
        <Tile label={period === 'week' ? 'Replies This Week' : 'Replies This Month'} value={String(periodCount)} />
        <Tile
          label="Average Rating"
          value={feedback.length > 0 ? avg.toFixed(1) : '—'}
          sub={avgDelta !== null ? `${avgDelta >= 0 ? '▲' : '▼'} ${Math.abs(avgDelta).toFixed(1)} vs last ${unit}` : undefined}
        />
        <Tile label="Links Sent" value={String(sent)} />
        <Tile label="Reply Rate" value={sent > 0 ? `${replyRate.toFixed(0)}%` : '—'} sub={`${answered} of ${sent} answered`} />
      </div>

      {recentTrend.length > 1 && (
        <div style={{ background: '#FDF5EC', borderRadius: 12, padding: '1rem 1.15rem', border: '1px solid #EDE0CC', marginBottom: '1.25rem' }}>
          <div style={{ color: '#1a1a1a', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem' }}>
            Replies by {unit}
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 90 }}>
            {recentTrend.map(t => (
              <button
                key={t.key}
                onClick={() => go({ key: t.key })}
                title={`${periodLabel(t.key, period)} — ${t.count} replies, avg ${t.avg.toFixed(1)}`}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <span style={{ color: '#888', fontSize: '0.6rem' }}>{t.count}</span>
                <div style={{
                  width: '100%',
                  height: `${(t.count / maxTrendCount) * 60}px`,
                  minHeight: 2,
                  background: t.key === periodKey ? '#7A1828' : '#D8BFA8',
                  borderRadius: '4px 4px 0 0',
                }} />
                <span style={{ color: t.key === periodKey ? '#7A1828' : '#999', fontSize: '0.6rem', fontWeight: t.key === periodKey ? 700 : 400 }}>
                  {periodShortLabel(t.key, period)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12, marginBottom: '1.25rem' }}>
        <AreaBreakdown
          title="What to retain"
          subtitle={`Strengths clients named in ${label}`}
          areas={bestAreas}
          color="#7A1828"
          emptyText={`No strengths recorded this ${unit}.`}
        />
        <AreaBreakdown
          title="What to improve"
          subtitle={`The shortlist to work on for ${label}`}
          areas={improveAreas}
          color="#c05a00"
          emptyText={`No improvement areas recorded this ${unit}.`}
        />
      </div>

      <div style={{ background: '#FDF5EC', borderRadius: 12, padding: '1rem 1.15rem', border: '1px solid #EDE0CC', marginBottom: '1.25rem' }}>
        <div style={{ color: '#1a1a1a', fontWeight: 700, fontSize: '0.9rem' }}>Submissions</div>
        <div style={{ color: '#999', fontSize: '0.7rem', marginTop: 2, marginBottom: '0.85rem' }}>
          Every reply received in {label}, with the date it was rated
        </div>
        {feedback.length === 0 ? (
          <div style={{ color: '#aaa', fontSize: '0.78rem' }}>No feedback was submitted this {unit}.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {feedback.map(f => (
              <div key={f.id} style={{ borderLeft: `3px solid ${(f.rating || 0) <= 2 ? '#c0392b' : '#EDE0CC'}`, paddingLeft: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <Stars rating={f.rating || 0} size={12} />
                  <span style={{ color: '#444', fontSize: '0.78rem', fontWeight: 700 }}>{f.client_name || '—'}</span>
                  <span style={{ color: '#999', fontSize: '0.7rem' }}>
                    {f.jo && `${f.jo} · `}{f.service || '—'}
                  </span>
                </div>
                <div style={{ color: '#888', fontSize: '0.68rem', marginTop: 2 }}>
                  Rated {fmtDateTime(f.created_at)}
                </div>
                {(f.best_areas?.length > 0 || f.improve_areas?.length > 0) && (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 5 }}>
                    {(f.best_areas || []).map((a: string) => (
                      <span key={`b-${a}`} style={{ background: '#7A1828', color: '#fff', fontSize: '0.62rem', padding: '0.12rem 0.45rem', borderRadius: 10, fontWeight: 600 }}>+ {a}</span>
                    ))}
                    {(f.improve_areas || []).map((a: string) => (
                      <span key={`i-${a}`} style={{ background: '#c05a00', color: '#fff', fontSize: '0.62rem', padding: '0.12rem 0.45rem', borderRadius: 10, fontWeight: 600 }}>△ {a}</span>
                    ))}
                  </div>
                )}
                {f.comments?.trim() && (
                  <div style={{ color: '#444', fontSize: '0.78rem', lineHeight: 1.45, marginTop: 5 }}>&ldquo;{f.comments}&rdquo;</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <p style={{ color: '#999', fontSize: '0.72rem', marginBottom: '1rem', lineHeight: 1.5 }}>
        Averages reflect only the clients who chose to reply, and feedback is signed with the
        client&apos;s name and job order — read a high average with few replies accordingly. Links sent
        is the fairer measure of a GA&apos;s work, since whether a client answers isn&apos;t theirs to control.
      </p>

      {ranked.length === 0 ? (
        <div style={{ color: '#aaa', textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem' }}>
          No replies and no links sent in {label}.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {ranked.map((ga, i) => {
            // A medal has to be earned by an actual rating — an unrated GA gets a plain
            // position marker and the neutral card, not gold and the highlight.
            const medalled = ga.count > 0 && i < 3
            const isTop = ga.count > 0 && i === 0
            return (
              <div key={ga.name} style={{
                background: isTop ? '#5C001F' : '#3a3a3a',
                borderRadius: 12, padding: '1rem 1.25rem',
                border: `1px solid ${isTop ? '#7A1828' : '#2a2a2a'}`,
                display: 'flex', alignItems: 'center', gap: '1rem',
              }}>
                <div style={{ fontSize: medalled ? '1.6rem' : '1rem', minWidth: 36, textAlign: 'center', color: medalled ? RANK_COLORS[i] : '#555' }}>
                  {medalled ? MEDALS[i] : `#${i + 1}`}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: isTop ? '#fff' : '#ddd', fontWeight: 700, fontSize: isTop ? '1rem' : '0.9rem' }}>{ga.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                    {ga.count > 0 && <Stars rating={Math.round(ga.avg)} />}
                    <span style={{ color: '#999', fontSize: '0.72rem' }}>{ga.count} review{ga.count === 1 ? '' : 's'}</span>
                    <span style={{ color: '#777', fontSize: '0.72rem' }}>
                      · {ga.sent} link{ga.sent === 1 ? '' : 's'} sent
                      {ga.sent > 0 && ` · ${ga.answered}/${ga.sent} answered`}
                    </span>
                  </div>
                </div>
                <div style={{ minWidth: 60, textAlign: 'right' }}>
                  <div style={{ color: isTop ? '#f1c40f' : '#555', fontSize: '0.68rem', marginBottom: 4 }}>AVG</div>
                  <div style={{ color: isTop ? '#f1c40f' : '#aaa', fontWeight: 700, fontSize: '0.95rem' }}>{ga.count > 0 ? ga.avg.toFixed(1) : '—'}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
