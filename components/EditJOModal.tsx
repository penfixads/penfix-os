'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { generateItemId, generatePaymentId, formatPeso } from '@/lib/jo-helpers'
import type { AppUser } from '@/lib/user'
import JOItemForm from '@/app/(app)/jos/today/JOItemForm'

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
  const [rewardsBalance, setRewardsBalance] = useState(0)

  const client = jo.clients

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    Promise.all([
      supabase.from('job_order_items').select('*, subcategories(subcategory_name, category_id)').eq('job_order_id', jo.job_order_id).order('item_id'),
      supabase.from('payments').select('*').eq('job_order_id', jo.job_order_id).order('payment_date'),
      supabase.from('rewards_ledger').select('type, amount').eq('client_id', jo.client_id),
    ]).then(([{ data: items }, { data: pays }, { data: rewards }]) => {
      setEditItems((items || []).map(i => ({ ...i, subcategory_name: i.subcategories?.subcategory_name || i.item_id, _existing: true })))
      setEditPayments((pays || []).map(p => ({ ...p, method: p.payment_method, cashback: p.cashback_amount || 0, _existing: true })))
      const earned = (rewards || []).filter(r => r.type === 'earned').reduce((s, r) => s + (r.amount || 0), 0)
      const redeemed = (rewards || []).filter(r => r.type === 'redeemed').reduce((s, r) => s + (r.amount || 0), 0)
      setRewardsBalance(Math.max(0, earned - redeemed))
      setLoading(false)
    })
  }, [jo.job_order_id, jo.client_id])

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

  function addPayment() {
    const amt = parseFloat(payAmount) || 0
    if (amt <= 0) return
    setEditPayments(prev => [...prev, { amount: amt, method: payMethod, cashback: payCashback }])
    setPayAmount('')
    setPayCashback(0)
    setShowPayForm(false)
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const supabase = createSupabaseBrowserClient()
      const joId = jo.job_order_id

      for (const id of removedItemIds) await supabase.from('job_order_items').delete().eq('item_id', id)
      for (const id of removedPaymentIds) await supabase.from('payments').delete().eq('payment_id', id)

      const newItems = editItems.filter(i => !i._existing)
      const existingCount = editItems.filter(i => i._existing).length
      for (let i = 0; i < newItems.length; i++) {
        const { category_name, subcategory_name, _existing, subcategories, ...item } = newItems[i]
        await supabase.from('job_order_items').insert({ ...item, item_id: generateItemId(joId, existingCount + i + 1), job_order_id: joId })
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
          payment_date: new Date().toISOString().split('T')[0],
          recorded_by: currentUser.name,
        })
      }

      await supabase.from('job_orders').update({
        grand_total: grandTotal,
        total_amount_paid: totalPaid,
        discount: editDiscount,
        cashback_discount: cashback,
        payment_status: paymentStatus,
        is_for_billing: editIsForBilling,
        is_fully_paid: paymentStatus === 'Fully Paid',
        balance_due: balance,
      }).eq('job_order_id', joId)

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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}>
      <div style={{ background: '#FDF5EC', borderRadius: 14, width: '100%', maxWidth: 620, padding: '1.5rem', marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ color: '#7A1828', fontSize: '1.1rem', fontWeight: 700 }}>Edit Job Order</h2>
            <div style={{ color: '#999', fontSize: '0.75rem', marginTop: 2 }}>{jo.job_order_id}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#999', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
        </div>

        {loading ? (
          <div style={{ color: '#aaa', textAlign: 'center', padding: '2rem' }}>Loading…</div>
        ) : (
          <>
            <div style={fieldStyle}>
              <label style={labelStyle}>Client</label>
              <div style={{ display: 'inline-block', background: '#f0ece3', color: '#1a1a1a', borderRadius: 20, padding: '0.3rem 0.85rem', fontSize: '0.8rem' }}>
                {client?.client_name || client?.company_name || jo.client_id}
              </div>
              {rewardsBalance > 0 && (
                <div style={{ color: '#2ecc71', fontSize: '0.75rem', marginTop: 4 }}>Earned Rewards: {formatPeso(rewardsBalance)}</div>
              )}
            </div>

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
                          </td>
                          <td style={{ ...td, textAlign: 'center', color: '#555' }}>{item.quantity || 1}</td>
                          <td style={{ ...td, textAlign: 'right', fontWeight: 700, color: '#1a1a1a' }}>{formatPeso(item.computed_line_total)}</td>
                          <td style={{ ...td, textAlign: 'center' }}>
                            <button onClick={() => {
                              if (item._existing) setRemovedItemIds(prev => [...prev, item.item_id])
                              setEditItems(prev => prev.filter((_, j) => j !== i))
                            }} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <button type="button" onClick={() => setShowItemForm(true)}
                style={{ width: '100%', background: '#f0f0f0', border: '1px dashed #aaa', color: '#7A1828', fontWeight: 700, padding: '0.55rem', borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem' }}>
                + Add Item
              </button>
            </div>

            <div style={{ background: '#fff', border: '1px solid #EDE0CC', borderRadius: 8, padding: '0.75rem', marginBottom: '1rem' }}>
              {[
                { label: 'Grand Total', value: formatPeso(grandTotal), bold: true },
                { label: 'Total Paid', value: formatPeso(totalPaid) },
                { label: 'Balance Due', value: formatPeso(balance), warn: balance > 0 },
                { label: 'Status', value: paymentStatus, accent: true },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#ccc', fontSize: '0.82rem', marginBottom: 6 }}>
                  <span>{row.label}</span>
                  {row.label === 'Balance Due' ? (
                    <span style={{ color: balance > 0 ? '#e74c3c' : '#2ecc71', fontWeight: 700 }}>{row.value}</span>
                  ) : row.label === 'Status' ? (
                    <span style={{ color: '#7A1828', fontWeight: 600, fontSize: '0.8rem' }}>{row.value}</span>
                  ) : (
                    <span style={{ fontWeight: row.bold ? 700 : 400, color: row.bold ? '#1a1a1a' : undefined }}>{row.value}</span>
                  )}
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#ccc', fontSize: '0.82rem' }}>
                <span>Discount</span>
                <input type="number" value={editDiscount} onChange={e => setEditDiscount(parseFloat(e.target.value) || 0)}
                  style={{ width: 100, background: '#FDF5EC', border: '1.5px solid #d0d0d0', borderRadius: 7, padding: '0.2rem 0.5rem', color: '#1a1a1a', fontSize: '0.82rem', textAlign: 'right', outline: 'none' }} />
              </div>
            </div>

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
                          <td style={{ ...td, fontWeight: 600, color: '#1a1a1a' }}>{p.method || p.payment_method}</td>
                          <td style={{ ...td, textAlign: 'right', color: '#1a1a1a' }}>{formatPeso(p.amount)}</td>
                          <td style={{ ...td, textAlign: 'right', color: '#777' }}>{p.cashback > 0 ? formatPeso(p.cashback) : '—'}</td>
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
              )}
              {showPayForm ? (
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
                  {rewardsBalance > 0 && (
                    <div>
                      <label style={labelStyle}>Apply Cashback (Available: {formatPeso(rewardsBalance)})</label>
                      <input type="number" value={payCashback} onChange={e => setPayCashback(Math.min(parseFloat(e.target.value) || 0, rewardsBalance))} placeholder="0.00" style={inputStyle} />
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={addPayment} style={{ flex: 1, background: '#7A1828', color: '#fff', border: '2px solid #C9A84C', borderRadius: 999, padding: '0.5rem', cursor: 'pointer', fontWeight: 700 }}>Add</button>
                    <button onClick={() => setShowPayForm(false)} style={{ flex: 1, background: '#eee', color: '#333', border: 'none', borderRadius: 7, padding: '0.5rem', cursor: 'pointer' }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => setShowPayForm(true)}
                  style={{ width: '100%', background: '#f0f0f0', border: '1px dashed #aaa', color: '#7A1828', fontWeight: 700, padding: '0.55rem', borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem' }}>
                  + Add Payment
                </button>
              )}
            </div>

            {error && <div style={{ color: '#e74c3c', fontSize: '0.82rem', marginBottom: '0.75rem' }}>{error}</div>}

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={onClose} style={{ flex: 1, background: '#f0f0f0', color: '#1a1a1a', border: 'none', borderRadius: 8, padding: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={handleSave} disabled={saving}
                style={{ flex: 2, background: '#7A1828', color: '#fff', border: '2px solid #C9A84C', borderRadius: 999, padding: '0.75rem', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700 }}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </>
        )}
      </div>

      {showItemForm && (
        <JOItemForm
          categories={categories}
          subcategories={subcategories}
          onSave={(item) => { setEditItems(prev => [...prev, item]); setShowItemForm(false) }}
          onClose={() => setShowItemForm(false)}
        />
      )}
    </div>
  )
}

const fieldStyle: React.CSSProperties = { marginBottom: '1rem' }
const labelStyle: React.CSSProperties = { display: 'block', color: '#999', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem' }
const inputStyle: React.CSSProperties = { width: '100%', background: '#FDF5EC', border: '1.5px solid #d0d0d0', borderRadius: 7, padding: '0.55rem 0.75rem', color: '#1a1a1a', fontSize: '0.85rem', boxSizing: 'border-box', outline: 'none' }
const th: React.CSSProperties = { padding: '0.4rem 0.6rem', textAlign: 'left', fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.03em' }
const td: React.CSSProperties = { padding: '0.45rem 0.6rem', verticalAlign: 'top' }
