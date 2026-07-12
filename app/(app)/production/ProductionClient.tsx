'use client'

import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { formatPeso, getEffectiveSteps, canPushToProduction } from '@/lib/jo-helpers'
import { syncJobOrderDoneStatus } from '@/lib/jo-completion'
import type { AppUser } from '@/lib/user'
import JOItemForm from '@/app/(app)/jos/today/JOItemForm'
import Pagination from '@/components/Pagination'

const PAGE_SIZE = 10

interface Props {
  items: any[]
  sopSteps: any[]
  staff: any[]
  statusLogs: any[]
  categories: any[]
  subcategories: any[]
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

export default function ProductionClient({ items: initialItems, sopSteps, staff, statusLogs, categories, subcategories, currentUser }: Props) {
  const [localItems, setLocalItems] = useState(initialItems)
  const [localLogs, setLocalLogs] = useState(statusLogs)
  const [advancing, setAdvancing] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [groupPage, setGroupPage] = useState<Record<string, number>>({})
  const [viewingItem, setViewingItem] = useState<any | null>(null)
  // completedStatus = the step being marked done (attribution is logged against this);
  // targetStatus = the step job_status advances to once confirmed.
  const [pendingChange, setPendingChange] = useState<{ itemId: string; jobOrderId: string; completedStatus: string; targetStatus: string } | null>(null)
  const [selectedProponents, setSelectedProponents] = useState<string[]>([])
  const [cancelTarget, setCancelTarget] = useState<{ itemId: string; jobOrderId: string; label: string } | null>(null)
  const [cancelInput, setCancelInput] = useState('')
  const isFabricator = currentUser.role === 'Fabricator'

  const items = localItems

  // Build SOP lookup
  const sopBySubcategory: Record<string, any[]> = {}
  for (const s of sopSteps) {
    if (!sopBySubcategory[s.subcategory_id]) sopBySubcategory[s.subcategory_id] = []
    sopBySubcategory[s.subcategory_id].push(s)
  }

  // Who worked on each already-completed step, per item — feeds the checklist display.
  const namesByItemStatus: Record<string, Record<string, string[]>> = {}
  for (const log of localLogs) {
    if (!namesByItemStatus[log.item_id]) namesByItemStatus[log.item_id] = {}
    if (!namesByItemStatus[log.item_id][log.status_name]) namesByItemStatus[log.item_id][log.status_name] = []
    namesByItemStatus[log.item_id][log.status_name].push(log.changed_by_name)
  }

  // A subcategory's SOP can include GA-owned steps (layout, client approval) before the
  // step marked "Fabricators start here" — until that step, the item stays GA-only even
  // though it's past "Received". Falls back to "any non-Received status" if nothing's marked.
  function isVisibleToFabricator(subcategoryId: string, jobFlow: string | null | undefined, status: string): boolean {
    if (status === 'Received') return false
    const steps = getEffectiveSteps(sopBySubcategory[subcategoryId] || [], jobFlow)
    const startStep = steps.find(s => s.is_production_start)
    if (!startStep) return true
    const currentStep = steps.find(s => s.status_name === status)
    if (!currentStep) return true
    return currentStep.sequence >= startStep.sequence
  }

  // completedStatus is the step being checked off (attribution is logged against it);
  // targetStatus is the next step job_status moves to.
  function requestStatusChange(itemId: string, jobOrderId: string, completedStatus: string, targetStatus: string) {
    setPendingChange({ itemId, jobOrderId, completedStatus, targetStatus })
    setSelectedProponents([currentUser.email])
  }

  function toggleProponent(email: string) {
    setSelectedProponents(prev => prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email])
  }

  async function confirmStatusChange() {
    if (!pendingChange) return
    const { itemId, jobOrderId, completedStatus, targetStatus } = pendingChange
    // Defense in depth — the checklist UI already hides this action for ineligible JOs, but
    // re-check here too in case localItems went stale (e.g. someone else just recorded a
    // payment or an Admin just rejected the override in another tab).
    const liveItem = localItems.find(i => i.item_id === itemId)
    if (!canPushToProduction(liveItem?.job_orders)) {
      alert('This job order needs 50% downpayment (or Admin-approved override) before it can advance past Received.')
      setPendingChange(null)
      return
    }
    const proponents = selectedProponents.length > 0 ? selectedProponents : [currentUser.email]
    setAdvancing(itemId)
    try {
      const supabase = createSupabaseBrowserClient()
      const { error } = await supabase.from('job_order_items').update({ job_status: targetStatus }).eq('item_id', itemId)
      if (error) { alert(error.message || 'Failed to advance status.'); return }
      setLocalItems(prev => prev.map(i => i.item_id === itemId ? { ...i, job_status: targetStatus } : i))
      // Attribution log for the people-KPI system — one row per person who worked on this
      // step together, so credit isn't limited to whoever clicked the checklist item.
      const newLogs = proponents.map(email => {
        const person = staff.find(s => s.user_email === email)
        return {
          item_id: itemId,
          job_order_id: jobOrderId,
          status_name: completedStatus,
          changed_by_email: email,
          changed_by_name: person?.name || (email === currentUser.email ? currentUser.name : email),
          changed_by_role: person?.role || (email === currentUser.email ? currentUser.role : null),
        }
      })
      await supabase.from('job_order_item_status_log').insert(newLogs)
      setLocalLogs(prev => [...prev, ...newLogs])
      setPendingChange(null)
      await syncJobOrderDoneStatus(supabase, jobOrderId)
    } finally {
      setAdvancing(null)
    }
  }

