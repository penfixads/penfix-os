'use client'

import { useState } from 'react'
import { formatPeso } from '@/lib/jo-helpers'
import type { AppUser } from '@/lib/user'

interface Props {
  jobOrders: any[]
  currentUser: AppUser
}

const STATUS_COLORS: Record<string, string> = {
  'Pending Payment': '#e67e22',
  'Below 50% Downpayment': '#e74c3c',
  'Downpayment Received': '#2980b9',
  'Fully Paid': '#27ae60',
  'For Billing': '#8e44ad',
}

export default function ActiveJOsClient({ jobOrders, currentUser }: Props) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = jobOrders.filter(jo => {
    const client = jo.clients?.client_name || jo.clients?.company_name || ''
    const q = search.toLowerCase()
    const matchSearch = client.toLowerCase().includes(q) || jo.job_order_id.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || jo.payment_status === statusFilter
    return matchSearch && matchStatus
  })

  const statuses = ['all', ...Array.from(new Set(jobOrders.map(j => j.payment_status).filter(Boolean)))]

  const totalGrand = filtered.reduce((s, j) => s + (j.grand_total || 0), 0)
  const totalBalance = filtered.reduce((s, j) => s + (j.balance_due || 0), 0)

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ color: '#1a1a1a', fontSize: '1.4rem', fontWeight: 700 }}>Active Job Orders</h1>
        <p style={{ color: '#777', fontSize: '0.8rem', marginTop: 2 }}>{filtered.length} active JO(s)</p>
      </div>

      {/* Stat bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: '1.25rem' }}>
        {[
          { label: 'Total JOs', value: filtered.length },
          { label: 'Total Grand Total', value: formatPeso(totalGrand) },
          { label: 'Total Balance Due', value: formatPeso(totalBalance), warn: totalBalance > 0 },
        ].map(stat => (
          <div key={stat.label} style={{ background: '#f5f5f5', borderRadius: 10, padding: '0.75rem 1rem', border: '1px solid #ebebeb' }}>
            <div style={{ color: '#999', fontSize: '0.7rem', marginBottom: 4 }}>{stat.label}</div>
            <div style={{ color: stat.warn ? '#e74c3c' : '#fff', fontWeight: 700, fontSize: '1rem' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search client or JO ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ background: '#f5f5f5', border: '1.5px solid #d0d0d0', borderRadius: 8, padding: '0.5rem 0.85rem', color: '#1a1a1a', fontSize: '0.82rem', flex: 1, minWidth: 180, outline: 'none' }}
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ background: '#f5f5f5', border: '1.5px solid #d0d0d0', borderRadius: 8, padding: '0.5rem 0.75rem', color: '#1a1a1a', fontSize: '0.82rem', outline: 'none' }}
        >
          {statuses.map(s => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s}</option>)}
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div style={{ color: '#aaa', textAlign: 'center', marginTop: '3rem', fontSize: '0.9rem' }}>No active job orders found.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {filtered.map(jo => {
            const clientName = jo.clients?.client_name || jo.clients?.company_name || jo.client_id
            const items = jo.job_order_items || []
            const nearestDeadline = items
              .map((i: any) => i.date_time_needed)
              .filter(Boolean)
              .sort()[0]
            const isOverdue = nearestDeadline && new Date(nearestDeadline) < new Date()
            const statusColor = STATUS_COLORS[jo.payment_status] || '#555'

            return (
              <div key={jo.job_order_id} style={{ background: '#f5f5f5', borderRadius: 10, padding: '0.85rem 1rem', border: `1px solid ${isOverdue ? '#3a0000' : '#2a2a2a'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#1a1a1a', fontWeight: 700, fontSize: '0.9rem' }}>{clientName}</div>
                    <div style={{ color: '#999', fontSize: '0.72rem', marginTop: 1 }}>{jo.job_order_id} · {items.length} item(s) · by {jo.received_by || '—'}</div>
                    <div style={{ color: '#777', fontSize: '0.73rem', marginTop: 2 }}>
                      Received: {new Date(jo.date_time_received).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {nearestDeadline && (
                      <div style={{ color: isOverdue ? '#e74c3c' : '#f39c12', fontSize: '0.72rem', marginTop: 2, fontWeight: isOverdue ? 700 : 400 }}>
                        {isOverdue ? '⚠ OVERDUE' : 'Deadline'}: {new Date(nearestDeadline).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                    {/* Item statuses */}
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                      {items.slice(0, 4).map((item: any) => (
                        <span key={item.item_id} style={{ background: '#f0f0f0', color: '#999', fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: 10 }}>
                          {item.subcategories?.subcategory_name || item.item_id} · {item.job_status}
                        </span>
                      ))}
                      {items.length > 4 && <span style={{ color: '#aaa', fontSize: '0.65rem' }}>+{items.length - 4} more</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ color: '#1a1a1a', fontWeight: 700, fontSize: '0.9rem' }}>{formatPeso(jo.grand_total || 0)}</div>
                    <div style={{ color: (jo.balance_due || 0) > 0 ? '#e74c3c' : '#2ecc71', fontSize: '0.75rem' }}>
                      Bal: {formatPeso(jo.balance_due || 0)}
                    </div>
                    <div style={{ marginTop: 4, padding: '0.2rem 0.55rem', borderRadius: 12, background: statusColor + '22', color: statusColor, fontSize: '0.66rem', fontWeight: 700 }}>
                      {jo.payment_status}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
