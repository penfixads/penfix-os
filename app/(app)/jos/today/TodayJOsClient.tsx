'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { generateItemId, formatPeso, buildFeedbackUrl } from '@/lib/jo-helpers'
import type { AppUser } from '@/lib/user'
import JOItemForm from './JOItemForm'
import NewJOModal from '@/components/NewJOModal'
import EditJOModal from '@/components/EditJOModal'
import JOReceiptModal from '@/components/JOReceiptModal'
import { IconPlus } from '@/components/icons'
import Pagination from '@/components/Pagination'

const PAGE_SIZE = 10

interface Props {
  jobOrders: any[]
  clients: any[]
  categories: any[]
  subcategories: any[]
  currentUser: AppUser
  // Set when this page was opened by scanning a client's QR code (?client=<id>) — auto-opens
  // New JO pre-filled with that client instead of making staff search for them again.
  initialClientId?: string
}

export default function TodayJOsClient({ jobOrders: initialJOs, clients, categories, subcategories, currentUser, initialClientId }: Props) {
  const router = useRouter()
  const [jobOrders, setJobOrders] = useState(initialJOs)
  // Which client the New JO modal should open pre-filled for — set when arriving via a
  // scanned QR link (initialClientId); otherwise staff pick the client inside the form.
  const [activeClientId, setActiveClientId] = useState<string | undefined>(initialClientId)
  const [showForm, setShowForm] = useState(!!initialClientId)
  const [editingJO, setEditingJO] = useState<any | null>(null)
  const [addingItemToJO, setAddingItemToJO] = useState<string | null>(null) // joId of saved JO being edited
  const [receiptJOId, setReceiptJOId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const currentPage = Math.min(page, Math.max(1, Math.ceil(jobOrders.length / PAGE_SIZE)))
  const pageItems = jobOrders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

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
    // Recalculate grand total
    const { data: allItems } = await supabase.from('job_order_items').select('computed_line_total').eq('job_order_id', joId)
    const newTotal = (allItems || []).reduce((s: number, i: any) => s + (i.computed_line_total || 0), 0)
    await supabase.from('job_orders').update({ grand_total: newTotal }).eq('job_order_id', joId)
    // Update local state immediately — no page refresh needed
    setJobOrders(prev => prev.map(j => {
      if (j.job_order_id !== joId) return j
      return {
        ...j,
        grand_total: newTotal,
        job_order_items: [...(j.job_order_items || []), { item_id: itemId, computed_line_total: item.computed_line_total }],
      }
    }))
    setAddingItemToJO(null)
  }

  function copyTrackLink(publicToken: string) {
    const url = `${window.location.origin}/track/${publicToken}`
    navigator.clipboard.writeText(url)
  }

  async function copyFeedbackLink(joId: string, clientName: string) {
    const url = buildFeedbackUrl(window.location.origin, joId, clientName)
    navigator.clipboard.writeText(url)
    const supabase = createSupabaseBrowserClient()
    await supabase.from('job_orders').update({ feedback_requested_at: new Date().toISOString() }).eq('job_order_id', joId)
    alert('Feedback link copied — paste it into Messenger, Viber, SMS, or wherever the client prefers.')
  }

  function handleEditSave(joId: string, updates: any) {
    setJobOrders(prev => prev.map(j => j.job_order_id !== joId ? j : { ...j, ...updates }))
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ color: '#7A1828', fontSize: '1.4rem', fontWeight: 700 }}>Today&apos;s Received JOs</h1>
          <p style={{ color: '#777', fontSize: '0.8rem', marginTop: 2 }}>{new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="pf-btn">
          <IconPlus />New JO
        </button>
      </div>

      {/* JO List */}
      {jobOrders.length === 0 ? (
        <div style={{ color: '#aaa', textAlign: 'center', marginTop: '3rem', fontSize: '0.9rem' }}>No job orders received today yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {pageItems.map(jo => {
            const clientName = jo.clients?.client_name || jo.clients?.company_name || jo.client_id
            const deadline = jo.job_order_items?.[0]?.date_time_needed
            const hasBalance = jo.balance_due > 0
            const isDone = jo.job_status === 'Done'
            return (
              <div key={jo.job_order_id} style={{ background: '#FDF5EC', borderRadius: 10, padding: '0.85rem 1rem', border: '1px solid #EDE0CC' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ color: '#1a1a1a', fontWeight: 700, fontSize: '0.9rem' }}>{clientName}</div>
                    <div style={{ color: '#777', fontSize: '0.75rem', marginTop: 2 }}>
                      {jo.job_order_id} · {jo.job_order_items?.length || 0} item(s)
                    </div>
                    {deadline && (
                      <div style={{ color: '#999', fontSize: '0.73rem' }}>
                        Deadline: {new Date(deadline).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                    <div style={{ color: '#2ecc71', fontSize: '0.72rem', marginTop: 2 }}>
                      Earned Rewards: {formatPeso(jo.rewards_balance || 0)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'flex', flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                      <button title="Edit JO" onClick={() => setEditingJO(jo)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A1828', padding: 2, display: 'flex', alignItems: 'center' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button title="Add Job Order Item" onClick={() => setAddingItemToJO(jo.job_order_id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#27ae60', padding: 2, display: 'flex', alignItems: 'center' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                      </button>
                      <button title="Send tracking link to be pasted on social media platform" onClick={() => copyTrackLink(jo.public_token)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2980b9', padding: 2, display: 'flex', alignItems: 'center' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                      </button>
                      <button title="Generate job order receipt to send for client approval" onClick={() => setReceiptJOId(jo.job_order_id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8e44ad', padding: 2, display: 'flex', alignItems: 'center' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>
                      </button>
                      {isDone && (
                        <button title="Send feedback link to be pasted on social media platform" onClick={() => copyFeedbackLink(jo.job_order_id, clientName)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c9a84c', padding: 2, display: 'flex', alignItems: 'center' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        </button>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: hasBalance ? '#e74c3c' : '#2ecc71', fontWeight: 700, fontSize: '0.9rem' }}>
                        {formatPeso(jo.grand_total || 0)}
                      </div>
                      <div style={{ color: '#777', fontSize: '0.72rem' }}>Bal: {formatPeso(jo.balance_due || 0)}</div>
                      <div style={{ color: '#7A1828', fontSize: '0.68rem', marginTop: 2 }}>{jo.payment_status}</div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Pagination page={currentPage} totalItems={jobOrders.length} pageSize={PAGE_SIZE} onPageChange={setPage} />

      {showForm && (
        <NewJOModal
          clients={clients}
          categories={categories}
          subcategories={subcategories}
          currentUser={currentUser}
          initialClientId={activeClientId}
          onClose={() => { setShowForm(false); setActiveClientId(undefined); if (initialClientId) router.replace('/jos/today') }}
          onCreated={(newJO) => {
            setJobOrders(prev => [newJO, ...prev])
            setPage(1)
            setShowForm(false)
            setActiveClientId(undefined)
            if (initialClientId) router.replace('/jos/today')
          }}
        />
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

      {/* Item Form Modal (existing saved JO) */}
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
