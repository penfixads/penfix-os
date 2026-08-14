'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { formatPeso, formatAge, getEffectiveSteps, type StatusStep } from '@/lib/jo-helpers'

// Supabase's untyped client (no generated Database type in this project — see
// MVPClient/DispatchClient for the same pattern) infers every embedded relation as an
// array regardless of actual FK cardinality, so these raw rows are typed loosely as `any`
// and accessed the way they actually come back at runtime (single joined row as an object).
type Client = { client_name: string; company_name: string | null } | null

type ActiveJOItem = {
  item_id: string
  job_status: string
  subcategory_id: string | null
  subcategories: { subcategory_name: string; job_flow: string | null } | null
}

interface Props {
  userName: string
  today: string
  todayJOCount: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  activeJOs: any[]
  sopBySubcategory: Record<string, StatusStep[]>
  grossSalesMTD: number
  expensesMTD: number
  netSalesMTD: number
  yesterdaySales: number
  yesterdayExpenses: number
  yesterdayCollection: number
  netProfitMarginMTD: number | null
  netCashFlowMTD: number
  totalAR: number
  arDays: number | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  statusLog: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recentJOs: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recentPayments: any[]
}

type Bucket = 'production' | 'in_production' | 'dispatch'

const BUCKET_LABEL: Record<Bucket, string> = {
  production: 'For Production',
  in_production: 'In Production',
  dispatch: 'Ready for Dispatch',
}
const BUCKET_COLOR: Record<Bucket, string> = {
  production: '#C9A84C',
  in_production: '#5C001F',
  dispatch: '#2ecc71',
}

function bucketForItem(item: ActiveJOItem, sopBySubcategory: Record<string, StatusStep[]>): Bucket {
  const steps = getEffectiveSteps(sopBySubcategory[item.subcategory_id || ''] || [], item.subcategories?.job_flow)
  if (item.job_status === 'Received') return 'production'
  const current = steps.find(s => s.status_name === item.job_status)
  if (current?.is_terminal) return 'dispatch'
  const startStep = steps.find(s => s.is_production_start)
  if (!startStep || !current) return 'in_production'
  return current.sequence >= startStep.sequence ? 'in_production' : 'production'
}

function clientLabel(c: Client): string {
  if (!c) return 'Unknown Client'
  return c.company_name || c.client_name
}

function StatCard({ label, value, sub, href, valueColor }: { label: string; value: string; sub?: string; href: string; valueColor?: string }) {
  return (
    <Link href={href} style={{
      background: '#FDF5EC', borderRadius: 12, padding: '1rem 1.25rem', border: '1px solid #EDE0CC',
      textDecoration: 'none', display: 'block', transition: 'box-shadow 0.15s',
    }}>
      <div style={{ color: '#999', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ color: valueColor || '#1a1a1a', fontWeight: 700, fontSize: '1.7rem', marginTop: 4 }}>{value}</div>
      <div style={{ color: '#7A1828', fontSize: '0.75rem', fontWeight: 600, marginTop: 6 }}>{sub || 'View all →'}</div>
    </Link>
  )
}

