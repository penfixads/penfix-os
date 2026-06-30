'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { generateJobOrderId, generateItemId, generateClientId, generatePaymentId, computeLineTotal, formatPeso, getNextJOSequence } from '@/lib/jo-helpers'
import type { AppUser } from '@/lib/user'
import JOItemForm from './JOItemForm'
import AddClientModal from './AddClientModal'

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
  const [editItems, setEditItems] = useState<any[]>([])
  const [editPayments, setEditPayments] = useState<any[]>([])
  const [editDiscount, setEditDiscount] = useState(0)
  const [editIsForBilling, setEditIsForBilling] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')
  const [removedItemIds, setRemovedItemIds] = useState<string[]>([])
  const [removedPaymentIds, setRemovedPaymentIds] = useState<string[]>([])
  const [showEditItemForm, setShowEditItemForm] = useState(false)
  const [showEditPayForm, setShowEditPayForm] = useState(false)
  const [editPayAmount, setEditPayAmount] = useState('')
  const [editPayMethod, setEditPayMethod] = useState('Cash')
  const [editPayCashback, setEditPayCashback] = useState(0)
  const [payments, setPayments] = useState<any[]>([])
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [discount, setDiscount] = useState(0)
  const [overrideReason, setOverrideReason] = useState('')

  // Payment form state
  const [payAmount, setPayAmount] = useState('')
  const [payMethod, setPayMethod] = useState('Cash')
  const [payCashback, setPayCashback] = useState(0)

  const selectedClient = clients.find(c => c.client_id === selectedClientId)
  const earnedRewards = selectedClient?.earned_rewards || 0
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
  const needsOverride = paymentStatus === 'Below 50% Downpayment' && !isForBilling

  const filteredClients = clients.filter(c => {
    const name = (c.client_name || c.company_name || '').toLowerCase()
    return name.includes(clientSearch.toLowerCase())
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
      const existingIds = jobOrders.map(j => j.job_order_id)
      const seq = getNextJOSequence(existingIds, dateStr)
      const joId = generateJobOrderId(seq)

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
      if (joErr) throw joErr

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
      }
      setJobOrders(prev => [newJO, ...prev])
      resetForm()
      setShowForm(false)
    } catch (e: any) {
      setError(e.message || 'Failed to save job order.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteJO(joId: string) {
    if (!confirm(`Delete job order ${joId}? This cannot be undone.`)) return
    const supabase = createSupabaseBrowserClient()
    await supabase.from('job_orders').delete().eq('job_order_id', joId)
    setJobOrders(prev => prev.filter(j => j.job_order_id !== joId))
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

  function addPayment() {
    const amt = parseFloat(payAmount) || 0
    if (amt <= 0) return
    setPayments(prev => [...prev, { amount: amt, method: payMethod, cashback: payCashback }])
    setPayAmount('')
    setPayCashback(0)
    setShowPaymentForm(false)
  }

  // Edit JO computed values
  const editGrandTotal = editItems.reduce((s, i) => s + (i.computed_line_total || 0), 0) - editDiscount
  const editTotalPaid = editPayments.reduce((s, p) => s + (p.amount || 0), 0)
  const editCashback = editPayments.reduce((s, p) => s + (p.cashback || 0), 0)
  const editBalance = editGrandTotal - editTotalPaid - editCashback
  const editPaymentStatus = (() => {
    if (editIsForBilling) return 'For Billing'
    if (editTotalPaid === 0 && editCashback === 0) return 'Pending Payment'
    if (editTotalPaid + editCashback >= editGrandTotal) return 'Fully Paid'
    if ((editTotalPaid + editCashback) >= editGrandTotal * 0.5) return 'Downpayment Received'
    return 'Below 50% Downpayment'
  })()
  const editClient = clients.find(c => c.client_id === editingJO?.client_id)
  const editEarnedRewards = editClient?.earned_rewards || 0

  async function openEditJO(jo: any) {
    setEditingJO(jo)
    setEditLoading(true)
    setEditError('')
    setRemovedItemIds([])
    setRemovedPaymentIds([])
    setEditDiscount(jo.discount || 0)
    setEditIsForBilling(jo.is_for_billing || false)
    const supabase = createSupabaseBrowserClient()
    const [{ data: itemsData }, { data: paysData }] = await Promise.all([
      supabase.from('job_order_items')
        .select('*, subcategories(subcategory_name, category_id)')
        .eq('job_order_id', jo.job_order_id)
        .order('item_id'),
      supabase.from('payments')
        .select('*')
        .eq('job_order_id', jo.job_order_id)
        .order('payment_date'),
    ])
    setEditItems((itemsData || []).map(i => ({
      ...i,
      subcategory_name: i.subcategories?.subcategory_name || i.item_id,
      _existing: true,
    })))
    setEditPayments((paysData || []).map(p => ({
      ...p,
      method: p.payment_method,
      cashback: p.cashback_amount || 0,
      _existing: true,
    })))
    setEditLoading(false)
  }

  function closeEditJO() {
    setEditingJO(null)
    setEditItems([])
    setEditPayments([])
    setEditError('')
    setShowEditItemForm(false)
    setShowEditPayForm(false)
  }

  async function handleSaveEdit() {
    if (!editingJO) return
    setEditSaving(true)
    setEditError('')
    try {
      const supabase = createSupabaseBrowserClient()
      const joId = editingJO.job_order_id

      // Delete removed items
      for (const id of removedItemIds) {
        await supabase.from('job_order_items').delete().eq('item_id', id)
      }
      // Delete removed payments
      for (const id of removedPaymentIds) {
        await supabase.from('payments').delete().eq('payment_id', id)
      }
      // Insert new items (those without _existing)
      const newItems = editItems.filter(i => !i._existing)
      const existingCount = editItems.filter(i => i._existing).length
      for (let i = 0; i < newItems.length; i++) {
        const { category_name, subcategory_name, _existing, subcategories, ...item } = newItems[i]
        const itemId = generateItemId(joId, existingCount + i + 1)
        await supabase.from('job_order_items').insert({ ...item, item_id: itemId, job_order_id: joId })
      }
      // Insert new payments
      const newPays = editPayments.filter(p => !p._existing)
      const existingPayCount = editPayments.filter(p => p._existing).length
      for (let i = 0; i < newPays.length; i++) {
        const payId = generatePaymentId(joId, existingPayCount + i + 1)
        await supabase.from('payments').insert({
          payment_id: payId,
          job_order_id: joId,
          client_id: editingJO.client_id,
          grand_total: editGrandTotal,
          amount: newPays[i].amount,
          payment_method: newPays[i].method,
          payment_date: new Date().toISOString().split('T')[0],
          recorded_by: currentUser.name,
        })
      }
      // Update JO totals
      await supabase.from('job_orders').update({
        grand_total: editGrandTotal,
        total_amount_paid: editTotalPaid,
        discount: editDiscount,
        cashback_discount: editCashback,
        payment_status: editPaymentStatus,
        is_for_billing: editIsForBilling,
        is_fully_paid: editPaymentStatus === 'Fully Paid',
        balance_due: editBalance,
      }).eq('job_order_id', joId)

      // Update local state
      setJobOrders(prev => prev.map(j => {
        if (j.job_order_id !== joId) return j
        return {
          ...j,
          grand_total: editGrandTotal,
          total_amount_paid: editTotalPaid,
          balance_due: editBalance,
          payment_status: editPaymentStatus,
          is_for_billing: editIsForBilling,
          job_order_items: editItems.map(i => ({ item_id: i.item_id, computed_line_total: i.computed_line_total })),
        }
      }))
      closeEditJO()
    } catch (e: any) {
      setEditError(e.message || 'Failed to save changes.')
    } finally {
      setEditSaving(false)
    }
  }

  function addEditPayment() {
    const amt = parseFloat(editPayAmount) || 0
    if (amt <= 0) return
    setEditPayments(prev => [...prev, { amount: amt, method: editPayMethod, cashback: editPayCashback }])
    setEditPayAmount('')
    setEditPayCashback(0)
    setShowEditPayForm(false)
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ color: '#7A1828', fontSize: '1.4rem', fontWeight: 700 }}>Today&apos;s Received JOs</h1>
          <p style={{ color: '#777', fontSize: '0.8rem', marginTop: 2 }}>{new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true) }} style={{ background: '#7A1828', color: '#fff', border: '2px solid #C9A84C', borderRadius: 999, padding: '0.6rem 1.2rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
          + New JO
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
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'flex', flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                      <button title="Edit JO" onClick={() => openEditJO(jo)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A1828', padding: 2, display: 'flex', alignItems: 'center' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button title="Delete JO" onClick={() => handleDeleteJO(jo.job_order_id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c', padding: 2, display: 'flex', alignItems: 'center' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                      </button>
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}>
          <div style={{ background: '#FDF5EC', borderRadius: 14, width: '100%', maxWidth: 560, padding: '1.5rem', marginTop: '1rem' }}>
            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ color: '#7A1828', fontSize: '1.1rem', fontWeight: 700 }}>New Job Order</h2>
              <button onClick={() => { resetForm(); setShowForm(false) }} style={{ background: 'none', border: 'none', color: '#999', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            {/* User */}
            <div style={fieldStyle}>
              <label style={labelStyle}>User</label>
              <div style={{ ...chipStyle }}>{currentUser.name}</div>
            </div>

            {/* Client search */}
            <div style={fieldStyle}>
              <label style={labelStyle}>Client <span style={{ color: '#e74c3c' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search client name..."
                  value={clientSearch}
                  onChange={e => { setClientSearch(e.target.value); setShowClientDropdown(true); setSelectedClientId('') }}
                  onFocus={() => setShowClientDropdown(true)}
                  style={inputStyle}
                />
                {showClientDropdown && (
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
                        <div style={{ fontWeight: 600 }}>{c.client_name || c.company_name}</div>
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

            {/* Billing toggle */}
            <div style={fieldStyle}>
              <label style={labelStyle}>Is Client Type for Billing?</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['N', 'Y'].map(v => (
                  <button key={v} type="button" onClick={() => setIsForBilling(v === 'Y')}
                    style={{ flex: 1, padding: '0.5rem', borderRadius: 7, border: '1.5px solid', borderColor: (v === 'Y') === isForBilling ? '#7A1828' : '#333', background: (v === 'Y') === isForBilling ? '#7A1828' : 'transparent', color: '#1a1a1a', cursor: 'pointer', fontWeight: 600 }}>
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Job Order Items */}
            <div style={fieldStyle}>
              <label style={labelStyle}>Job Order Items <span style={{ color: '#e74c3c' }}>*</span></label>
              {items.length > 0 && (
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
              )}
              <button type="button" onClick={() => setShowItemForm(true)} style={{ width: '100%', background: '#f0f0f0', border: '1px dashed #444', color: '#7A1828', fontWeight: 700, padding: '0.6rem', borderRadius: 8, cursor: 'pointer' }}>
                + Add Item
              </button>
            </div>

            {/* Totals */}
            <div style={{ background: '#FDF5EC', borderRadius: 8, padding: '0.75rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={totalRowStyle}><span>Grand Total</span><span>{formatPeso(grandTotal)}</span></div>
              <div style={totalRowStyle}><span>Discount</span>
                <input type="number" value={discount} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} style={{ ...inputStyle, width: 100, padding: '0.2rem 0.5rem', textAlign: 'right' }} />
              </div>
              <div style={totalRowStyle}><span>Total Paid</span><span>{formatPeso(totalPaid)}</span></div>
              <div style={totalRowStyle}><span>Balance Due</span><span style={{ color: balanceDue > 0 ? '#e74c3c' : '#2ecc71', fontWeight: 700 }}>{formatPeso(balanceDue)}</span></div>
              <div style={totalRowStyle}><span>Status</span><span style={{ color: '#7A1828', fontWeight: 600, fontSize: '0.8rem' }}>{paymentStatus}</span></div>
            </div>

            {/* Payments */}
            <div style={fieldStyle}>
              <label style={labelStyle}>Payments</label>
              {payments.length > 0 && (
                <div style={{ marginBottom: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {payments.map((p, i) => (
                    <div key={i} style={{ background: '#f0f0f0', borderRadius: 8, padding: '0.5rem 0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#1a1a1a', fontSize: '0.8rem' }}>{p.method} · {formatPeso(p.amount)}{p.cashback > 0 ? ` · Cashback: ${formatPeso(p.cashback)}` : ''}</span>
                      <button onClick={() => setPayments(prev => prev.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer' }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
              {showPaymentForm ? (
                <div style={{ background: '#f0f0f0', borderRadius: 8, padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Amount</label>
                      <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} placeholder="0.00" style={inputStyle} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Method</label>
                      <select value={payMethod} onChange={e => setPayMethod(e.target.value)} style={inputStyle}>
                        {['Cash','G-Cash','Maya','Bank Transfer via BPI Acct.','Bank Transfer via BDO Acct.','Cheque'].map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {earnedRewards > 0 && (
                    <div>
                      <label style={labelStyle}>Apply Cashback (Available: {formatPeso(earnedRewards)})</label>
                      <input type="number" value={payCashback} onChange={e => setPayCashback(Math.min(parseFloat(e.target.value) || 0, earnedRewards))} placeholder="0.00" style={inputStyle} />
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={addPayment} style={{ flex: 1, background: '#7A1828', color: '#fff', border: '2px solid #C9A84C', borderRadius: 999, padding: '0.5rem', cursor: 'pointer', fontWeight: 700 }}>Add</button>
                    <button onClick={() => setShowPaymentForm(false)} style={{ flex: 1, background: '#333', color: '#1a1a1a', border: 'none', borderRadius: 7, padding: '0.5rem', cursor: 'pointer' }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => setShowPaymentForm(true)} style={{ width: '100%', background: '#f0f0f0', border: '1px dashed #444', color: '#7A1828', fontWeight: 700, padding: '0.6rem', borderRadius: 8, cursor: 'pointer' }}>
                  + Add Payment
                </button>
              )}
            </div>

            {/* Override reason */}
            {needsOverride && (
              <div style={fieldStyle}>
                <label style={{ ...labelStyle, color: '#e74c3c' }}>Reason for override (below 50%) <span style={{ color: '#e74c3c' }}>*</span></label>
                <textarea value={overrideReason} onChange={e => setOverrideReason(e.target.value)} rows={3} placeholder="Please provide a reason..." style={{ ...inputStyle, resize: 'vertical' }} />
                <div style={{ color: '#e74c3c', fontSize: '0.72rem', marginTop: 4 }}>This will be sent to the manager for approval before production can start.</div>
              </div>
            )}

            {error && <div style={{ color: '#e74c3c', fontSize: '0.82rem', marginBottom: '0.75rem' }}>{error}</div>}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { resetForm(); setShowForm(false) }} style={{ flex: 1, background: '#f0f0f0', color: '#1a1a1a', border: 'none', borderRadius: 8, padding: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{ flex: 2, background: '#7A1828', color: '#fff', border: '2px solid #C9A84C', borderRadius: 999, padding: '0.75rem', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700 }}>
                {saving ? 'Saving…' : 'Save Job Order'}
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

      {/* Edit JO Modal */}
      {editingJO && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}>
          <div style={{ background: '#FDF5EC', borderRadius: 14, width: '100%', maxWidth: 620, padding: '1.5rem', marginTop: '1rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ color: '#7A1828', fontSize: '1.1rem', fontWeight: 700 }}>Edit Job Order</h2>
                <div style={{ color: '#999', fontSize: '0.75rem', marginTop: 2 }}>{editingJO.job_order_id}</div>
              </div>
              <button onClick={closeEditJO} style={{ background: 'none', border: 'none', color: '#999', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            {editLoading ? (
              <div style={{ color: '#aaa', textAlign: 'center', padding: '2rem' }}>Loading…</div>
            ) : (
              <>
                {/* Client (read-only) */}
                <div style={fieldStyle}>
                  <label style={labelStyle}>Client</label>
                  <div style={{ ...chipStyle, background: '#f0ece3' }}>
                    {editClient?.client_name || editClient?.company_name || editingJO.client_id}
                  </div>
                  {editClient && (
                    <div style={{ color: '#2ecc71', fontSize: '0.75rem', marginTop: 4 }}>
                      Earned Rewards: {formatPeso(editEarnedRewards)}
                    </div>
                  )}
                </div>

                {/* Billing toggle */}
                <div style={fieldStyle}>
                  <label style={labelStyle}>Is Client Type for Billing?</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['N', 'Y'].map(v => (
                      <button key={v} type="button" onClick={() => setEditIsForBilling(v === 'Y')}
                        style={{ flex: 1, padding: '0.5rem', borderRadius: 7, border: '1.5px solid', borderColor: (v === 'Y') === editIsForBilling ? '#7A1828' : '#ccc', background: (v === 'Y') === editIsForBilling ? '#7A1828' : 'transparent', color: '#1a1a1a', cursor: 'pointer', fontWeight: 600 }}>
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Items table */}
                <div style={fieldStyle}>
                  <label style={labelStyle}>Job Order Items</label>
                  {editItems.length > 0 && (
                    <div style={{ overflowX: 'auto', marginBottom: 8 }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                        <thead>
                          <tr style={{ background: '#3a3a3a', color: '#ccc' }}>
                            <th style={th}>Item / Service</th>
                            <th style={{ ...th, textAlign: 'center' }}>Qty</th>
                            <th style={{ ...th, textAlign: 'right' }}>Line Total</th>
                            <th style={{ ...th, width: 32 }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {editItems.map((item, i) => (
                            <tr key={item.item_id || i} style={{ borderBottom: '1px solid #EDE0CC' }}>
                              <td style={td}>
                                <div style={{ fontWeight: 600, color: '#1a1a1a' }}>{item.subcategory_name}</div>
                                {item.production_specs && <div style={{ color: '#888', fontSize: '0.7rem', marginTop: 1 }}>{item.production_specs}</div>}
                                {item.notes && <div style={{ color: '#aaa', fontSize: '0.68rem' }}>{item.notes}</div>}
                              </td>
                              <td style={{ ...td, textAlign: 'center', color: '#555' }}>{item.quantity || 1}</td>
                              <td style={{ ...td, textAlign: 'right', fontWeight: 700, color: '#1a1a1a' }}>{formatPeso(item.computed_line_total)}</td>
                              <td style={{ ...td, textAlign: 'center' }}>
                                <button onClick={() => {
                                  if (item._existing) setRemovedItemIds(prev => [...prev, item.item_id])
                                  setEditItems(prev => prev.filter((_, j) => j !== i))
                                }} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}>✕</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <button type="button" onClick={() => setShowEditItemForm(true)}
                    style={{ width: '100%', background: '#f0f0f0', border: '1px dashed #aaa', color: '#7A1828', fontWeight: 700, padding: '0.55rem', borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem' }}>
                    + Add Item
                  </button>
                </div>

                {/* Totals */}
                <div style={{ background: '#fff', border: '1px solid #EDE0CC', borderRadius: 8, padding: '0.75rem', marginBottom: '1rem' }}>
                  <div style={totalRowStyle}><span>Grand Total</span><span style={{ fontWeight: 700, color: '#1a1a1a' }}>{formatPeso(editGrandTotal)}</span></div>
                  <div style={{ ...totalRowStyle, marginTop: 6 }}>
                    <span>Discount</span>
                    <input type="number" value={editDiscount} onChange={e => setEditDiscount(parseFloat(e.target.value) || 0)}
                      style={{ ...inputStyle, width: 100, padding: '0.2rem 0.5rem', textAlign: 'right' }} />
                  </div>
                  <div style={{ ...totalRowStyle, marginTop: 6 }}><span>Total Paid</span><span>{formatPeso(editTotalPaid)}</span></div>
                  <div style={{ ...totalRowStyle, marginTop: 6 }}><span>Balance Due</span><span style={{ color: editBalance > 0 ? '#e74c3c' : '#2ecc71', fontWeight: 700 }}>{formatPeso(editBalance)}</span></div>
                  <div style={{ ...totalRowStyle, marginTop: 6 }}><span>Status</span><span style={{ color: '#7A1828', fontWeight: 600, fontSize: '0.8rem' }}>{editPaymentStatus}</span></div>
                </div>

                {/* Payments table */}
                <div style={fieldStyle}>
                  <label style={labelStyle}>Payments</label>
                  {editPayments.length > 0 && (
                    <div style={{ overflowX: 'auto', marginBottom: 8 }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                        <thead>
                          <tr style={{ background: '#3a3a3a', color: '#ccc' }}>
                            <th style={th}>Method</th>
                            <th style={{ ...th, textAlign: 'right' }}>Amount</th>
                            <th style={{ ...th, textAlign: 'right' }}>Cashback</th>
                            <th style={{ ...th, width: 32 }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {editPayments.map((p, i) => (
                            <tr key={p.payment_id || i} style={{ borderBottom: '1px solid #EDE0CC' }}>
                              <td style={{ ...td, color: '#1a1a1a', fontWeight: 600 }}>{p.method || p.payment_method}</td>
                              <td style={{ ...td, textAlign: 'right', color: '#1a1a1a' }}>{formatPeso(p.amount)}</td>
                              <td style={{ ...td, textAlign: 'right', color: '#777' }}>{p.cashback > 0 ? formatPeso(p.cashback) : '—'}</td>
                              <td style={{ ...td, textAlign: 'center' }}>
                                <button onClick={() => {
                                  if (p._existing) setRemovedPaymentIds(prev => [...prev, p.payment_id])
                                  setEditPayments(prev => prev.filter((_, j) => j !== i))
                                }} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}>✕</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {showEditPayForm ? (
                    <div style={{ background: '#f0f0f0', borderRadius: 8, padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <label style={labelStyle}>Amount</label>
                          <input type="number" value={editPayAmount} onChange={e => setEditPayAmount(e.target.value)} placeholder="0.00" style={inputStyle} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={labelStyle}>Method</label>
                          <select value={editPayMethod} onChange={e => setEditPayMethod(e.target.value)} style={inputStyle}>
                            {['Cash','G-Cash','Maya','Bank Transfer via BPI Acct.','Bank Transfer via BDO Acct.','Cheque'].map(m => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {editEarnedRewards > 0 && (
                        <div>
                          <label style={labelStyle}>Apply Cashback (Available: {formatPeso(editEarnedRewards)})</label>
                          <input type="number" value={editPayCashback} onChange={e => setEditPayCashback(Math.min(parseFloat(e.target.value) || 0, editEarnedRewards))} placeholder="0.00" style={inputStyle} />
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={addEditPayment} style={{ flex: 1, background: '#7A1828', color: '#fff', border: '2px solid #C9A84C', borderRadius: 999, padding: '0.5rem', cursor: 'pointer', fontWeight: 700 }}>Add</button>
                        <button onClick={() => setShowEditPayForm(false)} style={{ flex: 1, background: '#eee', color: '#333', border: 'none', borderRadius: 7, padding: '0.5rem', cursor: 'pointer' }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setShowEditPayForm(true)}
                      style={{ width: '100%', background: '#f0f0f0', border: '1px dashed #aaa', color: '#7A1828', fontWeight: 700, padding: '0.55rem', borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem' }}>
                      + Add Payment
                    </button>
                  )}
                </div>

                {editError && <div style={{ color: '#e74c3c', fontSize: '0.82rem', marginBottom: '0.75rem' }}>{editError}</div>}

                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={closeEditJO} style={{ flex: 1, background: '#f0f0f0', color: '#1a1a1a', border: 'none', borderRadius: 8, padding: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                  <button onClick={handleSaveEdit} disabled={editSaving}
                    style={{ flex: 2, background: '#7A1828', color: '#fff', border: '2px solid #C9A84C', borderRadius: 999, padding: '0.75rem', cursor: editSaving ? 'not-allowed' : 'pointer', fontWeight: 700 }}>
                    {editSaving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
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

      {/* Item Form Modal (edit JO) */}
      {showEditItemForm && (
        <JOItemForm
          categories={categories}
          subcategories={subcategories}
          onSave={(item) => { setEditItems(prev => [...prev, item]); setShowEditItemForm(false) }}
          onClose={() => setShowEditItemForm(false)}
        />
      )}

      {/* Add Client Modal */}
      {showAddClient && (
        <AddClientModal
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

const fieldStyle: React.CSSProperties = { marginBottom: '1rem' }
const labelStyle: React.CSSProperties = { display: 'block', color: '#999', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem' }
const inputStyle: React.CSSProperties = { width: '100%', background: '#FDF5EC', border: '1.5px solid #d0d0d0', borderRadius: 7, padding: '0.55rem 0.75rem', color: '#1a1a1a', fontSize: '0.85rem', boxSizing: 'border-box', outline: 'none' }
const chipStyle: React.CSSProperties = { display: 'inline-block', background: '#f0f0f0', color: '#1a1a1a', borderRadius: 20, padding: '0.3rem 0.85rem', fontSize: '0.8rem' }
const totalRowStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#ccc', fontSize: '0.82rem' }
const th: React.CSSProperties = { padding: '0.4rem 0.6rem', textAlign: 'left', fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.03em' }
const td: React.CSSProperties = { padding: '0.45rem 0.6rem', verticalAlign: 'top' }
