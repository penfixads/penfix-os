'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { formatPeso, getPhilippineDayOfWeek } from '@/lib/jo-helpers'
import type { AppUser } from '@/lib/user'
import { IconPlus, IconX, IconCheck, IconEdit } from '@/components/icons'
import Pagination from '@/components/Pagination'

const PAGE_SIZE = 10

interface Props {
  payments: any[]
  expenses: any[]
  jobOrders: any[]
  summary: any
  previousSummary: any
  recentSummaries: any[]
  date: string
  today: string
  currentUser: AppUser
}

const PAY_METHODS = ['Cash', 'G-Cash', 'Maya', 'Bank Transfer via BPI Acct.', 'Bank Transfer via BDO Acct.', 'Cheque']

// Exactly 0 means cash on hand matched what was expected — that's a distinct, good outcome
// from "Excess" (more cash than expected, usually an unrecorded job order) and shouldn't be
// lumped in with it just because 0 >= 0.
function reconciliationBadge(excessDeficit: number): { label: string; bg: string; color: string } {
  if (excessDeficit === 0) return { label: 'Balance', bg: '#3a3010', color: '#C9A84C' }
  if (excessDeficit > 0) return { label: 'Excess', bg: '#1a4a1a', color: '#2ecc71' }
  return { label: 'Deficit', bg: '#4a1a1a', color: '#e74c3c' }
}

