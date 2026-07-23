'use client'

import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { formatPeso, generatePurchaseId, getPhilippineDateStr } from '@/lib/jo-helpers'
import { findLikelyDuplicatePurchases, type RecordMatch, type PurchaseCandidate } from '@/lib/record-dedupe'
import type { AppUser } from '@/lib/user'
import { IconCirclePlus, IconEdit, IconCheck, IconX } from '@/components/icons'
import Pagination from '@/components/Pagination'
import DuplicateRecordPrompt from '@/components/DuplicateRecordPrompt'

const PAGE_SIZE = 10

interface Props {
  purchases: any[]
  currentUser: AppUser
}

function monthLabel(monthKey: string) {
  return new Date(monthKey + '-01T00:00:00').toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })
}

export default function PurchasesClient({ purchases: initialPurchases, currentUser }: Props) {
  const [purchases, setPurchases] = useState(initialPurchases)
  const [monthFilter, setMonthFilter] = useState<string>('all')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [page, setPage] = useState(1)
  const [duplicateMatches, setDuplicateMatches] = useState<RecordMatch<PurchaseCandidate>[] | null>(null)

  const [purchaseDate, setPurchaseDate] = useState(getPhilippineDateStr())
  const [supplierName, setSupplierName] = useState('')
  const [specs, setSpecs] = useState('')
  const [size, setSize] = useState('')
  const [amount, setAmount] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [remarks, setRemarks] = useState('')

  const totalAmount = (parseFloat(amount) || 0) * (parseFloat(quantity) || 0)

  const months = Array.from(new Set(purchases.map(p => p.purchase_date.slice(0, 7)))).sort((a, b) => b.localeCompare(a))
  const filtered = monthFilter === 'all' ? purchases : purchases.filter(p => p.purchase_date.slice(0, 7) === monthFilter)

  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)))
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const grouped: Record<string, any[]> = {}
  for (const p of pageItems) {
    const key = p.purchase_date.slice(0, 7)
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(p)
  }
  const groupKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  function openAdd() {
    setEditing(null)
    setPurchaseDate(getPhilippineDateStr())
    setSupplierName(''); setSpecs(''); setSize('')
    setAmount(''); setQuantity('1'); setRemarks('')
    setError('')
    setShowForm(true)
  }

  function openEdit(p: any) {
    setEditing(p)
    setPurchaseDate(p.purchase_date)
    setSupplierName(p.supplier_name || '')
    setSpecs(p.specs || '')
    setSize(p.size || '')
    setAmount(String(p.amount ?? ''))
    setQuantity(String(p.quantity ?? 1))
    setRemarks(p.remarks || '')
    setError('')
    setShowForm(true)
  }

  async function handleSave(skipDuplicateCheck?: boolean) {
    if (!supplierName.trim()) { setError('Please enter a supplier name.'); return }
    if (!specs.trim()) { setError('Please enter item specs.'); return }
    if (!amount || parseFloat(amount) <= 0) { setError('Please enter a valid amount.'); return }
    if (!purchaseDate) { setError('Please set the purchase date.'); return }
    if (!editing && !skipDuplicateCheck) {
      const matches = findLikelyDuplicatePurchases({ purchaseDate, supplierName, specs }, purchases)
      if (matches.length > 0) { setDuplicateMatches(matches); return }
    }
    setSaving(true)
    setError('')
    try {
      const supabase = createSupabaseBrowserClient()
      const payload = {
        purchase_date: purchaseDate,
        supplier_name: supplierName.trim(),
        specs: specs.trim(),
        size: size || null,
        amount: parseFloat(amount) || 0,
        quantity: parseFloat(quantity) || 1,
        total_amount: totalAmount,
        remarks: remarks || null,
        recorded_by: currentUser.name,
      }
      if (editing) {
        const { data, error: err } = await supabase.from('purchases').update(payload).eq('purchase_id', editing.purchase_id).select().single()
        if (err) throw err
        setPurchases(prev => prev.map(p => p.purchase_id === editing.purchase_id ? data : p))
      } else {
        const { data, error: err } = await supabase.from('purchases').insert({ ...payload, purchase_id: generatePurchaseId() }).select().single()
        if (err) throw err
        setPurchases(prev => [data, ...prev])
        setPage(1)
      }
      setShowForm(false)
    } catch (e: any) {
      setError(e.message || 'Failed to save purchase.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(p: any) {
    if (!confirm(`Delete this purchase from ${p.supplier_name}?`)) return
    setDeleteError('')
    try {
      const supabase = createSupabaseBrowserClient()
      const { error: err } = await supabase.from('purchases').delete().eq('purchase_id', p.purchase_id)
      if (err) throw err
      setPurchases(prev => prev.filter(x => x.purchase_id !== p.purchase_id))
    } catch (e: any) {
      setDeleteError(e.message || 'Failed to delete purchase.')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ color: '#7A1828', fontSize: '1.4rem', fontWeight: 700 }}>Purchases</h1>
          <p style={{ color: '#777', fontSize: '0.8rem', marginTop: 2 }}>
            Same-day cash purchases shelled out from the company budget.
          </p>
        </div>
        <button onClick={openAdd} className="pf-btn">
          <IconCirclePlus />Add Purchase
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap' }}>
        <select value={monthFilter} onChange={e => { setMonthFilter(e.target.value); setPage(1) }}
          style={{ background: '#FDF5EC', border: '1.5px solid #d0d0d0', borderRadius: 8, padding: '0.5rem 0.75rem', color: '#1a1a1a', fontSize: '0.82rem', outline: 'none' }}>
          <option value="all">All Months</option>
          {months.map(m => <option key={m} value={m}>{monthLabel(m)}</option>)}
        </select>
      </div>

      {deleteError && <div style={{ color: '#e74c3c', fontSize: '0.82rem', marginBottom: '0.75rem' }}>{deleteError}</div>}

      {groupKeys.length === 0 ? (
        <div style={{ color: '#aaa', textAlign: 'center', marginTop: '3rem' }}>No purchases recorded.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {groupKeys.map(month => {
            const rows = grouped[month]
            const total = rows.reduce((s, p) => s + (p.total_amount || 0), 0)
            return (
              <div key={month} style={{ background: '#FDF5EC', borderRadius: 10, border: '1px solid #EDE0CC', overflow: 'hidden' }}>
                <div style={{ background: '#3D1523', color: '#fff', padding: '0.65rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{monthLabel(month)}</span>
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
                        <th style={{ ...th, textAlign: 'right' }}>Amount</th>
                        <th style={{ ...th, textAlign: 'center' }}>Qty</th>
                        <th style={{ ...th, textAlign: 'right' }}>Total</th>
                        <th style={th}>Remarks</th>
                        <th style={thActions}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map(p => (
                        <tr key={p.purchase_id} style={{ borderBottom: '1px solid #EDE0CC' }}>
                          <td style={td}>{new Date(p.purchase_date + 'T00:00:00').toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: '2-digit' })}</td>
                          <td style={{ ...td, fontWeight: 600 }}>{p.supplier_name}</td>
                          <td style={td}>{p.specs}</td>
                          <td style={td}>{p.size || '—'}</td>
                          <td style={{ ...td, textAlign: 'right' }}>{formatPeso(p.amount || 0)}</td>
                          <td style={{ ...td, textAlign: 'center' }}>{p.quantity}</td>
                          <td style={{ ...td, textAlign: 'right', fontWeight: 700 }}>{formatPeso(p.total_amount || 0)}</td>
                          <td style={{ ...td, color: '#777' }}>{p.remarks || '—'}</td>
                          <td style={tdActions}>
                            <button onClick={() => openEdit(p)} title="Edit purchase" style={{ background: 'none', border: 'none', color: '#7A1828', cursor: 'pointer', marginRight: 8, display: 'inline-flex' }}>
                              <IconEdit style={{ width: 14, height: 14 }} />
                            </button>
                            <button onClick={() => handleDelete(p)} title="Delete purchase" style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
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

      <Pagination page={currentPage} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />

      {showForm && (
        <div className="pf-modal-overlay">
          <div className="pf-modal-card pf-modal-wine" style={{ maxWidth: 480 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700 }}>{editing ? 'Edit Purchase' : 'Add Purchase'}</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#E8B9C6', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div className="pf-field">
              <label className="pf-label">Purchase Date <span className="pf-req">*</span></label>
              <input type="date" value={purchaseDate} max={getPhilippineDateStr()} onChange={e => setPurchaseDate(e.target.value)} className="pf-input" />
            </div>

            <div className="pf-field">
              <label className="pf-label">Supplier <span className="pf-req">*</span></label>
              <input type="text" value={supplierName} onChange={e => setSupplierName(e.target.value)} placeholder="e.g. Macway" className="pf-input" />
            </div>

            <div className="pf-field">
              <label className="pf-label">Specs <span className="pf-req">*</span></label>
              <input type="text" value={specs} onChange={e => setSpecs(e.target.value)} placeholder="e.g. X-Banner" className="pf-input" />
            </div>

            <div className="pf-field">
              <label className="pf-label">Size</label>
              <input type="text" value={size} onChange={e => setSize(e.target.value)} placeholder="e.g. 2x5" className="pf-input" />
            </div>

            <div className="pf-grid-2" style={{ marginBottom: '0.85rem' }}>
              <div>
                <label className="pf-label">Amount (₱) <span className="pf-req">*</span></label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="pf-input" />
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
              <button onClick={() => handleSave()} disabled={saving} className="pf-btn">
                <IconCheck />{saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Purchase'}
              </button>
            </div>
          </div>
        </div>
      )}

      {duplicateMatches && (
        <DuplicateRecordPrompt
          title="Possible Duplicate Purchase"
          message={`This looks like a purchase from "${supplierName}" already logged for this date. Is it the same one?`}
          matches={duplicateMatches}
          getKey={r => r.purchase_id}
          renderMatch={r => (
            <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.88rem' }}>
              {r.supplier_name} — {r.specs}
              <span style={{ color: '#E8B9C6', fontWeight: 400 }}> · {formatPeso(r.amount || 0)}</span>
            </div>
          )}
          onUseExisting={(record) => {
            setDuplicateMatches(null)
            const full = purchases.find(p => p.purchase_id === record.purchase_id)
            if (full) openEdit(full)
          }}
          onSaveAnyway={() => { setDuplicateMatches(null); handleSave(true) }}
          onCancel={() => setDuplicateMatches(null)}
        />
      )}
    </div>
  )
}

const th: React.CSSProperties = { padding: '0.5rem 0.65rem', textAlign: 'left', fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.03em' }
const td: React.CSSProperties = { padding: '0.5rem 0.65rem', verticalAlign: 'top', color: '#1a1a1a' }
// Pinned to the right so Edit/Delete stay reachable without scrolling the table horizontally.
const thActions: React.CSSProperties = { ...th, width: 60, position: 'sticky', right: 0, background: '#C9A84C', boxShadow: '-2px 0 4px rgba(0,0,0,0.08)' }
const tdActions: React.CSSProperties = { ...td, textAlign: 'center', whiteSpace: 'nowrap', position: 'sticky', right: 0, background: '#FDF5EC', boxShadow: '-2px 0 4px rgba(0,0,0,0.08)' }
