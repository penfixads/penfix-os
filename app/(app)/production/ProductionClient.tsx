'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  'Delivered': '#27ae60',
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
  'Reserved': '#555',
  'Released': '#2980b9',
  'Paid': '#27ae60',
  'For Lamination': '#16a085',
  'Materials & Tools Preparation': '#555',
}

function canPushToProduction(jo: any): boolean {
  if (!jo) return false
  if (jo.is_for_billing) return true
  if (jo.payment_status === 'Fully Paid' || jo.payment_status === 'Downpayment Received') return true
  if (jo.override_status === 'Approved') return true
  return false
}

export default function ProductionClient({ items, sopSteps, currentUser }: Props) {
  const router = useRouter()
  const [advancing, setAdvancing] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'mine'>('all')
  const [search, setSearch] = useState('')

  // Group SOP steps by process_type_id
  const sopByType: Record<string, any[]> = {}
  for (const s of sopSteps) {
    if (!sopByType[s.process_type_id]) sopByType[s.process_type_id] = []
    sopByType[s.process_type_id].push(s)
  }

  function getNextStatus(processTypeId: string, currentStatus: string): string | null {
    const steps = sopByType[processTypeId] || []
    const idx = steps.findIndex(s => s.status_name === currentStatus)
    if (idx < 0 || idx >= steps.length - 1) return null
    const next = steps[idx + 1]
    return next.is_terminal ? null : next.status_name
  }

  function getFinalStatus(processTypeId: string): string {
    const steps = sopByType[processTypeId] || []
    const terminal = steps.find(s => s.is_terminal)
    return terminal?.status_name || 'Done'
  }

  function getAllNextStatuses(processTypeId: string, currentStatus: string): string[] {
    const steps = sopByType[processTypeId] || []
    const idx = steps.findIndex(s => s.status_name === currentStatus)
    if (idx < 0) return []
    return steps.slice(idx + 1).map(s => s.status_name)
  }

  async function advanceStatus(itemId: string, processTypeId: string, currentStatus: string, targetStatus?: string) {
    setAdvancing(itemId)
    try {
      const supabase = createSupabaseBrowserClient()
      const next = targetStatus || getNextStatus(processTypeId, currentStatus)
      if (!next) return
      const isDone = sopByType[processTypeId]?.find(s => s.status_name === next)?.is_terminal
      await supabase.from('job_order_items').update({
        job_status: next,
        ...(isDone ? { date_time_done: new Date().toISOString() } : {}),
      }).eq('item_id', itemId)
      router.refresh()
    } finally {
      setAdvancing(null)
    }
  }

  async function markCancelled(itemId: string) {
    if (!confirm('Mark this item as Cancelled?')) return
    const supabase = createSupabaseBrowserClient()
    await supabase.from('job_order_items').update({ job_status: 'Cancelled' }).eq('item_id', itemId)
    router.refresh()
  }

  // Filter items: only those whose JO can go to production
  const productionItems = items.filter(item => {
    const jo = item.job_orders
    return canPushToProduction(jo)
  })

  const filtered = productionItems.filter(item => {
    const clientName = item.job_orders?.clients?.client_name || item.job_orders?.clients?.company_name || ''
    const joId = item.job_orders?.job_order_id || ''
    const sub = item.subcategories?.subcategory_name || ''
    return (clientName + joId + sub).toLowerCase().includes(search.toLowerCase())
  })

  // Group by status
  const grouped: Record<string, any[]> = {}
  for (const item of filtered) {
    const status = item.job_status || 'Received'
    if (!grouped[status]) grouped[status] = []
    grouped[status].push(item)
  }

  const statusOrder = [
    'Received','For Layout','For Client Review','Revision','Sent for Approval','Client Reviewing','Revision Requested',
    'For Printing','Drying / Curing','For Finishing','For Cutting','For Lamination',
    'For Cutting','For Assembly','Quality Check','Materials & Tools Preparation','For Fabrication','Electrical / Lighting',
    'For Artwork','For Sourcing','For Production','Assembly',
    'Sent to Supplier','In Supplier Production','Received from Supplier',
    'In Progress','Scheduled','En Route','Reserved','Released',
    'Ready for Pickup','Ready for Installation','Installed','Delivered','Approved','Paid','Done',
  ]

  const sortedStatuses = Object.keys(grouped).sort((a, b) => {
    const ai = statusOrder.indexOf(a), bi = statusOrder.indexOf(b)
    return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi)
  })

  const pendingCount = items.filter(i => !canPushToProduction(i.job_orders)).length

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h1 style={{ color: '#1a1a1a', fontSize: '1.4rem', fontWeight: 700 }}>Fabricator&apos;s Production Panel</h1>
          <p style={{ color: '#777', fontSize: '0.8rem', marginTop: 2 }}>
            {productionItems.length} item(s) in production
            {pendingCount > 0 && <span style={{ color: '#e67e22', marginLeft: 8 }}>· {pendingCount} awaiting payment/approval</span>}
          </p>
        </div>
        <input
          type="text"
          placeholder="Search client, JO, item..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ background: '#ffffff', border: '1.5px solid #d0d0d0', borderRadius: 8, padding: '0.5rem 0.85rem', color: '#1a1a1a', fontSize: '0.82rem', width: 220, outline: 'none' }}
        />
      </div>

      {productionItems.length === 0 ? (
        <div style={{ color: '#aaa', textAlign: 'center', marginTop: '3rem', fontSize: '0.9rem' }}>No items in production queue.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {sortedStatuses.map(status => (
            <div key={status}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.6rem' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: STATUS_COLORS[status] || '#555' }} />
                <span style={{ color: '#ccc', fontWeight: 700, fontSize: '0.85rem' }}>{status}</span>
                <span style={{ color: '#aaa', fontSize: '0.75rem' }}>({grouped[status].length})</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {grouped[status].map(item => {
                  const jo = item.job_orders
                  const clientName = jo?.clients?.client_name || jo?.clients?.company_name || jo?.client_id
                  const processTypeId = item.subcategories?.process_type_id
                  const nextOptions = getAllNextStatuses(processTypeId, status)
                  const isTerminal = sopByType[processTypeId]?.find(s => s.status_name === status)?.is_terminal
                  const isAdvancing = advancing === item.item_id

                  return (
                    <div key={item.item_id} style={{ background: '#ffffff', borderRadius: 10, padding: '0.85rem 1rem', border: '1px solid #e5e5e5' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: '#1a1a1a', fontWeight: 700, fontSize: '0.88rem' }}>{clientName}</div>
                          <div style={{ color: '#999', fontSize: '0.72rem', marginTop: 1 }}>{jo?.job_order_id} · {item.item_id}</div>
                          <div style={{ color: '#999', fontSize: '0.8rem', marginTop: 3 }}>{item.subcategories?.subcategory_name}</div>
                          {item.production_specs && (
                            <div style={{ color: '#777', fontSize: '0.73rem', marginTop: 2 }}>{item.production_specs}</div>
                          )}
                          {item.date_time_needed && (
                            <div style={{ color: new Date(item.date_time_needed) < new Date() ? '#e74c3c' : '#f39c12', fontSize: '0.72rem', marginTop: 3 }}>
                              Deadline: {new Date(item.date_time_needed).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                          {item.remarks && (
                            <div style={{ color: '#777', fontSize: '0.71rem', marginTop: 2, fontStyle: 'italic' }}>"{item.remarks}"</div>
                          )}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ color: '#1a1a1a', fontWeight: 700, fontSize: '0.88rem' }}>{formatPeso(item.computed_line_total || 0)}</div>
                          <div style={{ color: '#aaa', fontSize: '0.68rem' }}>qty: {item.quantity || 1}</div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      {!isTerminal && nextOptions.length > 0 && (
                        <div style={{ marginTop: '0.75rem', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {nextOptions.slice(0, 3).map(next => {
                            const isNextTerminal = sopByType[processTypeId]?.find(s => s.status_name === next)?.is_terminal
                            return (
                              <button
                                key={next}
                                onClick={() => advanceStatus(item.item_id, processTypeId, status, next)}
                                disabled={isAdvancing}
                                style={{
                                  background: isNextTerminal ? '#1a4a1a' : '#2a2a2a',
                                  border: `1px solid ${isNextTerminal ? '#27ae60' : '#3a3a3a'}`,
                                  color: isNextTerminal ? '#2ecc71' : '#aaa',
                                  fontSize: '0.72rem',
                                  padding: '0.35rem 0.7rem',
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
                            style={{ background: 'none', border: '1px solid #3a0000', color: '#7B1C1C', fontSize: '0.72rem', padding: '0.35rem 0.7rem', borderRadius: 6, cursor: 'pointer', marginLeft: 'auto' }}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                      {isTerminal && (
                        <div style={{ marginTop: '0.65rem', color: '#27ae60', fontSize: '0.75rem', fontWeight: 600 }}>
                          ✓ Complete — Ready for dispatch
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
