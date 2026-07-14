'use client'

import { useState, useMemo, useEffect } from 'react'
import { formatPeso, getPhilippineDateStr } from '@/lib/jo-helpers'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import Pagination from '@/components/Pagination'

const PAGE_SIZE = 10

interface Props { payments: any[]; jobOrders: any[]; expenses: any[]; purchases: any[]; supplierDeliveries: any[]; overheadExpenses: any[] }

const JO_STATUS_COLORS: Record<string, string> = {
  'Fully Paid': '#27ae60',
  'For Billing': '#9b59b6',
  'Downpayment Received': '#2980b9',
  'Below 50% Downpayment': '#e67e22',
  'Pending Payment': '#e74c3c',
}

// overhead_expenses.expense_name is free text (e.g. "Employees salary", "Electric Bill"),
// no fixed category column — bucket it by keyword so Salary and each bill type show up as
// their own line instead of one lumped "Overhead" number.
type OverheadBucket = 'salary' | 'telephone' | 'electric' | 'water' | 'internet' | 'other'
function classifyOverhead(name: string): OverheadBucket {
  const n = (name || '').toLowerCase()
  if (/salary|sueldo|payroll|wage|sahod/.test(n)) return 'salary'
  if (/pldt|internet|wifi|telecom|converge|fiber|broadband/.test(n)) return 'internet'
  if (/electric|meralco|kuryente/.test(n)) return 'electric'
  if (/\bwater\b|maynilad|manila water|tubig/.test(n)) return 'water'
  if (/telephone|landline|globe|smart|load\b/.test(n)) return 'telephone'
  return 'other'
}

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

// YYYY-MM key for the month-filter dropdown — same idea as getPeriodKey('monthly') but as a
// plain function so it can filter the raw arrays before anything else runs.
function monthKeyOf(dateStr: string): string {
  return dateStr.slice(0, 7)
}
function monthLabelOf(key: string): string {
  const [y, m] = key.split('-')
  return new Date(parseInt(y), parseInt(m) - 1, 1).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })
}

