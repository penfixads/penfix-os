'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { generateJobOrderId, generateItemId, generateClientId, generatePaymentId, computeLineTotal, formatPeso, getNextJOSequence, buildFeedbackUrl } from '@/lib/jo-helpers'
import type { AppUser } from '@/lib/user'
import JOItemForm from './JOItemForm'
import { IconPlus, IconCirclePlus, IconX, IconCheck } from '@/components/icons'
import AddClientModal from './AddClientModal'
import EditJOModal from '@/components/EditJOModal'
import { sendTrackingEmail } from './actions'

interface Props {
  jobOrders: any[]
  clients: any[]
  categories: any[]
  subcategories: any[]
  currentUser: AppUser
}

export default function TodayJOsClient({ jobOrders: initialJOs, clients: initialClients, categories, subcategories, currentUser }: Props) {
  const router = useRouter()
  const [jobOrders, setJobOrders] = useState(initialJOs)
  const [clients, setClients] = useState(initialClients)
  const [showForm, setShowForm] = useState(false)
  const [showAddClient, setShowAddClient] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // JO form state
  const [selectedClientId, setSelectedClientId] = useState('')
  const [clientSearch, setClientSearch] = useState('')
  const [showClientDropdown, setShowClientDropdown] = useState(false)
  const [isForBilling, setIsForBilling] = useState(false)
  const [items, setItems] = useState<any[]>([])
  const [showItemForm, setShowItemForm] = useState(false)
  const [editingItem, setEditingItem] = useState<any | null>(null)
  const [addingItemToJO, setAddingItemToJO] = useState<string | null>(null) // joId of saved JO being edited

  // Edit JO modal state
  const [editingJO, setEditingJO] = useState<any | null>(null)
  const [payments, setPayments] = useState<any[]>([])
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [discount, setDiscount] = useState(0)
  const [overrideReason, setOverrideReason] = useState('')

  // Payment form state
  const [payAmount, setPayAmount] = useState('')
  const [payMethod, setPayMethod] = useState('Cash')
  const [payCashback, setPayCashback] = useState(0)

  const selectedClient = clients.find(c => c.client_id === selectedClientId)
  const [rewardsBalance, setRewardsBalance] = useState(0)

  useEffect(() => {
    if (!selectedClientId) { setRewardsBalance(0); return }
    const supabase = createSupabaseBrowserClient()
    supabase.from('rewards_ledger').select('type, amount').eq('client_id', selectedClientId).then(({ data }) => {
      const earned = (data || []).filter(r => r.type === 'earned').reduce((s, r) => s + (r.amount || 0), 0)
      const redeemed = (data || []).filter(r => r.type === 'redeemed').reduce((s, r) => s + (r.amount || 0), 0)
      setRewardsBalance(Math.max(0, earned - redeemed))
    })
  }, [selectedClientId])

  // "For Billing" is the client's credit-line status as declared in the database —
  // not user-editable here, so staff can't flip it just to skip the override reason.
  useEffect(() => {
    setIsForBilling(!!selectedClient?.credit_line_status)
  }, [selectedClientId])

  const earnedRewards = rewardsBalance
  const grandTotal = items.reduce((s, i) => s + (i.computed_line_total || 0), 0) - discount
  const totalPaid = payments.reduce((s, p) => s + (p.amount || 0), 0)
  const cashbackDiscount = payments.reduce((s, p) => s + (p.cashback || 0), 0)
  const balanceDue = grandTotal - totalPaid - cashbackDiscount
  const paymentStatus = (() => {
    if (isForBilling) return 'For Billing'
    if (totalPaid === 0 && cashbackDiscount === 0) return 'Pending Payment'
    if (totalPaid + cashbackDiscount >= grandTotal) return 'Fully Paid'
    if ((totalPaid + cashbackDiscount) >= grandTotal * 0.5) return 'Downpayment Received'
    return 'Below 50% Downpayment'
  })()
  const needsOverride = (paymentStatus === 'Below 50% Downpayment' || paymentStatus === 'Pending Payment') && !isForBilling

  const filteredClients = clients.filter(c => {
    const q = clientSearch.toLowerCase()
    return (c.client_name || '').toLowerCase().includes(q) || (c.company_name || '').toLowerCase().includes(q)
  }).slice(0, 10)

  function resetForm() {
    setSelectedClientId('')
    setClientSearch('')
    setIsForBilling(false)
    setItems([])
    setPayments([])
    setDiscount(0)
    setOverrideReason('')
    setPayAmount('')
    setPayCashback(0)
    setShowItemForm(false)
    setShowPaymentForm(false)
    setError('')
  }

  async function handleSave() {
    if (!selectedClientId) { setError('Please select a client.'); return }
    if (items.length === 0) { setError('Add at least one job order item.'); return }
    if (needsOverride && !overrideReason) { setError('Please provide a reason for the override.'); return }
    setSaving(true)
    setError('')
    try {
      const supabase = createSupabaseBrowserClient()
      const now = new Date()
      const mm = String(now.getMonth() + 1).padStart(2, '0')
      const dd = String(now.getDate()).padStart(2, '0')
      const yyyy = now.getFullYear()
      const dateStr = `${mm}${dd}${yyyy}`

      // Two staff saving a JO at the same moment can both compute the same "next"
      // sequence number from stale local state, so retry against a fresh DB read
      // on a duplicate-key conflict instead of failing the whole save.
      let joId = ''
      for (let attempt = 0; attempt < 5; attempt++) {
        const { data: existing } = await supabase.from('job_orders').select('job_order_id').like('job_order_id', `JO-${dateStr}-%`)
        const seq = getNextJOSequence((existing || []).map(j => j.job_order_id), dateStr)
        joId = generateJobOrderId(seq)
        const { error: joErr } = await supabase.from('job_orders').insert({
          job_order_id: joId,
          user_email: currentUser.email,
          client_id: selectedClientId,
          date_time_received: now.toISOString(),
          payment_status: paymentStatus,
          grand_total: grandTotal,
          total_amount_paid: totalPaid,
          discount,
          cashback_discount: cashbackDiscount,
          received_by: currentUser.name,
          request_override: overrideReason || null,
          override_status: needsOverride ? 'Pending' : null,
          is_for_billing: isForBilling,
          is_fully_paid: paymentStatus === 'Fully Paid',
        })
        if (!joErr) break
        if (joErr.code !== '23505' || attempt === 4) throw joErr
      }

      // Insert items
      for (let i = 0; i < items.length; i++) {
        const { category_name, subcategory_name, ...item } = items[i]
        const itemId = generateItemId(joId, i + 1)
        const { error: itemErr } = await supabase.from('job_order_items').insert({
          ...item,
          item_id: itemId,
          job_order_id: joId,
        })
        if (itemErr) throw itemErr
      }

      // Insert payments
      for (let i = 0; i < payments.length; i++) {
        const pay = payments[i]
        const payId = generatePaymentId(joId, i + 1)
        const { error: payErr } = await supabase.from('payments').insert({
          payment_id: payId,
          job_order_id: joId,
          client_id: selectedClientId,
          grand_total: grandTotal,
          amount: pay.amount,
          payment_method: pay.method,
          payment_date: now.toISOString().split('T')[0],
          recorded_by: currentUser.name,
          remarks: pay.remarks || null,
        })
        if (payErr) throw payErr
      }

      // Record redeemed rewards if cashback was applied
      if (cashbackDiscount > 0) {
        await supabase.from('rewards_ledger').insert({
          ledger_id: `REDM-${joId}`,
          client_id: selectedClientId,
          job_order_id: joId,
          type: 'redeemed',
          amount: cashbackDiscount,
          notes: `Cashback redeemed on JO ${joId}`,
        })
      }

      // Add new JO to local state immediately — no page reload needed
      const newJO = {
        job_order_id: joId,
        clients: { client_name: selectedClient?.client_name, company_name: selectedClient?.company_name },
        job_order_items: items.map((item, i) => ({
          item_id: generateItemId(joId, i + 1),
          job_status: 'Received',
          computed_line_total: item.computed_line_total,
        })),
        grand_total: grandTotal,
        total_amount_paid: totalPaid,
        balance_due: grandTotal - totalPaid - cashbackDiscount,
        payment_status: paymentStatus,
        date_time_received: now.toISOString(),
        received_by: currentUser.name,
        is_for_billing: isForBilling,
        client_id: selectedClientId,
        rewards_balance: Math.max(0, earnedRewards - cashbackDiscount),
      }
      setJobOrders(prev => [newJO, ...prev])
      resetForm()
      setShowForm(false)

      // Best-effort: email the client their tracking link if we have an address on file.
      // Never blocks or fails the JO save if this errors out.
      if (selectedClient?.email) {
        sendTrackingEmail(joId, selectedClient.email, selectedClient.client_name || selectedClient.company_name, window.location.origin).catch(() => {})
      }
    } catch (e: any) {
      setError(e.message || 'Failed to save job order.')
    } finally {
      setSaving(false)
    }
  }

  async function handleAddItemToExistingJO(joId: string, rawItem: any) {
    const supabase = createSupabaseBrowserClient()
    const { category_name, subcategory_name, ...item } = rawItem
    const { data: existingItems } = await supabase.from('job_order_items').select('item_id').eq('job_order_id', joId)
    const seq = (existingItems?.length || 0) + 1
    const itemId = generateItemId(joId, seq)
    await supabase.from('job_order_items').insert({ ...item, item_id: itemId, job_order_id: joId })
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

  function copyTrackLink(joId: string) {
    const url = `${window.location.origin}/track/${joId}`
    navigator.clipboard.writeText(url)
  }

  async function copyFeedbackLink(joId: string, clientName: string) {
    const url = buildFeedbackUrl(window.location.origin, joId, clientName)
    navigator.clipboard.writeText(url)
    const supabase = createSupabaseBrowserClient()
    await supabase.from('job_orders').update({ feedback_requested_at: new Date().toISOString() }).eq('job_order_id', joId)
    alert('Feedback link copied — paste it into Messenger, Viber, SMS, or wherever the client prefers.')
  }

  function addPayment() {
    const amt = parseFloat(payAmount) || 0
    if (amt <= 0) return
    setPayments(prev => [...prev, { amount: amt, method: payMethod, cashback: payCashback }])
    setPayAmount('')
    setPayCashback(0)
    setShowPaymentForm(false)
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
        <button onClick={() => { resetForm(); setShowForm(true) }} className="pf-btn">
          <IconPlus />New JO
        </button>
      </div>

      {/* JO List */}
      {jobOrders.length === 0 ? (
        <div style={{ color: '#aaa', textAlign: 'center', marginTop: '3rem', fontSize: '0.9rem' }}>No job orders received today yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {jobOrders.map(jo => {
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
                      <button title="Send tracking link to be pasted on social media platform" onClick={() => copyTrackLink(jo.job_order_id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2980b9', padding: 2, display: 'flex', alignItems: 'center' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
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

      {/* New JO Modal */}
      {showForm && (
        <div className="pf-modal-overlay" style={{ background: 'rgba(0,0,0,0.7)', alignItems: 'flex-start' }}>
          <div className="pf-modal-card pf-modal-wine" style={{ maxWidth: 560, marginTop: '1rem' }}>
            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ color: '#fff', fontSize: '1.7rem', fontWeight: 700 }}>New Job Order</h2>
              <button onClick={() => { resetForm(); setShowForm(false) }} style={{ background: 'none', border: 'none', color: '#E8B9C6', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            {/* User */}
            <div className="pf-field" style={{ color: '#E8B9C6', fontSize: '0.85rem' }}>
              User: <span style={{ color: '#fff', fontWeight: 600 }}>{currentUser.name}</span>
            </div>

            {/* Client search */}
            <div className="pf-field">
              <label className="pf-label">Client <span className="pf-req">*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search client name..."
                  value={clientSearch}
                  onChange={e => { setClientSearch(e.target.value); setShowClientDropdown(!!e.target.value); setSelectedClientId('') }}
                  className="pf-input"
                />
                {showClientDropdown && clientSearch && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, zIndex: 10, maxHeight: 220, overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    {filteredClients.length === 0 && clientSearch && (
                      <div style={{ padding: '0.6rem 0.85rem', color: '#999', fontSize: '0.85rem' }}>No clients found</div>
                    )}
                    {filteredClients.map(c => (
                      <div
                        key={c.client_id}
                        onClick={() => { setSelectedClientId(c.client_id); setClientSearch(c.client_name || c.company_name); setShowClientDropdown(false) }}
                        style={{ padding: '0.6rem 0.85rem', cursor: 'pointer', color: '#1a1a1a', fontSize: '0.85rem', borderBottom: '1px solid #f0f0f0' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#FDF5EC')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{ fontWeight: 600 }}>
                          {c.client_name || c.company_name}
                          {c.company_name && c.client_name && (
                            <span style={{ color: '#7A1828', fontWeight: 600 }}> · {c.company_name}</span>
                          )}
                        </div>
                        <div style={{ color: '#999', fontSize: '0.72rem' }}>{c.client_id} {c.credit_line_status ? '· Credit Line' : ''}</div>
                      </div>
                    ))}
                    <div
                      onClick={() => { setShowClientDropdown(false); setShowAddClient(true) }}
                      style={{ padding: '0.6rem 0.85rem', cursor: 'pointer', color: '#7A1828', fontSize: '0.85rem', fontWeight: 600, borderTop: '1px solid #f0f0f0' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#fdf0f0')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      + Add New Client
                    </div>
                  </div>
                )}
              </div>
              {selectedClient && (
                <div style={{ color: '#2ecc71', fontSize: '0.75rem', marginTop: 4 }}>
                  Earned Rewards: {formatPeso(earnedRewards)} · {selectedClient.credit_line_status ? 'Credit Line Active' : 'No Credit Line'}
                </div>
              )}
            </div>

            {/* Billing toggle — read-only, mirrors the client's credit_line_status in the database */}
            <div className="pf-field">
              <label className="pf-label">Is Client Type for Billing?</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['N', 'Y'].map(v => (
                  <button key={v} type="button" disabled title="Set by the client's credit line status. Edit the client record to change it."
                    className={(v === 'Y') === isForBilling ? 'pf-btn' : 'pf-btn pf-btn-secondary'} style={{ minWidth: 56, opacity: (v === 'Y') === isForBilling ? 1 : 0.5, cursor: 'not-allowed' }}>
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Job Order Items */}
            <div className="pf-field">
              <div className="pf-group-box">
                {items.length > 0 ? (
                  <div style={{ marginBottom: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {items.map((item, i) => (
                      <div key={i} style={{ background: '#f0f0f0', borderRadius: 8, padding: '0.6rem 0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ color: '#1a1a1a', fontSize: '0.8rem', fontWeight: 600 }}>{item.subcategory_name}</div>
                          <div style={{ color: '#777', fontSize: '0.72rem' }}>{item.production_specs}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ color: '#1a1a1a', fontSize: '0.82rem' }}>{formatPeso(item.computed_line_total)}</span>
                          <button onClick={() => { setItems(prev => prev.filter((_, j) => j !== i)) }} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '0.9rem' }}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="pf-group-empty">No job order items were added.</div>
                )}
                <div className="pf-group-box-actions">
                  <button type="button" onClick={() => setShowItemForm(true)} className="pf-link-btn">
                    <IconCirclePlus />Add Job Order Item <span className="pf-req">*</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Payments */}
            <div className="pf-field">
              <div className="pf-group-box">
                {payments.length > 0 ? (
                  <div style={{ marginBottom: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {payments.map((p, i) => (
                      <div key={i} style={{ background: '#f0f0f0', borderRadius: 8, padding: '0.5rem 0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#1a1a1a', fontSize: '0.8rem' }}>{p.method} · {formatPeso(p.amount)}{p.cashback > 0 ? ` · Cashback: ${formatPeso(p.cashback)}` : ''}</span>
                        <button onClick={() => setPayments(prev => prev.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer' }}>✕</button>
                      </div>
                    ))}
                  </div>
                ) : !showPaymentForm && (
                  <div className="pf-group-empty">No payments were added.</div>
                )}
                {showPaymentForm ? (
                  <div className="pf-payment-panel" style={{ borderRadius: 8, padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <label className="pf-label">Amount</label>
                        <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} placeholder="0.00" className="pf-input" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label className="pf-label">Method</label>
                        <select value={payMethod} onChange={e => setPayMethod(e.target.value)} className="pf-select">
                          {['Cash','G-Cash','Maya','Bank Transfer via BPI Acct.','Bank Transfer via BDO Acct.','Cheque'].map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {earnedRewards > 0 && (
                      <div>
                        <label className="pf-label">Apply Cashback (Available: {formatPeso(earnedRewards)})</label>
                        <input type="number" value={payCashback} onChange={e => setPayCashback(Math.min(parseFloat(e.target.value) || 0, earnedRewards))} placeholder="0.00" className="pf-input" />
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button onClick={() => setShowPaymentForm(false)} className="pf-btn pf-btn-secondary"><IconX />Cancel</button>
                      <button onClick={addPayment} className="pf-btn"><IconPlus />Add</button>
                    </div>
                  </div>
                ) : (
                  <div className="pf-group-box-actions">
                    <button type="button" onClick={() => setShowPaymentForm(true)} className="pf-link-btn">
                      <IconCirclePlus />Add Payment
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Totals */}
            <div className="pf-totals-box">
              <div className="pf-totals-row"><span>Grand Total</span><span style={{ color: '#000', fontWeight: 700 }}>{formatPeso(grandTotal)}</span></div>
              <div className="pf-totals-row"><span>Discount</span>
                <input type="number" value={discount} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} className="pf-input" style={{ width: 100, textAlign: 'right' }} />
              </div>
              <div className="pf-totals-row"><span>Total Paid</span><span style={{ color: '#000' }}>{formatPeso(totalPaid)}</span></div>
              <div className="pf-totals-row"><span>Balance Due</span><span style={{ color: '#400016', fontWeight: 700 }}>{formatPeso(balanceDue)}</span></div>
              <div className="pf-totals-row" style={{ marginBottom: 0 }}><span>Status</span><span style={{ color: '#000', fontWeight: 600, fontSize: '0.8rem' }}>{paymentStatus}</span></div>
            </div>

            {/* Override reason */}
            {needsOverride && (
              <div className="pf-field">
                <label className="pf-label" style={{ color: '#f1c40f' }}>Reason for override (below 50%) <span className="pf-req">*</span></label>
                <textarea value={overrideReason} onChange={e => setOverrideReason(e.target.value)} rows={3} placeholder="Please provide a reason..." className="pf-textarea" />
                <div style={{ color: '#e74c3c', fontSize: '0.72rem', marginTop: 4 }}>This will be sent to the manager for approval before production can start.</div>
              </div>
            )}

            {error && <div style={{ color: '#e74c3c', fontSize: '0.82rem', marginBottom: '0.75rem' }}>{error}</div>}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => { resetForm(); setShowForm(false) }} className="pf-btn pf-btn-secondary"><IconX />Cancel</button>
              <button onClick={handleSave} disabled={saving} className="pf-btn">
                <IconCheck />{saving ? 'Saving…' : 'Save Job Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Form Modal (new JO) */}
      {showItemForm && (
        <JOItemForm
          categories={categories}
          subcategories={subcategories}
          onSave={(item) => { setItems(prev => [...prev, item]); setShowItemForm(false) }}
          onClose={() => setShowItemForm(false)}
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

      {/* Add Client Modal */}
      {showAddClient && (
        <AddClientModal
          currentUser={currentUser}
          onSave={(newClient) => {
            setClients(prev => [...prev, newClient])
            setSelectedClientId(newClient.client_id)
            setClientSearch(newClient.client_name || newClient.company_name)
            setShowAddClient(false)
          }}
          onClose={() => setShowAddClient(false)}
        />
      )}
    </div>
  )
}

const chipStyle: React.CSSProperties = { display: 'inline-block', background: '#f0f0f0', color: '#1a1a1a', borderRadius: 20, padding: '0.3rem 0.85rem', fontSize: '0.8rem' }
const th: React.CSSProperties = { padding: '0.4rem 0.6rem', textAlign: 'left', fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.03em' }
const td: React.CSSProperties = { padding: '0.45rem 0.6rem', verticalAlign: 'top' }
