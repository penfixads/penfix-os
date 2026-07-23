'use client'

import { useState, useEffect, useRef } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { generateJobOrderId, generateItemId, generateClientId, generatePaymentId, formatPeso, getNextJOSequence, buildFeedbackUrl, getPhilippineDateStr, toLocalDateTimeInput, JO_SOURCE_CHANNELS } from '@/lib/jo-helpers'
import type { AppUser } from '@/lib/user'
import JOItemForm from '@/app/(app)/jos/today/JOItemForm'
import AddClientModal from '@/app/(app)/jos/today/AddClientModal'
import { sendTrackingEmail } from '@/app/(app)/jos/today/actions'
import { IconPlus, IconCirclePlus, IconX, IconCheck, IconKey } from '@/components/icons'

interface Props {
  clients: any[]
  categories: any[]
  subcategories: any[]
  currentUser: AppUser
  // When true, "Date Received" defaults locked to now and can only be changed to a past
  // date after an Admin unlocks it — used by Add Historical Records, not Today's Received JOs.
  allowDateOverride?: boolean
  // Set when this modal was opened by scanning a client's QR code — pre-selects that client
  // instead of making staff search for them.
  initialClientId?: string
  // Today's Received JOs requires the client to have been resolved via QR scan (or just-now
  // registration) before this modal opens at all — when true, the client field is a read-only
  // display of that resolved client instead of a free-text search, so staff can't bypass the
  // scan requirement by typing a name. Add Historical Records never sets this; it's backfilling
  // old paper records with no QR to scan.
  requireScannedClient?: boolean
  onClose: () => void
  onCreated: (newJO: any) => void
}

