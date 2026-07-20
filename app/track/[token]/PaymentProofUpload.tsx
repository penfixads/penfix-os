'use client'

import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { compressImageToDataUrl } from '@/lib/image-compress'
import { formatPeso } from '@/lib/jo-helpers'
import { IconSend, IconCheck } from '@/components/icons'

// Payment proofs need to stay legible (reference numbers, amounts) when staff review them in
// /jos/payment-proofs, so this budget is well above the ~20KB item-preview default.
const MAX_PROOF_BYTES = 250 * 1024
const MAX_PROOF_DIM = 1600

const METHODS = ['G-Cash', 'Maya', 'Bank Transfer via BPI Acct.', 'Bank Transfer via BDO Acct.']

interface Props {
  jobOrderId: string
  balanceDue: number
}

export default function PaymentProofUpload({ jobOrderId, balanceDue }: Props) {
  const [amount, setAmount] = useState(String(balanceDue > 0 ? balanceDue : ''))
  const [method, setMethod] = useState(METHODS[0])
  const [note, setNote] = useState('')
  const [preview, setPreview] = useState('')
  const [compressing, setCompressing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(file: File | null) {
    if (!file) return
    setError('')
    setCompressing(true)
    try {
      const { dataUrl } = await compressImageToDataUrl(file, MAX_PROOF_BYTES, MAX_PROOF_DIM)
      setPreview(dataUrl)
    } catch (e: any) {
      setError(e.message || 'Failed to process image.')
    } finally {
      setCompressing(false)
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const item = Array.from(e.clipboardData.items).find(i => i.type.startsWith('image/'))
    if (!item) return
    e.preventDefault()
    handleFile(item.getAsFile())
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amt = parseFloat(amount) || 0
    if (amt <= 0) { setError('Please enter the amount you paid.'); return }
    if (!preview) { setError('Please attach a screenshot of your payment.'); return }
    setError('')
    setSubmitting(true)
    try {
      const supabase = createSupabaseBrowserClient()
      const { error: dbError } = await supabase.from('payment_proofs').insert({
        job_order_id: jobOrderId,
        claimed_amount: amt,
        payment_method: method,
        proof_image: preview,
        client_note: note || null,
      })
      if (dbError) { setError(dbError.message); return }
      setSubmitted(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div style={{ background: '#FDF5EC', borderRadius: 14, padding: '1.25rem', marginTop: '1rem', border: '1px solid #EDE0CC', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', textAlign: 'center' }}>
        <div style={{ background: '#7A1828', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', color: '#F5C842' }}>
          <IconCheck />
        </div>
        <div style={{ color: '#7A1828', fontWeight: 700, fontSize: '0.95rem' }}>Payment proof received</div>
        <div style={{ color: '#777', fontSize: '0.78rem', marginTop: 4 }}>Our team will confirm it shortly and update your balance.</div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ background: '#FDF5EC', borderRadius: 14, padding: '1.25rem', marginTop: '1rem', border: '1px solid #EDE0CC', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
      <div style={{ color: '#7A1828', fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>Pay via E-Wallet / Bank Transfer</div>
      <div style={{ color: '#999', fontSize: '0.72rem', marginBottom: '0.9rem' }}>Upload a screenshot of your payment and we&apos;ll confirm it.</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
        <div>
          <label style={{ display: 'block', color: '#777', fontSize: '0.72rem', marginBottom: 4 }}>Amount Paid (₱)</label>
          <input
            type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', padding: '0.5rem 0.6rem', borderRadius: 8, border: '1px solid #EDE0CC', fontSize: '0.85rem' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', color: '#777', fontSize: '0.72rem', marginBottom: 4 }}>Method</label>
          <select
            value={method} onChange={e => setMethod(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', padding: '0.5rem 0.6rem', borderRadius: 8, border: '1px solid #EDE0CC', fontSize: '0.85rem', background: '#fff' }}
          >
            {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '0.85rem' }}>
        <label style={{ display: 'block', color: '#777', fontSize: '0.72rem', marginBottom: 4 }}>Payment Screenshot</label>
        {preview ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img src={preview} alt="Payment proof" style={{ width: 72, height: 72, objectFit: 'contain', borderRadius: 8, border: '1px solid #EDE0CC', background: '#fff' }} />
            <label style={{ color: '#7A1828', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
              Replace image
              <input type="file" accept="image/*" onChange={e => handleFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
            </label>
          </div>
        ) : (
          <div onPaste={handlePaste} tabIndex={0} style={{ border: '1.5px dashed #EDE0CC', borderRadius: 8, padding: '0.6rem 0.75rem', outline: 'none' }}>
            <input type="file" accept="image/*" onChange={e => handleFile(e.target.files?.[0] || null)} style={{ fontSize: '0.8rem', width: '100%' }} />
            <div style={{ color: '#aaa', fontSize: '0.68rem', marginTop: 6 }}>...or click here and paste (Ctrl+V) a screenshot</div>
          </div>
        )}
        {compressing && <div style={{ color: '#999', fontSize: '0.72rem', marginTop: 4 }}>Processing image…</div>}
      </div>

      <div style={{ marginBottom: '0.85rem' }}>
        <label style={{ display: 'block', color: '#777', fontSize: '0.72rem', marginBottom: 4 }}>Note (optional)</label>
        <input
          type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. reference number"
          style={{ width: '100%', boxSizing: 'border-box', padding: '0.5rem 0.6rem', borderRadius: 8, border: '1px solid #EDE0CC', fontSize: '0.85rem' }}
        />
      </div>

      {error && <p style={{ color: '#c0392b', fontSize: '0.78rem', marginBottom: '0.75rem' }}>{error}</p>}

      <button
        type="submit" disabled={submitting || compressing}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '0.7rem', borderRadius: 10, border: 'none', background: '#7A1828', color: '#fff',
          fontSize: '0.85rem', fontWeight: 700, cursor: submitting || compressing ? 'default' : 'pointer',
          opacity: submitting || compressing ? 0.7 : 1,
        }}
      >
        <IconSend />{submitting ? 'Submitting…' : 'Submit Payment Proof'}
      </button>
    </form>
  )
}
