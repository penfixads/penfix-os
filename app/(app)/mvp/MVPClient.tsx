'use client'

import { formatPeso } from '@/lib/jo-helpers'

interface Props {
  jobOrders: any[]
  payments: any[]
  today: string
}

const MEDALS = ['🥇', '🥈', '🥉']
const RANK_COLORS = ['#f1c40f', '#95a5a6', '#cd7f32']

export default function MVPClient({ jobOrders, payments, today }: Props) {
  // Aggregate by GA (received_by)
  const gaStats: Record<string, { jos: number; grandTotal: number; collected: number }> = {}

  for (const jo of jobOrders) {
    const ga = jo.received_by || 'Unknown'
    if (!gaStats[ga]) gaStats[ga] = { jos: 0, grandTotal: 0, collected: 0 }
    gaStats[ga].jos += 1
    gaStats[ga].grandTotal += jo.grand_total || 0
  }

  for (const pay of payments) {
    const ga = pay.recorded_by || 'Unknown'
    if (!gaStats[ga]) gaStats[ga] = { jos: 0, grandTotal: 0, collected: 0 }
    gaStats[ga].collected += pay.amount || 0
  }

  // Sort by grand total received descending
  const ranked = Object.entries(gaStats)
    .map(([name, stats]) => ({ name, ...stats, score: stats.grandTotal + stats.collected }))
    .sort((a, b) => b.score - a.score)

  const dateLabel = new Date(today + 'T00:00:00').toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const totalJOs = jobOrders.length
  const totalSales = jobOrders.reduce((s, j) => s + (j.grand_total || 0), 0)
  const totalCollected = payments.reduce((s, p) => s + (p.amount || 0), 0)

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ color: '#1a1a1a', fontSize: '1.4rem', fontWeight: 700 }}>Daily MVP</h1>
        <p style={{ color: '#777', fontSize: '0.8rem', marginTop: 2 }}>{dateLabel}</p>
      </div>

      {/* Day totals */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: '1.5rem' }}>
        {[
          { label: "Total JOs Today", value: totalJOs },
          { label: "Total Sales", value: formatPeso(totalSales) },
          { label: "Total Collected", value: formatPeso(totalCollected) },
        ].map(c => (
          <div key={c.label} style={{ background: '#f5f5f5', borderRadius: 10, padding: '0.75rem 1rem', border: '1px solid #ebebeb', textAlign: 'center' }}>
            <div style={{ color: '#999', fontSize: '0.68rem', marginBottom: 4 }}>{c.label}</div>
            <div style={{ color: '#1a1a1a', fontWeight: 700, fontSize: '0.95rem' }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Leaderboard */}
      {ranked.length === 0 ? (
        <div style={{ color: '#aaa', textAlign: 'center', marginTop: '3rem', fontSize: '0.9rem' }}>No activity recorded yet today.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {ranked.map((ga, i) => {
            const isTop = i === 0
            return (
              <div key={ga.name} style={{
                background: isTop ? '#1a0a00' : '#1a1a1a',
                borderRadius: 12,
                padding: '1rem 1.25rem',
                border: `1px solid ${isTop ? '#7B1C1C' : '#2a2a2a'}`,
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
                      <div style={{ color: '#1a1a1a', fontWeight: 700, fontSize: '0.88rem' }}>{ga.jos}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#999', fontSize: '0.65rem' }}>Sales</div>
                      <div style={{ color: '#2ecc71', fontWeight: 700, fontSize: '0.88rem' }}>{formatPeso(ga.grandTotal)}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#999', fontSize: '0.65rem' }}>Collected</div>
                      <div style={{ color: '#3498db', fontWeight: 700, fontSize: '0.88rem' }}>{formatPeso(ga.collected)}</div>
                    </div>
                  </div>
                </div>

                {/* Score bar */}
                <div style={{ minWidth: 80, textAlign: 'right' }}>
                  <div style={{ color: isTop ? '#f1c40f' : '#555', fontSize: '0.68rem', marginBottom: 4 }}>SCORE</div>
                  <div style={{ color: isTop ? '#f1c40f' : '#aaa', fontWeight: 700, fontSize: '0.95rem' }}>{formatPeso(ga.score)}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
