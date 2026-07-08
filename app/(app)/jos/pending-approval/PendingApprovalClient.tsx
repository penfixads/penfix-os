'use client'

import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { formatPeso } from '@/lib/jo-helpers'
import type { AppUser } from '@/lib/user'
import Pagination from '@/components/Pagination'

const PAGE_SIZE = 10

interface Props {
  jobOrders: any[]
  creditRequests: any[]
  unlockRequests: any[]
  currentUser: AppUser
}

export default function PendingApprovalClient({ jobOrders: initialJOs, creditRequests: initialCreditRequests, unlockRequests: initialUnlockRequests, currentUser }: Props) {
  const [jos, setJos] = useState(initialJOs)
  const [creditRequests, setCreditRequests] = useState(initialCreditRequests)
  const [unlockRequests, setUnlockRequests] = useState(initialUnlockRequests)
  const [acting, setActing] = useState<string | null>(null)
  const [rejectNote, setRejectNote] = useState<Record<string, string>>({})
  const [showReject, setShowReject] = useState<string | null>(null)
  const [unlockPage, setUnlockPage] = useState(1)
  const [creditPage, setCreditPage] = useState(1)
  const [joPage, setJoPage] = useState(1)

  const isAdmin = currentUser.role === 'Admin'

  const unlockCurrentPage = Math.min(unlockPage, Math.max(1, Math.ceil(unlockRequests.length / PAGE_SIZE)))
  const unlockPageItems = unlockRequests.slice((unlockCurrentPage - 1) * PAGE_SIZE, unlockCurrentPage * PAGE_SIZE)
  const creditCurrentPage = Math.min(creditPage, Math.max(1, Math.ceil(creditRequests.length / PAGE_SIZE)))
  const creditPageItems = creditRequests.slice((creditCurrentPage - 1) * PAGE_SIZE, creditCurrentPage * PAGE_SIZE)
  const joCurrentPage = Math.min(joPage, Math.max(1, Math.ceil(jos.length / PAGE_SIZE)))
  const joPageItems = jos.slice((joCurrentPage - 1) * PAGE_SIZE, joCurrentPage * PAGE_SIZE)

  async function approveUnlock(requestId: string) {
    setActing(requestId)
    try {
      const supabase = createSupabaseBrowserClient()
      await supabase.from('historical_unlock_requests').update({
        status: 'Approved', approved_by: currentUser.name, resolved_at: new Date().toISOString(),
      }).eq('request_id', requestId)
      setUnlockRequests(prev => prev.filter(r => r.request_id !== requestId))
    } finally {
      setActing(null)
    }
  }

  async function rejectUnlock(requestId: string) {
    setActing(requestId)
    try {
      const supabase = createSupabaseBrowserClient()
      await supabase.from('historical_unlock_requests').update({
        status: 'Rejected', approved_by: currentUser.name, resolved_at: new Date().toISOString(),
      }).eq('request_id', requestId)
      setUnlockRequests(prev => prev.filter(r => r.request_id !== requestId))
    } finally {
      setActing(null)
    }
  }

  async function approve(joId: string) {
    setActing(joId)
    try {
      const supabase = createSupabaseBrowserClient()
      await supabase.from('job_orders').update({ override_status: 'Approved' }).eq('job_order_id', joId)
      setJos(prev => prev.filter(j => j.job_order_id !== joId))
    } finally {
      setActing(null)
    }
  }

  async function reject(joId: string) {
    setActing(joId)
    try {
      const supabase = createSupabaseBrowserClient()
      await supabase.from('job_orders').update({
        override_status: 'Rejected',
        override_reject_note: rejectNote[joId] || null,
      }).eq('job_order_id', joId)
      setShowReject(null)
      setJos(prev => prev.filter(j => j.job_order_id !== joId))
    } finally {
      setActing(null)
    }
  }

  async function approveCredit(clientId: string) {
    setActing(clientId)
    try {
      const supabase = createSupabaseBrowserClient()
      await supabase.from('clients').update({ credit_line_status: true, credit_line_request_status: 'Approved' }).eq('client_id', clientId)
      setCreditRequests(prev => prev.filter(c => c.client_id !== clientId))
    } finally {
      setActing(null)
    }
  }

  async function rejectCredit(clientId: string) {
    setActing(clientId)
    try {
      const supabase = createSupabaseBrowserClient()
      await supabase.from('clients').update({ credit_line_status: false, credit_line_request_status: 'Rejected' }).eq('client_id', clientId)
      setCreditRequests(prev => prev.filter(c => c.client_id !== clientId))
    } finally {
      setActing(null)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ color: '#7A1828', fontSize: '1.4rem', fontWeight: 700 }}>Pending Approval</h1>
        <p style={{ color: '#777', fontSize: '0.8rem', marginTop: 2 }}>
          {jos.length} JO(s), {creditRequests.length} credit line request(s), and {unlockRequests.length} historical-record unlock request(s) awaiting manager approval
          {!isAdmin && <span style={{ color: '#e67e22', marginLeft: 8 }}>— view only (Admin can approve)</span>}
        </p>
      </div>

      {unlockRequests.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ color: '#7A1828', fontSize: '1rem', fontWeight: 700, marginBottom: '0.6rem' }}>Historical Record Unlock Requests</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {unlockPageItems.map(r => {
              const isActing = acting === r.request_id
              return (
                <div key={r.request_id} style={{ background: '#FDF5EC', borderRadius: 12, padding: '0.85rem 1rem', border: '1px solid #EDE0CC', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ color: '#1a1a1a', fontWeight: 700, fontSize: '0.88rem' }}>{r.requested_by_name}</div>
                    <div style={{ color: '#999', fontSize: '0.72rem', marginTop: 1 }}>
                      wants to backdate a job order · requested {new Date(r.created_at).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => rejectUnlock(r.request_id)} disabled={isActing} style={{ background: '#5a1010', border: '1px solid #7A1828', color: '#e74c3c', borderRadius: 8, padding: '0.45rem 0.8rem', cursor: isActing ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.78rem' }}>
                        Reject
                      </button>
                      <button onClick={() => approveUnlock(r.request_id)} disabled={isActing} style={{ background: '#1a3a1a', border: '1px solid #27ae60', color: '#2ecc71', borderRadius: 8, padding: '0.45rem 0.8rem', cursor: isActing ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.78rem' }}>
                        {isActing ? '…' : '✓ Approve'}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <Pagination page={unlockCurrentPage} totalItems={unlockRequests.length} pageSize={PAGE_SIZE} onPageChange={setUnlockPage} />
        </div>
      )}

      {creditRequests.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ color: '#7A1828', fontSize: '1rem', fontWeight: 700, marginBottom: '0.6rem' }}>Credit Line Requests</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {creditPageItems.map(c => {
              const clientName = c.client_name || c.company_name || c.client_id
              const isActing = acting === c.client_id
              return (
                <div key={c.client_id} style={{ background: '#FDF5EC', borderRadius: 12, padding: '0.85rem 1rem', border: '1px solid #EDE0CC', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ color: '#1a1a1a', fontWeight: 700, fontSize: '0.88rem' }}>{clientName}</div>
                    <div style={{ color: '#999', fontSize: '0.72rem', marginTop: 1 }}>
                      {c.client_id} {c.contact_number ? `· ${c.contact_number}` : ''} · requested by {c.credit_line_requested_by || '—'}
                    </div>
                  </div>
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => rejectCredit(c.client_id)} disabled={isActing} style={{ background: '#5a1010', border: '1px solid #7A1828', color: '#e74c3c', borderRadius: 8, padding: '0.45rem 0.8rem', cursor: isActing ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.78rem' }}>
                        Reject
                      </button>
                      <button onClick={() => approveCredit(c.client_id)} disabled={isActing} style={{ background: '#1a3a1a', border: '1px solid #27ae60', color: '#2ecc71', borderRadius: 8, padding: '0.45rem 0.8rem', cursor: isActing ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.78rem' }}>
                        {isActing ? '…' : '✓ Approve'}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <Pagination page={creditCurrentPage} totalItems={creditRequests.length} pageSize={PAGE_SIZE} onPageChange={setCreditPage} />
        </div>
      )}

      {jos.length === 0 ? (
        creditRequests.length === 0 && unlockRequests.length === 0 && <div style={{ color: '#aaa', textAlign: 'center', marginTop: '3rem', fontSize: '0.9rem' }}>No pending approvals. ✓</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {joPageItems.map(jo => {
            const clientName = jo.clients?.client_name || jo.clients?.company_name || jo.client_id
            const items = jo.job_order_items || []
            const totalPaid = jo.total_amount_paid || 0
            const pct = jo.grand_total ? Math.round((totalPaid / jo.grand_total) * 100) : 0
            const isActing = acting === jo.job_order_id

            return (
              <div key={jo.job_order_id} style={{ background: '#FDF5EC', borderRadius: 12, padding: '1rem', border: '1px solid #EDE0CC' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#1a1a1a', fontWeight: 700, fontSize: '0.92rem' }}>{clientName}</div>
                    <div style={{ color: '#999', fontSize: '0.72rem', marginTop: 1 }}>{jo.job_order_id} · {items.length} item(s) · by {jo.received_by || '—'}</div>
                    <div style={{ color: '#777', fontSize: '0.73rem', marginTop: 2 }}>
                      Received: {new Date(jo.date_time_received).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>

                    {/* Payment progress bar */}
                    <div style={{ marginTop: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ color: '#777', fontSize: '0.72rem' }}>Paid: {formatPeso(totalPaid)} / {formatPeso(jo.grand_total || 0)}</span>
                        <span style={{ color: '#e74c3c', fontSize: '0.72rem', fontWeight: 700 }}>{pct}%</span>
                      </div>
                      <div style={{ background: '#f0f0f0', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: pct >= 50 ? '#27ae60' : '#e74c3c', borderRadius: 4 }} />
                      </div>
                    </div>

                    {/* Override reason */}
                    {jo.request_override && (
                      <div style={{ marginTop: 10, background: '#3a3a3a', borderRadius: 8, padding: '0.6rem 0.85rem', border: '1px solid #555' }}>
                        <div style={{ color: '#e67e22', fontSize: '0.7rem', fontWeight: 700, marginBottom: 4 }}>OVERRIDE REASON FROM GA:</div>
                        <div style={{ color: '#ccc', fontSize: '0.8rem' }}>{jo.request_override}</div>
                      </div>
                    )}
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ color: '#1a1a1a', fontWeight: 700 }}>{formatPeso(jo.grand_total || 0)}</div>
                    <div style={{ color: '#e74c3c', fontSize: '0.75rem' }}>Bal: {formatPeso(jo.balance_due || 0)}</div>
                  </div>
                </div>

                {/* Admin action buttons */}
                {isAdmin && (
                  <div style={{ marginTop: '0.85rem' }}>
                    {showReject === jo.job_order_id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <textarea
                          placeholder="Rejection note (optional)..."
                          value={rejectNote[jo.job_order_id] || ''}
                          onChange={e => setRejectNote(prev => ({ ...prev, [jo.job_order_id]: e.target.value }))}
                          rows={2}
                          className="pf-textarea"
                          style={{ resize: 'none' }}
                        />
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => setShowReject(null)} style={{ flex: 1, background: '#f0f0f0', color: '#1a1a1a', border: 'none', borderRadius: 7, padding: '0.5rem', cursor: 'pointer', fontSize: '0.8rem' }}>Cancel</button>
                          <button onClick={() => reject(jo.job_order_id)} disabled={isActing} style={{ flex: 2, background: '#7A1828', color: '#fff', border: '2px solid #C9A84C', borderRadius: 999, padding: '0.5rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}>
                            {isActing ? '…' : 'Confirm Reject'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => setShowReject(jo.job_order_id)} style={{ flex: 1, background: '#5a1010', border: '1px solid #7A1828', color: '#e74c3c', borderRadius: 8, padding: '0.55rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}>
                          Reject
                        </button>
                        <button onClick={() => approve(jo.job_order_id)} disabled={isActing} style={{ flex: 2, background: '#1a3a1a', border: '1px solid #27ae60', color: '#2ecc71', borderRadius: 8, padding: '0.55rem', cursor: isActing ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.82rem' }}>
                          {isActing ? '…' : '✓ Approve for Production'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Pagination page={joCurrentPage} totalItems={jos.length} pageSize={PAGE_SIZE} onPageChange={setJoPage} />
    </div>
  )
}