// Shared by HistoryRow (past days) and the "today" expense list below — same edit/delete
// UI either way, just wired to whichever recompute logic its parent needs.
function ExpenseRow({ expense, canManage, locked, onSave, onDelete }: {
  expense: any
  canManage: boolean
  locked: boolean
  onSave: (expenseId: string, updates: { description: string; amount: number; category: string }) => Promise<void> | void
  onDelete: (expenseId: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [desc, setDesc] = useState(expense.description || expense.expense_name || '')
  const [amount, setAmount] = useState(String(expense.amount ?? ''))
  const [category, setCategory] = useState(expense.category || 'Operations')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function startEdit() {
    setDesc(expense.description || expense.expense_name || '')
    setAmount(String(expense.amount ?? ''))
    setCategory(expense.category || 'Operations')
    setError('')
    setEditing(true)
  }

  async function save() {
    if (!desc.trim()) { setError('Please enter a description.'); return }
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) { setError('Please enter a valid amount.'); return }
    setSaving(true)
    setError('')
    try {
      await onSave(expense.expense_id, { description: desc.trim(), amount: amt, category })
      setEditing(false)
    } catch (e: any) {
      setError(e.message || 'Failed to save expense.')
    } finally {
      setSaving(false)
    }
  }

  if (editing) {
    return (
      <div style={{ background: '#fff', borderRadius: 8, padding: '0.6rem 0.7rem', marginBottom: 6, border: '1px solid #EDE0CC', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="text" value={desc} onChange={e => setDesc(e.target.value)} className="pf-input" style={{ flex: 2 }} placeholder="Description" />
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="pf-input" style={{ flex: 1 }} placeholder="0.00" />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)} className="pf-select">
          {['Operations', 'Supplies', 'Utilities', 'Transport', 'Miscellaneous'].map(c => <option key={c}>{c}</option>)}
        </select>
        {error && <div style={{ color: '#e74c3c', fontSize: '0.72rem' }}>{error}</div>}
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setEditing(false)} disabled={saving} className="pf-btn pf-btn-secondary" style={{ flex: 1, padding: '0.3rem 0.6rem', fontSize: '0.72rem' }}><IconX />Cancel</button>
          <button onClick={save} disabled={saving} className="pf-btn" style={{ flex: 1, padding: '0.3rem 0.6rem', fontSize: '0.72rem' }}><IconCheck />{saving ? '…' : 'Save'}</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', padding: '0.4rem 0', borderBottom: '1px solid #e5e5e5' }}>
      <div>
        <span style={{ color: '#1a1a1a' }}>{expense.description || expense.expense_name}</span>
        {expense.category && <span style={{ color: '#666', marginLeft: 8 }}>{expense.category}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ color: '#e74c3c', fontWeight: 700 }}>{formatPeso(expense.amount)}</span>
        {canManage && !locked && (
          <>
            <button onClick={startEdit} title="Edit" style={{ background: 'none', border: 'none', color: '#7A1828', cursor: 'pointer', display: 'flex' }}>
              <IconEdit style={{ width: 13, height: 13 }} />
            </button>
            <button onClick={() => onDelete(expense.expense_id)} title="Delete" style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', display: 'flex' }}>
              <IconX style={{ width: 13, height: 13 }} />
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function HistoryRow({ row, currentUser }: { row: any; currentUser: AppUser }) {
  // Expense edit/delete is available to whoever actually logs these day-to-day (Admin +
  // Treasury), not just Admin — Treasury should be able to fix their own typos directly.
  const canManageExpenses = currentUser.role === 'Admin' || currentUser.role === 'Treasury'
  const [expanded, setExpanded] = useState(false)
  const [rowExpenses, setRowExpenses] = useState<any[] | null>(null)
  const [rowPayments, setRowPayments] = useState<any[] | null>(null)
  const [cashOnHand, setCashOnHand] = useState(row.cash_on_hand != null ? String(row.cash_on_hand) : '')
  const [remittedCash, setRemittedCash] = useState(row.remitted_cash != null ? String(row.remitted_cash) : '')
  const [remark, setRemark] = useState(row.remark || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(row)
  const [error, setError] = useState('')
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [expDesc, setExpDesc] = useState('')
  const [expAmount, setExpAmount] = useState('')
  const [expCategory, setExpCategory] = useState('Operations')
  const [savingExp, setSavingExp] = useState(false)
  const [expError, setExpError] = useState('')

  const expectedCashOnHand = saved.expected_cash_on_hand || 0
  const cashOnHandNum = parseFloat(cashOnHand) || 0
  const remittedCashNum = parseFloat(remittedCash) || 0
  const excessDeficit = cashOnHandNum - expectedCashOnHand
  const nextDayFund = cashOnHandNum - remittedCashNum

  async function toggleExpand() {
    const next = !expanded
    setExpanded(next)
    if (next && rowExpenses === null) {
      const supabase = createSupabaseBrowserClient()
      const { data } = await supabase.from('expenses').select('*').eq('summary_id', saved.summary_id).order('created_at', { ascending: false })
      setRowExpenses(data || [])
    }
    if (next && rowPayments === null) {
      const supabase = createSupabaseBrowserClient()
      const { data } = await supabase
        .from('payments')
        .select(`*, job_orders(client_id, clients(client_name, company_name))`)
        .eq('payment_date', row.date)
        .order('created_at', { ascending: false })
      setRowPayments(data || [])
    }
  }

  async function save() {
    setSaving(true)
    setError('')
    try {
      const supabase = createSupabaseBrowserClient()
      const updates = {
        cash_on_hand: cashOnHandNum,
        remitted_cash: remittedCashNum,
        excess_deficit: excessDeficit,
        next_day_fund: nextDayFund,
        remark,
      }
      const { data, error: err } = await supabase.from('daily_sales_summary').update(updates).eq('summary_id', saved.summary_id).select().single()
      if (err) throw err
      if (data) setSaved(data)
    } catch (e: any) {
      setError(e.message || 'Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  async function addExpense() {
    if (!expDesc) { setExpError('Please enter a description.'); return }
    if (!expAmount || parseFloat(expAmount) <= 0) { setExpError('Please enter a valid amount.'); return }
    setSavingExp(true)
    setExpError('')
    try {
      const supabase = createSupabaseBrowserClient()
      const amount = parseFloat(expAmount)
      const { data, error: err } = await supabase.from('expenses').insert({
        expense_date: row.date,
        date: row.date,
        expense_name: expDesc,
        description: expDesc,
        amount,
        category: expCategory,
        recorded_by: currentUser.name,
        summary_id: saved.summary_id,
      }).select().single()
      if (err) throw err
      // Recompute + persist this day's expected cash on hand / excess-deficit so the
      // collapsed badge and reconciliation stay correct without a separate "Save Changes" —
      // a new expense on a past day directly changes what cash was expected to be on hand.
      const newTotalExpenses = (saved.total_expenses || 0) + amount
      const newExpectedCashOnHand = (saved.initial_fund || 0) + (saved.cash || 0) - newTotalExpenses
      const newExcessDeficit = cashOnHandNum - newExpectedCashOnHand
      const { data: updatedSummary, error: updErr } = await supabase.from('daily_sales_summary').update({
        total_expenses: newTotalExpenses,
        expected_cash_on_hand: newExpectedCashOnHand,
        excess_deficit: newExcessDeficit,
      }).eq('summary_id', saved.summary_id).select().single()
      if (updErr) throw updErr
      if (data) setRowExpenses(prev => [data, ...(prev || [])])
      if (updatedSummary) setSaved(updatedSummary)
      setExpDesc('')
      setExpAmount('')
      setShowExpenseForm(false)
    } catch (e: any) {
      setExpError(e.message || 'Failed to save expense.')
    } finally {
      setSavingExp(false)
    }
  }

  async function deleteExpense(expenseId: string) {
    const target = rowExpenses?.find(e => e.expense_id === expenseId)
    const supabase = createSupabaseBrowserClient()
    const { error: err } = await supabase.from('expenses').delete().eq('expense_id', expenseId)
    if (err) { setExpError(err.message || 'Failed to delete expense.'); return }
    setRowExpenses(prev => (prev || []).filter(e => e.expense_id !== expenseId))
    if (target) {
      const newTotalExpenses = (saved.total_expenses || 0) - (target.amount || 0)
      const newExpectedCashOnHand = (saved.initial_fund || 0) + (saved.cash || 0) - newTotalExpenses
      const newExcessDeficit = cashOnHandNum - newExpectedCashOnHand
      const { data: updatedSummary } = await supabase.from('daily_sales_summary').update({
        total_expenses: newTotalExpenses,
        expected_cash_on_hand: newExpectedCashOnHand,
        excess_deficit: newExcessDeficit,
      }).eq('summary_id', saved.summary_id).select().single()
      if (updatedSummary) setSaved(updatedSummary)
    }
  }

  // Same recompute as deleteExpense, but by the amount delta instead of the full amount —
  // a past day's total_expenses/expected_cash_on_hand/excess_deficit are stored, not derived,
  // so an edited amount has to be pushed through the same way a delete or a new expense does.
  async function editExpense(expenseId: string, updates: { description: string; amount: number; category: string }) {
    const target = rowExpenses?.find(e => e.expense_id === expenseId)
    const supabase = createSupabaseBrowserClient()
    const { data, error: err } = await supabase.from('expenses').update({
      description: updates.description,
      expense_name: updates.description,
      amount: updates.amount,
      category: updates.category,
    }).eq('expense_id', expenseId).select().single()
    if (err) throw err
    setRowExpenses(prev => (prev || []).map(e => e.expense_id === expenseId ? data : e))
    if (target) {
      const amountDelta = updates.amount - (target.amount || 0)
      const newTotalExpenses = (saved.total_expenses || 0) + amountDelta
      const newExpectedCashOnHand = (saved.initial_fund || 0) + (saved.cash || 0) - newTotalExpenses
      const newExcessDeficit = cashOnHandNum - newExpectedCashOnHand
      const { data: updatedSummary } = await supabase.from('daily_sales_summary').update({
        total_expenses: newTotalExpenses,
        expected_cash_on_hand: newExpectedCashOnHand,
        excess_deficit: newExcessDeficit,
      }).eq('summary_id', saved.summary_id).select().single()
      if (updatedSummary) setSaved(updatedSummary)
    }
  }

  const dateLabel = new Date(row.date + 'T00:00:00').toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div style={{ background: '#FDF5EC', border: '1px solid #EDE0CC', borderRadius: 10, overflow: 'hidden' }}>
      <button onClick={toggleExpand} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}>
        <span style={{ color: '#7A1828', fontSize: '0.75rem' }}>{expanded ? '▼' : '▶'}</span>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#1a1a1a', fontWeight: 700, fontSize: '0.85rem' }}>{dateLabel}{saved.is_locked && <span style={{ marginLeft: 6 }} title="Locked">🔒</span>}</div>
          <div style={{ color: '#999', fontSize: '0.72rem' }}>Sales: {formatPeso(saved.total_sales || 0)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{
            background: reconciliationBadge(saved.excess_deficit || 0).bg,
            color: reconciliationBadge(saved.excess_deficit || 0).color,
            borderRadius: 20, padding: '0.15rem 0.55rem', fontSize: '0.68rem', fontWeight: 700,
          }}>
            {reconciliationBadge(saved.excess_deficit || 0).label} {formatPeso(Math.abs(saved.excess_deficit || 0))}
          </span>
          <div style={{ color: '#999', fontSize: '0.68rem', marginTop: 3 }}>Next Day: {formatPeso(saved.next_day_fund || 0)}</div>
        </div>
      </button>

      {expanded && (
        <div style={{ padding: '0 1rem 1rem', borderTop: '1px dashed #EDE0CC' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8, margin: '0.85rem 0' }}>
            <div>
              <label className="pf-label" style={{ color: '#999' }}>Cash On Hand</label>
              <input type="number" value={cashOnHand} disabled={saved.is_locked} onChange={e => setCashOnHand(e.target.value)} className="pf-input" />
            </div>
            <div>
              <label className="pf-label" style={{ color: '#999' }}>Remitted Cash</label>
              <input type="number" value={remittedCash} disabled={saved.is_locked} onChange={e => setRemittedCash(e.target.value)} className="pf-input" />
            </div>
            <div>
              <label className="pf-label" style={{ color: '#999' }}>Excess/Deficit</label>
              <div className={excessDeficit >= 0 ? 'money-green' : 'money-red'} style={{ fontWeight: 700, padding: '0.4rem 0' }}>{formatPeso(excessDeficit)}</div>
            </div>
            <div>
              <label className="pf-label" style={{ color: '#999' }}>Next Day Fund</label>
              <div className="money" style={{ fontWeight: 700, padding: '0.4rem 0' }}>{formatPeso(nextDayFund)}</div>
            </div>
          </div>
          <textarea value={remark} disabled={saved.is_locked} onChange={e => setRemark(e.target.value)} rows={2} placeholder="Remark..." className="pf-textarea" style={{ marginBottom: 8 }} />
          {error && <div style={{ color: '#e74c3c', fontSize: '0.78rem', marginBottom: 8 }}>{error}</div>}
          {saved.is_locked ? (
            <div style={{ color: '#999', fontSize: '0.75rem', marginBottom: 10 }}>🔒 Locked — an Admin must unlock this day before it can be edited again.</div>
          ) : (
            <button onClick={save} disabled={saving} className="pf-btn" style={{ marginBottom: 10 }}>
              <IconCheck />{saving ? 'Saving…' : 'Save Changes'}
            </button>
          )}

          {rowPayments && (
            <div style={{ marginBottom: rowExpenses && rowExpenses.length > 0 ? 14 : 0 }}>
              <div style={{ color: '#666', fontWeight: 700, fontSize: '0.75rem', marginBottom: 6 }}>Paid Job Orders ({rowPayments.length})</div>
              {rowPayments.length === 0 ? (
                <div style={{ color: '#aaa', fontSize: '0.75rem' }}>No payments recorded for this day.</div>
              ) : (
                <>
                  {rowPayments.map(p => {
                    const clientName = p.job_orders?.clients?.client_name || p.job_orders?.clients?.company_name || p.job_order_id
                    return (
                      <div key={p.payment_id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '0.3rem 0', borderBottom: '1px solid #e5e5e5' }}>
                        <div>
                          <span style={{ color: '#1a1a1a' }}>{p.job_order_id}</span>
                          <span style={{ color: '#1a1a1a', marginLeft: 8 }}>{clientName}</span>
                          <span style={{ color: '#999', marginLeft: 8 }}>{p.payment_method}</span>
                        </div>
                        <span style={{ color: '#2ecc71', fontWeight: 700 }}>{formatPeso(p.amount)}</span>
                      </div>
                    )
                  })}
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 6, fontWeight: 700, fontSize: '0.78rem' }}>
                    <span style={{ color: '#666' }}>Cash Payments Total</span>
                    <span style={{ color: '#1a1a1a' }}>{formatPeso(rowPayments.filter(p => p.payment_method === 'Cash').reduce((s, p) => s + (p.amount || 0), 0))}</span>
                  </div>
                </>
              )}
            </div>
          )}

          {rowExpenses !== null && (
            <div style={{ marginTop: rowPayments ? 14 : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ color: '#666', fontWeight: 700, fontSize: '0.75rem' }}>Expenses ({rowExpenses.length})</div>
                {!saved.is_locked && (
                  <button onClick={() => { setExpError(''); setShowExpenseForm(v => !v) }} title="Add expense" className="pf-btn" style={{ padding: '0.3rem', fontSize: '0.7rem' }}>
                    <IconPlus />
                  </button>
                )}
              </div>

              {showExpenseForm && (
                <div style={{ background: '#fff', borderRadius: 8, padding: '0.75rem', marginBottom: '0.65rem', border: '1px solid #EDE0CC', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ flex: 2 }}>
                      <label className="pf-label" style={{ color: '#999' }}>Description</label>
                      <input type="text" value={expDesc} onChange={e => setExpDesc(e.target.value)} placeholder="e.g. Ink cartridge" className="pf-input" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="pf-label" style={{ color: '#999' }}>Amount (₱)</label>
                      <input type="number" value={expAmount} onChange={e => setExpAmount(e.target.value)} placeholder="0.00" className="pf-input" />
                    </div>
                  </div>
                  <div>
                    <label className="pf-label" style={{ color: '#999' }}>Category</label>
                    <select value={expCategory} onChange={e => setExpCategory(e.target.value)} className="pf-select">
                      {['Operations', 'Supplies', 'Utilities', 'Transport', 'Miscellaneous'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  {expError && <div style={{ color: '#e74c3c', fontSize: '0.75rem' }}>{expError}</div>}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => { setExpError(''); setShowExpenseForm(false) }} className="pf-btn pf-btn-secondary" style={{ flex: 1 }}><IconX />Cancel</button>
                    <button onClick={addExpense} disabled={savingExp} className="pf-btn" style={{ flex: 2 }}>
                      <IconCheck />{savingExp ? '…' : 'Save Expense'}
                    </button>
                  </div>
                </div>
              )}

              {rowExpenses.length === 0 ? (
                <div style={{ color: '#aaa', fontSize: '0.75rem' }}>No expenses recorded for this day.</div>
              ) : (
                <>
                  {rowExpenses.map(e => (
                    <ExpenseRow
                      key={e.expense_id}
                      expense={e}
                      canManage={canManageExpenses}
                      locked={!!saved.is_locked}
                      onSave={editExpense}
                      onDelete={deleteExpense}
                    />
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 6, fontWeight: 700, fontSize: '0.78rem' }}>
                    <span style={{ color: '#666' }}>Total Expenses</span>
                    <span style={{ color: '#e74c3c' }}>{formatPeso(rowExpenses.reduce((s, e) => s + (e.amount || 0), 0))}</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function SalesSummaryClient({ payments, expenses: initExpenses, jobOrders, summary, previousSummary, recentSummaries, date, today, currentUser }: Props) {
  const router = useRouter()
  const isToday = date === today
  const [expenses, setExpenses] = useState(initExpenses)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [expDesc, setExpDesc] = useState('')
  const [expAmount, setExpAmount] = useState('')
  const [expCategory, setExpCategory] = useState('Operations')
  const [remark, setRemark] = useState(summary?.remark || '')
  const [savingExp, setSavingExp] = useState(false)
  const [expError, setExpError] = useState('')
  const [saving, setSaving] = useState(false)
  const [summaryError, setSummaryError] = useState('')
  const [summaryExists, setSummaryExists] = useState(!!summary)
  const [cashOnHand, setCashOnHand] = useState(summary?.cash_on_hand != null ? String(summary.cash_on_hand) : '')
  const [remittedCash, setRemittedCash] = useState(summary?.remitted_cash != null ? String(summary.remitted_cash) : '')
  const [overridingFund, setOverridingFund] = useState(false)
  const [fundOverride, setFundOverride] = useState('')
  const [showJOTable, setShowJOTable] = useState(false)
  const [searchDate, setSearchDate] = useState('')
  const [searchResult, setSearchResult] = useState<any | null | 'not_found'>(null)
  const [searching, setSearching] = useState(false)
  const [filterType, setFilterType] = useState<'all' | 'deficit' | 'excess'>('all')
  const [filterResults, setFilterResults] = useState<any[] | null>(null)
  const [filtering, setFiltering] = useState(false)
  const [recentPage, setRecentPage] = useState(1)
  const [bulkLocking, setBulkLocking] = useState(false)
  const [showHistoricalModal, setShowHistoricalModal] = useState(false)
  const [historicalDate, setHistoricalDate] = useState('')

  const recentDays = recentSummaries.filter(r => r.date !== date)
  const recentCurrentPage = Math.min(recentPage, Math.max(1, Math.ceil(recentDays.length / PAGE_SIZE)))
  const recentPageItems = recentDays.slice((recentCurrentPage - 1) * PAGE_SIZE, recentCurrentPage * PAGE_SIZE)

  const isAdmin = currentUser.role === 'Admin'
  const canManageExpenses = currentUser.role === 'Admin' || currentUser.role === 'Treasury'
  const summaryId = `DSS-${date}`

  // Totals by method
  const byMethod: Record<string, number> = {}
  for (const p of payments) {
    byMethod[p.payment_method] = (byMethod[p.payment_method] || 0) + (p.amount || 0)
  }
  const totalCash = byMethod['Cash'] || 0
  const totalOnline = Object.entries(byMethod).filter(([k]) => k !== 'Cash').reduce((s, [, v]) => s + v, 0)
  const totalCollections = payments.reduce((s, p) => s + (p.amount || 0), 0)
  const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0)
  const totalSales = jobOrders.reduce((s, j) => s + (j.grand_total || 0), 0)

  // Initial Fund inherits the most recent prior day's Next Day Fund — not necessarily
  // "yesterday", since Sundays/holidays are skipped irregularly.
  const inheritedFund = summary?.initial_fund ?? (previousSummary?.next_day_fund ?? 0)
  const initialFund = overridingFund ? (parseFloat(fundOverride) || 0) : inheritedFund

  const expectedCashOnHand = initialFund + totalCash - totalExpenses
  const cashOnHandNum = parseFloat(cashOnHand) || 0
  const remittedCashNum = parseFloat(remittedCash) || 0
  const excessDeficit = cashOnHandNum - expectedCashOnHand
  const nextDayFund = cashOnHandNum - remittedCashNum

  const isSunday = getPhilippineDayOfWeek(date) === 0

  async function ensureSummaryRow() {
    if (summaryExists) return
    const supabase = createSupabaseBrowserClient()
    await supabase.from('daily_sales_summary').upsert({
      summary_id: summaryId,
      date,
      initial_fund: initialFund,
    }, { onConflict: 'date' })
    setSummaryExists(true)
  }

  async function saveSummary() {
    setSaving(true)
    setSummaryError('')
    try {
      const supabase = createSupabaseBrowserClient()
      const { error } = await supabase.from('daily_sales_summary').upsert({
        summary_id: summaryId,
        date,
        initial_fund: initialFund,
        cash: totalCash,
        ewallet_bank: totalOnline,
        total_sales: totalSales,
        total_expenses: totalExpenses,
        expected_cash_on_hand: expectedCashOnHand,
        cash_on_hand: cashOnHandNum,
        remitted_cash: remittedCashNum,
        excess_deficit: excessDeficit,
        next_day_fund: nextDayFund,
        remark,
      }, { onConflict: 'date' })
      if (error) throw error
      setSummaryExists(true)
    } catch (e: any) {
      setSummaryError(e.message || 'Failed to save summary.')
    } finally {
      setSaving(false)
    }
  }

  async function addExpense() {
    if (!expDesc) { setExpError('Please enter a description.'); return }
    if (!expAmount || parseFloat(expAmount) <= 0) { setExpError('Please enter a valid amount.'); return }
    setSavingExp(true)
    setExpError('')
    try {
      await ensureSummaryRow()
      const supabase = createSupabaseBrowserClient()
      const { data, error } = await supabase.from('expenses').insert({
        expense_date: date,
        date,
        expense_name: expDesc,
        description: expDesc,
        amount: parseFloat(expAmount),
        category: expCategory,
        recorded_by: currentUser.name,
        summary_id: summaryId,
      }).select().single()
      if (error) throw error
      if (data) setExpenses(prev => [...prev, data])
      setExpDesc('')
      setExpAmount('')
      setShowExpenseForm(false)
    } catch (e: any) {
      setExpError(e.message || 'Failed to save expense.')
    } finally {
      setSavingExp(false)
    }
  }

  async function deleteExpense(expenseId: string) {
    const supabase = createSupabaseBrowserClient()
    await supabase.from('expenses').delete().eq('expense_id', expenseId)
    setExpenses(prev => prev.filter(e => e.expense_id !== expenseId))
  }

  // Unlike HistoryRow's editExpense, today's total_expenses/expected_cash_on_hand are derived
  // live from the `expenses` array below (not yet persisted to daily_sales_summary until "Save
  // Summary" is clicked), so editing here only needs to update local state — same as deleteExpense.
  async function saveExpenseEdit(expenseId: string, updates: { description: string; amount: number; category: string }) {
    const supabase = createSupabaseBrowserClient()
    const { data, error } = await supabase.from('expenses').update({
      description: updates.description,
      expense_name: updates.description,
      amount: updates.amount,
      category: updates.category,
    }).eq('expense_id', expenseId).select().single()
    if (error) throw error
    if (data) setExpenses(prev => prev.map(e => e.expense_id === expenseId ? data : e))
  }

  // Looks up any date directly, not just whatever happens to be in the last-30-days list —
  // useful once there are months of history (e.g. from the AppSheet migration) to dig through.
  async function searchByDate() {
    if (!searchDate) return
    setSearching(true)
    setSearchResult(null)
    setFilterType('all')
    setFilterResults(null)
    try {
      const supabase = createSupabaseBrowserClient()
      const { data } = await supabase.from('daily_sales_summary').select('*').eq('date', searchDate).maybeSingle()
      setSearchResult(data || 'not_found')
    } finally {
      setSearching(false)
    }
  }

  // Filters across the whole history (not just the last-30-days list) for every day that
  // ran a deficit or an excess — a different question from "what happened on date X".
  async function filterByType(type: 'deficit' | 'excess') {
    setFilterType(type)
    setFiltering(true)
    setSearchDate('')
    setSearchResult(null)
    try {
      const supabase = createSupabaseBrowserClient()
      let query = supabase.from('daily_sales_summary').select('*').order('date', { ascending: false })
      query = type === 'deficit' ? query.lt('excess_deficit', 0) : query.gt('excess_deficit', 0)
      const { data } = await query
      setFilterResults(data || [])
    } finally {
      setFiltering(false)
    }
  }

  // While January-to-present is being reconciled against the AppSheet migration, past days
  // need to stay editable for whoever's helping — this is the "flip it back" step for once
  // that pass is confirmed done, rather than locking/unlocking one day at a time.
  async function lockAllHistorical(lock: boolean) {
    const verb = lock ? 'Lock' : 'Unlock'
    if (!confirm(`${verb} every past day's sales summary (before today)? ${lock ? 'Cash On Hand, Remitted Cash, Remark, and Expenses will stop being editable until unlocked again.' : 'Past days will become editable again.'}`)) return
    setBulkLocking(true)
    try {
      const supabase = createSupabaseBrowserClient()
      const { error } = await supabase.from('daily_sales_summary').update({ is_locked: lock }).lt('date', today)
      if (error) { alert(error.message || 'Failed to update lock status.'); return }
      window.location.reload()
    } finally {
      setBulkLocking(false)
    }
  }

  function clearSearch() {
    setSearchDate('')
    setSearchResult(null)
    setFilterType('all')
    setFilterResults(null)
  }

  // Drives the entry form off a ?date= param instead of always "today" — lets Admin/Treasury
  // add or fix a past day's summary through the exact same full form (JOs received, cash
  // reconciliation, expenses) rather than just the limited edit fields in HistoryRow below.
  function goToDate(newDate: string) {
    router.push(newDate === today ? '/sales/summary' : `/sales/summary?date=${newDate}`)
  }

  const dateLabel = new Date(date + 'T00:00:00').toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div>
      <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ color: '#7A1828', fontSize: '1.4rem', fontWeight: 700 }}>Daily Sales Summary</h1>
          <p style={{ color: '#777', fontSize: '0.8rem', marginTop: 2 }}>{dateLabel}{!isToday && <span style={{ color: '#e67e22', fontWeight: 600 }}> — editing a past day</span>}</p>
          {isSunday && (
            <p style={{ color: '#e67e22', fontSize: '0.75rem', marginTop: 4 }}>{isToday ? 'Today' : 'This day'} is a Sunday — normally closed, recorded because the shop is open.</p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {!isToday && (
            <button onClick={() => goToDate(today)} className="pf-btn pf-btn-secondary" style={{ fontSize: '0.78rem', padding: '0.45rem 0.75rem', whiteSpace: 'nowrap' }}>
              Back to Today
            </button>
          )}
          <button onClick={() => { setHistoricalDate(date === today ? '' : date); setShowHistoricalModal(true) }} className="pf-btn" style={{ fontSize: '0.78rem', padding: '0.45rem 0.75rem', whiteSpace: 'nowrap' }}>
            <IconPlus />Add Historical Summary
          </button>
        </div>
      </div>

      {showHistoricalModal && (
        <div className="pf-modal-overlay">
          <div className="pf-modal-card pf-modal-wine" style={{ maxWidth: 400 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 700 }}>Add Historical Summary</h2>
              <button onClick={() => setShowHistoricalModal(false)} style={{ background: 'none', border: 'none', color: '#E8B9C6', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>
            <div className="pf-field">
              <label className="pf-label">Date <span className="pf-req">*</span></label>
              <input type="date" value={historicalDate} max={today} onChange={e => setHistoricalDate(e.target.value)} className="pf-input" />
            </div>
            <p style={{ color: '#E8B9C6', fontSize: '0.75rem', marginTop: -8, marginBottom: '1.1rem' }}>
              Opens the full entry form for that day — job orders received, cash reconciliation, and expenses — same as today's, pre-filled with anything already on record for it.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowHistoricalModal(false)} className="pf-btn pf-btn-secondary"><IconX />Cancel</button>
              <button
                onClick={() => { if (historicalDate) { goToDate(historicalDate); setShowHistoricalModal(false) } }}
                disabled={!historicalDate}
                className="pf-btn"
              >
                <IconCheck />Open Day
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: '1.25rem' }}>
        {[
          { label: isToday ? "Today's Received JOs" : 'Received JOs', value: jobOrders.length, unit: 'JOs' },
          { label: 'Total Collections', value: formatPeso(totalCollections) },
          { label: 'Cash Collections', value: formatPeso(totalCash) },
          { label: 'Online / Non-Cash', value: formatPeso(totalOnline) },
          { label: 'Total Expenses', value: formatPeso(totalExpenses), warn: totalExpenses > 0 },
          { label: 'Total Sales', value: formatPeso(totalSales) },
        ].map(card => (
          <div key={card.label} style={{ background: '#FDF5EC', borderRadius: 10, padding: '0.75rem 1rem', border: '1px solid #EDE0CC' }}>
            <div style={{ color: '#999', fontSize: '0.7rem', marginBottom: 4 }}>{card.label}</div>
            <div className={card.warn ? 'money-red' : 'money'} style={{ fontWeight: 700, fontSize: '1rem' }}>
              {card.unit ? `${card.value} ${card.unit}` : card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Job Orders Received Today — collapsible detail table */}
      <div style={{ background: '#FDF5EC', borderRadius: 10, marginBottom: '1.25rem', border: '1px solid #EDE0CC', overflow: 'hidden' }}>
        <button onClick={() => setShowJOTable(v => !v)} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}>
          <span style={{ color: '#7A1828', fontSize: '0.75rem' }}>{showJOTable ? '▼' : '▶'}</span>
          <div style={{ color: '#666', fontWeight: 700, fontSize: '0.8rem', flex: 1 }}>Job Orders Received{isToday ? ' Today' : ''} ({jobOrders.length})</div>
        </button>
        {showJOTable && (
          jobOrders.length === 0 ? (
            <div style={{ padding: '0 1rem 1rem', color: '#aaa', fontSize: '0.8rem' }}>No job orders received{isToday ? ' today' : ' on this day'}.</div>
          ) : (
            <div style={{ overflowX: 'auto', padding: '0 1rem 1rem', borderTop: '1px dashed #EDE0CC' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', minWidth: 640, marginTop: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#3a3a3a' }}>
                    <th style={th}>JO ID</th>
                    <th style={th}>Client</th>
                    <th style={th}>Items</th>
                    <th style={th}>Received By</th>
                    <th style={th}>Status</th>
                    <th style={{ ...th, textAlign: 'right' }}>Grand Total</th>
                    <th style={{ ...th, textAlign: 'right' }}>Balance Due</th>
                  </tr>
                </thead>
                <tbody>
                  {jobOrders.map((jo, i) => {
                    const clientName = jo.clients?.client_name || jo.clients?.company_name || jo.client_id || '—'
                    const itemsSummary = (jo.job_order_items || [])
                      .map((it: any) => it.subcategories?.subcategory_name ? `${it.subcategories.subcategory_name}${it.quantity > 1 ? ` ×${it.quantity}` : ''}` : null)
                      .filter(Boolean)
                      .join(', ') || '—'
                    const hasBalance = (jo.balance_due || 0) > 0
                    return (
                      <tr key={jo.job_order_id} style={{ borderBottom: '1px solid #EDE0CC', background: i % 2 === 0 ? '#FDF5EC' : '#faf0e0' }}>
                        <td style={{ ...td, color: '#1a1a1a' }}>{jo.job_order_id}</td>
                        <td style={{ ...td, color: '#1a1a1a', fontWeight: 600 }}>{clientName}</td>
                        <td style={{ ...td, color: '#666' }}>{itemsSummary}</td>
                        <td style={{ ...td, color: '#666' }}>{jo.received_by || '—'}</td>
                        <td style={{ ...td, color: '#7A1828' }}>{jo.payment_status}</td>
                        <td style={{ ...td, textAlign: 'right', fontWeight: 700, color: '#1a1a1a' }}>{formatPeso(jo.grand_total || 0)}</td>
                        <td style={{ ...td, textAlign: 'right', fontWeight: 600 }} className={hasBalance ? 'money-red' : 'money-green'}>{formatPeso(jo.balance_due || 0)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Cash Reconciliation */}
      <div style={{ background: '#FDF5EC', borderRadius: 10, padding: '1rem', marginBottom: '1.25rem', border: '1px solid #EDE0CC' }}>
        <div style={{ color: '#666', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.85rem' }}>Cash Reconciliation</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: '0.85rem' }}>
          <div>
            <label className="pf-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              Initial Fund
              {isAdmin && (
                <button onClick={() => { setOverridingFund(v => !v); setFundOverride(String(inheritedFund)) }} style={{ background: 'none', border: 'none', color: '#7A1828', cursor: 'pointer', padding: 0, display: 'inline-flex' }} title="Override inherited amount">
                  <IconEdit style={{ width: 12, height: 12 }} />
                </button>
              )}
            </label>
            {overridingFund ? (
              <input type="number" value={fundOverride} onChange={e => setFundOverride(e.target.value)} className="pf-input" />
            ) : (
              <div className="money" style={{ fontWeight: 700, padding: '0.4rem 0' }}>{formatPeso(initialFund)}</div>
            )}
          </div>
          <div>
            <label className="pf-label">Expected Cash On Hand</label>
            <div className="money" style={{ fontWeight: 700, padding: '0.4rem 0' }}>{formatPeso(expectedCashOnHand)}</div>
          </div>
          <div>
            <label className="pf-label">Cash On Hand</label>
            <input type="number" value={cashOnHand} onChange={e => setCashOnHand(e.target.value)} placeholder="0.00" className="pf-input" />
          </div>
          <div>
            <label className="pf-label">Remitted Cash</label>
            <input type="number" value={remittedCash} onChange={e => setRemittedCash(e.target.value)} placeholder="0.00" className="pf-input" />
          </div>
          <div>
            <label className="pf-label">{excessDeficit === 0 ? 'Balance' : excessDeficit > 0 ? 'Excess' : 'Deficit'}</label>
            <div className={excessDeficit === 0 ? 'money' : excessDeficit > 0 ? 'money-green' : 'money-red'} style={{ fontWeight: 700, padding: '0.4rem 0' }}>{formatPeso(excessDeficit)}</div>
            <div style={{ color: '#999', fontSize: '0.68rem' }}>
              {excessDeficit === 0 ? 'Cash on hand matches what was expected.' : excessDeficit > 0 ? 'More cash than expected — check for an unrecorded job order.' : 'Less cash than expected — a shortfall.'}
            </div>
          </div>
          <div>
            <label className="pf-label">Next Day Fund</label>
            <div className="money" style={{ fontWeight: 700, padding: '0.4rem 0' }}>{formatPeso(nextDayFund)}</div>
            <div style={{ color: '#999', fontSize: '0.68rem' }}>Becomes tomorrow's Initial Fund.</div>
          </div>
        </div>
        {summaryError && <div style={{ color: '#e74c3c', fontSize: '0.8rem', marginBottom: '0.5rem' }}>{summaryError}</div>}
        <button onClick={saveSummary} disabled={saving} className="pf-btn">
          <IconCheck />{saving ? 'Saving…' : 'Save Summary'}
        </button>
      </div>

      {/* Breakdown by payment method */}
      {Object.keys(byMethod).length > 0 && (
        <div style={{ background: '#FDF5EC', borderRadius: 10, padding: '1rem', marginBottom: '1.25rem', border: '1px solid #EDE0CC' }}>
          <div style={{ color: '#666', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.75rem' }}>Collections by Method</div>
          {PAY_METHODS.filter(m => byMethod[m]).map(method => (
            <div key={method} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.82rem' }}>
              <span style={{ color: '#ccc' }}>{method}</span>
              <span style={{ color: '#1a1a1a', fontWeight: 600 }}>{formatPeso(byMethod[method])}</span>
            </div>
          ))}
        </div>
      )}

      {/* Payment log */}
      {payments.length > 0 && (
        <div style={{ background: '#FDF5EC', borderRadius: 10, padding: '1rem', marginBottom: '1.25rem', border: '1px solid #EDE0CC' }}>
          <div style={{ color: '#666', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.75rem' }}>Payment Log ({payments.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {payments.map(p => {
              const clientName = p.job_orders?.clients?.client_name || p.job_orders?.clients?.company_name || p.job_order_id
              return (
                <div key={p.payment_id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', padding: '0.4rem 0', borderBottom: '1px solid #e5e5e5' }}>
                  <div>
                    <span style={{ color: '#1a1a1a' }}>{clientName}</span>
                    <span style={{ color: '#666', marginLeft: 8 }}>{p.payment_method}</span>
                  </div>
                  <span style={{ color: '#2ecc71', fontWeight: 700 }}>{formatPeso(p.amount)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Expenses */}
      <div style={{ background: '#FDF5EC', borderRadius: 10, padding: '1rem', marginBottom: '1.25rem', border: '1px solid #EDE0CC' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ color: '#666', fontWeight: 700, fontSize: '0.8rem' }}>Expenses</div>
          <button onClick={() => { setExpError(''); setShowExpenseForm(v => !v) }} title="Add expense" className="pf-btn" style={{ padding: '0.4rem', fontSize: '0.75rem' }}><IconPlus /></button>
        </div>

        {showExpenseForm && (
          <div style={{ background: '#FDF5EC', borderRadius: 8, padding: '0.85rem', marginBottom: '0.75rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 2 }}>
                <label className="pf-label">Description</label>
                <input type="text" value={expDesc} onChange={e => setExpDesc(e.target.value)} placeholder="e.g. Ink cartridge" className="pf-input" />
              </div>
              <div style={{ flex: 1 }}>
                <label className="pf-label">Amount (₱)</label>
                <input type="number" value={expAmount} onChange={e => setExpAmount(e.target.value)} placeholder="0.00" className="pf-input" />
              </div>
            </div>
            <div>
              <label className="pf-label">Category</label>
              <select value={expCategory} onChange={e => setExpCategory(e.target.value)} className="pf-select">
                {['Operations','Supplies','Utilities','Transport','Miscellaneous'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            {expError && <div style={{ color: '#e74c3c', fontSize: '0.78rem' }}>{expError}</div>}

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setExpError(''); setShowExpenseForm(false) }} className="pf-btn" style={{ flex: 1 }}><IconX />Cancel</button>
              <button onClick={addExpense} disabled={savingExp} className="pf-btn" style={{ flex: 2 }}>
                <IconCheck />{savingExp ? '…' : 'Save Expense'}
              </button>
            </div>
          </div>
        )}

        {expenses.length === 0 ? (
          <div style={{ color: '#aaa', fontSize: '0.8rem' }}>No expenses recorded{isToday ? ' today' : ' for this day'}.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {expenses.map(e => (
              <ExpenseRow
                key={e.expense_id}
                expense={e}
                canManage={canManageExpenses}
                locked={false}
                onSave={saveExpenseEdit}
                onDelete={deleteExpense}
              />
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 6, fontWeight: 700, fontSize: '0.82rem' }}>
              <span style={{ color: '#666' }}>Total Expenses</span>
              <span style={{ color: '#e74c3c' }}>{formatPeso(totalExpenses)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Remark */}
      <div style={{ background: '#FDF5EC', borderRadius: 10, padding: '1rem', marginBottom: '1.25rem', border: '1px solid #EDE0CC' }}>
        <div style={{ color: '#666', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.6rem' }}>Remark</div>
        <textarea
          value={remark}
          onChange={e => setRemark(e.target.value)}
          rows={3}
          placeholder="Notes for the day, reminders, reconciliation notes..."
          className="pf-textarea"
        />
        <div style={{ color: '#999', fontSize: '0.7rem', marginTop: 6 }}>Saved together with "Save Summary" above.</div>
      </div>

      {/* Search / filter */}
      <div style={{ background: '#FDF5EC', borderRadius: 10, padding: '1rem', marginBottom: '1.25rem', border: '1px solid #EDE0CC' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: '0.75rem' }}>
          <div style={{ color: '#666', fontWeight: 700, fontSize: '0.8rem' }}>Search Sales Summary</div>
          {isAdmin && (
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => lockAllHistorical(false)} disabled={bulkLocking} className="pf-btn pf-btn-secondary" style={{ fontSize: '0.72rem', padding: '0.3rem 0.65rem' }}>
                🔓 Unlock All Past Days
              </button>
              <button onClick={() => lockAllHistorical(true)} disabled={bulkLocking} className="pf-btn pf-btn-secondary" style={{ fontSize: '0.72rem', padding: '0.3rem 0.65rem' }}>
                🔒 Lock All Past Days
              </button>
            </div>
          )}
        </div>
        <div style={{ color: '#999', fontSize: '0.7rem', marginTop: -6, marginBottom: '0.65rem' }}>
          While correcting migrated records, past days stay editable — lock them all once every day from January to present has been reviewed.
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '0.65rem' }}>
          <input
            type="date"
            value={searchDate}
            max={today}
            onChange={e => setSearchDate(e.target.value)}
            className="pf-input"
            style={{ flex: 1, minWidth: 160 }}
          />
          <button onClick={searchByDate} disabled={!searchDate || searching} className="pf-btn">
            {searching ? 'Searching…' : 'Search Date'}
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ color: '#999', fontSize: '0.72rem' }}>Or filter every recorded day by:</span>
          <button onClick={() => filterByType('deficit')} disabled={filtering} className={filterType === 'deficit' ? 'pf-btn' : 'pf-btn pf-btn-secondary'} style={{ fontSize: '0.75rem', padding: '0.35rem 0.7rem' }}>
            {filtering && filterType === 'deficit' ? '…' : 'Deficits'}
          </button>
          <button onClick={() => filterByType('excess')} disabled={filtering} className={filterType === 'excess' ? 'pf-btn' : 'pf-btn pf-btn-secondary'} style={{ fontSize: '0.75rem', padding: '0.35rem 0.7rem' }}>
            {filtering && filterType === 'excess' ? '…' : 'Excess'}
          </button>
          {(searchResult !== null || searchDate || filterType !== 'all') && (
            <button onClick={clearSearch} className="pf-btn pf-btn-secondary" style={{ fontSize: '0.75rem', padding: '0.35rem 0.7rem' }}><IconX />Clear</button>
          )}
        </div>

        {searchResult === 'not_found' && (
          <div style={{ color: '#e67e22', fontSize: '0.8rem', marginTop: '0.85rem' }}>
            No sales summary recorded for {new Date(searchDate + 'T00:00:00').toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}.
          </div>
        )}
        {searchResult && searchResult !== 'not_found' && (
          <div style={{ marginTop: '0.85rem' }}>
            <HistoryRow row={searchResult} currentUser={currentUser} />
          </div>
        )}

        {filterType !== 'all' && filterResults && (
          <div style={{ marginTop: '0.85rem' }}>
            <div style={{ color: '#666', fontSize: '0.75rem', marginBottom: 8 }}>
              {filterResults.length} day(s) with {filterType === 'deficit' ? 'a deficit' : 'an excess'}
            </div>
            {filterResults.length === 0 ? (
              <div style={{ color: '#aaa', fontSize: '0.8rem' }}>None found.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filterResults.map(row => <HistoryRow key={row.summary_id} row={row} currentUser={currentUser} />)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent Days history */}
      {!searchResult && filterType === 'all' && recentDays.length > 0 && (
        <div>
          <div style={{ color: '#7A1828', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.6rem' }}>Recent Days</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentPageItems.map(row => (
              <HistoryRow key={row.summary_id} row={row} currentUser={currentUser} />
            ))}
          </div>
          <Pagination page={recentCurrentPage} totalItems={recentDays.length} pageSize={PAGE_SIZE} onPageChange={setRecentPage} />
        </div>
      )}
    </div>
  )
}

const th: React.CSSProperties = { padding: '0.5rem 0.7rem', textAlign: 'left', color: '#ccc', fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.03em' }
const td: React.CSSProperties = { padding: '0.5rem 0.7rem', verticalAlign: 'top' }
