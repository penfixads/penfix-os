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
        const item = items[i]
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

      // Update client earned rewards
      if (!isForBilling) {
        const newRewards = earnedRewards + grandTotal * 0.01
        await supabase.from('clients').update({ earned_rewards: newRewards }).eq('client_id', selectedClientId)
      }

      resetForm()
      setShowForm(false)
      router.refresh()
    } catch (e: any) {
      setError(e.message || 'Failed to save job order.')
    } finally {
      setSaving(false)
    }
  }

  function addPayment() {
    const amt = parseFloat(payAmount) || 0
    if (amt <= 0) return
    setPayments(prev => [...prev, { amount: amt, method: payMethod, cashback: payCashback }])
    setPayAmount('')
    setPayCashback(0)
    setShowPaymentForm(false)
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ color: '#1a1a1a', fontSize: '1.4rem', fontWeight: 700 }}>Today&apos;s Received JOs</h1>
          <p style={{ color: '#777', fontSize: '0.8rem', marginTop: 2 }}>{new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true) }} style={{ background: '#7B1C1C', color: '#1a1a1a', border: 'none', borderRadius: 8, padding: '0.6rem 1.2rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
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
              <div key={jo.job_order_id} style={{ background: '#f5f5f5', borderRadius: 10, padding: '0.85rem 1rem', border: '1px solid #ebebeb' }}>
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
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: hasBalance ? '#e74c3c' : '#2ecc71', fontWeight: 700, fontSize: '0.9rem' }}>
                      {formatPeso(jo.grand_total || 0)}
                    </div>
                    <div style={{ color: '#777', fontSize: '0.72rem' }}>Bal: {formatPeso(jo.balance_due || 0)}</div>
                    <div style={{ color: '#7B1C1C', fontSize: '0.68rem', marginTop: 2 }}>{jo.payment_status}</div>
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
          <div style={{ background: '#f5f5f5', borderRadius: 14, width: '100%', maxWidth: 560, padding: '1.5rem', marginTop: '1rem' }}>
            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ color: '#1a1a1a', fontSize: '1.1rem', fontWeight: 700 }}>New Job Order</h2>
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
                {showClientDropdown && clientSearch && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#f0f0f0', border: '1px solid #3a3a3a', borderRadius: 8, zIndex: 10, maxHeight: 200, overflowY: 'auto' }}>
                    {filteredClients.map(c => (
                      <div
                        key={c.client_id}
                        onClick={() => { setSelectedClientId(c.client_id); setClientSearch(c.client_name || c.company_name); setShowClientDropdown(false) }}
                        style={{ padding: '0.6rem 0.85rem', cursor: 'pointer', color: '#1a1a1a', fontSize: '0.85rem', borderBottom: '1px solid #333' }}
                      >
                        <div>{c.client_name || c.company_name}</div>
                        <div style={{ color: '#777', fontSize: '0.72rem' }}>{c.client_id} {c.credit_line_status ? '· Credit Line' : ''}</div>
                      </div>
                    ))}
                    <div
                      onClick={() => { setShowClientDropdown(false); setShowAddClient(true) }}
                      style={{ padding: '0.6rem 0.85rem', cursor: 'pointer', color: '#7B1C1C', fontSize: '0.85rem', fontWeight: 600 }}
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
                    style={{ flex: 1, padding: '0.5rem', borderRadius: 7, border: '1.5px solid', borderColor: (v === 'Y') === isForBilling ? '#7B1C1C' : '#333', background: (v === 'Y') === isForBilling ? '#7B1C1C' : 'transparent', color: '#1a1a1a', cursor: 'pointer', fontWeight: 600 }}>
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
              <button type="button" onClick={() => setShowItemForm(true)} style={{ width: '100%', background: '#f0f0f0', border: '1px dashed #444', color: '#7B1C1C', fontWeight: 700, padding: '0.6rem', borderRadius: 8, cursor: 'pointer' }}>
                + Add Item
              </button>
            </div>

            {/* Totals */}
            <div style={{ background: '#f5f5f5', borderRadius: 8, padding: '0.75rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={totalRowStyle}><span>Grand Total</span><span>{formatPeso(grandTotal)}</span></div>
              <div style={totalRowStyle}><span>Discount</span>
                <input type="number" value={discount} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} style={{ ...inputStyle, width: 100, padding: '0.2rem 0.5rem', textAlign: 'right' }} />
              </div>
              <div style={totalRowStyle}><span>Total Paid</span><span>{formatPeso(totalPaid)}</span></div>
              <div style={totalRowStyle}><span>Balance Due</span><span style={{ color: balanceDue > 0 ? '#e74c3c' : '#2ecc71', fontWeight: 700 }}>{formatPeso(balanceDue)}</span></div>
              <div style={totalRowStyle}><span>Status</span><span style={{ color: '#7B1C1C', fontWeight: 600, fontSize: '0.8rem' }}>{paymentStatus}</span></div>
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
                    <button onClick={addPayment} style={{ flex: 1, background: '#7B1C1C', color: '#1a1a1a', border: 'none', borderRadius: 7, padding: '0.5rem', cursor: 'pointer', fontWeight: 700 }}>Add</button>
                    <button onClick={() => setShowPaymentForm(false)} style={{ flex: 1, background: '#333', color: '#1a1a1a', border: 'none', borderRadius: 7, padding: '0.5rem', cursor: 'pointer' }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => setShowPaymentForm(true)} style={{ width: '100%', background: '#f0f0f0', border: '1px dashed #444', color: '#7B1C1C', fontWeight: 700, padding: '0.6rem', borderRadius: 8, cursor: 'pointer' }}>
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
              <button onClick={handleSave} disabled={saving} style={{ flex: 2, background: saving ? '#5a1010' : '#7B1C1C', color: '#1a1a1a', border: 'none', borderRadius: 8, padding: '0.75rem', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700 }}>
                {saving ? 'Saving…' : 'Save Job Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Form Modal */}
      {showItemForm && (
        <JOItemForm
          categories={categories}
          subcategories={subcategories}
          onSave={(item) => { setItems(prev => [...prev, item]); setShowItemForm(false) }}
          onClose={() => setShowItemForm(false)}
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
const inputStyle: React.CSSProperties = { width: '100%', background: '#f5f5f5', border: '1.5px solid #d0d0d0', borderRadius: 7, padding: '0.55rem 0.75rem', color: '#1a1a1a', fontSize: '0.85rem', boxSizing: 'border-box', outline: 'none' }
const chipStyle: React.CSSProperties = { display: 'inline-block', background: '#f0f0f0', color: '#1a1a1a', borderRadius: 20, padding: '0.3rem 0.85rem', fontSize: '0.8rem' }
const totalRowStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#ccc', fontSize: '0.82rem' }