export default function DashboardClient({
  userName, today, todayJOCount, activeJOs, sopBySubcategory,
  grossSalesMTD, expensesMTD, netSalesMTD, yesterdaySales, yesterdayExpenses, yesterdayCollection,
  netProfitMarginMTD, netCashFlowMTD, totalAR, arDays,
  statusLog, recentJOs, recentPayments,
}: Props) {
  const firstName = userName.split(' ')[0]
  const hour = new Date().getUTCHours() + 8 // Manila is UTC+8
  const greeting = ((hour % 24) < 12) ? 'Good morning' : ((hour % 24) < 18) ? 'Good afternoon' : 'Good evening'
  const dateLabel = new Date(today + 'T00:00:00').toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  // Bucket every item across all active JOs — same is_terminal/is_production_start rules
  // Production and Dispatch already use, so "Ready for Dispatch" here always agrees with
  // the /jos/dispatch queue count.
  const bucketCounts = useMemo(() => {
    const counts: Record<Bucket, number> = { production: 0, in_production: 0, dispatch: 0 }
    for (const jo of activeJOs) {
      for (const item of jo.job_order_items || []) {
        counts[bucketForItem(item, sopBySubcategory)]++
      }
    }
    return counts
  }, [activeJOs, sopBySubcategory])

  const totalItems = bucketCounts.production + bucketCounts.in_production + bucketCounts.dispatch
  const donutData = (['production', 'in_production', 'dispatch'] as Bucket[])
    .map(b => ({ key: b, name: BUCKET_LABEL[b], value: bucketCounts[b] }))
    .filter(d => d.value > 0)

  // Per-JO status for the table preview: worst-case across its items (nothing done yet →
  // something started → everything at its terminal step), so one glance tells you where
  // the whole order sits, not just one item.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function joBucket(jo: any): Bucket {
    const items = jo.job_order_items || []
    if (items.length === 0) return 'production'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buckets: Bucket[] = items.map((i: any) => bucketForItem(i, sopBySubcategory))
    if (buckets.every((b: Bucket) => b === 'dispatch')) return 'dispatch'
    if (buckets.some((b: Bucket) => b !== 'production')) return 'in_production'
    return 'production'
  }

  const activity = useMemo(() => {
    type Entry = { key: string; message: string; sub: string; timestamp: string; icon: string; color: string }
    const entries: Entry[] = []
    for (const log of statusLog) {
      entries.push({
        key: `log-${log.log_id}`,
        message: `${log.job_order_id} marked as ${log.status_name}`,
        sub: log.changed_by_name || '',
        timestamp: log.created_at,
        icon: '✓', color: '#2ecc71',
      })
    }
    for (const jo of recentJOs) {
      const service = jo.job_order_items?.[0]?.subcategories?.subcategory_name
      entries.push({
        key: `jo-${jo.job_order_id}`,
        message: `New Job Order created: ${jo.job_order_id}`,
        sub: [clientLabel(jo.clients), service].filter(Boolean).join(' · '),
        timestamp: jo.created_at,
        icon: '＋', color: '#5C001F',
      })
    }
    for (const p of recentPayments) {
      entries.push({
        key: `pay-${p.payment_id}`,
        message: `Payment received for ${p.job_orders?.job_order_id || 'JO'}`,
        sub: `${formatPeso(p.amount)} (${p.payment_method})`,
        timestamp: p.created_at,
        icon: '₱', color: '#C9A84C',
      })
    }
    return entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8)
  }, [statusLog, recentJOs, recentPayments])

  const previewRows = activeJOs.slice(0, 6)

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ color: '#7A1828', fontSize: '1.5rem', fontWeight: 700 }}>{greeting}, {firstName}! 👋</h1>
          <p style={{ color: '#777', fontSize: '0.85rem', marginTop: 2 }}>Here&apos;s what&apos;s happening today.</p>
        </div>
        <div style={{ background: '#fff', border: '1px solid #EDE0CC', borderRadius: 10, padding: '0.5rem 1rem', color: '#7A1828', fontSize: '0.8rem', fontWeight: 600 }}>
          {dateLabel}
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        <StatCard label="Today's Job Orders" value={String(todayJOCount)} href="/jos/today" />
        <StatCard label="Active Job Orders" value={String(activeJOs.length)} href="/jos/active" />
        <StatCard label="Ready for Dispatch" value={String(bucketCounts.dispatch)} href="/jos/dispatch" />
      </div>

      {/* Finance snapshot */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard label="Yesterday's Sales" value={formatPeso(yesterdaySales)} href="/sales/summary" />
        <StatCard label="Yesterday's Collection" value={formatPeso(yesterdayCollection)} href="/sales/summary" />
        <StatCard label="Yesterday's Expenses" value={formatPeso(yesterdayExpenses)} href="/sales/summary" valueColor="#e74c3c" />
        <StatCard label="Gross Sales (MTD)" value={formatPeso(grossSalesMTD)} href="/sales/reports" />
        <StatCard label="Expenses (MTD)" value={formatPeso(expensesMTD)} href="/sales/reports" valueColor="#e74c3c" />
        <StatCard label="Net Sales (MTD)" value={formatPeso(netSalesMTD)} href="/sales/reports" valueColor={netSalesMTD >= 0 ? '#2ecc71' : '#e74c3c'} />
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard
          label="Net Profit Margin (MTD)"
          value={netProfitMarginMTD === null ? '—' : `${netProfitMarginMTD.toFixed(1)}%`}
          sub="Net Sales ÷ Gross Sales"
          href="/sales/reports"
          valueColor={netProfitMarginMTD === null ? undefined : netProfitMarginMTD >= 0 ? '#2ecc71' : '#e74c3c'}
        />
        <StatCard
          label="Net Cash Flow (MTD)"
          value={formatPeso(netCashFlowMTD)}
          sub="Collections − Expenses"
          href="/sales/reports"
          valueColor={netCashFlowMTD >= 0 ? '#2ecc71' : '#e74c3c'}
        />
        <StatCard
          label="Accounts Receivable Days"
          value={arDays === null ? '—' : `${Math.round(arDays)} days`}
          sub={`${formatPeso(totalAR)} outstanding`}
          href="/jos/all"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) minmax(320px, 1.4fr)', gap: '1rem' }}>
        {/* Today's Overview donut */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #EDE0CC', padding: '1.25rem' }}>
          <div style={{ color: '#1a1a1a', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.75rem' }}>Today&apos;s Overview</div>
          {totalItems === 0 ? (
            <div style={{ color: '#aaa', textAlign: 'center', padding: '2.5rem 0', fontSize: '0.85rem' }}>No active items right now.</div>
          ) : (
            <>
              <div style={{ position: 'relative', height: 190 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={2}>
                      {donutData.map(d => <Cell key={d.key} fill={BUCKET_COLOR[d.key]} stroke="none" />)}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: '0.78rem', borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a' }}>{totalItems}</div>
                  <div style={{ fontSize: '0.68rem', color: '#999' }}>Items In Progress</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                {donutData.map(d => (
                  <div key={d.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ width: 9, height: 9, borderRadius: '50%', background: BUCKET_COLOR[d.key], display: 'inline-block' }} />
                      <span style={{ color: '#444' }}>{d.name}</span>
                    </div>
                    <span style={{ color: '#1a1a1a', fontWeight: 700 }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Recent Activities */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #EDE0CC', padding: '1.25rem' }}>
          <div style={{ color: '#1a1a1a', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.75rem' }}>Recent Activities</div>
          {activity.length === 0 ? (
            <div style={{ color: '#aaa', textAlign: 'center', padding: '2.5rem 0', fontSize: '0.85rem' }}>No recent activity.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {activity.map(a => (
                <div key={a.key} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: '50%', background: `${a.color}1a`, color: a.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0,
                  }}>{a.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#1a1a1a', fontSize: '0.82rem', fontWeight: 600 }}>{a.message}</div>
                    {a.sub && <div style={{ color: '#999', fontSize: '0.72rem' }}>{a.sub}</div>}
                  </div>
                  <div style={{ color: '#bbb', fontSize: '0.68rem', whiteSpace: 'nowrap' }}>{formatAge(a.timestamp)} ago</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Active Job Orders preview */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #EDE0CC', padding: '1.25rem', marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ color: '#1a1a1a', fontWeight: 700, fontSize: '0.95rem' }}>Active Job Orders</div>
          <Link href="/jos/active" style={{ color: '#7A1828', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
        </div>
        {previewRows.length === 0 ? (
          <div style={{ color: '#aaa', textAlign: 'center', padding: '2rem 0', fontSize: '0.85rem' }}>No active job orders.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ color: '#999', textAlign: 'left', borderBottom: '1px solid #EDE0CC' }}>
                  <th style={{ padding: '0.5rem 0.6rem', fontWeight: 600 }}>Job Order #</th>
                  <th style={{ padding: '0.5rem 0.6rem', fontWeight: 600 }}>Client</th>
                  <th style={{ padding: '0.5rem 0.6rem', fontWeight: 600 }}>Service</th>
                  <th style={{ padding: '0.5rem 0.6rem', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '0.5rem 0.6rem', fontWeight: 600 }}>Age</th>
                  <th style={{ padding: '0.5rem 0.6rem', fontWeight: 600, textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {previewRows.map(jo => {
                  const bucket = joBucket(jo)
                  const service = jo.job_order_items?.[0]?.subcategories?.subcategory_name || '—'
                  const extra = (jo.job_order_items?.length || 0) - 1
                  return (
                    <tr key={jo.job_order_id} style={{ borderBottom: '1px solid #f5efe4' }}>
                      <td style={{ padding: '0.6rem', color: '#1a1a1a', fontWeight: 600 }}>{jo.job_order_id}</td>
                      <td style={{ padding: '0.6rem', color: '#444' }}>{clientLabel(jo.clients)}</td>
                      <td style={{ padding: '0.6rem', color: '#444' }}>{service}{extra > 0 ? ` +${extra} more` : ''}</td>
                      <td style={{ padding: '0.6rem' }}>
                        <span style={{ background: `${BUCKET_COLOR[bucket]}1a`, color: BUCKET_COLOR[bucket], fontWeight: 700, fontSize: '0.72rem', padding: '0.2rem 0.55rem', borderRadius: 999 }}>
                          {BUCKET_LABEL[bucket]}
                        </span>
                      </td>
                      <td style={{ padding: '0.6rem', color: '#777' }}>{formatAge(jo.date_time_received)}</td>
                      <td style={{ padding: '0.6rem', color: '#1a1a1a', fontWeight: 600, textAlign: 'right' }}>{formatPeso(jo.grand_total || 0)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
