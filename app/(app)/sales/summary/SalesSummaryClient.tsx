'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { formatPeso } from '@/lib/jo-helpers'
import type { AppUser } from '@/lib/user'

interface Props {
  payments: any[]
  expenses: any[]
  summary: any
  joCount: number
  today: string
  currentUser: AppUser
}

const PAY_METHODS = ['Cash', 'G-Cash', 'Maya', 'Bank Transfer via BPI Acct.', 'Bank Transfer via BDO Acct.', 'Cheque']

export default function SalesSummaryClient({ payments, expenses: initExpenses, summary, joCount, today, currentUser }: Props) {
  const router = useRouter()
  const [expenses, setExpenses] = useState(initExpenses)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [expDesc, setExpDesc] = useState('')
  const [expAmount, setExpAmount] = useState('')
  const [expCategory, setExpCategory] = useState('Operations')
  const [remark, setRemark] = useState(summary?.remark || '')
  const [savingRemark, setSavingRemark] = useState(false)
  const [savingExp, setSavingExp] = useState(false)

  // Totals by method
  const byMethod: Record<string, number> = {}
  for (const p of payments) {
    byMethod[p.payment_method] = (byMethod[p.payment_method] || 0) + (p.amount || 0)
  }
  const totalCash = byMethod['Cash'] || 0
  const totalOnline = Object.entries(byMethod).filter(([k]) => k !== 'Cash').reduce((s, [, v]) => s + v, 0)
  const totalCollections = payments.reduce((s, p) => s + (p.amount || 0), 0)
  const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0)
  const netCash = totalCash - totalExpenses
  const expCash = summary?.exp_cash || 0

  async function saveRemark() {
    setSavingRemark(true)
    const supabase = createSupabaseBrowserClient()
    await supabase.from('daily_sales_summary').upsert({
      summary_date: today,
      remark,
      total_collections: totalCollections,
      total_expenses: totalExpenses,
      net_cash: netCash,
    }, { onConflict: 'summary_date' })
    setSavingRemark(false)
    router.refresh()
  }

  async function addExpense() {
    if (!expDesc || !expAmount) return
    setSavingExp(true)
    const supabase = createSupabaseBrowserClient()
    const { data } = await supabase.from('expenses').insert({
      expense_date: today,
      date: today,
      expense_name: expDesc,
      description: expDesc,
      amount: parseFloat(expAmount),
      category: expCategory,
      recorded_by: currentUser.name,
    }).select().single()
    if (data) setExpenses(prev => [...prev, data])
    setExpDesc('')
    setExpAmount('')
    setShowExpenseForm(false)
    setSavingExp(false)
    router.refresh()
  }

  async function deleteExpense(expenseId: string) {
    const supabase = createSupabaseBrowserClient()
    await supabase.from('expenses').delete().eq('expense_id', expenseId)
    setExpenses(prev => prev.filter(e => e.expense_id !== expenseId))
  }

  const dateLabel = new Date(today + 'T00:00:00').toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ color: '#7A1828', fontSize: '1.4rem', fontWeight: 700 }}>Daily Sales Summary</h1>
        <p style={{ color: '#777', fontSize: '0.8rem', marginTop: 2 }}>{dateLabel}</p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: '1.25rem' }}>
        {[
          { label: "Today's Received JOs", value: joCount, unit: 'JOs' },
          { label: 'Total Collections', value: formatPeso(totalCollections) },
          { label: 'Cash Collections', value: formatPeso(totalCash) },
          { label: 'Online / Non-Cash', value: formatPeso(totalOnline) },
          { label: 'Total Expenses (EXPCASH)', value: formatPeso(totalExpenses), warn: totalExpenses > 0 },
          { label: 'Net Cash', value: formatPeso(netCash), good: netCash >= 0 },
        ].map(card => (
          <div key={card.label} style={{ background: '#FDF5EC', borderRadius: 10, padding: '0.75rem 1rem', border: '1px solid #EDE0CC' }}>
            <div style={{ color: '#999', fontSize: '0.7rem', marginBottom: 4 }}>{card.label}</div>
            <div style={{ color: card.warn ? '#e74c3c' : card.good !== undefined ? (card.good ? '#27ae60' : '#e74c3c') : '#333', fontWeight: 700, fontSize: '1rem' }}>
              {card.unit ? `${card.value} ${card.unit}` : card.value}
            </div>
          </div>
        ))}
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
          <div style={{ color: '#666', fontWeight: 700, fontSize: '0.8rem' }}>Expenses (EXPCASH)</div>
          <button onClick={() => setShowExpenseForm(v => !v)} style={{ background: '#7A1828', color: '#fff', border: '2px solid #C9A84C', borderRadius: 999, padding: '0.3rem 0.7rem', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 700 }}>+ Add</button>
        </div>

        {showExpenseForm && (
          <div style={{ background: '#FDF5EC', borderRadius: 8, padding: '0.85rem', marginBottom: '0.75rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 2 }}>
                <label style={lbl}>Description</label>
                <input type="text" value={expDesc} onChange={e => setExpDesc(e.target.value)} placeholder="e.g. Ink cartridge" style={inp} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={lbl}>Amount (₱)</label>
                <input type="number" value={expAmount} onChange={e => setExpAmount(e.target.value)} placeholder="0.00" style={inp} />
              </div>
            </div>
            <div>
              <label style={lbl}>Category</label>
              <select value={expCategory} onChange={e => setExpCategory(e.target.value)} style={inp}>
                {['Operations','Supplies','Utilities','Transport','Miscellaneous'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowExpenseForm(false)} style={{ flex: 1, background: '#f0f0f0', color: '#1a1a1a', border: 'none', borderRadius: 7, padding: '0.5rem', cursor: 'pointer' }}>Cancel</button>
              <button onClick={addExpense} disabled={savingExp} style={{ flex: 2, background: '#7A1828', color: '#fff', border: '2px solid #C9A84C', borderRadius: 999, padding: '0.5rem', fontWeight: 700, cursor: 'pointer' }}>
                {savingExp ? '…' : 'Save Expense'}
              </button>
            </div>
          </div>
        )}

        {expenses.length === 0 ? (
          <div style={{ color: '#aaa', fontSize: '0.8rem' }}>No expenses recorded today.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {expenses.map(e => (
              <div key={e.expense_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', padding: '0.4rem 0', borderBottom: '1px solid #e5e5e5' }}>
                <div>
                  <span style={{ color: '#1a1a1a' }}>{e.description || e.expense_name}</span>
                  <span style={{ color: '#666', marginLeft: 8 }}>{e.category}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: '#e74c3c', fontWeight: 700 }}>{formatPeso(e.amount)}</span>
                  {currentUser.role === 'Admin' && (
                    <button onClick={() => deleteExpense(e.expense_id)} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '0.8rem' }}>✕</button>
                  )}
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 6, fontWeight: 700, fontSize: '0.82rem' }}>
              <span style={{ color: '#666' }}>Total Expenses</span>
              <span style={{ color: '#e74c3c' }}>{formatPeso(totalExpenses)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Remark */}
      <div style={{ background: '#FDF5EC', borderRadius: 10, padding: '1rem', border: '1px solid #EDE0CC' }}>
        <div style={{ color: '#666', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.6rem' }}>Remark (REM)</div>
        <textarea
          value={remark}
          onChange={e => setRemark(e.target.value)}
          rows={3}
          placeholder="Notes for the day, reminders, reconciliation notes..."
          style={{ ...inp, resize: 'vertical', marginBottom: 8 }}
        />
        <button onClick={saveRemark} disabled={savingRemark} style={{ background: '#7A1828', color: '#fff', border: '2px solid #C9A84C', borderRadius: 999, padding: '0.5rem 1rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem' }}>
          {savingRemark ? 'Saving…' : 'Save Remark'}
        </button>
      </div>
    </div>
  )
}

const lbl: React.CSSProperties = { display: 'block', color: '#999', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }
const inp: React.CSSProperties = { width: '100%', background: '#FDF5EC', border: '1.5px solid #d0d0d0', borderRadius: 7, padding: '0.5rem 0.7rem', color: '#1a1a1a', fontSize: '0.82rem', boxSizing: 'border-box', outline: 'none' }