export default function NewJOModal({ clients: initialClients, categories, subcategories, currentUser, allowDateOverride, initialClientId, requireScannedClient, onClose, onCreated }: Props) {
  const [clients, setClients] = useState(initialClients)
  const [showAddClient, setShowAddClient] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const initialClient = initialClientId ? initialClients.find(c => c.client_id === initialClientId) : undefined
  const [selectedClientId, setSelectedClientId] = useState(initialClientId || '')
  const [clientSearch, setClientSearch] = useState(initialClient ? (initialClient.client_name || initialClient.company_name) : '')
  const [showClientDropdown, setShowClientDropdown] = useState(false)
  const [sourceChannel, setSourceChannel] = useState('')
  const [isForBilling, setIsForBilling] = useState(false)
  const [items, setItems] = useState<any[]>([])
  const [showItemForm, setShowItemForm] = useState(false)

  const [payments, setPayments] = useState<any[]>([])
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [discount, setDiscount] = useState(0)
  const [overrideReason, setOverrideReason] = useState('')

  const [payAmount, setPayAmount] = useState('')
  const [payMethod, setPayMethod] = useState('Cash')
  const [payMethodOther, setPayMethodOther] = useState('')
  const [payCashback, setPayCashback] = useState(0)
  const [payDate, setPayDate] = useState(getPhilippineDateStr())

  // Date Received override (historical records only). Once an Admin approves an unlock
  // request, it's remembered in sessionStorage (keyed per logged-in user) so the rest of
  // this browser session's "Add Historical Job Order" clicks skip asking again — without
  // this, every single record would need its own fresh approval, which doesn't scale when
  // backfilling a whole month of paper records in one sitting.
  // TEMPORARILY DISABLED (2026-07-20): the Jan-present historical migration review is still
  // in progress, so the Admin-approval gate is just friction right now — Date Received opens
  // unlocked by default. Restore the `return typeof window === 'undefined' || ...` line below
  // once that review is confirmed done.
  const historicalUnlockKey = `pf_historical_unlock_${currentUser.email}`
  const [dateReceived, setDateReceived] = useState(() => toLocalDateTimeInput(new Date().toISOString()))
  const [dateLocked, setDateLocked] = useState(() => {
    return false
  })
  const [unlockedByName, setUnlockedByName] = useState<string | null>(() => {
    if (!allowDateOverride || typeof window === 'undefined') return null
    return sessionStorage.getItem(historicalUnlockKey)
  })
  // 'idle' | 'pending' | 'rejected' — remote-approval flow, so an Admin can approve from
  // their own phone instead of needing to type credentials into the requester's device.
  const [unlockRequestId, setUnlockRequestId] = useState<string | null>(null)
  const [unlockRequestStatus, setUnlockRequestStatus] = useState<'idle' | 'pending' | 'rejected'>('idle')

  const selectedClient = clients.find(c => c.client_id === selectedClientId)
  const [rewardsBalance, setRewardsBalance] = useState(0)

  // If the modal closes (Cancel, saved, etc.) while a request is still pending, don't leave
  // an orphaned row an Admin might approve later for a form that no longer exists.
  const pendingRequestRef = useRef<string | null>(null)
  useEffect(() => { pendingRequestRef.current = unlockRequestStatus === 'pending' ? unlockRequestId : null })
  useEffect(() => () => {
    if (pendingRequestRef.current) {
      createSupabaseBrowserClient().from('historical_unlock_requests').delete().eq('request_id', pendingRequestRef.current)
    }
  }, [])

  // Warn before a real browser navigation (tab close, refresh, typed URL) discards an
  // in-progress draft — this form only lives in local state until Save, so leaving via
  // anything other than Cancel/Save silently loses whatever was filled in.
  const hasUnsavedWork = !!selectedClientId || items.length > 0 || payments.length > 0
  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (!hasUnsavedWork) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [hasUnsavedWork])

  useEffect(() => {
    if (!selectedClientId) { setRewardsBalance(0); return }
    const supabase = createSupabaseBrowserClient()
    supabase.from('rewards_ledger').select('type, amount').eq('client_id', selectedClientId).then(({ data }) => {
      const earned = (data || []).filter(r => r.type === 'earned').reduce((s, r) => s + (r.amount || 0), 0)
      const redeemed = (data || []).filter(r => r.type === 'redeemed').reduce((s, r) => s + (r.amount || 0), 0)
      setRewardsBalance(Math.max(0, earned - redeemed))
    })
  }, [selectedClientId])

  // "For Billing" is the client's credit-line status as declared in the database —
  // not user-editable here, so staff can't flip it just to skip the override reason.
  useEffect(() => {
    setIsForBilling(!!selectedClient?.credit_line_status)
  }, [selectedClientId])

  const earnedRewards = rewardsBalance
  const grandTotal = items.reduce((s, i) => s + (i.computed_line_total || 0), 0) - discount
  const totalPaid = payments.reduce((s, p) => s + (p.amount || 0), 0)
  const cashbackDiscount = payments.reduce((s, p) => s + (p.cashback || 0), 0)
  const balanceDue = grandTotal - totalPaid - cashbackDiscount
  const paymentStatus = (() => {
    if (isForBilling) return 'For Billing'
    if (totalPaid === 0 && cashbackDiscount === 0) return 'Pending Payment'
    if (totalPaid + cashbackDiscount >= grandTotal) return 'Fully Paid'
    if ((totalPaid + cashbackDiscount) >= grandTotal * 0.5) return 'Downpayment Received'
    return 'Below 50% Downpayment'
  })()
  const needsOverride = (paymentStatus === 'Below 50% Downpayment' || paymentStatus === 'Pending Payment') && !isForBilling

  const filteredClients = clients.filter(c => {
    const q = clientSearch.toLowerCase()
    return (c.client_name || '').toLowerCase().includes(q) || (c.company_name || '').toLowerCase().includes(q)
  }).slice(0, 10)

  // Sends a request an Admin can approve from anywhere (their own phone, the Pending Approval
  // page) rather than needing to be physically present to type credentials into this device.
  async function requestUnlock() {
    const supabase = createSupabaseBrowserClient()
    const requestId = `UNLOCK-${Date.now()}`
    const { error: reqErr } = await supabase.from('historical_unlock_requests').insert({
      request_id: requestId,
      requested_by_email: currentUser.email,
      requested_by_name: currentUser.name,
      status: 'Pending',
    })
    if (reqErr) { setError(reqErr.message || 'Failed to send unlock request.'); return }
    setUnlockRequestId(requestId)
    setUnlockRequestStatus('pending')
  }

  function cancelUnlockRequest() {
    if (unlockRequestId) {
      const supabase = createSupabaseBrowserClient()
      supabase.from('historical_unlock_requests').delete().eq('request_id', unlockRequestId)
    }
    setUnlockRequestId(null)
    setUnlockRequestStatus('idle')
  }

  // Poll the request every few seconds so an Admin approving from a different device/phone
  // is picked up here without needing a manual refresh.
  useEffect(() => {
    if (!unlockRequestId || unlockRequestStatus !== 'pending') return
    const supabase = createSupabaseBrowserClient()
    const interval = setInterval(async () => {
      const { data } = await supabase.from('historical_unlock_requests').select('status, approved_by').eq('request_id', unlockRequestId).maybeSingle()
      if (!data) return
      if (data.status === 'Approved') {
        setDateLocked(false)
        setUnlockedByName(data.approved_by)
        if (typeof window !== 'undefined') sessionStorage.setItem(historicalUnlockKey, data.approved_by)
        setUnlockRequestStatus('idle')
        setUnlockRequestId(null)
      } else if (data.status === 'Rejected') {
        setUnlockRequestStatus('rejected')
        setUnlockRequestId(null)
      }
    }, 4000)
    return () => clearInterval(interval)
  }, [unlockRequestId, unlockRequestStatus])

  async function handleSave() {
    if (!selectedClientId) { setError('Please select a client.'); return }
    if (!sourceChannel) { setError('Please select how this client reached us.'); return }
    if (items.length === 0) { setError('Add at least one job order item.'); return }
    if (needsOverride && !overrideReason) { setError('Please provide a reason for the override.'); return }
    setSaving(true)
    setError('')
    try {
      const supabase = createSupabaseBrowserClient()
      const receivedAt = allowDateOverride ? new Date(dateReceived) : new Date()
      const mm = String(receivedAt.getMonth() + 1).padStart(2, '0')
      const dd = String(receivedAt.getDate()).padStart(2, '0')
      const yyyy = receivedAt.getFullYear()
      const dateStr = `${mm}${dd}${yyyy}`

      // Two staff saving a JO at the same moment can both compute the same "next"
      // sequence number from stale local state, so retry against a fresh DB read
      // on a duplicate-key conflict instead of failing the whole save.
      let joId = ''
      for (let attempt = 0; attempt < 5; attempt++) {
        const { data: existing } = await supabase.from('job_orders').select('job_order_id').like('job_order_id', `JO-${dateStr}-%`)
        const seq = getNextJOSequence((existing || []).map(j => j.job_order_id), dateStr)
        joId = generateJobOrderId(seq, receivedAt)
        const { error: joErr } = await supabase.from('job_orders').insert({
          job_order_id: joId,
          user_email: currentUser.email,
          client_id: selectedClientId,
          date_time_received: receivedAt.toISOString(),
          payment_status: paymentStatus,
          grand_total: grandTotal,
          total_amount_paid: totalPaid,
          discount,
          cashback_discount: cashbackDiscount,
          received_by: currentUser.name,
          request_override: overrideReason || null,
          override_status: needsOverride ? 'Pending' : null,
          is_for_billing: isForBilling,
          is_fully_paid: paymentStatus === 'Fully Paid',
          date_override_authorized_by: unlockedByName,
          source_channel: sourceChannel,
        })
        if (!joErr) break
        if (joErr.code !== '23505' || attempt === 4) throw joErr
      }

      // Insert items — the "Received" step is auto-logged to whoever is creating this JO
      // right now, since receiving it from the client is what they're doing by saving this
      // form at all; there's no separate action for them to click to confirm it.
      for (let i = 0; i < items.length; i++) {
        const { category_name, subcategory_name, ...item } = items[i]
        const itemId = generateItemId(joId, i + 1)
        const { error: itemErr } = await supabase.from('job_order_items').insert({
          ...item,
          item_id: itemId,
          job_order_id: joId,
        })
        if (itemErr) throw itemErr
        await supabase.from('job_order_item_status_log').insert({
          item_id: itemId,
          job_order_id: joId,
          status_name: 'Received',
          changed_by_email: currentUser.email,
          changed_by_name: currentUser.name,
          changed_by_role: currentUser.role,
        })
      }

      // Insert payments
      for (let i = 0; i < payments.length; i++) {
        const pay = payments[i]
        const payId = generatePaymentId(joId)
        const { error: payErr } = await supabase.from('payments').insert({
          payment_id: payId,
          job_order_id: joId,
          client_id: selectedClientId,
          grand_total: grandTotal,
          amount: pay.amount,
          payment_method: pay.method,
          payment_date: pay.payment_date || getPhilippineDateStr(receivedAt),
          recorded_by: currentUser.name,
          remarks: pay.remarks || null,
        })
        if (payErr) throw payErr
      }

      // Record redeemed rewards if cashback was applied
      if (cashbackDiscount > 0) {
        await supabase.from('rewards_ledger').insert({
          ledger_id: `REDM-${joId}`,
          client_id: selectedClientId,
          job_order_id: joId,
          type: 'redeemed',
          amount: cashbackDiscount,
          notes: `Cashback redeemed on JO ${joId}`,
        })
      }

      const newJO = {
        job_order_id: joId,
        clients: { client_name: selectedClient?.client_name, company_name: selectedClient?.company_name },
        job_order_items: items.map((item, i) => ({
          item_id: generateItemId(joId, i + 1),
          job_status: 'Received',
          computed_line_total: item.computed_line_total,
        })),
        grand_total: grandTotal,
        total_amount_paid: totalPaid,
        balance_due: grandTotal - totalPaid - cashbackDiscount,
        payment_status: paymentStatus,
        date_time_received: receivedAt.toISOString(),
        received_by: currentUser.name,
        is_for_billing: isForBilling,
        client_id: selectedClientId,
        rewards_balance: Math.max(0, earnedRewards - cashbackDiscount),
        date_override_authorized_by: unlockedByName,
        source_channel: sourceChannel,
      }
      onCreated(newJO)

      // Best-effort: email the client their tracking link if we have an address on file.
      // Never blocks or fails the JO save if this errors out.
      if (selectedClient?.email) {
        sendTrackingEmail(joId, selectedClient.email, selectedClient.client_name || selectedClient.company_name, window.location.origin).catch(() => {})
      }
    } catch (e: any) {
      setError(e.message || 'Failed to save job order.')
    } finally {
      setSaving(false)
    }
  }

  function addPayment() {
    const amt = parseFloat(payAmount) || 0
    if (amt <= 0) return
    const method = payMethod === 'Others' ? payMethodOther.trim() : payMethod
    if (payMethod === 'Others' && !method) return
    setPayments(prev => [...prev, { amount: amt, method, cashback: payCashback, payment_date: payDate }])
    setPayAmount('')
    setPayMethod('Cash')
    setPayMethodOther('')
    setPayCashback(0)
    setPayDate(getPhilippineDateStr())
    setShowPaymentForm(false)
  }

  return (
    <div className="pf-modal-overlay" style={{ background: 'rgba(0,0,0,0.7)', alignItems: 'flex-start' }}>
      <div className="pf-modal-card pf-modal-wine" style={{ maxWidth: 560, marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ color: '#fff', fontSize: '1.7rem', fontWeight: 700 }}>{allowDateOverride ? 'Add Historical Job Order' : 'New Job Order'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#E8B9C6', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
        </div>

        <div className="pf-field" style={{ color: '#E8B9C6', fontSize: '0.85rem' }}>
          User: <span style={{ color: '#fff', fontWeight: 600 }}>{currentUser.name}</span>
        </div>

        {allowDateOverride && (
          <div className="pf-field">
            <label className="pf-label">Date Received <span className="pf-req">*</span></label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="datetime-local"
                value={dateReceived}
                disabled={dateLocked}
                max={toLocalDateTimeInput(new Date().toISOString())}
                onChange={e => setDateReceived(e.target.value)}
                className="pf-input"
                style={{ flex: 1 }}
              />
              {dateLocked && unlockRequestStatus === 'idle' && (
                <button type="button" onClick={requestUnlock} className="pf-btn pf-btn-secondary" style={{ whiteSpace: 'nowrap' }}>
                  <IconKey />Request Unlock
                </button>
              )}
            </div>
            {dateLocked && unlockRequestStatus === 'idle' && (
              <div style={{ color: '#E8B9C6', fontSize: '0.72rem', marginTop: 4 }}>Send a request — any Admin can approve it from their own device, they don't need to be here.</div>
            )}
            {unlockRequestStatus === 'pending' && (
              <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '0.75rem 0.85rem', marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ color: '#C9A84C', fontSize: '0.78rem' }}>⏳ Waiting for an Admin to approve on the Pending Approval page…</div>
                <button type="button" onClick={cancelUnlockRequest} className="pf-btn pf-btn-secondary" style={{ whiteSpace: 'nowrap', fontSize: '0.75rem' }}><IconX />Cancel</button>
              </div>
            )}
            {unlockRequestStatus === 'rejected' && (
              <div style={{ color: '#e74c3c', fontSize: '0.75rem', marginTop: 4 }}>
                Request was rejected. <button type="button" onClick={() => setUnlockRequestStatus('idle')} className="pf-link-btn" style={{ display: 'inline', fontSize: '0.75rem' }}>Send another request</button>
              </div>
            )}
            {!dateLocked && unlockedByName && (
              <div style={{ color: '#2ecc71', fontSize: '0.72rem', marginTop: 4 }}>Unlocked by {unlockedByName} (Admin)</div>
            )}
          </div>
        )}

        <div className="pf-field">
          <label className="pf-label">Client <span className="pf-req">*</span></label>
          {requireScannedClient ? (
            <div style={{ background: '#f0f0f0', borderRadius: 8, padding: '0.6rem 0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#1a1a1a', fontSize: '0.85rem' }}>{clientSearch || selectedClientId}</div>
                <div style={{ color: '#999', fontSize: '0.72rem' }}>{selectedClientId}</div>
              </div>
              <span style={{ color: '#27ae60', fontSize: '0.72rem', fontWeight: 700 }}>✓ Scanned</span>
            </div>
          ) : (
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search client name..."
              value={clientSearch}
              onChange={e => { setClientSearch(e.target.value); setShowClientDropdown(!!e.target.value); setSelectedClientId('') }}
              className="pf-input"
            />
            {showClientDropdown && clientSearch && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, zIndex: 10, maxHeight: 220, overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                {filteredClients.length === 0 && clientSearch && (
                  <div style={{ padding: '0.6rem 0.85rem', color: '#999', fontSize: '0.85rem' }}>No clients found</div>
                )}
                {filteredClients.map(c => (
                  <div
                    key={c.client_id}
                    onClick={() => { setSelectedClientId(c.client_id); setClientSearch(c.client_name || c.company_name); setShowClientDropdown(false) }}
                    style={{ padding: '0.6rem 0.85rem', cursor: 'pointer', color: '#1a1a1a', fontSize: '0.85rem', borderBottom: '1px solid #f0f0f0' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#FDF5EC')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ fontWeight: 600 }}>
                      {c.client_name || c.company_name}
                      {c.company_name && c.client_name && (
                        <span style={{ color: '#7A1828', fontWeight: 600 }}> · {c.company_name}</span>
                      )}
                    </div>
                    <div style={{ color: '#999', fontSize: '0.72rem' }}>{c.client_id} {c.credit_line_status ? '· Credit Line' : ''}</div>
                  </div>
                ))}
                <div
                  onClick={() => { setShowClientDropdown(false); setShowAddClient(true) }}
                  style={{ padding: '0.6rem 0.85rem', cursor: 'pointer', color: '#7A1828', fontSize: '0.85rem', fontWeight: 600, borderTop: '1px solid #f0f0f0' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fdf0f0')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  + Add New Client
                </div>
              </div>
            )}
          </div>
          )}
          {selectedClientId && !selectedClient && (
            <div style={{ color: '#e74c3c', fontSize: '0.75rem', marginTop: 4 }}>
              Scanned client ({selectedClientId}) wasn&apos;t found — they may have been removed. Search for them above instead.
            </div>
          )}
          {selectedClient && (
            <div style={{ color: '#2ecc71', fontSize: '0.75rem', marginTop: 4 }}>
              Earned Rewards: {formatPeso(earnedRewards)}{selectedClient.credit_line_status ? ' · Credit Line Active' : ''}
            </div>
          )}
        </div>

        <div className="pf-field">
          <label className="pf-label">How did this client reach us? <span className="pf-req">*</span></label>
          <select value={sourceChannel} onChange={e => setSourceChannel(e.target.value)} className="pf-select">
            <option value="">-- Select --</option>
            {JO_SOURCE_CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Billing toggle — read-only, mirrors the client's credit_line_status in the database */}
        <div className="pf-field">
          <label className="pf-label">Is Client Type for Billing?</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {['N', 'Y'].map(v => (
              <button key={v} type="button" disabled title="Set by the client's credit line status. Edit the client record to change it."
                className={(v === 'Y') === isForBilling ? 'pf-btn' : 'pf-btn pf-btn-secondary'} style={{ minWidth: 56, opacity: (v === 'Y') === isForBilling ? 1 : 0.5, cursor: 'not-allowed' }}>
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Job Order Items */}
        <div className="pf-field">
          <div className="pf-group-box">
            {items.length > 0 ? (
              <div style={{ marginBottom: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {items.map((item, i) => (
                  <div key={i} style={{ background: '#f0f0f0', borderRadius: 8, padding: '0.6rem 0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ color: '#1a1a1a', fontSize: '0.8rem', fontWeight: 600 }}>{item.subcategory_name}</div>
                      <div style={{ color: '#777', fontSize: '0.72rem' }}>{item.production_specs}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: '#1a1a1a', fontSize: '0.82rem' }}>{formatPeso(item.computed_line_total)}</span>
                      <button onClick={() => { setItems(prev => prev.filter((_, j) => j !== i)) }} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '0.9rem' }}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="pf-group-empty">No job order items were added.</div>
            )}
            <div className="pf-group-box-actions">
              <button type="button" onClick={() => setShowItemForm(true)} className="pf-link-btn">
                <IconCirclePlus />Add Job Order Item <span className="pf-req">*</span>
              </button>
            </div>
          </div>
        </div>

        {/* Payments */}
        <div className="pf-field">
          <div className="pf-group-box">
            {payments.length > 0 ? (
              <div style={{ marginBottom: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {payments.map((p, i) => (
                  <div key={i} style={{ background: '#f0f0f0', borderRadius: 8, padding: '0.5rem 0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#1a1a1a', fontSize: '0.8rem' }}>{p.method} · {formatPeso(p.amount)}{p.cashback > 0 ? ` · Cashback: ${formatPeso(p.cashback)}` : ''} · <span style={{ color: '#777' }}>Paid {new Date(p.payment_date + 'T00:00:00').toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}</span></span>
                    <button onClick={() => setPayments(prev => prev.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer' }}>✕</button>
                  </div>
                ))}
              </div>
            ) : !showPaymentForm && (
              <div className="pf-group-empty">No payments were added.</div>
            )}
            {showPaymentForm ? (
              <div className="pf-payment-panel" style={{ borderRadius: 8, padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <label className="pf-label">Amount</label>
                    <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} placeholder="0.00" className="pf-input" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="pf-label">Method</label>
                    <select value={payMethod} onChange={e => setPayMethod(e.target.value)} className="pf-select">
                      {['Cash','G-Cash','Maya','Bank Transfer via BPI Acct.','Bank Transfer via BDO Acct.','Cheque','Others'].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {payMethod === 'Others' && (
                  <div>
                    <label className="pf-label">Specify Method</label>
                    <input type="text" value={payMethodOther} onChange={e => setPayMethodOther(e.target.value)} placeholder="e.g. PayMaya Padala, Barter" className="pf-input" />
                  </div>
                )}
                <div>
                  <label className="pf-label">Date Paid</label>
                  <input type="date" value={payDate} max={getPhilippineDateStr()} onChange={e => setPayDate(e.target.value)} className="pf-input" />
                </div>
                {earnedRewards > 0 && (
                  <div>
                    <label className="pf-label">Apply Cashback (Available: {formatPeso(earnedRewards)})</label>
                    <input type="number" value={payCashback} onChange={e => setPayCashback(Math.min(parseFloat(e.target.value) || 0, earnedRewards))} placeholder="0.00" className="pf-input" />
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button onClick={() => setShowPaymentForm(false)} className="pf-btn pf-btn-secondary"><IconX />Cancel</button>
                  <button onClick={addPayment} className="pf-btn"><IconPlus />Add</button>
                </div>
              </div>
            ) : (
              <div className="pf-group-box-actions">
                <button type="button" onClick={() => setShowPaymentForm(true)} className="pf-link-btn">
                  <IconCirclePlus />Add Payment
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Totals */}
        <div className="pf-totals-box">
          <div className="pf-totals-row"><span>Grand Total</span><span style={{ color: '#000', fontWeight: 700 }}>{formatPeso(grandTotal)}</span></div>
          <div className="pf-totals-row"><span>Discount</span>
            <input type="number" value={discount} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} className="pf-input" style={{ width: 100, textAlign: 'right' }} />
          </div>
          <div className="pf-totals-row"><span>Total Paid</span><span style={{ color: '#000' }}>{formatPeso(totalPaid)}</span></div>
          <div className="pf-totals-row"><span>Balance Due</span><span style={{ color: '#400016', fontWeight: 700 }}>{formatPeso(balanceDue)}</span></div>
          <div className="pf-totals-row" style={{ marginBottom: 0 }}><span>Status</span><span style={{ color: '#000', fontWeight: 600, fontSize: '0.8rem' }}>{paymentStatus}</span></div>
        </div>

        {/* Override reason */}
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
            <IconCheck />{saving ? 'Saving…' : 'Save Job Order'}
          </button>
        </div>
      </div>

      {showItemForm && (
        <JOItemForm
          categories={categories}
          subcategories={subcategories}
          onSave={(item) => { setItems(prev => [...prev, item]); setShowItemForm(false) }}
          onClose={() => setShowItemForm(false)}
        />
      )}

      {showAddClient && (
        <AddClientModal
          currentUser={currentUser}
          existingClients={clients}
          onSave={(newClient) => {
            // newClient may be an existing client the dedupe prompt matched to, not one just
            // inserted — don't add it twice to the in-memory list.
            setClients(prev => prev.some(c => c.client_id === newClient.client_id) ? prev : [...prev, newClient])
            setSelectedClientId(newClient.client_id)
            setClientSearch(newClient.client_name || newClient.company_name)
            setShowAddClient(false)
          }}
          onClose={() => setShowAddClient(false)}
        />
      )}
    </div>
  )
}
