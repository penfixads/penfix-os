'use client'

import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { generatePaymentId, formatPeso, getPhilippineDateStr } from '@/lib/jo-helpers'
import { IconCheck, IconX, IconImage } from '@/components/icons'
import type { AppUser } from '@/lib/user'

interface Proof {
  proof_id: string
  job_order_id: string
  claimed_amount: number
  payment_method: string
  proof_image: string
  client_note: string | null
  created_at: string
  job_orders: {
    client_id: string
    grand_total: number
    total_amount_paid: number
    balance_due: number
    payment_status: string
    is_for_billing: boolean
    clients: { client_name: string; company_name: string | null } | null
  } | null
}

interface Props {
  initialProofs: Proof[]
  currentUser: AppUser
}

// Mirrors components/EditJOModal.tsx's payment_status derivation — kept as a small inline
// formula here rather than a shared helper since this is the only other place that posts a
// payment, and pulling EditJOModal in directly would drag along its unrelated item-editing
// (categories/subcategories) machinery just to record one payment.
function derivePaymentStatus(isForBilling: boolean, totalPaid: number, grandTotal: number): string {
  if (isForBilling) return 'For Billing'
  if (totalPaid === 0) return 'Pending Payment'
  if (totalPaid >= grandTotal) return 'Fully Paid'
  if (totalPaid >= grandTotal * 0.5) return 'Downpayment Received'
  return 'Below 50% Downpayment'
}

