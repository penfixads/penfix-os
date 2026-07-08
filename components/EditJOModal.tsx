'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { generateItemId, generatePaymentId, formatPeso, getEffectiveSteps, getPhilippineDateStr } from '@/lib/jo-helpers'
import { syncJobOrderDoneStatus } from '@/lib/jo-completion'
import type { AppUser } from '@/lib/user'
import JOItemForm from '@/app/(app)/jos/today/JOItemForm'
import JOReceiptModal from '@/components/JOReceiptModal'
import { IconPlus, IconCirclePlus, IconEdit, IconX, IconCheck } from '@/components/icons'

interface Props {
  jo: any
  categories: any[]
  subcategories: any[]
  currentUser: AppUser
  onClose: () => void
  onSave: (joId: string, updates: any) => void
}

export default function EditJOModal({ jo, categories, subcategories, currentUser, onClose, onSave }: Props) {
  const [editItems, setEditItems] = useState<any[]>([])
  const [editPayments, setEditPayments] = useState<any[]>([])
  const [editDiscount, setEditDiscount] = useState(jo.discount || 0)
  const [editIsForBilling, setEditIsForBilling] = useState(jo.is_for_billing || false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [removedItemIds, setRemovedItemIds] = useState<string[]>([])
  const [removedPaymentIds, setRemovedPaymentIds] = useState<string[]>([])
  const [showItemForm, setShowItemForm] = useState(false)
  const [showPayForm, setShowPayForm] = useState(false)
  const [payAmount, setPayAmount] = useState('')
  const [payMethod, setPayMethod] = useState('Cash')
  const [payCashback, setPayCashback] = useState(0)
  const [payDate, setPayDate] = useState(getPhilippineDateStr())
  const [rewardsBalance, setRewardsBalance] = useState(0)
  const [overrideReason, setOverrideReason] = useState(jo.request_override || '')
  const [editingItem, setEditingItem] = useState<any | null>(null)
  const [sopSteps, setSopSteps] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [statusLogs, setStatusLogs] = useState<any[]>([])
  const [advancingItemId, setAdvancingItemId] = useState<string | null>(null)
  const [pendingChange, setPendingChange] = useState<{ itemId: string; completedStatus: string; targetStatus: string } | null>(null)
  const [selectedProponents, setSelectedProponents] = useState<string[]>([])
  const [showReceipt, setShowReceipt] = useState(false)

  const client = jo.clients

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    // Items need to be fetched first — the SOP query below filters by their subcategory_ids
    // rather than pulling the whole subcategory_sop table (1200+ rows across all 221
    // subcategories, well past Supabase's 1000-row-per-request cap, which was silently
    // truncating the terminal step off of most subcategories' checklists).
    supabase.from('job_order_items').select('*, subcategories(subcategory_name, category_id, job_flow)').eq('job_order_id', jo.job_order_id).order('item_id')
      .then(async ({ data: items }) => {
        const subcategoryIds = Array.from(new Set((items || []).map(i => i.subcategory_id).filter(Boolean)))
        const [{ data: pays }, { data: rewards }, { data: clientRow }, { data: sops }, { data: staffRows }] = await Promise.all([
          supabase.from('payments').select('*').eq('job_order_id', jo.job_order_id).order('payment_date'),
          supabase.from('rewards_ledger').select('type, amount').eq('client_id', jo.client_id),
          supabase.from('clients').select('credit_line_status').eq('client_id', jo.client_id).single(),
          subcategoryIds.length > 0
            ? supabase.from('subcategory_sop').select('*').eq('is_active', true).in('subcategory_id', subcategoryIds).order('sequence')
            : Promise.resolve({ data: [] }),
          supabase.from('users').select('user_email, name, role').in('role', ['Fabricator', 'GA']).eq('is_active', true).order('name'),
        ])
        setEditItems((items || []).map(i => ({ ...i, subcategory_name: i.subcategories?.subcategory_name || i.item_id, _existing: true })))
        setEditPayments((pays || []).map(p => ({ ...p, method: p.payment_method, cashback: p.cashback_amount || 0, _existing: true })))
        const earned = (rewards || []).filter(r => r.type === 'earned').reduce((s, r) => s + (r.amount || 0), 0)
        const redeemed = (rewards || []).filter(r => r.type === 'redeemed').reduce((s, r) => s + (r.amount || 0), 0)
        setRewardsBalance(Math.max(0, earned - redeemed))
        // "For Billing" mirrors the client's current credit line status — not editable from here.
        setEditIsForBilling(!!clientRow?.credit_line_status)
        setSopSteps(sops || [])
        setStaff(staffRows || [])
        const itemIds = (items || []).map(i => i.item_id)
        const { data: logs } = itemIds.length > 0
          ? await supabase.from('job_order_item_status_log').select('item_id, status_name, changed_by_name').in('item_id', itemIds)
          : { data: [] }
        setStatusLogs(logs || [])
        setLoading(false)
      })
  }, [jo.job_order_id, jo.client_id])

  // SOP steps grouped by subcategory, and who-worked-on-what per item — feeds the status checklist.
  const sopBySubcategory: Record<string, any[]> = {}
  for (const s of sopSteps) {
    if (!sopBySubcategory[s.subcategory_id]) sopBySubcategory[s.subcategory_id] = []
    sopBySubcategory[s.subcategory_id].push(s)
  }
  const namesByItemStatus: Record<string, Record<string, string[]>> = {}
  for (const log of statusLogs) {
    if (!namesByItemStatus[log.item_id]) namesByItemStatus[log.item_id] = {}
    if (!namesByItemStatus[log.item_id][log.status_name]) namesByItemStatus[log.item_id][log.status_name] = []
    namesByItemStatus[log.item_id][log.status_name].push(log.changed_by_name)
  }

  function requestStatusChange(itemId: string, completedStatus: string, targetStatus: string) {
    setPendingChange({ itemId, completedStatus, targetStatus })
    setSelectedProponents([currentUser.email])
  }

  function toggleProponent(email: string) {
    setSelectedProponents(prev => prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email])
  }

  async function confirmStatusChange() {
    if (!pendingChange) return
    const { itemId, completedStatus, targetStatus } = pendingChange
    const proponents = selectedProponents.length > 0 ? selectedProponents : [currentUser.email]
    setAdvancingItemId(itemId)
    try {
      const supabase = createSupabaseBrowserClient()
      const { error } = await supabase.from('job_order_items').update({ job_status: targetStatus }).eq('item_id', itemId)
      if (error) { alert(error.message || 'Failed to advance status.'); return }
      setEditItems(prev => prev.map(i => i.item_id === itemId ? { ...i, job_status: targetStatus } : i))
      const newLogs = proponents.map(email => {
        const person = staff.find(s => s.user_email === email)
        return {
          item_id: itemId,
          job_order_id: jo.job_order_id,
          status_name: completedStatus,
          changed_by_email: email,
          changed_by_name: person?.name || (email === currentUser.email ? currentUser.name : email),
          changed_by_role: person?.role || (email === currentUser.email ? currentUser.role : null),
        }
      })
      await supabase.from('job_order_item_status_log').insert(newLogs)
      setStatusLogs(prev => [...prev, ...newLogs])
      setPendingChange(null)
      await syncJobOrderDoneStatus(supabase, jo.job_order_id)
    } finally {
      setAdvancingItemId(null)
    }
  }

  function saveEditedItem(updated: any) {
    setEditItems(prev => prev.map(i => i.item_id === updated.item_id ? { ...i, ...updated, subcategory_name: updated.subcategory_name || i.subcategory_name } : i))
    setEditingItem(null)
  }

  const grandTotal = editItems.reduce((s, i) => s + (i.computed_line_total || 0), 0) - editDiscount
  const totalPaid = editPayments.reduce((s, p) => s + (p.amount || 0), 0)
  const cashback = editPayments.reduce((s, p) => s + (p.cashback || 0), 0)
  const balance = grandTotal - totalPaid - cashback
  const paymentStatus = (() => {
    if (editIsForBilling) return 'For Billing'
    if (totalPaid === 0 && cashback === 0) return 'Pending Payment'
    if (totalPaid + cashback >= grandTotal) return 'Fully Paid'
    if ((totalPaid + cashback) >= grandTotal * 0.5) return 'Downpayment Received'
    return 'Below 50% Downpayment'
  })()
  const needsOverride = (paymentStatus === 'Below 50% Downpayment' || paymentStatus === 'Pending Payment') && !editIsForBilling

  function addPayment() {
    const amt = parseFloat(payAmount) || 0
    if (amt <= 0) return
    setEditPayments(prev => [...prev, { amount: amt, method: payMethod, cashback: payCashback, payment_date: payDate }])
    setPayAmount('')
    setPayCashback(0)
    setPayDate(getPhilippineDateStr())
    setShowPayForm(false)
  }

  async function handleSave() {
    if (needsOverride && !overrideReason) { setError('Please provide a reason for the override.'); return }
    setSaving(true)
    setError('')
    try {
      const supabase = createSupabaseBrowserClient()
      const joId = jo.job_order_id

      for (const id of removedItemIds) await supabase.from('job_order_items').delete().eq('item_id', id)
      for (const id of removedPaymentIds) await supabase.from('payments').delete().eq('payment_id', id)

      const newItems = editItems.filter(i => !i._existing)
      const existingItems = editItems.filter(i => i._existing)
      const existingCount = existingItems.length
      for (let i = 0; i < newItems.length; i++) {
        const { category_name, subcategory_name, _existing, subcategories, ...item } = newItems[i]
        await supabase.from('job_order_items').insert({ ...item, item_id: generateItemId(joId, existingCount + i + 1), job_order_id: joId })
      }

      for (const item of existingItems) {
        await supabase.from('job_order_items').update({
          subcategory_id: item.subcategory_id,
          pricing_model: item.pricing_model,
          base_price: item.base_price,
          quantity: item.quantity,
          width: item.width,
          height: item.height,
          depth: item.depth,
          no_of_mins: item.no_of_mins,
          letter_count: item.letter_count,
          production_specs: item.production_specs,
          notes: item.notes,
          date_time_needed: item.date_time_needed,
          discount: item.discount,
          computed_line_total: item.computed_line_total,
          item_preview: item.item_preview,
        }).eq('item_id', item.item_id)
      }

      const newPays = editPayments.filter(p => !p._existing)
      const existingPayCount = editPayments.filter(p => p._existing).length
      for (let i = 0; i < newPays.length; i++) {
        await supabase.from('payments').insert({
          payment_id: generatePaymentId(joId, existingPayCount + i + 1),
          job_order_id: joId,
          client_id: jo.client_id,
          grand_total: grandTotal,
          amount: newPays[i].amount,
          payment_method: newPays[i].method,
          payment_date: newPays[i].payment_date || getPhilippineDateStr(),
          recorded_by: currentUser.name,
        })
      }

      const { error: joUpdateErr } = await supabase.from('job_orders').update({
        grand_total: grandTotal,
        total_amount_paid: totalPaid,
        discount: editDiscount,
        cashback_discount: cashback,
        payment_status: paymentStatus,
        is_for_billing: editIsForBilling,
        is_fully_paid: paymentStatus === 'Fully Paid',
        request_override: overrideReason || null,
        override_status: needsOverride ? 'Pending' : null,
      }).eq('job_order_id', joId)
      if (joUpdateErr) throw joUpdateErr

      await syncJobOrderDoneStatus(supabase, joId)

      const newCashback = newPays.filter(p => (p.cashback || 0) > 0).reduce((s, p) => s + p.cashback, 0)
      if (newCashback > 0) {
        await supabase.from('rewards_ledger').insert({
          ledger_id: `REDM-${joId}-${Date.now()}`,
          client_id: jo.client_id,
          job_order_id: joId,
          type: 'redeemed',
          amount: newCashback,
          notes: `Cashback redeemed on JO ${joId}`,
        })
      }

      onSave(joId, {
        grand_total: grandTotal,
        total_amount_paid: totalPaid,
        balance_due: balance,
        payment_status: paymentStatus,
        is_for_billing: editIsForBilling,
        request_override: overrideReason || null,
        override_status: needsOverride ? 'Pending' : null,
        job_order_items: editItems.map(i => ({ item_id: i.item_id, computed_line_total: i.computed_line_total, job_status: i.job_status, date_time_needed: i.date_time_needed, subcategories: i.subcategories })),
      })
      onClose()
    } catch (e: any) {
      setError(e.message || 'Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="pf-modal-overlay" style={{ alignItems: 'flex-start' }}>
      <div className="pf-modal-card pf-modal-wine" style={{ maxWidth: 620, marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ color: '#fff', fontSize: '1.7rem', fontWeight: 700 }}>Edit Job Order</h2>
            <div style={{ color: '#E8B9C6', fontSize: '0.75rem', marginTop: 2 }}>{jo.job_order_id}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button title="Generate job order receipt to send for client approval" onClick={() => setShowReceipt(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E8B9C6', padding: 2, display: 'flex', alignItems: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#E8B9C6', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
          </div>
        </div>

        {loading ? (
          <div style={{ color: '#E8B9C6', textAlign: 'center', padding: '2rem' }}>Loading…</div>
        ) : (
          <>
            <div className="pf-field">
              <label className="pf-label">Client</label>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'inline-block', background: '#f0ece3', color: '#1a1a1a', borderRadius: 20, padding: '0.3rem 0.85rem', fontSize: '0.8rem' }}>
                  {client?.client_name || client?.company_name || jo.client_id}
                </div>
                <div style={{ color: '#2ecc71', fontSize: '0.75rem' }}>Total Rewards Earned: {formatPeso(rewardsBalance)}</div>
              </div>
            </div>

            <div className="pf-field">
              <label className="pf-label">Is Client Type for Billing?</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['N', 'Y'].map(v => (
                  <button key={v} type="button" disabled title="Set by the client's credit line status. Edit the client record to change it."
                    className={(v === 'Y') === editIsForBilling ? 'pf-btn' : 'pf-btn pf-btn-secondary'} style={{ minWidth: 56, opacity: (v === 'Y') === editIsForBilling ? 1 : 0.5, cursor: 'not-allowed' }}>
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="pf-field">
              <div className="pf-group-box">
                {editItems.length > 0 ? (
                  <div style={{ overflowX: 'auto', marginBottom: 8 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                      <thead>
                        <tr style={{ background: '#C9A84C', color: '#3a0a0a' }}>
                          <th style={th}>Item / Service</th>
                          <th style={{ ...th, textAlign: 'center' }}>Qty</th>
                          <th style={{ ...th, textAlign: 'right' }}>Line Total</th>
                          <th style={th}>Status</th>
                          <th style={{ ...th, width: 32 }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {editItems.map((item, i) => {
                          const status = item.job_status || 'Received'
                          return (
                            <tr key={item.item_id || i} style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                              <td style={td}>
                                <div style={{ fontWeight: 600, color: '#fff' }}>{item.subcategory_name}</div>
                                {item.production_specs && <div style={{ color: '#E8B9C6', fontSize: '0.7rem', marginTop: 1 }}>{item.production_specs}</div>}
                              </td>
                              <td style={{ ...td, textAlign: 'center', color: '#E8B9C6' }}>{item.quantity || 1}</td>
                              <td style={{ ...td, textAlign: 'right', fontWeight: 700, color: '#fff' }}>{formatPeso(item.computed_line_total)}</td>
                              <td style={td}>
                                <span style={{ color: '#E8B9C6' }}>{item._existing ? status : 'New'}</span>
                              </td>
                              <td style={{ ...td, textAlign: 'center', whiteSpace: 'nowrap' }}>
                                {item._existing && (
                                  <button onClick={() => setEditingItem({ ...item, category_id: item.subcategories?.category_id })}
                                    style={{ background: 'none', border: 'none', color: '#E8B9C6', cursor: 'pointer', padding: 0, marginRight: 8, display: 'inline-flex' }} title="Edit item">
                                    <IconEdit style={{ width: 14, height: 14 }} />
                                  </button>
                                )}
                                <button onClick={() => {
                                  if (item._existing) setRemovedItemIds(prev => [...prev, item.item_id])
                                  setEditItems(prev => prev.filter((_, j) => j !== i))
                                }} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="pf-group-empty">No job order items were added.</div>
                )}
                <div className="pf-group-box-actions">
                  <button type="button" onClick={() => setShowItemForm(true)} className="pf-link-btn">
                    <IconCirclePlus />Add Job Order Item
                  </button>
                </div>
              </div>
            </div>

            <div className="pf-field">
              <div className="pf-group-box">
                {editPayments.length > 0 ? (
                  <div style={{ overflowX: 'auto', marginBottom: 8 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                      <thead>
                        <tr style={{ background: '#C9A84C', color: '#3a0a0a' }}>
                          <th style={th}>Method</th>
                          <th style={th}>Date Paid</th>
                          <th style={th}>Date Recorded</th>
                          <th style={{ ...th, textAlign: 'right' }}>Amount</th>
                          <th style={{ ...th, textAlign: 'right' }}>Cashback</th>
                          <th style={{ ...th, width: 32 }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {editPayments.map((p, i) => (
                          <tr key={p.payment_id || i} style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                            <td style={{ ...td, fontWeight: 600, color: '#fff' }}>{p.method || p.payment_method}</td>
                            <td style={{ ...td, color: '#E8B9C6' }}>{p.payment_date ? new Date(p.payment_date + 'T00:00:00').toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                            <td style={{ ...td, color: '#E8B9C6' }}>{p.created_at ? new Date(p.created_at).toLocaleString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'On save'}</td>
                            <td style={{ ...td, textAlign: 'right', color: '#fff' }}>{formatPeso(p.amount)}</td>
                            <td style={{ ...td, textAlign: 'right', color: '#E8B9C6' }}>{p.cashback > 0 ? formatPeso(p.cashback) : '—'}</td>
                            <td style={{ ...td, textAlign: 'center' }}>
                              <button onClick={() => {
                                if (p._existing) setRemovedPaymentIds(prev => [...prev, p.payment_id])
                                setEditPayments(prev => prev.filter((_, j) => j !== i))
                              }} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : !showPayForm && (
                  <div className="pf-group-empty">No payments were added.</div>
                )}
                {showPayForm ? (
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
                    <div>
                      <label className="pf-label">Date Paid</label>
                      <input type="date" value={payDate} max={getPhilippineDateStr()} onChange={e => setPayDate(e.target.value)} className="pf-input" />
                    </div>
                    {rewardsBalance > 0 && (
                      <div>
                        <label className="pf-label">Apply Cashback (Available: {formatPeso(rewardsBalance)})</label>
                        <input type="number" value={payCashback} onChange={e => setPayCashback(Math.min(parseFloat(e.target.value) || 0, rewardsBalance))} placeholder="0.00" className="pf-input" />
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button onClick={() => setShowPayForm(false)} className="pf-btn pf-btn-secondary"><IconX />Cancel</button>
                      <button onClick={addPayment} className="pf-btn"><IconPlus />Add</button>
                    </div>
                  </div>
                ) : (
                  <div className="pf-group-box-actions">
                    <button type="button" onClick={() => setShowPayForm(true)} className="pf-link-btn">
                      <IconCirclePlus />Add Payment
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="pf-totals-box">
              {[
                { label: 'Grand Total', value: formatPeso(grandTotal), bold: true },
                { label: 'Total Paid', value: formatPeso(totalPaid) },
                { label: 'Balance Due', value: formatPeso(balance), warn: balance > 0 },
                { label: 'Status', value: paymentStatus, accent: true },
              ].map(row => (
                <div key={row.label} className="pf-totals-row">
                  <span>{row.label}</span>
                  {row.label === 'Balance Due' ? (
                    <span style={{ color: '#400016', fontWeight: 700 }}>{row.value}</span>
                  ) : row.label === 'Status' ? (
                    <span style={{ color: '#000', fontWeight: 600, fontSize: '0.8rem' }}>{row.value}</span>
                  ) : (
                    <span style={{ fontWeight: row.bold ? 700 : 400, color: '#000' }}>{row.value}</span>
                  )}
                </div>
              ))}
              <div className="pf-totals-row" style={{ marginBottom: 0 }}>
                <span>Discount</span>
                <input type="number" value={editDiscount} onChange={e => setEditDiscount(parseFloat(e.target.value) || 0)}
                  className="pf-input" style={{ width: 100, textAlign: 'right' }} />
              </div>
            </div>

            {needsOverride && (
              <div className="pf-field">
                <label className="pf-label" style={{ color: '#f1c40f' }}>Reason for override (below 50%) <span className="pf-req">*</span></label>
                <textarea value={overrideReason} onChange={e => setOverrideReason(e.target.value)} rows={3} placeholder="Please provide a reason..." className="pf-textarea" />
                <div style={{ color: '#e74c3c', fontSize: '0.72rem', marginTop: 4 }}>This will be sent to the manager for approval before production can start.</div>
              </div>
            )}

            {error && <div style={{ color: '#e74c3c', fontSize: '0.82rem', marginBottom: '0.75rem' }}>{error}</div>}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={onClose} className="pf-btn pf-btn-secondary"><IconX />Cancel</button>
              <button onClick={handleSave} disabled={saving} className="pf-btn">
                <IconCheck />{saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </>
        )}
      </div>

      {showReceipt && (
        <JOReceiptModal jobOrderId={jo.job_order_id} onClose={() => setShowReceipt(false)} />
      )}

      {showItemForm && (
        <JOItemForm
          categories={categories}
          subcategories={subcategories}
          onSave={(item) => { setEditItems(prev => [...prev, item]); setShowItemForm(false) }}
          onClose={() => setShowItemForm(false)}
        />
      )}

      {editingItem && (() => {
        // editItems may have advanced since the modal opened (checklist clicks update it) —
        // always read the live copy so the modal reflects the current status.
        const liveItem = { ...(editItems.find(i => i.item_id === editingItem.item_id) || editingItem), category_id: editingItem.category_id }
        const subcategoryId = liveItem.subcategory_id
        const jobFlow = liveItem.subcategories?.job_flow
        const currentStatus = liveItem.job_status || 'Received'
        const steps = getEffectiveSteps(sopBySubcategory[subcategoryId] || [], jobFlow)
        const isPendingHere = pendingChange?.itemId === liveItem.item_id
        return (
          <JOItemForm
            categories={categories}
            subcategories={subcategories}
            editingItem={liveItem}
            currentUser={currentUser}
            onSave={saveEditedItem}
            onClose={() => setEditingItem(null)}
            statusChecklist={{
              steps,
              currentStatus,
              namesByStatus: namesByItemStatus[liveItem.item_id] || {},
              staff,
              pendingStatus: isPendingHere ? pendingChange!.completedStatus : null,
              selectedProponents,
              advancing: advancingItemId === liveItem.item_id,
              onRequestAdvance: (completedStatus, targetStatus) => requestStatusChange(liveItem.item_id, completedStatus, targetStatus),
              onToggleProponent: toggleProponent,
              onConfirmAdvance: confirmStatusChange,
              onCancelPending: () => setPendingChange(null),
            }}
          />
        )
      })()}
    </div>
  )
}

const th: React.CSSProperties = { padding: '0.4rem 0.6rem', textAlign: 'left', fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.03em' }
const td: React.CSSProperties = { padding: '0.45rem 0.6rem', verticalAlign: 'top' }
