'use client'

import { useState } from 'react'
import { formatPeso } from '@/lib/jo-helpers'
import type { AppUser } from '@/lib/user'

interface Props { jobOrders: any[]; currentUser: AppUser }

export default function AllJOsClient({ jobOrders }: Props) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const statuses = ['all', ...Array.from(new Set(jobOrders.map(j => j.payment_status).filter(Boolean)))]

  const filtered = jobOrders.filter(jo => {
    const client = jo.clients?.client_name || jo.clients?.company_name || ''
    const q = search.toLowerCase()
    const matchSearch = !q || client.toLowerCase().includes(q) || jo.job_order_id.toLowerCase().includes(q) || (jo.received_by || '').toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || jo.payment_status === statusFilter
    const d = jo.date_time_received?.split('T')[0]
    const matchFrom = !dateFrom || d >= dateFrom
    const matchTo = !dateTo || d <= dateTo
    return matchSearch && matchStatus && matchFrom && matchTo
  })

  const totalGrand = filtered.reduce((s, j) => s + (j.grand_total || 0), 0)
  const totalBal = filtered.reduce((s, j) => s + (j.balance_due || 0), 0)

  function copyTrackLink(joId: string) {
    const url = `${window.location.origin}/track/${joId}`
    navigator.clipboard.writeText(url)
  }

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ color: '#7A1828', fontSize: '1.4rem', fontWeight: 700 }}>All Job Orders</h1>
        <p style={{ color: '#777', fontSize: '0.8rem', marginTop: 2 }}>{filtered.length} of {jobOrders.length} JOs shown</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: '1rem' }}>
        {[
          { label: 'JOs', value: filtered.length },
          { label: 'Grand Total', value: formatPeso(totalGrand) },
          { label: 'Balance Due', value: formatPeso(totalBal), warn: totalBal > 0 },
        ].map(c => (
          <div key={c.label} style={{ background: '#FDF5EC', borderRadius: 10, padding: '0.65rem 0.85rem', border: '1px solid #EDE0CC' }}>
            <div style={{ color: '#aaa', fontSize: '0.65rem' }}>{c.label}</div>
            <div style={{ color: c.warn ? '#e74c3c' : '#fff', fontWeight: 700, fontSize: '0.9rem' }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input type="text" placeholder="Search client, JO ID, GA…" value={search} onChange={e => setSearch(e.target.value)}
          style={inp} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ ...inp, flex: 'none', width: 'auto' }}>
          {statuses.map(s => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s}</option>)}
        </select>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ ...inp, flex: 'none', width: 'auto' }} />
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ ...inp, flex: 'none', width: 'auto' }} />
      </div>

      {/* Table-style list */}
      {filtered.length === 0 ? (
        <div style={{ color: '#aaa', textAlign: 'center', marginTop: '3rem' }}>No job orders match your filters.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {filtered.map(jo => {
            const clientName = jo.clients?.client_name || jo.clients?.company_name || jo.client_id
            const items = jo.job_order_items || []
            const allDone = items.length > 0 && items.every((i: any) => i.job_status === 'Done' || i.job_status === 'Cancelled')
            const hasBalance = (jo.balance_due || 0) > 0

            return (
              <div key={jo.job_order_id} style={{ background: '#FDF5EC', borderRadius: 10, padding: '0.75rem 1rem', border: '1px solid #EDE0CC', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#1a1a1a', fontWeight: 700, fontSize: '0.85rem' }}>{clientName}</span>
                    {allDone && <span style={{ background: '#1a4a1a', color: '#2ecc71', fontSize: '0.6rem', padding: '0.1rem 0.4rem', borderRadius: 10, fontWeight: 700 }}>DONE</span>}
                    {jo.is_for_billing && <span style={{ background: '#2a1a4a', color: '#9b59b6', fontSize: '0.6rem', padding: '0.1rem 0.4rem', borderRadius: 10, fontWeight: 700 }}>BILLING</span>}
                  </div>
                  <div style={{ color: '#aaa', fontSize: '0.68rem', marginTop: 1 }}>
                    {jo.job_order_id} · {new Date(jo.date_time_received).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })} · {jo.received_by || '—'}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ color: '#1a1a1a', fontWeight: 700, fontSize: '0.85rem' }}>{formatPeso(jo.grand_total || 0)}</div>
                  <div style={{ color: hasBalance ? '#e74c3c' : '#2ecc71', fontSize: '0.7rem' }}>Bal: {formatPeso(jo.balance_due || 0)}</div>
                </div>
                <button
                  onClick={() => copyTrackLink(jo.job_order_id)}
                  title="Copy tracking link"
                  style={{ background: '#f0f0f0', border: '1px solid #d0d0d0', color: '#666', borderRadius: 7, padding: '0.35rem 0.6rem', cursor: 'pointer', fontSize: '0.72rem', flexShrink: 0 }}
                >
                  🔗
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const inp: React.CSSProperties = { flex: 1, minWidth: 140, background: '#FDF5EC', border: '1.5px solid #d0d0d0', borderRadius: 8, padding: '0.5rem 0.75rem', color: '#1a1a1a', fontSize: '0.82rem', outline: 'none' }
