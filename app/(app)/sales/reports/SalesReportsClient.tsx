'use client'

import { useState, useMemo } from 'react'
import { formatPeso } from '@/lib/jo-helpers'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

interface Props { payments: any[]; jobOrders: any[]; expenses: any[] }

type Period = 'weekly' | 'monthly' | 'yearly'

function getPeriodKey(date: string, period: Period): string {
  const d = new Date(date + 'T00:00:00')
  if (period === 'yearly') return String(d.getFullYear())
  if (period === 'monthly') return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  // weekly — ISO week
  const jan1 = new Date(d.getFullYear(), 0, 1)
  const week = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7)
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`
}

function periodLabel(key: string, period: Period): string {
  if (period === 'yearly') return key
  if (period === 'monthly') {
    const [y, m] = key.split('-')
    return new Date(parseInt(y), parseInt(m) - 1, 1).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })
  }
  return key
}

export default function SalesReportsClient({ payments, jobOrders, expenses }: Props) {
  const [period, setPeriod] = useState<Period>('monthly')

  const report = useMemo(() => {
    const map: Record<string, { collections: number; sales: number; expenses: number; joCount: number; byMethod: Record<string, number> }> = {}

    for (const p of payments) {
      const d = p.payment_date
      if (!d) continue
      const key = getPeriodKey(d, period)
      if (!map[key]) map[key] = { collections: 0, sales: 0, expenses: 0, joCount: 0, byMethod: {} }
      map[key].collections += p.amount || 0
      map[key].byMethod[p.payment_method] = (map[key].byMethod[p.payment_method] || 0) + (p.amount || 0)
    }

    for (const jo of jobOrders) {
      const d = jo.date_time_received?.split('T')[0]
      if (!d) continue
      const key = getPeriodKey(d, period)
      if (!map[key]) map[key] = { collections: 0, sales: 0, expenses: 0, joCount: 0, byMethod: {} }
      map[key].sales += jo.grand_total || 0
      map[key].joCount += 1
    }

    for (const e of expenses) {
      const d = e.expense_date || e.date
      if (!d) continue
      const key = getPeriodKey(d, period)
      if (!map[key]) map[key] = { collections: 0, sales: 0, expenses: 0, joCount: 0, byMethod: {} }
      map[key].expenses += e.amount || 0
    }

    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]))
  }, [payments, jobOrders, expenses, period])

  const grandCollections = report.reduce((s, [, r]) => s + r.collections, 0)
  const grandSales = report.reduce((s, [, r]) => s + r.sales, 0)
  const grandExpenses = report.reduce((s, [, r]) => s + r.expenses, 0)
  const grandJOs = report.reduce((s, [, r]) => s + r.joCount, 0)

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ color: '#1a1a1a', fontSize: '1.4rem', fontWeight: 700 }}>Sales Reports</h1>
        <p style={{ color: '#777', fontSize: '0.8rem', marginTop: 2 }}>Last 12 months</p>
      </div>

      {/* Chart */}
      {report.length > 0 && (
        <div style={{ background: '#f5f5f5', borderRadius: 12, padding: '1rem', border: '1px solid #ebebeb', marginBottom: '1.25rem' }}>
          <div style={{ color: '#999', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.75rem' }}>Overview</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={[...report].reverse().map(([key, r]) => ({
              name: periodLabel(key, period),
              Sales: Math.round(r.sales),
              Collections: Math.round(r.collections),
              Expenses: Math.round(r.expenses),
            }))} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="name" tick={{ fill: '#666', fontSize: 10 }} />
              <YAxis tick={{ fill: '#666', fontSize: 10 }} tickFormatter={v => `₱${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: '#f5f5f5', border: '1px solid #d0d0d0', borderRadius: 8, fontSize: '0.78rem' }}
                labelStyle={{ color: '#1a1a1a', fontWeight: 700 }}
                formatter={(value: number) => formatPeso(value)}
              />
              <Legend wrapperStyle={{ fontSize: '0.75rem', color: '#666' }} />
              <Bar dataKey="Sales" fill="#2980b9" radius={[3,3,0,0]} />
              <Bar dataKey="Collections" fill="#27ae60" radius={[3,3,0,0]} />
              <Bar dataKey="Expenses" fill="#e74c3c" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Period toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem' }}>
        {(['weekly', 'monthly', 'yearly'] as Period[]).map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            style={{ padding: '0.5rem 1.1rem', borderRadius: 8, border: '1.5px solid', borderColor: period === p ? '#7B1C1C' : '#333', background: period === p ? '#7B1C1C' : 'transparent', color: '#1a1a1a', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', textTransform: 'capitalize' }}>
            {p}
          </button>
        ))}
      </div>

      {/* Totals bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8, marginBottom: '1.25rem' }}>
        {[
          { label: 'Total JOs', value: grandJOs },
          { label: 'Total Sales', value: formatPeso(grandSales) },
          { label: 'Total Collections', value: formatPeso(grandCollections) },
          { label: 'Total Expenses', value: formatPeso(grandExpenses), warn: true },
        ].map(c => (
          <div key={c.label} style={{ background: '#f5f5f5', borderRadius: 10, padding: '0.75rem', border: '1px solid #ebebeb' }}>
            <div style={{ color: '#aaa', fontSize: '0.68rem' }}>{c.label}</div>
            <div style={{ color: c.warn ? '#e74c3c' : '#fff', fontWeight: 700, fontSize: '0.95rem', marginTop: 2 }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Period rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {report.map(([key, r]) => {
          const netCash = r.collections - r.expenses
          const maxVal = Math.max(r.sales, 1)
          return (
            <div key={key} style={{ background: '#f5f5f5', borderRadius: 12, padding: '1rem', border: '1px solid #ebebeb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ color: '#1a1a1a', fontWeight: 700, fontSize: '0.9rem' }}>{periodLabel(key, period)}</div>
                  <div style={{ color: '#999', fontSize: '0.7rem' }}>{r.joCount} JO(s)</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#2ecc71', fontWeight: 700, fontSize: '0.95rem' }}>{formatPeso(r.collections)}</div>
                  <div style={{ color: '#aaa', fontSize: '0.68rem' }}>collected</div>
                </div>
              </div>

              {/* Bar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { label: 'Sales', value: r.sales, color: '#2980b9' },
                  { label: 'Collections', value: r.collections, color: '#27ae60' },
                  { label: 'Expenses', value: r.expenses, color: '#e74c3c' },
                ].map(bar => (
                  <div key={bar.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ color: '#777', fontSize: '0.68rem' }}>{bar.label}</span>
                      <span style={{ color: '#999', fontSize: '0.68rem' }}>{formatPeso(bar.value)}</span>
                    </div>
                    <div style={{ background: '#f0f0f0', borderRadius: 4, height: 5, overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min((bar.value / maxVal) * 100, 100)}%`, height: '100%', background: bar.color, borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', paddingTop: '0.65rem', borderTop: '1px solid #e5e5e5' }}>
                <span style={{ color: '#777', fontSize: '0.72rem' }}>Net Cash</span>
                <span style={{ color: netCash >= 0 ? '#2ecc71' : '#e74c3c', fontWeight: 700, fontSize: '0.78rem' }}>{formatPeso(netCash)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