export default function PaymentProofsClient({ initialProofs, currentUser }: Props) {
  const [proofs, setProofs] = useState(initialProofs)
  const [amounts, setAmounts] = useState<Record<string, string>>(
    Object.fromEntries(initialProofs.map(p => [p.proof_id, String(p.claimed_amount)]))
  )
  const [remarks, setRemarks] = useState<Record<string, string>>({})
  const [working, setWorking] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [zoomed, setZoomed] = useState<string | null>(null)

  function setError(id: string, msg: string) {
    setErrors(prev => ({ ...prev, [id]: msg }))
  }

  async function handleConfirm(proof: Proof) {
    const jo = proof.job_orders
    if (!jo) { setError(proof.proof_id, 'Job order not found.'); return }
    const amount = parseFloat(amounts[proof.proof_id]) || 0
    if (amount <= 0) { setError(proof.proof_id, 'Enter a valid amount.'); return }

    setWorking(proof.proof_id)
    setError(proof.proof_id, '')
    try {
      const supabase = createSupabaseBrowserClient()
      const joId = proof.job_order_id

      const { count: existingPayCount } = await supabase
        .from('payments')
        .select('payment_id', { count: 'exact', head: true })
        .eq('job_order_id', joId)
      const paymentId = generatePaymentId(joId, (existingPayCount || 0) + 1)

      const totalPaid = (jo.total_amount_paid || 0) + amount
      const paymentStatus = derivePaymentStatus(jo.is_for_billing, totalPaid, jo.grand_total || 0)

      const { error: payErr } = await supabase.from('payments').insert({
        payment_id: paymentId,
        job_order_id: joId,
        client_id: jo.client_id,
        grand_total: jo.grand_total,
        amount,
        payment_method: proof.payment_method,
        payment_date: getPhilippineDateStr(),
        recorded_by: currentUser.name,
        remarks: `Client-uploaded e-wallet payment proof (${proof.proof_id})`,
      })
      if (payErr) throw payErr

      const { error: joErr } = await supabase.from('job_orders').update({
        total_amount_paid: totalPaid,
        payment_status: paymentStatus,
        is_fully_paid: paymentStatus === 'Fully Paid',
      }).eq('job_order_id', joId)
      if (joErr) throw joErr

      const { error: proofErr } = await supabase.from('payment_proofs').update({
        status: 'Confirmed',
        reviewed_by: currentUser.name,
        reviewed_at: new Date().toISOString(),
        linked_payment_id: paymentId,
      }).eq('proof_id', proof.proof_id)
      if (proofErr) throw proofErr

      setProofs(prev => prev.filter(p => p.proof_id !== proof.proof_id))
    } catch (e: any) {
      setError(proof.proof_id, e.message || 'Failed to confirm payment.')
    } finally {
      setWorking(null)
    }
  }

  async function handleReject(proof: Proof) {
    setWorking(proof.proof_id)
    setError(proof.proof_id, '')
    try {
      const supabase = createSupabaseBrowserClient()
      const { error } = await supabase.from('payment_proofs').update({
        status: 'Rejected',
        reviewed_by: currentUser.name,
        reviewed_at: new Date().toISOString(),
        review_remarks: remarks[proof.proof_id] || null,
      }).eq('proof_id', proof.proof_id)
      if (error) throw error
      setProofs(prev => prev.filter(p => p.proof_id !== proof.proof_id))
    } catch (e: any) {
      setError(proof.proof_id, e.message || 'Failed to reject.')
    } finally {
      setWorking(null)
    }
  }

  return (
    <div style={{ padding: '1.5rem' }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#5C001F', marginBottom: 4 }}>Payment Proofs</h1>
      <div style={{ fontSize: '0.82rem', color: '#777', marginBottom: '1.25rem' }}>
        {proofs.length} pending confirmation
      </div>

      {proofs.length === 0 ? (
        <div style={{ color: '#999', fontSize: '0.85rem', padding: '2rem', textAlign: 'center', background: '#fafafa', borderRadius: 10 }}>
          No pending payment proofs.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {proofs.map(proof => {
            const jo = proof.job_orders
            const client = jo?.clients
            const clientName = client?.client_name || client?.company_name || '—'
            const busy = working === proof.proof_id
            return (
              <div key={proof.proof_id} style={{ background: '#fff', border: '1px solid #eee', borderRadius: 10, padding: '1rem', display: 'flex', gap: '0.85rem' }}>
                <button
                  onClick={() => setZoomed(proof.proof_image)}
                  style={{ padding: 0, border: '1px solid #eee', borderRadius: 8, overflow: 'hidden', cursor: 'pointer', flexShrink: 0, width: 96, height: 96, background: '#f5f5f5' }}
                >
                  {proof.proof_image
                    ? <img src={proof.proof_image} alt="Payment proof" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <IconImage style={{ width: 24, height: 24, color: '#ccc' }} />}
                </button>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ fontWeight: 700, color: '#5C001F', fontSize: '0.85rem' }}>{proof.job_order_id}</div>
                    <div style={{ fontSize: '0.7rem', color: '#aaa' }}>{new Date(proof.created_at).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#777' }}>{clientName} · {proof.payment_method}</div>
                  {jo && (
                    <div style={{ fontSize: '0.72rem', color: '#999', marginTop: 2 }}>
                      Balance due: {formatPeso(jo.balance_due || 0)} of {formatPeso(jo.grand_total || 0)}
                    </div>
                  )}
                  {proof.client_note && (
                    <div style={{ fontSize: '0.75rem', color: '#555', marginTop: 4, fontStyle: 'italic' }}>&quot;{proof.client_note}&quot;</div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: '0.6rem' }}>
                    <span style={{ fontSize: '0.72rem', color: '#777' }}>Amount</span>
                    <input
                      type="number" min="0" step="0.01" disabled={busy}
                      value={amounts[proof.proof_id] ?? ''}
                      onChange={e => setAmounts(prev => ({ ...prev, [proof.proof_id]: e.target.value }))}
                      style={{ width: 100, padding: '0.35rem 0.5rem', borderRadius: 6, border: '1.5px solid #d0d0d0', fontSize: '0.8rem' }}
                    />
                  </div>

                  {errors[proof.proof_id] && <div style={{ color: '#c0392b', fontSize: '0.75rem', marginTop: 6 }}>{errors[proof.proof_id]}</div>}

                  <div style={{ display: 'flex', gap: 8, marginTop: '0.75rem' }}>
                    <button onClick={() => handleConfirm(proof)} disabled={busy} className="pf-btn" style={{ padding: '0.4rem 0.7rem' }}>
                      <IconCheck />{busy ? 'Working…' : 'Confirm'}
                    </button>
                    <button
                      onClick={() => { const r = remarks[proof.proof_id]; if (r === undefined) setRemarks(prev => ({ ...prev, [proof.proof_id]: '' })); else handleReject(proof) }}
                      disabled={busy} className="pf-btn pf-btn-secondary" style={{ padding: '0.4rem 0.7rem', color: '#c0392b', borderColor: '#e0b4b4' }}
                    >
                      <IconX />{remarks[proof.proof_id] !== undefined ? 'Confirm Reject' : 'Reject'}
                    </button>
                  </div>
                  {remarks[proof.proof_id] !== undefined && (
                    <input
                      type="text" placeholder="Reason (optional)" disabled={busy}
                      value={remarks[proof.proof_id]}
                      onChange={e => setRemarks(prev => ({ ...prev, [proof.proof_id]: e.target.value }))}
                      style={{ width: '100%', boxSizing: 'border-box', marginTop: 6, padding: '0.35rem 0.5rem', borderRadius: 6, border: '1.5px solid #d0d0d0', fontSize: '0.78rem' }}
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {zoomed && (
        <div onClick={() => setZoomed(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', cursor: 'zoom-out' }}>
          <img src={zoomed} alt="Payment proof" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 8 }} />
        </div>
      )}
    </div>
  )
}
