'use client'

import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { formatPeso } from '@/lib/jo-helpers'
import type { AppUser } from '@/lib/user'
import EditJOModal from '@/components/EditJOModal'

interface Props {
  jobOrders: any[]
  categories: any[]
  subcategories: any[]
  currentUser: AppUser
}

const STATUS_COLORS: Record<string, string> = {
  'Pending Payment': '#e67e22',
  'Below 50% Downpayment': '#e74c3c',
  'Downpayment Received': '#2980b9',
  'Fully Paid': '#27ae60',
  'For Billing': '#8e44ad',
}

export default function ActiveJOsClient({ jobOrders: initialJOs, categories, subcategories, currentUser }: Props) {
  const [jobOrders, setJobOrders] = useState(initialJOs)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editingJO, setEditingJO] = useState<any | null>(null)

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

  async function handleDelete(joId: string) {
    if (!confirm(`Delete job order ${joId}? This cannot be undone.`)) return
    const supabase = createSupabaseBrowserClient()
    await supabase.from('job_orders').delete().eq('job_order_id', joId)
    setJobOrders(prev => prev.filter(j => j.job_order_id !== joId))
  }

  function handleEditSave(joId: string, updates: any) {
    setJobOrders(prev => prev.map(j => j.job_order_id !== joId ? j : { ...j, ...updates }))
  }

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ color: '#7A1828', fontSize: '1.4rem', fontWeight: 700 }}>Active Job Orders</h1>
        <p style={{ color: '#777', fontSize: '0.8rem', marginTop: 2 }}>{filtered.length} active JO(s)</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: '1.25rem' }}>
        {[
          { label: 'Total JOs', value: filtered.length },
          { label: 'Total Grand Total', value: formatPeso(totalGrand) },
          { label: 'Total Balance Due', value: formatPeso(totalBalance), warn: totalBalance > 0 },
        ].map(stat => (
          <div key={stat.label} style={{ background: '#FDF5EC', borderRadius: 10, padding: '0.75rem 1rem', border: '1px solid #EDE0CC' }}>
            <div style={{ color: '#999', fontSize: '0.7rem', marginBottom: 4 }}>{stat.label}</div>
            <div style={{ color: stat.warn ? '#e74c3c' : '#333', fontWeight: 700, fontSize: '1rem' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search client or JO ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ background: '#FDF5EC', border: '1.5px solid #d0d0d0', borderRadius: 8, padding: '0.5rem 0.85rem', color: '#1a1a1a', fontSize: '0.82rem', flex: 1, minWidth: 180, outline: 'none' }}
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
        <div style={{ color: '#aaa', textAlign: 'center', marginTop: '3rem', fontSize: '0.9rem' }}>No active job orders found.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {filtered.map(jo => {
            const clientName = jo.clients?.client_name || jo.clients?.company_name || jo.client_id
            const items = jo.job_order_items || []
            const nearestDeadline = items.map((i: any) => i.date_time_needed).filter(Boolean).sort()[0]
            const isOverdue = nearestDeadline && new Date(nearestDeadline) < new Date()
            const statusColor = STATUS_COLORS[jo.payment_status] || '#555'

            return (
              <div key={jo.job_order_id} style={{ background: '#FDF5EC', borderRadius: 10, padding: '0.85rem 1rem', border: `1px solid ${isOverdue ? '#c0392b' : '#EDE0CC'}`, borderLeft: isOverdue ? '4px solid #e74c3c' : '1px solid #EDE0CC' }}>
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
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                      {items.slice(0, 4).map((item: any) => (
                        <span key={item.item_id} style={{ background: '#f0f0f0', color: '#999', fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: 10 }}>
                          {item.subcategories?.subcategory_name || item.item_id} · {item.job_status}
                        </span>
                      ))}
                      {items.length > 4 && <span style={{ color: '#aaa', fontSize: '0.65rem' }}>+{items.length - 4} more</span>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flexShrink: 0 }}>
                    {/* Edit / Delete icons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 2 }}>
                      <button title="Edit JO" onClick={() => setEditingJO(jo)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A1828', padding: 2, display: 'flex', alignItems: 'center' }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button title="Delete JO" onClick={() => handleDelete(jo.job_order_id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c', padding: 2, display: 'flex', alignItems: 'center' }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                      </button>
                    </div>

                    <div style={{ textAlign: 'right' }}>
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
              </div>
            )
          })}
        </div>
      )}

      {editingJO && (
        <EditJOModal
          jo={editingJO}
          categories={categories}
          subcategories={subcategories}
          currentUser={currentUser}
          onClose={() => setEditingJO(null)}
          onSave={handleEditSave}
        />
      )}
    </div>
  )
}
