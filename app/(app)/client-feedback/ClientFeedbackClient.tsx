'use client'

import { IconStar } from '@/components/icons'

interface Props { feedback: any[] }

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

export default function ClientFeedbackClient({ feedback }: Props) {
  const gaStats: Record<string, { total: number; count: number }> = {}

  for (const f of feedback) {
    const receivedBy = Array.isArray(f.job_orders) ? f.job_orders[0]?.received_by : f.job_orders?.received_by
    const ga = receivedBy || 'Unassigned'
    if (!gaStats[ga]) gaStats[ga] = { total: 0, count: 0 }
    gaStats[ga].total += f.rating || 0
    gaStats[ga].count += 1
  }

  const ranked = Object.entries(gaStats)
    .map(([name, stats]) => ({ name, count: stats.count, avg: stats.total / stats.count }))
    .sort((a, b) => b.avg - a.avg || b.count - a.count)

  const overallCount = feedback.length
  const overallAvg = overallCount > 0 ? feedback.reduce((s, f) => s + (f.rating || 0), 0) / overallCount : 0

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ color: '#7A1828', fontSize: '1.4rem', fontWeight: 700 }}>Client Feedback</h1>
        <p style={{ color: '#777', fontSize: '0.8rem', marginTop: 2 }}>How clients rate the service they received, by GA</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: '1.5rem' }}>
        <div style={{ background: '#FDF5EC', borderRadius: 10, padding: '0.75rem 1rem', border: '1px solid #EDE0CC', textAlign: 'center' }}>
          <div style={{ color: '#999', fontSize: '0.68rem', marginBottom: 4 }}>Total Reviews</div>
          <div style={{ color: '#1a1a1a', fontWeight: 700, fontSize: '0.95rem' }}>{overallCount}</div>
        </div>
        <div style={{ background: '#FDF5EC', borderRadius: 10, padding: '0.75rem 1rem', border: '1px solid #EDE0CC', textAlign: 'center' }}>
          <div style={{ color: '#999', fontSize: '0.68rem', marginBottom: 4 }}>Overall Average</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <span style={{ color: '#1a1a1a', fontWeight: 700, fontSize: '0.95rem' }}>{overallCount > 0 ? overallAvg.toFixed(1) : '—'}</span>
            {overallCount > 0 && <Stars rating={Math.round(overallAvg)} />}
          </div>
        </div>
      </div>

      {ranked.length === 0 ? (
        <div style={{ color: '#aaa', textAlign: 'center', marginTop: '3rem', fontSize: '0.9rem' }}>No client feedback submitted yet.</div>
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
                <div style={{ fontSize: i < 3 ? '1.6rem' : '1rem', minWidth: 36, textAlign: 'center', color: RANK_COLORS[i] || '#555' }}>
                  {i < 3 ? MEDALS[i] : `#${i + 1}`}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ color: isTop ? '#fff' : '#ddd', fontWeight: 700, fontSize: isTop ? '1rem' : '0.9rem' }}>{ga.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                    <Stars rating={Math.round(ga.avg)} />
                    <span style={{ color: '#999', fontSize: '0.72rem' }}>{ga.count} review{ga.count === 1 ? '' : 's'}</span>
                  </div>
                </div>

                <div style={{ minWidth: 60, textAlign: 'right' }}>
                  <div style={{ color: isTop ? '#f1c40f' : '#555', fontSize: '0.68rem', marginBottom: 4 }}>AVG</div>
                  <div style={{ color: isTop ? '#f1c40f' : '#aaa', fontWeight: 700, fontSize: '0.95rem' }}>{ga.avg.toFixed(1)}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
