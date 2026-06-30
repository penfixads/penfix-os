'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { formatPeso } from '@/lib/jo-helpers'
import type { AppUser } from '@/lib/user'

interface Props {
  jobOrders: any[]
  currentUser: AppUser
}

export default function PendingApprovalClient({ jobOrders, currentUser }: Props) {
  const router = useRouter()
  const [acting, setActing] = useState<string | null>(null)
  const [rejectNote, setRejectNote] = useState<Record<string, string>>({})
  const [showReject, setShowReject] = useState<string | null>(null)

  const isAdmin = currentUser.role === 'Admin'

  async function approve(joId: string) {
    setActing(joId)
    try {
      const supabase = createSupabaseBrowserClient()
      await supabase.from('job_orders').update({ override_status: 'Approved' }).eq('job_order_id', joId)
      router.refresh()
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
      router.refresh()
    } finally {
      setActing(null)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ color: '#1a1a1a', fontSize: '1.4rem', fontWeight: 700 }}>Pending Approval</h1>
        <p style={{ color: '#777', fontSize: '0.8rem', marginTop: 2 }}>
          {jobOrders.length} JO(s) awaiting manager approval
          {!isAdmin && <span style={{ color: '#e67e22', marginLeft: 8 }}>— view only (Admin can approve)</span>}
        </p>
      </div>

      {jobOrders.length === 0 ? (
        <div style={{ color: '#aaa', textAlign: 'center', marginTop: '3rem', fontSize: '0.9rem' }}>No pending approvals. ✓</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {jobOrders.map(jo => {
            const clientName = jo.clients?.client_name || jo.clients?.company_name || jo.client_id
            const items = jo.job_order_items || []
            const totalPaid = jo.total_amount_paid || 0
            const pct = jo.grand_total ? Math.round((totalPaid / jo.grand_total) * 100) : 0
            const isActing = acting === jo.job_order_id

            return (
              <div key={jo.job_order_id} style={{ background: '#f5f5f5', borderRadius: 12, padding: '1rem', border: '1px solid #3a1a00' }}>
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
                      <div style={{ marginTop: 10, background: '#1a0f00', borderRadius: 8, padding: '0.6rem 0.85rem', border: '1px solid #3a2a00' }}>
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
                          style={{ background: '#f5f5f5', border: '1.5px solid #3a0000', borderRadius: 7, padding: '0.5rem 0.7rem', color: '#1a1a1a', fontSize: '0.82rem', resize: 'none', outline: 'none' }}
                        />
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => setShowReject(null)} style={{ flex: 1, background: '#f0f0f0', color: '#1a1a1a', border: 'none', borderRadius: 7, padding: '0.5rem', cursor: 'pointer', fontSize: '0.8rem' }}>Cancel</button>
                          <button onClick={() => reject(jo.job_order_id)} disabled={isActing} style={{ flex: 2, background: '#7B1C1C', color: '#fff', border: 'none', borderRadius: 999, borderRadius: 7, padding: '0.5rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}>
                            {isActing ? '…' : 'Confirm Reject'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => setShowReject(jo.job_order_id)} style={{ flex: 1, background: '#5a1010', border: '1px solid #7B1C1C', color: '#e74c3c', borderRadius: 8, padding: '0.55rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}>
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
    </div>
  )
}
