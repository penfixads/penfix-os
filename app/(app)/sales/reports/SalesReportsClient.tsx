'use client'

import { useState, useMemo, useEffect } from 'react'
import { formatPeso, getPhilippineDateStr } from '@/lib/jo-helpers'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import Pagination from '@/components/Pagination'

const PAGE_SIZE = 10

interface Props { payments: any[]; jobOrders: any[]; expenses: any[]; purchases: any[]; supplierDeliveries: any[]; overheadExpenses: any[] }

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

export default function SalesReportsClient({ payments, jobOrders, expenses, purchases, supplierDeliveries, overheadExpenses }: Props) {
  const [period, setPeriod] = useState<Period>('monthly')
  const [page, setPage] = useState(1)
  useEffect(() => { setPage(1) }, [period])

  const report = useMemo(() => {
    const map: Record<string, { collections: number; sales: number; expenses: number; overhead: number; joCount: number; byMethod: Record<string, number> }> = {}
    const blank = () => ({ collections: 0, sales: 0, expenses: 0, overhead: 0, joCount: 0, byMethod: {} })

    for (const p of payments) {
      const d = p.payment_date
      if (!d) continue
      const key = getPeriodKey(d, period)
      if (!map[key]) map[key] = blank()
      map[key].collections += p.amount || 0
      map[key].byMethod[p.payment_method] = (map[key].byMethod[p.payment_method] || 0) + (p.amount || 0)
    }

    for (const jo of jobOrders) {
      const d = jo.date_time_received ? getPhilippineDateStr(new Date(jo.date_time_received)) : undefined
      if (!d) continue
      const key = getPeriodKey(d, period)
      if (!map[key]) map[key] = blank()
      map[key].sales += jo.grand_total || 0
      map[key].joCount += 1
    }

    for (const e of expenses) {
      const d = e.expense_date || e.date
      if (!d) continue
      const key = getPeriodKey(d, period)
      if (!map[key]) map[key] = blank()
      map[key].expenses += e.amount || 0
    }

    // Purchases (same-day cash) and Supplier Deliveries (billed via next month's cheque)
    // are both real cash-out overhead — folded into the same Expenses bucket.
    for (const p of purchases) {
      const d = p.purchase_date
      if (!d) continue
      const key = getPeriodKey(d, period)
      if (!map[key]) map[key] = blank()
      map[key].expenses += p.total_amount || 0
    }

    for (const sd of supplierDeliveries) {
      const d = sd.billing_month
      if (!d) continue
      const key = getPeriodKey(d, period)
      if (!map[key]) map[key] = blank()
      map[key].expenses += sd.total_amount || 0
    }

    // Fixed monthly overhead (utilities, salaries, BIR, etc.) — kept separate from
    // Expenses so Net Profit (Sales - Expenses) and final Profit (- Overhead) show
    // as two tiers, matching how the business actually tracks profitability.
    for (const oh of overheadExpenses) {
      const d = oh.month
      if (!d) continue
      const key = getPeriodKey(d, period)
      if (!map[key]) map[key] = blank()
      map[key].overhead += oh.amount || 0
    }

    // Supplier deliveries are keyed by billing_month (next month's cheque), which can
    // land on a period that hasn't happened yet — drop anything past the current period
    // so the report doesn't show a future month's projected-but-unrealized expense.
    const currentKey = getPeriodKey(getPhilippineDateStr(), period)
    return Object.entries(map)
      .filter(([key]) => key <= currentKey)
      .sort((a, b) => b[0].localeCompare(a[0]))
  }, [payments, jobOrders, expenses, purchases, supplierDeliveries, overheadExpenses, period])

  const grandCollections = report.reduce((s, [, r]) => s + r.collections, 0)
  const grandSales = report.reduce((s, [, r]) => s + r.sales, 0)
  const grandExpenses = report.reduce((s, [, r]) => s + r.expenses, 0)
  const grandOverhead = report.reduce((s, [, r]) => s + r.overhead, 0)
  const grandNetProfit = grandSales - grandExpenses
  const grandProfit = grandNetProfit - grandOverhead
  const grandJOs = report.reduce((s, [, r]) => s + r.joCount, 0)
  const pagedReport = report.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ color: '#7A1828', fontSize: '1.4rem', fontWeight: 700 }}>Sales Reports</h1>
        <p style={{ color: '#777', fontSize: '0.8rem', marginTop: 2 }}>Last 12 months</p>
      </div>

      {/* Chart */}
      {report.length > 0 && (
        <div style={{ background: '#FDF5EC', borderRadius: 12, padding: '1rem', border: '1px solid #EDE0CC', marginBottom: '1.25rem' }}>
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
                contentStyle={{ background: '#FDF5EC', border: '1px solid #d0d0d0', borderRadius: 8, fontSize: '0.78rem' }}
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
            style={{ padding: '0.5rem 1.5rem', borderRadius: 999, background: period === p ? '#7A1828' : 'transparent', color: period === p ? '#fff' : '#7A1828', border: period === p ? '2px solid #C9A84C' : '1.5px solid #7A1828', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', textTransform: 'capitalize' }}>
            {p}
          </button>
        ))}
      </div>

      {/* Totals bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, marginBottom: '1.25rem' }}>
        {[
          { label: 'Total JOs', value: grandJOs },
          { label: 'Total Sales', value: formatPeso(grandSales) },
          { label: 'Total Collections', value: formatPeso(grandCollections) },
          { label: 'Total Expenses', value: formatPeso(grandExpenses), warn: true },
          { label: 'Net Profit', value: formatPeso(grandNetProfit), profit: grandNetProfit >= 0 },
          { label: 'Overhead', value: formatPeso(grandOverhead), warn: true },
          { label: 'Profit', value: formatPeso(grandProfit), profit: grandProfit >= 0 },
        ].map(c => (
          <div key={c.label} style={{ background: '#FDF5EC', borderRadius: 10, padding: '0.75rem', border: '1px solid #EDE0CC' }}>
            <div style={{ color: '#aaa', fontSize: '0.68rem' }}>{c.label}</div>
            <div style={{ color: c.warn ? '#e74c3c' : c.profit !== undefined ? (c.profit ? '#27ae60' : '#e74c3c') : '#1a1a1a', fontWeight: 700, fontSize: '0.95rem', marginTop: 2 }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Period rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {pagedReport.map(([key, r]) => {
          const netCash = r.collections - r.expenses
          const netProfit = r.sales - r.expenses
          const profit = netProfit - r.overhead
          const maxVal = Math.max(r.sales, 1)
          return (
            <div key={key} style={{ background: '#FDF5EC', borderRadius: 12, padding: '1rem', border: '1px solid #EDE0CC' }}>
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
                  { label: 'Overhead', value: r.overhead, color: '#c0392b' },
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: '0.75rem', paddingTop: '0.65rem', borderTop: '1px solid #e5e5e5' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#777', fontSize: '0.72rem' }}>Net Cash</span>
                  <span style={{ color: netCash >= 0 ? '#2ecc71' : '#e74c3c', fontWeight: 700, fontSize: '0.78rem' }}>{formatPeso(netCash)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#777', fontSize: '0.72rem' }}>Net Profit</span>
                  <span style={{ color: netProfit >= 0 ? '#2ecc71' : '#e74c3c', fontWeight: 700, fontSize: '0.78rem' }}>{formatPeso(netProfit)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#777', fontSize: '0.72rem', fontWeight: 700 }}>Profit</span>
                  <span style={{ color: profit >= 0 ? '#2ecc71' : '#e74c3c', fontWeight: 700, fontSize: '0.85rem' }}>{formatPeso(profit)}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <Pagination page={page} totalItems={report.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
    </div>
  )
}
