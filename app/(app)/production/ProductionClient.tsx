'use client'

import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { formatPeso } from '@/lib/jo-helpers'
import type { AppUser } from '@/lib/user'

interface Props {
  items: any[]
  sopSteps: any[]
  currentUser: AppUser
}

const STATUS_COLORS: Record<string, string> = {
  'Received': '#555',
  'For Layout': '#2980b9',
  'For Client Review': '#8e44ad',
  'Revision': '#e67e22',
  'Approved': '#27ae60',
  'For Printing': '#2980b9',
  'Drying / Curing': '#16a085',
  'For Finishing': '#e67e22',
  'Ready for Pickup': '#27ae60',
  'Ready for Installation': '#27ae60',
  'Done': '#27ae60',
  'Scheduled': '#8e44ad',
  'En Route': '#e67e22',
  'In Progress': '#2980b9',
  'Quality Check': '#e67e22',
  'For Cutting': '#2980b9',
  'For Assembly': '#16a085',
  'For Fabrication': '#2980b9',
  'Electrical / Lighting': '#e67e22',
  'For Artwork': '#8e44ad',
  'For Sourcing': '#2980b9',
  'For Production': '#2980b9',
  'Assembly': '#16a085',
  'Sent to Supplier': '#555',
  'In Supplier Production': '#2980b9',
  'Received from Supplier': '#16a085',
  'Sent for Approval': '#8e44ad',
  'Client Reviewing': '#e67e22',
  'Revision Requested': '#c0392b',
  'For Lamination': '#16a085',
  'Materials & Tools Preparation': '#555',
}

const URGENCY_GROUPS = [
  { key: 'overdue',  label: '🔴 Overdue',    color: '#c0392b', bg: '#2a0a0a', border: '#7A1828' },
  { key: 'today',   label: '🟠 Due Today',   color: '#e67e22', bg: '#2a1a00', border: '#c0782b' },
  { key: 'week',    label: '🟡 This Week',   color: '#f1c40f', bg: '#2a2a00', border: '#8a7a00' },
  { key: 'upcoming',label: '🟢 Upcoming',    color: '#2ecc71', bg: '#0a2a0a', border: '#1a6a1a' },
  { key: 'none',    label: '⬜ No Deadline', color: '#aaa',    bg: '#2a2a2a', border: '#444'    },
]

function getUrgencyKey(dateStr: string | null): string {
  if (!dateStr) return 'none'
  const deadline = new Date(dateStr)
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayEnd   = new Date(todayStart.getTime() + 86400000)
  const weekEnd    = new Date(todayStart.getTime() + 7 * 86400000)
  if (deadline < todayStart) return 'overdue'
  if (deadline < todayEnd)   return 'today'
  if (deadline < weekEnd)    return 'week'
  return 'upcoming'
}

