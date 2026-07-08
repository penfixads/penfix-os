'use client'

import { useState } from 'react'
import { formatPeso, fuzzyMatch } from '@/lib/jo-helpers'
import type { AppUser } from '@/lib/user'

interface Props { items: any[]; currentUser: AppUser }

const STATUS_COLORS: Record<string, string> = {
  'Received': '#e67e22',
  'For Layout/Vectoring': '#2980b9',
  'For Production': '#8e44ad',
  'Ready For Pickup/Delivery/Installation': '#16a085',
  'Done': '#27ae60',
  'Cancelled': '#7f8c8d',
}

const PRIORITY_COLORS: Record<string, string> = {
  LOW: '#7f8c8d',
  HIGH: '#e67e22',
  URGENT: '#e74c3c',
}

export default function ItemsClient({ items, currentUser }: Props) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const toggleExpand = (itemId: string) => setExpanded(prev => ({ ...prev, [itemId]: !prev[itemId] }))

  const statuses = ['all', ...Array.from(new Set(items.map(i => i.job_status).filter(Boolean)))]

  const filtered = items.filter(item => {
    const jo = item.job_orders
    const client = jo?.clients?.client_name || jo?.clients?.company_name || ''
    const matchSearch = !search ||
      fuzzyMatch(client, search) ||
      fuzzyMatch(item.job_order_id || '', search) ||
      fuzzyMatch(item.subcategories?.subcategory_name || '', search) ||
      fuzzyMatch(jo?.received_by || '', search)
    const matchStatus = statusFilter === 'all' || item.job_status === statusFilter
    return matchSearch && matchStatus
  })

  const totalValue = filtered.reduce((s, i) => s + (i.computed_line_total || 0), 0)

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ color: '#7A1828', fontSize: '1.4rem', fontWeight: 700 }}>All Job Order Items</h1>
        <p style={{ color: '#777', fontSize: '0.8rem', marginTop: 2 }}>{filtered.length} of {items.length} item(s) shown</p>
      </div>

      {currentUser.role !== 'GA' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, marginBottom: '1rem' }}>
          {[
            { label: 'Items', value: filtered.length },
            { label: 'Total Value', value: formatPeso(totalValue) },
          ].map(c => (
            <div key={c.label} style={{ background: '#FDF5EC', borderRadius: 10, padding: '0.65rem 0.85rem', border: '1px solid #EDE0CC' }}>
              <div style={{ color: '#aaa', fontSize: '0.65rem' }}>{c.label}</div>
              <div style={{ color: '#333', fontWeight: 700, fontSize: '0.9rem' }}>{c.value}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search client, JO ID, item, GA…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 180, background: '#FDF5EC', border: '1.5px solid #d0d0d0', borderRadius: 8, padding: '0.5rem 0.75rem', color: '#1a1a1a', fontSize: '0.82rem', outline: 'none' }}
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ background: '#FDF5EC', border: '1.5px solid #d0d0d0', borderRadius: 8, padding: '0.5rem 0.75rem', color: '#1a1a1a', fontSize: '0.82rem', outline: 'none' }}
        >
          {statuses.map(s => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div style={{ color: '#aaa', textAlign: 'center', marginTop: '3rem' }}>No job order items match your filters.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {filtered.map(item => {
            const jo = item.job_orders
            const clientName = jo?.clients?.client_name || jo?.clients?.company_name || '—'
            const statusColor = STATUS_COLORS[item.job_status] || '#555'
            const priorityColor = PRIORITY_COLORS[item.priority] || '#999'

            const isOpen = !!expanded[item.item_id]
            const log = [...(item.job_order_item_status_log || [])].sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

            return (
              <div key={item.item_id} style={{ background: '#FDF5EC', borderRadius: 10, border: '1px solid #EDE0CC', overflow: 'hidden' }}>
                <div style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <button onClick={() => toggleExpand(item.item_id)} title="Show who did what, per SOP step"
                    style={{ background: 'none', border: 'none', color: '#7A1828', cursor: 'pointer', fontSize: '0.75rem', padding: 2, flexShrink: 0 }}>
                    {isOpen ? '▼' : '▶'}
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ color: '#1a1a1a', fontWeight: 700, fontSize: '0.85rem' }}>{item.subcategories?.subcategory_name || item.item_id}</span>
                      {item.priority && <span style={{ background: priorityColor + '22', color: priorityColor, fontSize: '0.6rem', padding: '0.1rem 0.4rem', borderRadius: 10, fontWeight: 700 }}>{item.priority}</span>}
                    </div>
                    <div style={{ color: '#aaa', fontSize: '0.68rem', marginTop: 1 }}>
                      {item.item_id} · {item.job_order_id} · {clientName} · Qty {item.quantity || 1} · by {jo?.received_by || '—'}
                    </div>
                    {item.production_specs && (
                      <div style={{ color: '#999', fontSize: '0.7rem', marginTop: 2 }}>{item.production_specs}</div>
                    )}
                    {item.date_time_needed && (
                      <div style={{ color: '#999', fontSize: '0.7rem', marginTop: 2 }}>
                        Needed: {new Date(item.date_time_needed).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ color: '#1a1a1a', fontWeight: 700, fontSize: '0.85rem' }}>{formatPeso(item.computed_line_total || 0)}</div>
                    <div style={{ marginTop: 4, padding: '0.2rem 0.55rem', borderRadius: 12, background: statusColor + '22', color: statusColor, fontSize: '0.66rem', fontWeight: 700 }}>
                      {item.job_status}
                    </div>
                  </div>
                </div>

                {isOpen && (
                  <div style={{ borderTop: '1px solid #EDE0CC', padding: '0.6rem 1rem' }}>
                    {log.length === 0 ? (
                      <div style={{ color: '#aaa', fontSize: '0.75rem' }}>No step history recorded yet.</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {log.map((entry: any, i: number) => (
                          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'baseline', fontSize: '0.75rem', flexWrap: 'wrap' }}>
                            <span style={{ color: '#7A1828', fontWeight: 600, minWidth: 140 }}>{entry.status_name}</span>
                            <span style={{ color: '#555' }}>{entry.changed_by_name || entry.changed_by_email || '—'}</span>
                            {entry.changed_by_role && <span style={{ color: '#aaa' }}>({entry.changed_by_role})</span>}
                            <span style={{ color: '#aaa', marginLeft: 'auto' }}>
                              {new Date(entry.created_at).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
