'use client'

import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { formatPeso, generateDeliveryId, getPhilippineDateStr, nextMonthFirst } from '@/lib/jo-helpers'
import type { AppUser } from '@/lib/user'
import { IconPlus, IconCirclePlus, IconEdit, IconCheck, IconX } from '@/components/icons'

interface Props {
  deliveries: any[]
  currentUser: AppUser
}

function monthLabel(billingMonth: string) {
  return new Date(billingMonth + 'T00:00:00').toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })
}

export default function SupplierDeliveriesClient({ deliveries: initialDeliveries, currentUser }: Props) {
  const [deliveries, setDeliveries] = useState(initialDeliveries)
  const [monthFilter, setMonthFilter] = useState<string>('all')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteError, setDeleteError] = useState('')

  const [deliveryDate, setDeliveryDate] = useState(getPhilippineDateStr())
  const [supplierName, setSupplierName] = useState('')
  const [specs, setSpecs] = useState('')
  const [size, setSize] = useState('')
  const [unitPrice, setUnitPrice] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [remarks, setRemarks] = useState('')
  const [billingMonth, setBillingMonth] = useState(nextMonthFirst(getPhilippineDateStr()))
  const [billingOverridden, setBillingOverridden] = useState(false)

  const totalAmount = (parseFloat(unitPrice) || 0) * (parseFloat(quantity) || 0)

  const billingMonths = Array.from(new Set(deliveries.map(d => d.billing_month))).sort((a, b) => b.localeCompare(a))
  const filtered = monthFilter === 'all' ? deliveries : deliveries.filter(d => d.billing_month === monthFilter)

  const grouped: Record<string, any[]> = {}
  for (const d of filtered) {
    if (!grouped[d.billing_month]) grouped[d.billing_month] = []
    grouped[d.billing_month].push(d)
  }
  const groupKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  function openAdd() {
    setEditing(null)
    setDeliveryDate(getPhilippineDateStr())
    setSupplierName(''); setSpecs(''); setSize('')
    setUnitPrice(''); setQuantity('1'); setRemarks('')
    setBillingMonth(nextMonthFirst(getPhilippineDateStr()))
    setBillingOverridden(false)
    setError('')
    setShowForm(true)
  }

  function openEdit(d: any) {
    setEditing(d)
    setDeliveryDate(d.delivery_date)
    setSupplierName(d.supplier_name || '')
    setSpecs(d.specs || '')
    setSize(d.size || '')
    setUnitPrice(String(d.unit_price ?? ''))
    setQuantity(String(d.quantity ?? 1))
    setRemarks(d.remarks || '')
    setBillingMonth(d.billing_month)
    setBillingOverridden(true)
    setError('')
    setShowForm(true)
  }

  function handleDateChange(value: string) {
    setDeliveryDate(value)
    if (!billingOverridden) setBillingMonth(nextMonthFirst(value))
  }

  async function handleSave() {
    if (!supplierName.trim()) { setError('Please enter a supplier name.'); return }
    if (!specs.trim()) { setError('Please enter item specs.'); return }
    if (!unitPrice || parseFloat(unitPrice) <= 0) { setError('Please enter a valid unit price.'); return }
    if (!deliveryDate) { setError('Please set the delivery date.'); return }
    setSaving(true)
    setError('')
    try {
      const supabase = createSupabaseBrowserClient()
      const payload = {
        delivery_date: deliveryDate,
        supplier_name: supplierName.trim(),
        specs: specs.trim(),
        size: size || null,
        unit_price: parseFloat(unitPrice) || 0,
        quantity: parseFloat(quantity) || 1,
        total_amount: totalAmount,
        remarks: remarks || null,
        billing_month: billingMonth,
        recorded_by: currentUser.name,
      }
      if (editing) {
        const { data, error: err } = await supabase.from('supplier_deliveries').update(payload).eq('delivery_id', editing.delivery_id).select().single()
        if (err) throw err
        setDeliveries(prev => prev.map(d => d.delivery_id === editing.delivery_id ? data : d))
      } else {
        const { data, error: err } = await supabase.from('supplier_deliveries').insert({ ...payload, delivery_id: generateDeliveryId() }).select().single()
        if (err) throw err
        setDeliveries(prev => [data, ...prev])
      }
      setShowForm(false)
    } catch (e: any) {
      setError(e.message || 'Failed to save delivery.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(d: any) {
    if (!confirm(`Delete this delivery from ${d.supplier_name}?`)) return
    setDeleteError('')
    try {
      const supabase = createSupabaseBrowserClient()
      const { error: err } = await supabase.from('supplier_deliveries').delete().eq('delivery_id', d.delivery_id)
      if (err) throw err
      setDeliveries(prev => prev.filter(x => x.delivery_id !== d.delivery_id))
    } catch (e: any) {
      setDeleteError(e.message || 'Failed to delete delivery.')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ color: '#7A1828', fontSize: '1.4rem', fontWeight: 700 }}>Supplier Deliveries</h1>
          <p style={{ color: '#777', fontSize: '0.8rem', marginTop: 2 }}>
            Deliveries received on 1-month cheque terms — a delivery received this month is billed via next month's cheque.
          </p>
        </div>
        <button onClick={openAdd} className="pf-btn">
          <IconCirclePlus />Add Delivery
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap' }}>
        <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)}
          style={{ background: '#FDF5EC', border: '1.5px solid #d0d0d0', borderRadius: 8, padding: '0.5rem 0.75rem', color: '#1a1a1a', fontSize: '0.82rem', outline: 'none' }}>
          <option value="all">All Billing Months</option>
          {billingMonths.map(m => <option key={m} value={m}>{monthLabel(m)} Billing</option>)}
        </select>
      </div>

      {deleteError && <div style={{ color: '#e74c3c', fontSize: '0.82rem', marginBottom: '0.75rem' }}>{deleteError}</div>}

      {groupKeys.length === 0 ? (
        <div style={{ color: '#aaa', textAlign: 'center', marginTop: '3rem' }}>No supplier deliveries recorded.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {groupKeys.map(month => {
            const rows = grouped[month]
            const total = rows.reduce((s, d) => s + (d.total_amount || 0), 0)
            return (
              <div key={month} style={{ background: '#FDF5EC', borderRadius: 10, border: '1px solid #EDE0CC', overflow: 'hidden' }}>
                <div style={{ background: '#3D1523', color: '#fff', padding: '0.65rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{monthLabel(month)} Billing</span>
                  <span style={{ color: '#C9A84C', fontWeight: 700, fontSize: '0.88rem' }}>{formatPeso(total)}</span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', minWidth: 720 }}>
                    <thead>
                      <tr style={{ background: '#C9A84C', color: '#3a0a0a' }}>
                        <th style={th}>Date</th>
                        <th style={th}>Supplier</th>
                        <th style={th}>Specs</th>
                        <th style={th}>Size</th>
                        <th style={{ ...th, textAlign: 'right' }}>Unit Price</th>
                        <th style={{ ...th, textAlign: 'center' }}>Qty</th>
                        <th style={{ ...th, textAlign: 'right' }}>Total</th>
                        <th style={th}>Remarks</th>
                        <th style={{ ...th, width: 60 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map(d => (
                        <tr key={d.delivery_id} style={{ borderBottom: '1px solid #EDE0CC' }}>
                          <td style={td}>{new Date(d.delivery_date + 'T00:00:00').toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: '2-digit' })}</td>
                          <td style={{ ...td, fontWeight: 600 }}>{d.supplier_name}</td>
                          <td style={td}>{d.specs}</td>
                          <td style={td}>{d.size || '—'}</td>
                          <td style={{ ...td, textAlign: 'right' }}>{formatPeso(d.unit_price || 0)}</td>
                          <td style={{ ...td, textAlign: 'center' }}>{d.quantity}</td>
                          <td style={{ ...td, textAlign: 'right', fontWeight: 700 }}>{formatPeso(d.total_amount || 0)}</td>
                          <td style={{ ...td, color: '#777' }}>{d.remarks || '—'}</td>
                          <td style={{ ...td, textAlign: 'center', whiteSpace: 'nowrap' }}>
                            <button onClick={() => openEdit(d)} title="Edit delivery" style={{ background: 'none', border: 'none', color: '#7A1828', cursor: 'pointer', marginRight: 8, display: 'inline-flex' }}>
                              <IconEdit style={{ width: 14, height: 14 }} />
                            </button>
                            <button onClick={() => handleDelete(d)} title="Delete delivery" style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showForm && (
        <div className="pf-modal-overlay">
          <div className="pf-modal-card pf-modal-wine" style={{ maxWidth: 480 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700 }}>{editing ? 'Edit Delivery' : 'Add Delivery'}</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#E8B9C6', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div className="pf-grid-2" style={{ marginBottom: '0.85rem' }}>
              <div>
                <label className="pf-label">Delivery Date <span className="pf-req">*</span></label>
                <input type="date" value={deliveryDate} max={getPhilippineDateStr()} onChange={e => handleDateChange(e.target.value)} className="pf-input" />
              </div>
              <div>
                <label className="pf-label">Billing Month <span className="pf-req">*</span></label>
                <input type="month" value={billingMonth.slice(0, 7)} onChange={e => { setBillingMonth(`${e.target.value}-01`); setBillingOverridden(true) }} className="pf-input" />
              </div>
            </div>

            <div className="pf-field">
              <label className="pf-label">Supplier <span className="pf-req">*</span></label>
              <input type="text" value={supplierName} onChange={e => setSupplierName(e.target.value)} placeholder="e.g. Artmart Signage Materials Trading" className="pf-input" />
            </div>

            <div className="pf-field">
              <label className="pf-label">Specs <span className="pf-req">*</span></label>
              <input type="text" value={specs} onChange={e => setSpecs(e.target.value)} placeholder="e.g. Acryglass Sheet 6mm (CW)" className="pf-input" />
            </div>

            <div className="pf-field">
              <label className="pf-label">Size</label>
              <input type="text" value={size} onChange={e => setSize(e.target.value)} placeholder="e.g. 4x8" className="pf-input" />
            </div>

            <div className="pf-grid-2" style={{ marginBottom: '0.85rem' }}>
              <div>
                <label className="pf-label">Unit Price (₱) <span className="pf-req">*</span></label>
                <input type="number" value={unitPrice} onChange={e => setUnitPrice(e.target.value)} placeholder="0.00" className="pf-input" />
              </div>
              <div>
                <label className="pf-label">Quantity</label>
                <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} min="1" className="pf-input" />
              </div>
            </div>

            <div className="pf-field">
              <label className="pf-label">Remarks</label>
              <input type="text" value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Optional" className="pf-input" />
            </div>

            <div className="pf-totals-box" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#D9A8B5', fontSize: '0.82rem' }}>Total Amount</span>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>{formatPeso(totalAmount)}</span>
            </div>

            {error && <div style={{ color: '#e74c3c', fontSize: '0.82rem', marginBottom: '0.75rem' }}>{error}</div>}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)} className="pf-btn pf-btn-secondary"><IconX />Cancel</button>
              <button onClick={handleSave} disabled={saving} className="pf-btn">
                <IconCheck />{saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Delivery'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const th: React.CSSProperties = { padding: '0.5rem 0.65rem', textAlign: 'left', fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.03em' }
const td: React.CSSProperties = { padding: '0.5rem 0.65rem', verticalAlign: 'top', color: '#1a1a1a' }
