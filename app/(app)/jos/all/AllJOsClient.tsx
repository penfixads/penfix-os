'use client'

import { useState } from 'react'
import { formatPeso, buildFeedbackUrl, getPhilippineDateStr, fuzzyMatch } from '@/lib/jo-helpers'
import type { AppUser } from '@/lib/user'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import Pagination from '@/components/Pagination'

const PAGE_SIZE = 10

interface Props { jobOrders: any[]; currentUser: AppUser }

function isJODone(jo: any): boolean {
  const items = jo.job_order_items || []
  return items.length > 0 && items.every((i: any) => i.job_status === 'Done' || i.job_status === 'Cancelled')
}

export default function AllJOsClient({ jobOrders: initialJobOrders, currentUser }: Props) {
  const [jobOrders, setJobOrders] = useState(initialJobOrders)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const toggleExpand = (joId: string) => setExpanded(prev => ({ ...prev, [joId]: !prev[joId] }))
  const [page, setPage] = useState(1)

  const statuses = ['all', 'Done', ...Array.from(new Set(jobOrders.map(j => j.payment_status).filter(Boolean)))]

  const filtered = jobOrders.filter(jo => {
    const client = jo.clients?.client_name || jo.clients?.company_name || ''
    const matchSearch = !search || fuzzyMatch(client, search) || fuzzyMatch(jo.job_order_id, search) || fuzzyMatch(jo.received_by || '', search)
    const matchStatus = statusFilter === 'all' || (statusFilter === 'Done' ? isJODone(jo) : jo.payment_status === statusFilter)
    const d = jo.date_time_received ? getPhilippineDateStr(new Date(jo.date_time_received)) : undefined
    const matchFrom = !dateFrom || d >= dateFrom
    const matchTo = !dateTo || d <= dateTo
    return matchSearch && matchStatus && matchFrom && matchTo
  })

  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)))
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const totalGrand = filtered.reduce((s, j) => s + (j.grand_total || 0), 0)
  const totalPaid = filtered.reduce((s, j) => s + (j.total_amount_paid || 0), 0)
  const totalBal = filtered.reduce((s, j) => s + (j.balance_due || 0), 0)

  function copyTrackLink(joId: string) {
    const url = `${window.location.origin}/track/${joId}`
    navigator.clipboard.writeText(url)
  }

  function markFeedbackRequested(joId: string) {
    setJobOrders(prev => prev.map(j => j.job_order_id === joId ? { ...j, feedback_requested_at: new Date().toISOString() } : j))
  }

  async function copyFeedbackLink(joId: string, clientName: string) {
    const url = buildFeedbackUrl(window.location.origin, joId, clientName)
    navigator.clipboard.writeText(url)
    const supabase = createSupabaseBrowserClient()
    await supabase.from('job_orders').update({ feedback_requested_at: new Date().toISOString() }).eq('job_order_id', joId)
    markFeedbackRequested(joId)
    alert('Feedback link copied — paste it into Messenger, Viber, or wherever the client prefers.')
  }

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ color: '#7A1828', fontSize: '1.4rem', fontWeight: 700 }}>All Job Orders</h1>
        <p style={{ color: '#777', fontSize: '0.8rem', marginTop: 2 }}>{filtered.length} of {jobOrders.length} JOs shown</p>
      </div>

      {/* Stats — hidden for GA so they focus on the list instead of the aggregate totals */}
      {currentUser.role !== 'GA' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, marginBottom: '1rem' }}>
          {[
            { label: 'JOs', value: filtered.length },
            { label: 'Grand Total', value: formatPeso(totalGrand) },
            { label: 'Total Paid', value: formatPeso(totalPaid) },
            { label: 'Balance Due', value: formatPeso(totalBal), warn: totalBal > 0 },
          ].map(c => (
            <div key={c.label} style={{ background: '#FDF5EC', borderRadius: 10, padding: '0.65rem 0.85rem', border: '1px solid #EDE0CC' }}>
              <div style={{ color: '#aaa', fontSize: '0.65rem' }}>{c.label}</div>
              <div style={{ color: c.warn ? '#e74c3c' : '#333', fontWeight: 700, fontSize: '0.9rem' }}>{c.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input type="text" placeholder="Search client, JO ID, GA…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
          style={inp} />
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} style={{ ...inp, flex: 'none', width: 'auto' }}>
          {statuses.map(s => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s}</option>)}
        </select>
        <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1) }} style={{ ...inp, flex: 'none', width: 'auto' }} />
        <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1) }} style={{ ...inp, flex: 'none', width: 'auto' }} />
      </div>

      {/* Table-style list */}
      {filtered.length === 0 ? (
        <div style={{ color: '#aaa', textAlign: 'center', marginTop: '3rem' }}>No job orders match your filters.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {pageItems.map(jo => {
            const clientName = jo.clients?.client_name || jo.clients?.company_name || jo.client_id
            const items = jo.job_order_items || []
            const allDone = isJODone(jo)
            const hasBalance = (jo.balance_due || 0) > 0

            const isOpen = !!expanded[jo.job_order_id]

            return (
              <div key={jo.job_order_id} style={{ background: '#FDF5EC', borderRadius: 10, border: '1px solid #EDE0CC', overflow: 'hidden' }}>
                <div style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <button onClick={() => toggleExpand(jo.job_order_id)} title="Show who did what, per SOP step"
                    style={{ background: 'none', border: 'none', color: '#7A1828', cursor: 'pointer', fontSize: '0.75rem', padding: 2, flexShrink: 0 }}>
                    {isOpen ? '▼' : '▶'}
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: '#1a1a1a', fontWeight: 700, fontSize: '0.85rem' }}>{clientName}</span>
                      {allDone && <span style={{ background: '#1a4a1a', color: '#2ecc71', fontSize: '0.6rem', padding: '0.1rem 0.4rem', borderRadius: 10, fontWeight: 700 }}>DONE</span>}
                      {allDone && !jo.feedback_requested_at && (
                        <button
                          onClick={() => copyFeedbackLink(jo.job_order_id, clientName)}
                          title="Copy the feedback link to paste into Messenger, Viber, etc."
                          style={{ background: '#4a3a1a', color: '#f39c12', fontSize: '0.6rem', padding: '0.1rem 0.4rem', borderRadius: 10, fontWeight: 700, border: 'none', cursor: 'pointer' }}
                        >
                          FEEDBACK PENDING
                        </button>
                      )}
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
                    title="Send tracking link to be pasted on social media platform"
                    style={{ background: '#f0f0f0', border: '1px solid #d0d0d0', color: '#666', borderRadius: 7, padding: '0.35rem 0.6rem', cursor: 'pointer', fontSize: '0.72rem', flexShrink: 0 }}
                  >
                    🔗
                  </button>
                  {allDone && (
                    <button
                      onClick={() => copyFeedbackLink(jo.job_order_id, clientName)}
                      title="Send feedback link to be pasted on social media platform"
                      style={{ background: '#f0f0f0', border: '1px solid #d0d0d0', color: '#666', borderRadius: 7, padding: '0.35rem 0.6rem', cursor: 'pointer', fontSize: '0.72rem', flexShrink: 0 }}
                    >
                      📋
                    </button>
                  )}
                </div>

                {isOpen && (
                  <div style={{ borderTop: '1px solid #EDE0CC', padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {items.length === 0 ? (
                      <div style={{ color: '#aaa', fontSize: '0.8rem' }}>No items on this job order.</div>
                    ) : items.map((item: any) => {
                      const log = [...(item.job_order_item_status_log || [])].sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                      return (
                        <div key={item.item_id}>
                          <div style={{ color: '#1a1a1a', fontWeight: 600, fontSize: '0.8rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                            {item.subcategories?.subcategory_name || item.item_id}
                            <span style={{ color: '#999', fontWeight: 400, marginLeft: 6 }}>· Qty {item.quantity || 1} · currently {item.job_status}</span>
                            {allDone && !jo.feedback_requested_at && (
                              <button
                                onClick={() => copyFeedbackLink(jo.job_order_id, clientName)}
                                title="Copy the feedback link to paste into Messenger, Viber, etc."
                                style={{ background: 'none', border: 'none', color: '#e74c3c', fontWeight: 700, fontSize: '0.72rem', marginLeft: 8, cursor: 'pointer', padding: 0 }}
                              >
                                ⚠ Feedback Pending
                              </button>
                            )}
                          </div>
                          {log.length === 0 ? (
                            <div style={{ color: '#aaa', fontSize: '0.75rem', marginTop: 2, marginLeft: 4 }}>No step history recorded yet.</div>
                          ) : (
                            <div style={{ marginTop: 4, marginLeft: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
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
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Pagination page={currentPage} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
    </div>
  )
}

const inp: React.CSSProperties = { flex: 1, minWidth: 140, background: '#FDF5EC', border: '1.5px solid #d0d0d0', borderRadius: 8, padding: '0.5rem 0.75rem', color: '#1a1a1a', fontSize: '0.82rem', outline: 'none' }
