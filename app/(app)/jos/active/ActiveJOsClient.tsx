'use client'

import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { formatPeso, generateItemId, formatAge, fuzzyMatch, getPhilippineDateStr } from '@/lib/jo-helpers'
import { syncJobOrderDoneStatus } from '@/lib/jo-completion'
import type { AppUser } from '@/lib/user'
import EditJOModal from '@/components/EditJOModal'
import JOReceiptModal from '@/components/JOReceiptModal'
import Pagination from '@/components/Pagination'
import JOItemForm from '../today/JOItemForm'

const PAGE_SIZE = 10

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
  const [addingItemToJO, setAddingItemToJO] = useState<string | null>(null)
  const [receiptJOId, setReceiptJOId] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const filtered = jobOrders.filter(jo => {
    const client = jo.clients?.client_name || jo.clients?.company_name || ''
    const matchSearch = !search || fuzzyMatch(client, search) || fuzzyMatch(jo.job_order_id, search)
    const matchStatus = statusFilter === 'all' || jo.payment_status === statusFilter
    return matchSearch && matchStatus
  })

  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)))
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const statuses = ['all', ...Array.from(new Set(jobOrders.map(j => j.payment_status).filter(Boolean)))]

  const totalGrand = filtered.reduce((s, j) => s + (j.grand_total || 0), 0)
  const totalBalance = filtered.reduce((s, j) => s + (j.balance_due || 0), 0)

  function handleEditSave(joId: string, updates: any) {
    setJobOrders(prev => prev.map(j => j.job_order_id !== joId ? j : { ...j, ...updates }))
  }

  async function handleAddItemToExistingJO(joId: string, rawItem: any) {
    const supabase = createSupabaseBrowserClient()
    const { category_name, subcategory_name, ...item } = rawItem
    const { data: existingItems } = await supabase.from('job_order_items').select('item_id').eq('job_order_id', joId)
    const seq = (existingItems?.length || 0) + 1
    const itemId = generateItemId(joId, seq)
    const { error: insertErr } = await supabase.from('job_order_items').insert({ ...item, item_id: itemId, job_order_id: joId })
    if (insertErr) { alert(insertErr.message || 'Failed to add item.'); return }
    // "Received" is auto-logged to whoever is adding this item right now, same as a brand-new JO.
    await supabase.from('job_order_item_status_log').insert({
      item_id: itemId,
      job_order_id: joId,
      status_name: 'Received',
      changed_by_email: currentUser.email,
      changed_by_name: currentUser.name,
      changed_by_role: currentUser.role,
    })
    const { data: allItems } = await supabase.from('job_order_items').select('computed_line_total').eq('job_order_id', joId)
    const newTotal = (allItems || []).reduce((s: number, i: any) => s + (i.computed_line_total || 0), 0)
    const { error: totalErr } = await supabase.from('job_orders').update({ grand_total: newTotal }).eq('job_order_id', joId)
    if (totalErr) { alert(totalErr.message || 'Item was added but the job order total failed to update — refresh to check.'); return }
    setJobOrders(prev => prev.map(j => {
      if (j.job_order_id !== joId) return j
      return {
        ...j,
        grand_total: newTotal,
        job_order_items: [...(j.job_order_items || []), { item_id: itemId, job_status: 'Received', computed_line_total: item.computed_line_total, subcategories: { subcategory_name } }],
      }
    }))
    setAddingItemToJO(null)
  }

  function copyTrackLink(publicToken: string) {
    const url = `${window.location.origin}/track/${publicToken}`
    navigator.clipboard.writeText(url)
  }

  // Client never came back to claim/pay for this item. Mirrors markCancelled's one-way,
  // confirm-then-persist shape (see ProductionClient.tsx), plus a status-log entry so the
  // action is traceable in All Job Order Items' history timeline. Guarded in the render below
  // to same-day-received JOs can't be marked (avoids archiving something that's simply new).
  async function markUnclaimed(itemId: string, jobOrderId: string, itemLabel: string) {
    if (!confirm(`Mark "${itemLabel}" as Unclaimed? The client never came back to claim/pay for it.`)) return
    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase.from('job_order_items').update({ job_status: 'Unclaimed' }).eq('item_id', itemId)
    if (error) { alert(error.message || 'Failed to mark item as unclaimed.'); return }
    await supabase.from('job_order_item_status_log').insert({
      item_id: itemId,
      job_order_id: jobOrderId,
      status_name: 'Unclaimed',
      changed_by_email: currentUser.email,
      changed_by_name: currentUser.name,
      changed_by_role: currentUser.role,
    })
    await syncJobOrderDoneStatus(supabase, jobOrderId)

    // Mirror the server-side rollup: once every sibling item is terminal, the JO itself
    // rolled up to 'Unclaimed' server-side too — drop the whole card locally so it disappears
    // from Active JOs without waiting on a page refresh.
    setJobOrders(prev => {
      const jo = prev.find(j => j.job_order_id === jobOrderId)
      if (!jo) return prev
      const updatedItems = (jo.job_order_items || []).map((i: any) => i.item_id === itemId ? { ...i, job_status: 'Unclaimed' } : i)
      const TERMINAL = ['Done', 'Cancelled', 'Unclaimed']
      const allTerminal = updatedItems.every((i: any) => TERMINAL.includes(i.job_status))
      if (allTerminal) return prev.filter(j => j.job_order_id !== jobOrderId)
      return prev.map(j => j.job_order_id === jobOrderId ? { ...j, job_order_items: updatedItems } : j)
    })
  }

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ color: '#7A1828', fontSize: '1.4rem', fontWeight: 700 }}>Active Job Orders</h1>
        <p style={{ color: '#777', fontSize: '0.8rem', marginTop: 2 }}>{filtered.length} active JO(s)</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: '1.25rem' }}>
        {[
          { label: 'Total JOs', value: filtered.length },
          // GA can see and manage JOs but not the shop's money totals — Admin/Treasury only.
          ...(currentUser.role === 'Admin' || currentUser.role === 'Treasury' ? [
            { label: 'Total Grand Total', value: formatPeso(totalGrand) },
            { label: 'Total Balance Due', value: formatPeso(totalBalance), warn: totalBalance > 0 },
          ] : []),
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
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          style={{ background: '#FDF5EC', border: '1.5px solid #d0d0d0', borderRadius: 8, padding: '0.5rem 0.85rem', color: '#1a1a1a', fontSize: '0.82rem', flex: 1, minWidth: 180, outline: 'none' }}
        />
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
          style={{ background: '#FDF5EC', border: '1.5px solid #d0d0d0', borderRadius: 8, padding: '0.5rem 0.75rem', color: '#1a1a1a', fontSize: '0.82rem', outline: 'none' }}
        >
          {statuses.map(s => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div style={{ color: '#aaa', textAlign: 'center', marginTop: '3rem', fontSize: '0.9rem' }}>No active job orders found.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {pageItems.map(jo => {
            const clientName = jo.clients?.client_name || jo.clients?.company_name || jo.client_id
            const items = jo.job_order_items || []
            // Cancelled/Unclaimed items are terminal — hide them here the same way Production
            // and Dispatch already hide them from their queues, so the card only shows work
            // still in flight. (They stay fully visible in All Job Order Items.)
            const visibleItems = items.filter((i: any) => i.job_status !== 'Cancelled' && i.job_status !== 'Unclaimed')
            const receivedToday = getPhilippineDateStr(new Date(jo.date_time_received)) === getPhilippineDateStr()
            const nearestDeadline = items.map((i: any) => i.date_time_needed).filter(Boolean).sort()[0]
            const isOverdue = nearestDeadline && new Date(nearestDeadline) < new Date()
            const statusColor = STATUS_COLORS[jo.payment_status] || '#555'
            const ageMs = Date.now() - new Date(jo.date_time_received).getTime()
            const ageHours = ageMs / (1000 * 60 * 60)
            const ageColor = ageHours > 48 ? '#e74c3c' : ageHours > 24 ? '#f39c12' : '#999'

            return (
              <div key={jo.job_order_id} style={{ background: '#FDF5EC', borderRadius: 10, padding: '0.85rem 1rem', border: `1px solid ${isOverdue ? '#c0392b' : '#EDE0CC'}`, borderLeft: isOverdue ? '4px solid #e74c3c' : '1px solid #EDE0CC' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#1a1a1a', fontWeight: 700, fontSize: '0.9rem' }}>{clientName}</div>
                    <div style={{ color: '#999', fontSize: '0.72rem', marginTop: 1 }}>{jo.job_order_id} · {items.length} item(s) · by {jo.received_by || '—'}</div>
                    <div style={{ color: '#777', fontSize: '0.73rem', marginTop: 2 }}>
                      Date Received: {new Date(jo.date_time_received).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      {' · '}
                      <span style={{ color: ageColor, fontWeight: ageHours > 24 ? 700 : 400 }}>{formatAge(jo.date_time_received)} old</span>
                    </div>
                    <div style={{ color: '#2ecc71', fontSize: '0.72rem', marginTop: 2 }}>
                      Earned Rewards: {formatPeso(jo.rewards_balance || 0)}
                    </div>
                    {nearestDeadline && (
                      <div style={{ color: isOverdue ? '#e74c3c' : '#f39c12', fontSize: '0.72rem', marginTop: 2, fontWeight: isOverdue ? 700 : 400 }}>
                        {isOverdue ? '⚠ OVERDUE' : 'Date Needed'}: {new Date(nearestDeadline).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                      {visibleItems.slice(0, 4).map((item: any) => {
                        const canMarkUnclaimed = item.job_status !== 'Done' && !receivedToday
                        return (
                          <span key={item.item_id} style={{ background: '#f0f0f0', color: '#999', fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: 10, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            {item.subcategories?.subcategory_name || item.item_id} · {item.job_status} · {formatPeso(item.computed_line_total || 0)}
                            {canMarkUnclaimed && (
                              <button
                                title="Mark unclaimed — client never came back for this item"
                                onClick={() => markUnclaimed(item.item_id, jo.job_order_id, item.subcategories?.subcategory_name || item.item_id)}
                                style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', padding: 0, fontSize: '0.7rem', lineHeight: 1, fontWeight: 700 }}
                              >
                                ✕
                              </button>
                            )}
                          </span>
                        )
                      })}
                      {visibleItems.length > 4 && <span style={{ color: '#aaa', fontSize: '0.65rem' }}>+{visibleItems.length - 4} more</span>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flexShrink: 0 }}>
                    {/* Edit / Add item / Copy tracking link / Generate receipt */}
                    <div style={{ display: 'flex', flexDirection: 'row', gap: 6, paddingTop: 2 }}>
                      <button title="Edit JO" onClick={() => setEditingJO(jo)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A1828', padding: 2, display: 'flex', alignItems: 'center' }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button title="Add Job Order Item" onClick={() => setAddingItemToJO(jo.job_order_id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#27ae60', padding: 2, display: 'flex', alignItems: 'center' }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                      </button>
                      <button title="Send tracking link to be pasted on social media platform" onClick={() => copyTrackLink(jo.public_token)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2980b9', padding: 2, display: 'flex', alignItems: 'center' }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                      </button>
                      <button title="Generate job order receipt to send for client approval" onClick={() => setReceiptJOId(jo.job_order_id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8e44ad', padding: 2, display: 'flex', alignItems: 'center' }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>
                      </button>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#999', fontSize: '0.65rem' }}>JO Total</div>
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

      <Pagination page={currentPage} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />

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

      {addingItemToJO && (
        <JOItemForm
          categories={categories}
          subcategories={subcategories}
          onSave={(item) => handleAddItemToExistingJO(addingItemToJO, item)}
          onClose={() => setAddingItemToJO(null)}
        />
      )}

      {receiptJOId && (
        <JOReceiptModal jobOrderId={receiptJOId} onClose={() => setReceiptJOId(null)} />
      )}
    </div>
  )
}