  function requestCancel(itemId: string, jobOrderId: string, label: string) {
    setCancelTarget({ itemId, jobOrderId, label })
    setCancelInput('')
  }

  async function confirmCancel() {
    if (!cancelTarget || cancelInput.trim().toUpperCase() !== 'CANCEL') return
    const { itemId, jobOrderId } = cancelTarget
    const supabase = createSupabaseBrowserClient()
    await supabase.from('job_order_items').update({ job_status: 'Cancelled' }).eq('item_id', itemId)
    setLocalItems(prev => prev.filter(i => i.item_id !== itemId))
    // Same attribution log as every other status change — records who cancelled it and when.
    const newLog = {
      item_id: itemId,
      job_order_id: jobOrderId,
      status_name: 'Cancelled',
      changed_by_email: currentUser.email,
      changed_by_name: currentUser.name,
      changed_by_role: currentUser.role,
    }
    await supabase.from('job_order_item_status_log').insert(newLog)
    setLocalLogs(prev => [...prev, newLog])
    setCancelTarget(null)
    setCancelInput('')
    await syncJobOrderDoneStatus(supabase, jobOrderId)
  }

  // GA/Admin/Treasury can edit an item's fields from this panel too — Fabricators open the
  // same modal in read-only mode and only interact with the status checklist inside it.
  async function saveItemFields(updated: any) {
    const supabase = createSupabaseBrowserClient()
    const { item_id, subcategory_name, category_name, ...fields } = updated
    const { error } = await supabase.from('job_order_items').update(fields).eq('item_id', item_id)
    if (error) { alert(error.message || 'Failed to save item.'); return }
    setLocalItems(prev => prev.map(i => i.item_id === item_id ? { ...i, ...fields, subcategories: { ...i.subcategories, subcategory_name } } : i))
    setViewingItem(null)
  }

