'use client'

import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { formatPeso, generateItemId, buildFeedbackUrl, formatAge } from '@/lib/jo-helpers'
import type { AppUser } from '@/lib/user'
import EditJOModal from '@/components/EditJOModal'
import JOReceiptModal from '@/components/JOReceiptModal'
import JOItemForm from '../today/JOItemForm'

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

  function handleEditSave(joId: string, updates: any) {
    setJobOrders(prev => prev.map(j => j.job_order_id !== joId ? j : { ...j, ...updates }))
  }

  async function handleAddItemToExistingJO(joId: string, rawItem: any) {
    const supabase = createSupabaseBrowserClient()
    const { category_name, subcategory_name, ...item } = rawItem
    const { data: existingItems } = await supabase.from('job_order_items').select('item_id').eq('job_order_id', joId)
    const seq = (existingItems?.length || 0) + 1
    const itemId = generateItemId(joId, seq)
    await supabase.from('job_order_items').insert({ ...item, item_id: itemId, job_order_id: joId })
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
    await supabase.from('job_orders').update({ grand_total: newTotal }).eq('job_order_id', joId)
    setJobOrders(prev => prev.map(j => {
      if (j.job_order_id !== joId) return j
      return {
        ...j,
        grand_total: newTotal,
        job_order_items: [...(j.job_order_items || []), { item_id: itemId, job_status: 'Received', computed_line_total: item.computed_line_total }],
      }
    }))
    setAddingItemToJO(null)
  }

  function copyTrackLink(joId: string) {
    const url = `${window.location.origin}/track/${joId}`
    navigator.clipboard.writeText(url)
  }

  async function copyFeedbackLink(joId: string, clientName: string) {
    const url = buildFeedbackUrl(window.location.origin, joId, clientName)
    navigator.clipboard.writeText(url)
    const supabase = createSupabaseBrowserClient()
    await supabase.from('job_orders').update({ feedback_requested_at: new Date().toISOString() }).eq('job_order_id', joId)
    // Feedback has now been requested for this Done JO, so it no longer belongs in Active JOs
    setJobOrders(prev => prev.filter(j => j.job_order_id !== joId))
    alert('Feedback link copied — paste it into Messenger, Viber, SMS, or wherever the client prefers.')
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
            const isDone = jo.job_status === 'Done'
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
                      {items.slice(0, 4).map((item: any) => (
                        <span key={item.item_id} style={{ background: '#f0f0f0', color: '#999', fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: 10 }}>
                          {item.subcategories?.subcategory_name || item.item_id} · {item.job_status}
                        </span>
                      ))}
                      {items.length > 4 && <span style={{ color: '#aaa', fontSize: '0.65rem' }}>+{items.length - 4} more</span>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flexShrink: 0 }}>
                    {/* Edit / Add item / Copy tracking link / Copy feedback link */}
                    <div style={{ display: 'flex', flexDirection: 'row', gap: 6, paddingTop: 2 }}>
                      <button title="Edit JO" onClick={() => setEditingJO(jo)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A1828', padding: 2, display: 'flex', alignItems: 'center' }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button title="Add Job Order Item" onClick={() => setAddingItemToJO(jo.job_order_id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#27ae60', padding: 2, display: 'flex', alignItems: 'center' }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                      </button>
                      <button title="Send tracking link to be pasted on social media platform" onClick={() => copyTrackLink(jo.job_order_id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2980b9', padding: 2, display: 'flex', alignItems: 'center' }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                      </button>
                      <button title="Generate job order receipt to send for client approval" onClick={() => setReceiptJOId(jo.job_order_id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8e44ad', padding: 2, display: 'flex', alignItems: 'center' }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>
                      </button>
                      {isDone && (
                        <button title="Send feedback link to be pasted on social media platform" onClick={() => copyFeedbackLink(jo.job_order_id, clientName)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c9a84c', padding: 2, display: 'flex', alignItems: 'center' }}>
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        </button>
                      )}
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