function formatDeadline(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleString('en-PH', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function canPushToProduction(jo: any): boolean {
  if (!jo) return false
  if (jo.is_for_billing) return true
  if (jo.payment_status === 'Fully Paid' || jo.payment_status === 'Downpayment Received') return true
  if (jo.override_status === 'Approved') return true
  return false
}

export default function ProductionClient({ items, sopSteps, currentUser }: Props) {
  const [advancing, setAdvancing] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  // Build SOP lookup
  const sopByType: Record<string, any[]> = {}
  for (const s of sopSteps) {
    if (!sopByType[s.process_type_id]) sopByType[s.process_type_id] = []
    sopByType[s.process_type_id].push(s)
  }

  function getAllNextStatuses(processTypeId: string, currentStatus: string): string[] {
    const steps = sopByType[processTypeId] || []
    const idx = steps.findIndex(s => s.status_name === currentStatus)
    if (idx < 0) return []
    return steps.slice(idx + 1).map(s => s.status_name)
  }

  async function advanceStatus(itemId: string, processTypeId: string, currentStatus: string, targetStatus: string) {
    setAdvancing(itemId)
    try {
      const supabase = createSupabaseBrowserClient()
      const isDone = sopByType[processTypeId]?.find(s => s.status_name === targetStatus)?.is_terminal
      await supabase.from('job_order_items').update({
        job_status: targetStatus,
        ...(isDone ? { date_time_done: new Date().toISOString() } : {}),
      }).eq('item_id', itemId)
      // Optimistic update — page will refresh via router but we avoid it for snappiness
      window.location.reload()
    } finally {
      setAdvancing(null)
    }
  }

  async function markCancelled(itemId: string) {
    if (!confirm('Mark this item as Cancelled?')) return
    const supabase = createSupabaseBrowserClient()
    await supabase.from('job_order_items').update({ job_status: 'Cancelled' }).eq('item_id', itemId)
    window.location.reload()
  }

  // Filter to production-eligible items
  const productionItems = items.filter(i => canPushToProduction(i.job_orders))
  const pendingCount = items.length - productionItems.length

  const filtered = productionItems.filter(item => {
    const q = search.toLowerCase()
    const client = item.job_orders?.clients?.client_name || item.job_orders?.clients?.company_name || ''
    return (client + (item.job_orders?.job_order_id || '') + (item.subcategories?.subcategory_name || '')).toLowerCase().includes(q)
  })

  // Group by urgency, sort within each group by deadline asc (no-deadline last)
  const grouped: Record<string, any[]> = { overdue: [], today: [], week: [], upcoming: [], none: [] }
  for (const item of filtered) {
    grouped[getUrgencyKey(item.date_time_needed)].push(item)
  }
  for (const key of Object.keys(grouped)) {
    grouped[key].sort((a, b) => {
      if (!a.date_time_needed) return 1
      if (!b.date_time_needed) return -1
      return new Date(a.date_time_needed).getTime() - new Date(b.date_time_needed).getTime()
    })
  }

  const toggleCollapse = (key: string) => setCollapsed(prev => ({ ...prev, [key]: !prev[key] }))

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h1 style={{ color: '#7A1828', fontSize: '1.4rem', fontWeight: 700 }}>Fabricator&apos;s Production Panel</h1>
          <p style={{ color: '#777', fontSize: '0.8rem', marginTop: 2 }}>
            {productionItems.length} item(s) in queue
            {pendingCount > 0 && <span style={{ color: '#e67e22', marginLeft: 8 }}>· {pendingCount} awaiting payment/approval</span>}
          </p>
        </div>
        <input
          type="text"
          placeholder="Search client, JO, item..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ background: '#FDF5EC', border: '1.5px solid #d0d0d0', borderRadius: 8, padding: '0.5rem 0.85rem', color: '#1a1a1a', fontSize: '0.82rem', width: 220, outline: 'none' }}
        />
      </div>

      {productionItems.length === 0 ? (
        <div style={{ color: '#aaa', textAlign: 'center', marginTop: '3rem', fontSize: '0.9rem' }}>No items in production queue.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {URGENCY_GROUPS.map(group => {
            const groupItems = grouped[group.key]
            if (groupItems.length === 0) return null
            const isCollapsed = collapsed[group.key]

            return (
              <div key={group.key}>
                {/* Section Header */}
                <button
                  onClick={() => toggleCollapse(group.key)}
                  style={{ width: '100%', background: group.bg, border: `1px solid ${group.border}`, borderRadius: isCollapsed ? 10 : '10px 10px 0 0', padding: '0.65rem 1rem', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', textAlign: 'left' }}
                >
                  <span style={{ color: group.color, fontWeight: 700, fontSize: '0.88rem', flex: 1 }}>{group.label}</span>
                  <span style={{ background: group.border, color: '#fff', borderRadius: 20, padding: '0.15rem 0.55rem', fontSize: '0.72rem', fontWeight: 700 }}>{groupItems.length}</span>
                  <span style={{ color: group.color, fontSize: '0.75rem' }}>{isCollapsed ? '▶' : '▼'}</span>
                </button>

                {/* Cards */}
                {!isCollapsed && (
                  <div style={{ border: `1px solid ${group.border}`, borderTop: 'none', borderRadius: '0 0 10px 10px', overflow: 'hidden' }}>
                    {groupItems.map((item, idx) => {
                      const jo = item.job_orders
                      const clientName = jo?.clients?.client_name || jo?.clients?.company_name || jo?.client_id
                      const processTypeId = item.subcategories?.process_type_id
                      const status = item.job_status || 'Received'
                      const nextOptions = getAllNextStatuses(processTypeId, status)
                      const isTerminal = sopByType[processTypeId]?.find(s => s.status_name === status)?.is_terminal
                      const isAdvancing = advancing === item.item_id
                      const isOverdue = group.key === 'overdue'
                      const isToday = group.key === 'today'

                      return (
                        <div key={item.item_id} style={{
                          background: '#FDF5EC',
                          borderTop: idx > 0 ? '1px solid #EDE0CC' : 'none',
                          padding: '0.9rem 1rem',
                          borderLeft: `4px solid ${STATUS_COLORS[status] || '#555'}`,
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              {/* Client + JO */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <span style={{ color: '#1a1a1a', fontWeight: 700, fontSize: '0.88rem' }}>{clientName}</span>
                                <span style={{ background: STATUS_COLORS[status] || '#555', color: '#fff', borderRadius: 20, padding: '0.1rem 0.5rem', fontSize: '0.65rem', fontWeight: 700 }}>{status}</span>
                              </div>
                              <div style={{ color: '#999', fontSize: '0.7rem', marginTop: 2 }}>{jo?.job_order_id} · {item.item_id}</div>

                              {/* Service */}
                              <div style={{ color: '#555', fontSize: '0.82rem', fontWeight: 600, marginTop: 4 }}>{item.subcategories?.subcategory_name}</div>
                              {item.production_specs && <div style={{ color: '#777', fontSize: '0.72rem', marginTop: 2 }}>{item.production_specs}</div>}
                              {item.notes && <div style={{ color: '#aaa', fontSize: '0.7rem', marginTop: 1, fontStyle: 'italic' }}>"{item.notes}"</div>}

                              {/* Deadline */}
                              {item.date_time_needed && (
                                <div style={{ marginTop: 5, display: 'inline-flex', alignItems: 'center', gap: 4, background: isOverdue ? '#3a0a0a' : isToday ? '#2a1a00' : '#2a2a2a', borderRadius: 6, padding: '0.2rem 0.55rem' }}>
                                  <span style={{ fontSize: '0.68rem' }}>📅</span>
                                  <span style={{ color: isOverdue ? '#e74c3c' : isToday ? '#e67e22' : '#aaa', fontSize: '0.72rem', fontWeight: 600 }}>
                                    {isOverdue ? 'OVERDUE · ' : ''}{formatDeadline(item.date_time_needed)}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Right: amount + qty */}
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              <div style={{ color: '#1a1a1a', fontWeight: 700, fontSize: '0.85rem' }}>{formatPeso(item.computed_line_total || 0)}</div>
                              <div style={{ color: '#aaa', fontSize: '0.68rem' }}>qty: {item.quantity || 1}</div>
                            </div>
                          </div>

                          {/* Advance buttons */}
                          {!isTerminal && nextOptions.length > 0 && (
                            <div style={{ marginTop: '0.7rem', display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                              {nextOptions.slice(0, 4).map(next => {
                                const isNextTerminal = sopByType[processTypeId]?.find(s => s.status_name === next)?.is_terminal
                                return (
                                  <button
                                    key={next}
                                    onClick={() => advanceStatus(item.item_id, processTypeId, status, next)}
                                    disabled={!!isAdvancing}
                                    style={{
                                      background: isNextTerminal ? '#1a4a1a' : '#2a2a2a',
                                      border: `1px solid ${isNextTerminal ? '#27ae60' : '#3a3a3a'}`,
                                      color: isNextTerminal ? '#2ecc71' : '#bbb',
                                      fontSize: '0.7rem',
                                      padding: '0.3rem 0.65rem',
                                      borderRadius: 6,
                                      cursor: isAdvancing ? 'not-allowed' : 'pointer',
                                      fontWeight: 600,
                                    }}
                                  >
                                    {isAdvancing ? '…' : `→ ${next}`}
                                  </button>
                                )
                              })}
                              <button
                                onClick={() => markCancelled(item.item_id)}
                                style={{ marginLeft: 'auto', background: 'none', border: '1px solid #3a0000', color: '#7A1828', fontSize: '0.7rem', padding: '0.3rem 0.65rem', borderRadius: 6, cursor: 'pointer' }}
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                          {isTerminal && (
                            <div style={{ marginTop: '0.6rem', color: '#27ae60', fontSize: '0.75rem', fontWeight: 600 }}>✓ Complete — Ready for dispatch</div>
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
    </div>
  )
}