export default function SalesReportsClient({ payments, jobOrders, expenses, purchases, supplierDeliveries, overheadExpenses }: Props) {
  const [period, setPeriod] = useState<Period>('monthly')
  const [page, setPage] = useState(1)
  const [monthFilter, setMonthFilter] = useState('all')
  useEffect(() => { setPage(1) }, [period, monthFilter])

  // Every month that actually has data, newest first — feeds the dropdown below.
  const availableMonths = useMemo(() => {
    const keys = new Set<string>()
    for (const jo of jobOrders) if (jo.date_time_received) keys.add(monthKeyOf(getPhilippineDateStr(new Date(jo.date_time_received))))
    for (const p of payments) if (p.payment_date) keys.add(monthKeyOf(p.payment_date))
    for (const e of expenses) { const d = e.expense_date || e.date; if (d) keys.add(monthKeyOf(d)) }
    for (const p of purchases) if (p.purchase_date) keys.add(monthKeyOf(p.purchase_date))
    for (const sd of supplierDeliveries) if (sd.billing_month) keys.add(monthKeyOf(sd.billing_month))
    for (const oh of overheadExpenses) if (oh.month) keys.add(monthKeyOf(oh.month))
    return Array.from(keys).sort((a, b) => b.localeCompare(a))
  }, [jobOrders, payments, expenses, purchases, supplierDeliveries, overheadExpenses])

  // When a specific month is picked, every panel on the page (top summary, chart, and the
  // period-by-period list) scopes down to just that month instead of the full 12-month window.
  const fPayments = useMemo(() => monthFilter === 'all' ? payments : payments.filter(p => p.payment_date && monthKeyOf(p.payment_date) === monthFilter), [payments, monthFilter])
  const fJobOrders = useMemo(() => monthFilter === 'all' ? jobOrders : jobOrders.filter(jo => jo.date_time_received && monthKeyOf(getPhilippineDateStr(new Date(jo.date_time_received))) === monthFilter), [jobOrders, monthFilter])
  const fExpenses = useMemo(() => monthFilter === 'all' ? expenses : expenses.filter(e => { const d = e.expense_date || e.date; return d && monthKeyOf(d) === monthFilter }), [expenses, monthFilter])
  const fPurchases = useMemo(() => monthFilter === 'all' ? purchases : purchases.filter(p => p.purchase_date && monthKeyOf(p.purchase_date) === monthFilter), [purchases, monthFilter])
  const fSupplierDeliveries = useMemo(() => monthFilter === 'all' ? supplierDeliveries : supplierDeliveries.filter(sd => sd.billing_month && monthKeyOf(sd.billing_month) === monthFilter), [supplierDeliveries, monthFilter])
  const fOverheadExpenses = useMemo(() => monthFilter === 'all' ? overheadExpenses : overheadExpenses.filter(oh => oh.month && monthKeyOf(oh.month) === monthFilter), [overheadExpenses, monthFilter])

  const report = useMemo(() => {
    const map: Record<string, {
      collections: number; sales: number; expenses: number; overhead: number; joCount: number
      byMethod: Record<string, number>
      dailyExpenses: number; purchasesAmt: number; supplierDeliveriesAmt: number
      overheadByBucket: Record<OverheadBucket, number>
    }> = {}
    const blank = () => ({
      collections: 0, sales: 0, expenses: 0, overhead: 0, joCount: 0, byMethod: {},
      dailyExpenses: 0, purchasesAmt: 0, supplierDeliveriesAmt: 0,
      overheadByBucket: { salary: 0, telephone: 0, electric: 0, water: 0, internet: 0, other: 0 },
    })

    for (const p of fPayments) {
      const d = p.payment_date
      if (!d) continue
      const key = getPeriodKey(d, period)
      if (!map[key]) map[key] = blank()
      map[key].collections += p.amount || 0
      map[key].byMethod[p.payment_method] = (map[key].byMethod[p.payment_method] || 0) + (p.amount || 0)
    }

    for (const jo of fJobOrders) {
      const d = jo.date_time_received ? getPhilippineDateStr(new Date(jo.date_time_received)) : undefined
      if (!d) continue
      const key = getPeriodKey(d, period)
      if (!map[key]) map[key] = blank()
      map[key].sales += jo.grand_total || 0
      map[key].joCount += 1
    }

    for (const e of fExpenses) {
      const d = e.expense_date || e.date
      if (!d) continue
      const key = getPeriodKey(d, period)
      if (!map[key]) map[key] = blank()
      map[key].expenses += e.amount || 0
      map[key].dailyExpenses += e.amount || 0
    }

    // Purchases (same-day cash) and Supplier Deliveries (billed via next month's cheque)
    // are both real cash-out overhead — folded into the same Expenses bucket, but tracked
    // separately too so the breakdown below can show where the money actually went.
    for (const p of fPurchases) {
      const d = p.purchase_date
      if (!d) continue
      const key = getPeriodKey(d, period)
      if (!map[key]) map[key] = blank()
      map[key].expenses += p.total_amount || 0
      map[key].purchasesAmt += p.total_amount || 0
    }

    for (const sd of fSupplierDeliveries) {
      const d = sd.billing_month
      if (!d) continue
      const key = getPeriodKey(d, period)
      if (!map[key]) map[key] = blank()
      map[key].expenses += sd.total_amount || 0
      map[key].supplierDeliveriesAmt += sd.total_amount || 0
    }

    // Fixed monthly overhead (utilities, salaries, BIR, etc.) — kept separate from
    // Expenses so Net Profit (Sales - Expenses) and final Profit (- Overhead) show
    // as two tiers, matching how the business actually tracks profitability.
    for (const oh of fOverheadExpenses) {
      const d = oh.month
      if (!d) continue
      const key = getPeriodKey(d, period)
      if (!map[key]) map[key] = blank()
      map[key].overhead += oh.amount || 0
      map[key].overheadByBucket[classifyOverhead(oh.expense_name)] += oh.amount || 0
    }

    // Supplier deliveries are keyed by billing_month (next month's cheque), which can
    // land on a period that hasn't happened yet — drop anything past the current period
    // so the report doesn't show a future month's projected-but-unrealized expense.
    const currentKey = getPeriodKey(getPhilippineDateStr(), period)
    return Object.entries(map)
      .filter(([key]) => key <= currentKey)
      .sort((a, b) => b[0].localeCompare(a[0]))
  }, [fPayments, fJobOrders, fExpenses, fPurchases, fSupplierDeliveries, fOverheadExpenses, period])

  const grandCollections = report.reduce((s, [, r]) => s + r.collections, 0)
  const grandSales = report.reduce((s, [, r]) => s + r.sales, 0)
  const grandExpenses = report.reduce((s, [, r]) => s + r.expenses, 0)
  const grandOverhead = report.reduce((s, [, r]) => s + r.overhead, 0)
  const grandNetProfit = grandSales - grandExpenses
  const grandProfit = grandNetProfit - grandOverhead
  const grandJOs = report.reduce((s, [, r]) => s + r.joCount, 0)
  const grandDailyExpenses = report.reduce((s, [, r]) => s + r.dailyExpenses, 0)
  const grandPurchases = report.reduce((s, [, r]) => s + r.purchasesAmt, 0)
  const grandSupplierDeliveries = report.reduce((s, [, r]) => s + r.supplierDeliveriesAmt, 0)
  const grandOverheadByBucket = report.reduce((acc, [, r]) => {
    for (const b of Object.keys(acc) as OverheadBucket[]) acc[b] += r.overheadByBucket[b]
    return acc
  }, { salary: 0, telephone: 0, electric: 0, water: 0, internet: 0, other: 0 } as Record<OverheadBucket, number>)
  const pagedReport = report.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // How many JOs actually processed, broken down by where they stand on payment — this is
  // the "what went wrong" view: a big JO count with a lot of Pending Payment / Below 50%
  // means the shop is doing the work but not collecting for it yet, not that sales are down.
  const joStatusCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const jo of fJobOrders) {
      const status = jo.payment_status || 'Unknown'
      counts[status] = (counts[status] || 0) + 1
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [fJobOrders])

  const grandBills = grandOverheadByBucket.telephone + grandOverheadByBucket.electric + grandOverheadByBucket.water + grandOverheadByBucket.internet
  // Top-level categories the user asked for: deliveries, everyday purchases, salary, bills.
  // "Everyday Purchases" combines the daily expenses log (Lalamove, supplies, snacks, cash
  // advances) with the same-day-cash Purchases table — both are day-to-day spend, distinct
  // from Deliveries (bulk supplier orders billed next month) and the fixed monthly Bills/Salary.
  const expenseBreakdown: { label: string; value: number; color: string; sub?: { label: string; value: number }[] }[] = [
    { label: 'Deliveries', value: grandSupplierDeliveries, color: '#d35400' },
    { label: 'Everyday Purchases', value: grandDailyExpenses + grandPurchases, color: '#e67e22' },
    { label: 'Salary', value: grandOverheadByBucket.salary, color: '#8e44ad' },
    {
      label: 'Bills', value: grandBills, color: '#c0392b',
      sub: [
        { label: 'Telephone', value: grandOverheadByBucket.telephone },
        { label: 'Electric', value: grandOverheadByBucket.electric },
        { label: 'Water', value: grandOverheadByBucket.water },
        { label: 'Internet/Telecom', value: grandOverheadByBucket.internet },
      ],
    },
  ]
  // Overhead entries that don't match Salary or a bill keyword (e.g. BIR, rent) still need to
  // show up somewhere rather than silently vanish from the total.
  if (grandOverheadByBucket.other > 0) {
    expenseBreakdown.push({ label: 'Other Overhead', value: grandOverheadByBucket.other, color: '#7f8c8d' })
  }
  const expenseGrandTotal = expenseBreakdown.reduce((s, e) => s + e.value, 0) || 1

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 10, marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ color: '#7A1828', fontSize: '1.4rem', fontWeight: 700 }}>Sales Reports</h1>
          <p style={{ color: '#777', fontSize: '0.8rem', marginTop: 2 }}>{monthFilter === 'all' ? 'Last 12 months' : monthLabelOf(monthFilter)}</p>
        </div>
        <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)}
          style={{ background: '#FDF5EC', border: '1.5px solid #d0d0d0', borderRadius: 8, padding: '0.5rem 0.85rem', color: '#1a1a1a', fontSize: '0.82rem', outline: 'none', minWidth: 180 }}>
          <option value="all">All Time</option>
          {availableMonths.map(m => <option key={m} value={m}>{monthLabelOf(m)}</option>)}
        </select>
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

      {/* JOs processed + Expense breakdown — the "what happened" view: a JO count with a lot
          of Pending/Below-50% payment means work got done but wasn't collected yet, not that
          business was slow. Expense breakdown shows where cash-out actually went. */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginBottom: '1.25rem' }}>
        <div style={{ background: '#FDF5EC', borderRadius: 12, padding: '1rem', border: '1px solid #EDE0CC' }}>
          <div style={{ color: '#7A1828', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.75rem' }}>
            Job Orders Processed — {grandJOs} {monthFilter !== 'all' && <span style={{ color: '#aaa', fontWeight: 400 }}>({monthLabelOf(monthFilter)})</span>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {joStatusCounts.map(([status, count]) => (
              <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: JO_STATUS_COLORS[status] || '#999', flexShrink: 0 }} />
                <span style={{ color: '#555', fontSize: '0.78rem', flex: 1 }}>{status}</span>
                <span style={{ color: '#1a1a1a', fontWeight: 700, fontSize: '0.8rem' }}>{count}</span>
                <span style={{ color: '#aaa', fontSize: '0.7rem', width: 40, textAlign: 'right' }}>{grandJOs ? Math.round((count / grandJOs) * 100) : 0}%</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#FDF5EC', borderRadius: 12, padding: '1rem', border: '1px solid #EDE0CC' }}>
          <div style={{ color: '#7A1828', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.75rem' }}>
            Expense Breakdown — {formatPeso(grandExpenses + grandOverhead)} {monthFilter !== 'all' && <span style={{ color: '#aaa', fontWeight: 400 }}>({monthLabelOf(monthFilter)})</span>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {expenseBreakdown.map(e => (
              <div key={e.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ color: '#555', fontSize: '0.78rem', fontWeight: e.sub ? 700 : 400 }}>{e.label}</span>
                  <span style={{ color: '#1a1a1a', fontWeight: 700, fontSize: '0.8rem' }}>{formatPeso(e.value)}</span>
                </div>
                <div style={{ background: '#f0f0f0', borderRadius: 4, height: 5, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min((e.value / expenseGrandTotal) * 100, 100)}%`, height: '100%', background: e.color, borderRadius: 4 }} />
                </div>
                {e.sub && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 6, paddingLeft: 10, borderLeft: '2px solid #EDE0CC' }}>
                    {e.sub.map(s => (
                      <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#999', fontSize: '0.7rem' }}>{s.label}</span>
                        <span style={{ color: '#777', fontSize: '0.7rem' }}>{formatPeso(s.value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
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

              {/* Expense categories for this period — same Deliveries/Everyday Purchases/
                  Salary/Bills split as the all-time panel above, but scoped to this one period. */}
              <div style={{ marginTop: '0.65rem', paddingTop: '0.6rem', borderTop: '1px solid #e5e5e5' }}>
                <div style={{ color: '#999', fontSize: '0.68rem', fontWeight: 700, marginBottom: 5 }}>Expenses ({formatPeso(r.expenses + r.overhead)})</div>
                {(() => {
                  const bills = r.overheadByBucket.telephone + r.overheadByBucket.electric + r.overheadByBucket.water + r.overheadByBucket.internet
                  const cats = [
                    { label: 'Deliveries', value: r.supplierDeliveriesAmt, color: '#d35400' },
                    { label: 'Everyday Purchases', value: r.dailyExpenses + r.purchasesAmt, color: '#e67e22' },
                    { label: 'Salary', value: r.overheadByBucket.salary, color: '#8e44ad' },
                    { label: 'Bills', value: bills, color: '#c0392b' },
                    ...(r.overheadByBucket.other > 0 ? [{ label: 'Other Overhead', value: r.overheadByBucket.other, color: '#7f8c8d' }] : []),
                  ]
                  const catMax = Math.max(...cats.map(c => c.value), 1)
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {cats.map(c => (
                        <div key={c.label}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                            <span style={{ color: '#777', fontSize: '0.68rem' }}>{c.label}</span>
                            <span style={{ color: '#999', fontSize: '0.68rem' }}>{formatPeso(c.value)}</span>
                          </div>
                          <div style={{ background: '#f0f0f0', borderRadius: 4, height: 5, overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min((c.value / catMax) * 100, 100)}%`, height: '100%', background: c.color, borderRadius: 4 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })()}
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
