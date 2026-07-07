'use client'

import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { formatPeso, generateOverheadId } from '@/lib/jo-helpers'
import type { AppUser } from '@/lib/user'
import { IconCirclePlus, IconEdit, IconCheck, IconX } from '@/components/icons'

interface Props {
  overheadExpenses: any[]
  currentUser: AppUser
}

function monthLabel(monthKey: string) {
  return new Date(monthKey + '-01T00:00:00').toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })
}

function currentMonthFirst() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
}

export default function OverheadExpensesClient({ overheadExpenses: initial, currentUser }: Props) {
  const [items, setItems] = useState(initial)
  const [monthFilter, setMonthFilter] = useState<string>('all')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteError, setDeleteError] = useState('')

  const [month, setMonth] = useState(currentMonthFirst())
  const [expenseName, setExpenseName] = useState('')
  const [amount, setAmount] = useState('')
  const [remarks, setRemarks] = useState('')

  const months = Array.from(new Set(items.map(i => i.month.slice(0, 7)))).sort((a, b) => b.localeCompare(a))
  const filtered = monthFilter === 'all' ? items : items.filter(i => i.month.slice(0, 7) === monthFilter)

  const grouped: Record<string, any[]> = {}
  for (const i of filtered) {
    const key = i.month.slice(0, 7)
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(i)
  }
  const groupKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  function openAdd() {
    setEditing(null)
    setMonth(currentMonthFirst())
    setExpenseName(''); setAmount(''); setRemarks('')
    setError('')
    setShowForm(true)
  }

  function openEdit(i: any) {
    setEditing(i)
    setMonth(i.month)
    setExpenseName(i.expense_name || '')
    setAmount(String(i.amount ?? ''))
    setRemarks(i.remarks || '')
    setError('')
    setShowForm(true)
  }

  async function handleSave() {
    if (!expenseName.trim()) { setError('Please enter an expense name.'); return }
    if (!amount || parseFloat(amount) <= 0) { setError('Please enter a valid amount.'); return }
    setSaving(true)
    setError('')
    try {
      const supabase = createSupabaseBrowserClient()
      const payload = {
        month,
        expense_name: expenseName.trim(),
        amount: parseFloat(amount) || 0,
        remarks: remarks || null,
        recorded_by: currentUser.name,
      }
      if (editing) {
        const { data, error: err } = await supabase.from('overhead_expenses').update(payload).eq('overhead_id', editing.overhead_id).select().single()
        if (err) throw err
        setItems(prev => prev.map(i => i.overhead_id === editing.overhead_id ? data : i))
      } else {
        const { data, error: err } = await supabase.from('overhead_expenses').insert({ ...payload, overhead_id: generateOverheadId() }).select().single()
        if (err) throw err
        setItems(prev => [data, ...prev])
      }
      setShowForm(false)
    } catch (e: any) {
      setError(e.message || 'Failed to save overhead expense.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(i: any) {
    if (!confirm(`Delete "${i.expense_name}"?`)) return
    setDeleteError('')
    try {
      const supabase = createSupabaseBrowserClient()
      const { error: err } = await supabase.from('overhead_expenses').delete().eq('overhead_id', i.overhead_id)
      if (err) throw err
      setItems(prev => prev.filter(x => x.overhead_id !== i.overhead_id))
    } catch (e: any) {
      setDeleteError(e.message || 'Failed to delete overhead expense.')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ color: '#7A1828', fontSize: '1.4rem', fontWeight: 700 }}>Overhead Expenses</h1>
          <p style={{ color: '#777', fontSize: '0.8rem', marginTop: 2 }}>
            Fixed monthly costs (utilities, salaries, BIR, etc.) — Admin-only, factored into final Profit in Sales Reports.
          </p>
        </div>
        <button onClick={openAdd} className="pf-btn">
          <IconCirclePlus />Add Expense
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap' }}>
        <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)}
          style={{ background: '#FDF5EC', border: '1.5px solid #d0d0d0', borderRadius: 8, padding: '0.5rem 0.75rem', color: '#1a1a1a', fontSize: '0.82rem', outline: 'none' }}>
          <option value="all">All Months</option>
          {months.map(m => <option key={m} value={m}>{monthLabel(m)}</option>)}
        </select>
      </div>

      {deleteError && <div style={{ color: '#e74c3c', fontSize: '0.82rem', marginBottom: '0.75rem' }}>{deleteError}</div>}

      {groupKeys.length === 0 ? (
        <div style={{ color: '#aaa', textAlign: 'center', marginTop: '3rem' }}>No overhead expenses recorded.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {groupKeys.map(monthKey => {
            const rows = grouped[monthKey]
            const total = rows.reduce((s, i) => s + (i.amount || 0), 0)
            return (
              <div key={monthKey} style={{ background: '#FDF5EC', borderRadius: 10, border: '1px solid #EDE0CC', overflow: 'hidden' }}>
                <div style={{ background: '#3D1523', color: '#fff', padding: '0.65rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{monthLabel(monthKey)}</span>
                  <span style={{ color: '#C9A84C', fontWeight: 700, fontSize: '0.88rem' }}>{formatPeso(total)}</span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', minWidth: 560 }}>
                    <thead>
                      <tr style={{ background: '#C9A84C', color: '#3a0a0a' }}>
                        <th style={th}>Expense</th>
                        <th style={{ ...th, textAlign: 'right' }}>Amount</th>
                        <th style={th}>Remarks</th>
                        <th style={{ ...th, width: 60 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map(i => (
                        <tr key={i.overhead_id} style={{ borderBottom: '1px solid #EDE0CC' }}>
                          <td style={{ ...td, fontWeight: 600 }}>{i.expense_name}</td>
                          <td style={{ ...td, textAlign: 'right' }}>{formatPeso(i.amount || 0)}</td>
                          <td style={{ ...td, color: '#777' }}>{i.remarks || '—'}</td>
                          <td style={{ ...td, textAlign: 'center', whiteSpace: 'nowrap' }}>
                            <button onClick={() => openEdit(i)} title="Edit expense" style={{ background: 'none', border: 'none', color: '#7A1828', cursor: 'pointer', marginRight: 8, display: 'inline-flex' }}>
                              <IconEdit style={{ width: 14, height: 14 }} />
                            </button>
                            <button onClick={() => handleDelete(i)} title="Delete expense" style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
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
              <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700 }}>{editing ? 'Edit Expense' : 'Add Expense'}</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#E8B9C6', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div className="pf-field">
              <label className="pf-label">Month <span className="pf-req">*</span></label>
              <input type="month" value={month.slice(0, 7)} onChange={e => setMonth(`${e.target.value}-01`)} className="pf-input" />
            </div>

            <div className="pf-field">
              <label className="pf-label">Expense Name <span className="pf-req">*</span></label>
              <input type="text" value={expenseName} onChange={e => setExpenseName(e.target.value)} placeholder="e.g. Employee Salary" className="pf-input" />
            </div>

            <div className="pf-field">
              <label className="pf-label">Amount (₱) <span className="pf-req">*</span></label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="pf-input" />
            </div>

            <div className="pf-field">
              <label className="pf-label">Remarks</label>
              <input type="text" value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Optional" className="pf-input" />
            </div>

            {error && <div style={{ color: '#e74c3c', fontSize: '0.82rem', marginBottom: '0.75rem' }}>{error}</div>}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)} className="pf-btn pf-btn-secondary"><IconX />Cancel</button>
              <button onClick={handleSave} disabled={saving} className="pf-btn">
                <IconCheck />{saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Expense'}
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
