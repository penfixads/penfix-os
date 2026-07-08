'use client'

import { useState } from 'react'
import { getPhilippineDateStr, fuzzyMatch } from '@/lib/jo-helpers'
import Pagination from '@/components/Pagination'

const PAGE_SIZE = 10

interface Props { jobOrders: any[] }

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function DailyRecordClient({ jobOrders }: Props) {
  const [date, setDate] = useState(todayStr())
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [page, setPage] = useState(1)

  const filtered = jobOrders.filter(jo => {
    const d = jo.date_time_received ? getPhilippineDateStr(new Date(jo.date_time_received)) : undefined
    const matchDate = !date || d === date
    const client = jo.clients?.client_name || jo.clients?.company_name || ''
    const matchSearch = !search || fuzzyMatch(client, search) || fuzzyMatch(jo.job_order_id, search) || fuzzyMatch(jo.received_by || '', search)
    return matchDate && matchSearch
  })

  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)))
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const toggle = (joId: string) => setExpanded(prev => ({ ...prev, [joId]: !prev[joId] }))

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ color: '#7A1828', fontSize: '1.4rem', fontWeight: 700 }}>Daily Job Order Record</h1>
        <p style={{ color: '#777', fontSize: '0.8rem', marginTop: 2 }}>Who did what, on every SOP step, for accountability and tracing issues back to source</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input type="date" value={date} onChange={e => { setDate(e.target.value); setPage(1) }}
          style={{ background: '#FDF5EC', border: '1.5px solid #d0d0d0', borderRadius: 8, padding: '0.5rem 0.75rem', color: '#1a1a1a', fontSize: '0.82rem', outline: 'none' }} />
        {date && (
          <button onClick={() => { setDate(''); setPage(1) }} style={{ background: '#f0f0f0', border: '1px solid #d0d0d0', borderRadius: 8, padding: '0.5rem 0.75rem', color: '#666', fontSize: '0.78rem', cursor: 'pointer' }}>
            Show all dates
          </button>
        )}
        <input type="text" placeholder="Search client, JO ID, GA…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
          style={{ flex: 1, minWidth: 180, background: '#FDF5EC', border: '1.5px solid #d0d0d0', borderRadius: 8, padding: '0.5rem 0.75rem', color: '#1a1a1a', fontSize: '0.82rem', outline: 'none' }} />
      </div>

      <p style={{ color: '#999', fontSize: '0.75rem', marginBottom: '0.75rem' }}>{filtered.length} job order(s) {date ? `on ${date}` : 'shown'}</p>

      {filtered.length === 0 ? (
        <div style={{ color: '#aaa', textAlign: 'center', marginTop: '3rem' }}>No job orders match.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {pageItems.map(jo => {
            const clientName = jo.clients?.client_name || jo.clients?.company_name || jo.job_order_id
            const items = jo.job_order_items || []
            const isOpen = !!expanded[jo.job_order_id]
            const totalSteps = items.reduce((s: number, i: any) => s + (i.job_order_item_status_log?.length || 0), 0)

            return (
              <div key={jo.job_order_id} style={{ background: '#FDF5EC', borderRadius: 10, border: '1px solid #EDE0CC', overflow: 'hidden' }}>
                <button
                  onClick={() => toggle(jo.job_order_id)}
                  style={{ width: '100%', background: 'none', border: 'none', padding: '0.85rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', textAlign: 'left' }}
                >
                  <div>
                    <div style={{ color: '#1a1a1a', fontWeight: 700, fontSize: '0.88rem' }}>{clientName}</div>
                    <div style={{ color: '#999', fontSize: '0.7rem', marginTop: 1 }}>
                      {jo.job_order_id} · {items.length} item(s) · by {jo.received_by || '—'} · {totalSteps} step(s) logged
                    </div>
                  </div>
                  <span style={{ color: '#7A1828', fontSize: '0.8rem' }}>{isOpen ? '▼' : '▶'}</span>
                </button>

                {isOpen && (
                  <div style={{ borderTop: '1px solid #EDE0CC', padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {items.length === 0 ? (
                      <div style={{ color: '#aaa', fontSize: '0.8rem' }}>No items on this job order.</div>
                    ) : items.map((item: any) => {
                      const log = [...(item.job_order_item_status_log || [])].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                      return (
                        <div key={item.item_id}>
                          <div style={{ color: '#1a1a1a', fontWeight: 600, fontSize: '0.8rem' }}>
                            {item.subcategories?.subcategory_name || item.item_id}
                            <span style={{ color: '#999', fontWeight: 400, marginLeft: 6 }}>· Qty {item.quantity || 1} · currently {item.job_status}</span>
                          </div>
                          {log.length === 0 ? (
                            <div style={{ color: '#aaa', fontSize: '0.75rem', marginTop: 2, marginLeft: 4 }}>No step history recorded yet.</div>
                          ) : (
                            <div style={{ marginTop: 4, marginLeft: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
                              {log.map((entry: any, i: number) => (
                                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'baseline', fontSize: '0.75rem' }}>
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
