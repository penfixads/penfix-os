'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { formatPeso } from '@/lib/jo-helpers'
import { IconX } from '@/components/icons'

interface Props {
  clientId: string
  clientName: string
  onClose: () => void
}

// A running "here's everything you still owe" statement for a client — every job order with
// an open balance, not just one, with each JO's own line items listed underneath it — so
// Treasury doesn't have to send separate per-JO receipts for a client with many orders, or
// one that's billed periodically instead of per order.
export default function BillingStatementModal({ clientId, clientName, onClose }: Props) {
  const [jobs, setJobs] = useState<any[]>([])
  const [itemsByJO, setItemsByJO] = useState<Record<string, any[]>>({})
  const [publicToken, setPublicToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    Promise.all([
      supabase.from('job_orders').select('job_order_id, date_time_received, grand_total, total_amount_paid, balance_due, payment_status')
        .eq('client_id', clientId).gt('balance_due', 0).order('date_time_received', { ascending: false }),
      supabase.from('clients').select('public_token').eq('client_id', clientId).single(),
    ]).then(async ([{ data: jobsData, error: jobsErr }, { data: clientRow, error: clientErr }]) => {
      if (jobsErr) console.error('Billing statement jobs query failed:', jobsErr.message)
      if (clientErr) console.error('Billing statement client query failed:', clientErr.message)
      setJobs(jobsData || [])
      setPublicToken(clientRow?.public_token || null)

      const jobIds = (jobsData || []).map(j => j.job_order_id)
      if (jobIds.length > 0) {
        const { data: items, error: itemsErr } = await supabase
          .from('job_order_items')
          .select('item_id, job_order_id, computed_line_total, job_status, quantity, subcategories(subcategory_name)')
          .in('job_order_id', jobIds)
          .order('item_id')
        if (itemsErr) console.error('Billing statement items query failed:', itemsErr.message)
        const grouped: Record<string, any[]> = {}
        for (const it of items || []) {
          if (!grouped[it.job_order_id]) grouped[it.job_order_id] = []
          grouped[it.job_order_id].push(it)
        }
        setItemsByJO(grouped)
      }
      setLoading(false)
    })
  }, [clientId])

  function copyLink() {
    if (!publicToken) return
    const url = `${window.location.origin}/billing/${publicToken}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const totalGrand = jobs.reduce((s, j) => s + (j.grand_total || 0), 0)
  const totalPaid = jobs.reduce((s, j) => s + (j.total_amount_paid || 0), 0)
  const totalBalance = jobs.reduce((s, j) => s + (j.balance_due || 0), 0)

  return (
    <div className="pf-modal-overlay" style={{ background: 'rgba(0,0,0,0.7)', alignItems: 'flex-start' }}>
      <div className="pf-modal-card pf-modal-wine" style={{ maxWidth: 480, marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
          <div>
            <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700 }}>Billing Statement</h2>
            <div style={{ color: '#E8B9C6', fontSize: '0.78rem', marginTop: 2 }}>{clientName}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#E8B9C6', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
        </div>

        {loading ? (
          <div style={{ color: '#E8B9C6', textAlign: 'center', padding: '2rem' }}>Loading…</div>
        ) : jobs.length === 0 ? (
          <div style={{ color: '#E8B9C6', textAlign: 'center', padding: '2rem', fontSize: '0.85rem' }}>
            No open balance — every job order is fully settled. ✓
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
            {jobs.map(jo => {
              const items = itemsByJO[jo.job_order_id] || []
              return (
                <div key={jo.job_order_id} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '0.6rem 0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.82rem' }}>{jo.job_order_id}</div>
                      <div style={{ color: '#E8B9C6', fontSize: '0.7rem', marginTop: 1 }}>
                        {new Date(jo.date_time_received).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.82rem' }}>{formatPeso(jo.grand_total || 0)}</div>
                      <div style={{ color: '#e74c3c', fontSize: '0.7rem' }}>Bal: {formatPeso(jo.balance_due || 0)}</div>
                    </div>
                  </div>
                  {items.length > 0 && (
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.15)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {items.map(it => (
                        <div key={it.item_id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                          <span style={{ color: '#ccc' }}>{it.subcategories?.subcategory_name || it.item_id} {it.quantity > 1 ? `× ${it.quantity}` : ''} <span style={{ color: '#999' }}>({it.job_status})</span></span>
                          <span style={{ color: '#ddd' }}>{formatPeso(it.computed_line_total || 0)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div className="pf-totals-box">
          {[
            { label: 'Total (all open JOs)', value: formatPeso(totalGrand) },
            { label: 'Total Paid', value: formatPeso(totalPaid) },
            { label: 'Total Balance Due', value: formatPeso(totalBalance) },
          ].map((row, i) => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: i > 0 ? 4 : 0 }}>
              <span style={{ color: '#000', fontSize: row.label === 'Total Balance Due' ? '0.82rem' : '0.75rem', fontWeight: row.label === 'Total Balance Due' ? 700 : 400 }}>{row.label}</span>
              <span style={{ color: row.label === 'Total Balance Due' ? '#400016' : '#000', fontWeight: 700, fontSize: row.label === 'Total Balance Due' ? '1rem' : '0.8rem' }}>{row.value}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button onClick={onClose} className="pf-btn pf-btn-secondary"><IconX />Close</button>
          <button onClick={copyLink} disabled={!publicToken} className="pf-btn">
            {copied ? 'Copied!' : 'Copy Billing Link'}
          </button>
        </div>
      </div>
    </div>
  )
}