  // Filter to production-eligible items. "Received" is the only automatic status (set at
  // JO creation) — a GA has to manually advance it at least one step before a Fabricator
  // sees it, so payment status alone isn't enough to enter their queue. GA/Admin/Treasury
  // still see Received items here so they have somewhere to perform that first advance.
  const paymentEligible = items.filter(i => canPushToProduction(i.job_orders))
  const productionItems = paymentEligible.filter(i =>
    !isFabricator || isVisibleToFabricator(i.subcategory_id, i.subcategories?.job_flow, i.job_status || 'Received')
  )
  const pendingCount = items.length - paymentEligible.length
  const notYetStartedCount = paymentEligible.length - productionItems.length

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
            {notYetStartedCount > 0 && <span style={{ color: '#e67e22', marginLeft: 8 }}>· {notYetStartedCount} not yet started by GA</span>}
          </p>
        </div>
        <input
          type="text"
          placeholder="Search client, JO, item..."
          value={search}
          onChange={e => { setSearch(e.target.value); setGroupPage({}) }}
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
            const groupCurrentPage = Math.min(groupPage[group.key] || 1, Math.max(1, Math.ceil(groupItems.length / PAGE_SIZE)))
            const groupPageItems = groupItems.slice((groupCurrentPage - 1) * PAGE_SIZE, groupCurrentPage * PAGE_SIZE)

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
                  <>
                  <div style={{ border: `1px solid ${group.border}`, borderTop: 'none', borderRadius: '0 0 10px 10px', overflow: 'hidden' }}>
                    {groupPageItems.map((item, idx) => {
                      const jo = item.job_orders
                      const clientName = jo?.clients?.client_name || jo?.clients?.company_name || jo?.client_id
                      const subcategoryId = item.subcategory_id
                      const jobFlow = item.subcategories?.job_flow
                      const status = item.job_status || 'Received'
                      const itemSteps = getEffectiveSteps(sopBySubcategory[subcategoryId] || [], jobFlow)
                      const isTerminal = itemSteps.find(s => s.status_name === status)?.is_terminal
                      const isAdvancing = advancing === item.item_id
                      const isOverdue = group.key === 'overdue'
                      const isToday = group.key === 'today'

                      const currentIndex = itemSteps.findIndex(s => s.status_name === status)
                      // The terminal step needs its own logged proponent, same as every other
                      // step — arriving at it isn't enough to count it as done.
                      const terminalConfirmed = isTerminal && !!(namesByItemStatus[item.item_id]?.[status]?.length)
                      const doneCount = currentIndex >= 0 ? currentIndex + (terminalConfirmed ? 1 : 0) : 0

                      return (
                        <div key={item.item_id}
                          onClick={() => setViewingItem(item)}
                          style={{
                            background: '#FDF5EC',
                            borderTop: idx > 0 ? '1px solid #EDE0CC' : 'none',
                            padding: '0.9rem 1rem',
                            borderLeft: `4px solid ${STATUS_COLORS[status] || '#555'}`,
                            cursor: 'pointer',
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

                              {itemSteps.length > 0 && (
                                <div style={{ color: '#999', fontSize: '0.7rem', marginTop: 5 }}>
                                  {doneCount} / {itemSteps.length} steps done · <span style={{ color: '#7A1828', fontWeight: 600 }}>click to view checklist</span>
                                </div>
                              )}
                            </div>

                            {/* Right: amount + qty */}
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              {!isFabricator && <div style={{ color: '#1a1a1a', fontWeight: 700, fontSize: '0.85rem' }}>{formatPeso(item.computed_line_total || 0)}</div>}
                              <div style={{ color: '#aaa', fontSize: '0.68rem' }}>qty: {item.quantity || 1}</div>
                              <button
                                onClick={e => { e.stopPropagation(); requestCancel(item.item_id, item.job_order_id, item.subcategories?.subcategory_name || item.item_id) }}
                                style={{ marginTop: 6, background: 'none', border: '1px solid #3a0000', color: '#7A1828', fontSize: '0.65rem', padding: '0.2rem 0.5rem', borderRadius: 6, cursor: 'pointer' }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>

                          {isTerminal && (
                            terminalConfirmed ? (
                              <div style={{ marginTop: '0.6rem', color: '#27ae60', fontSize: '0.75rem', fontWeight: 600 }}>✓ Complete — Ready for dispatch</div>
                            ) : (
                              <div style={{ marginTop: '0.6rem', color: '#e67e22', fontSize: '0.75rem', fontWeight: 600 }}>⚠ Open the checklist to confirm who marked this ready</div>
                            )
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <Pagination
                    page={groupCurrentPage}
                    totalItems={groupItems.length}
                    pageSize={PAGE_SIZE}
                    onPageChange={p => setGroupPage(prev => ({ ...prev, [group.key]: p }))}
                  />
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}

      {viewingItem && (() => {
        // localItems may have advanced since the modal opened (checklist clicks update it) —
        // always read the live copy so the modal reflects the current status.
        const liveItem = localItems.find(i => i.item_id === viewingItem.item_id) || viewingItem
        const subcategoryId = liveItem.subcategory_id
        const jobFlow = liveItem.subcategories?.job_flow
        const currentStatus = liveItem.job_status || 'Received'
        const steps = getEffectiveSteps(sopBySubcategory[subcategoryId] || [], jobFlow)
        const isPendingHere = pendingChange?.itemId === liveItem.item_id
        return (
          <JOItemForm
            categories={categories}
            subcategories={subcategories}
            editingItem={{ ...liveItem, category_id: liveItem.subcategories?.category_id }}
            currentUser={currentUser}
            readOnly={isFabricator}
            onSave={saveItemFields}
            onClose={() => setViewingItem(null)}
            statusChecklist={{
              steps,
              currentStatus,
              namesByStatus: namesByItemStatus[liveItem.item_id] || {},
              staff,
              pendingStatus: isPendingHere ? pendingChange!.completedStatus : null,
              selectedProponents,
              advancing: advancing === liveItem.item_id,
              blocked: !canPushToProduction(liveItem.job_orders),
              blockedReason: 'Needs 50% downpayment (or Admin-approved override) before status can move past Received.',
              onRequestAdvance: (completedStatus, targetStatus) => requestStatusChange(liveItem.item_id, liveItem.job_orders?.job_order_id, completedStatus, targetStatus),
              onToggleProponent: toggleProponent,
              onConfirmAdvance: confirmStatusChange,
              onCancelPending: () => setPendingChange(null),
            }}
          />
        )
      })()}

      {cancelTarget && (
        <div className="pf-modal-overlay">
          <div className="pf-modal-card pf-modal-wine" style={{ maxWidth: 420 }}>
            <h3 style={{ marginBottom: '0.75rem' }}>Cancel "{cancelTarget.label}"?</h3>
            <p style={{ color: '#E8B9C6', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1rem' }}>
              It will be removed from this queue right away. Its price still counts toward
              the Job Order's grand total — this does not adjust billing or issue a refund.
              If every other item on this Job Order is already Done/Cancelled and it is fully
              paid (or approved for billing), the Job Order itself will be marked Done.
              This is logged against your account and can't be undone from here.
            </p>
            <div className="pf-field">
              <label className="pf-label">Type CANCEL to confirm</label>
              <input
                type="text"
                className="pf-input"
                value={cancelInput}
                onChange={e => setCancelInput(e.target.value)}
                autoFocus
                placeholder="CANCEL"
              />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button onClick={() => { setCancelTarget(null); setCancelInput('') }} className="pf-btn pf-btn-secondary">
                Keep Item
              </button>
              <button
                onClick={confirmCancel}
                disabled={cancelInput.trim().toUpperCase() !== 'CANCEL'}
                className="pf-btn"
                style={{ opacity: cancelInput.trim().toUpperCase() !== 'CANCEL' ? 0.5 : 1, cursor: cancelInput.trim().toUpperCase() !== 'CANCEL' ? 'not-allowed' : 'pointer' }}
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
