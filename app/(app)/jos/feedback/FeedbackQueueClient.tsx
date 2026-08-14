'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { buildFeedbackUrl, buildFeedbackMessage } from '@/lib/jo-helpers'
import Pagination from '@/components/Pagination'
import { type Bucket, PAGE_SIZE, NO_RESPONSE_AFTER_DAYS, BUCKET_LABELS } from './constants'

interface Props {
  jobOrders: any[]
  counts: Record<Bucket, number>
  bucket: Bucket
  page: number
  totalItems: number
  search: string
}

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24))
}

function agoLabel(days: number): string {
  if (days <= 0) return 'today'
  return days === 1 ? 'yesterday' : `${days} days ago`
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}

// The service the client bought, for prefilling the form's "Service Availed". A JO can span
// several categories; the first is close enough for a prefill the client can't change, and
// beats making them pick from eleven options themselves.
function primaryService(jo: any): string | null {
  for (const item of jo.job_order_items || []) {
    const sub = Array.isArray(item.subcategories) ? item.subcategories[0] : item.subcategories
    const cat = Array.isArray(sub?.categories) ? sub.categories[0] : sub?.categories
    if (cat?.category_name) return cat.category_name
  }
  return null
}

function clientNameOf(jo: any): string {
  const c = Array.isArray(jo.clients) ? jo.clients[0] : jo.clients
  return c?.client_name || c?.company_name || jo.client_id || '—'
}

export default function FeedbackQueueClient({ jobOrders, counts, bucket, page, totalItems, search }: Props) {
  const router = useRouter()
  const [rows, setRows] = useState(jobOrders)
  const [searchInput, setSearchInput] = useState(search)
  const [copying, setCopying] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  // Bucket/page/search live in the URL because filtering and paging now happen in the query —
  // only the current page of rows is ever fetched, so the page stays the same weight whether
  // there are 40 completed job orders or 40,000.
  function go(next: { bucket?: Bucket; page?: number; q?: string }) {
    const params = new URLSearchParams()
    const b = next.bucket ?? bucket
    const p = next.page ?? 1
    const q = next.q ?? search
    if (b !== 'to_send') params.set('bucket', b)
    if (p > 1) params.set('page', String(p))
    if (q) params.set('q', q)
    const qs = params.toString()
    router.push(qs ? `/jos/feedback?${qs}` : '/jos/feedback')
  }

  useEffect(() => { setRows(jobOrders) }, [jobOrders])
  useEffect(() => { setSearchInput(search) }, [search])

  // Someone may send a link from All JOs or Today's JOs in another tab — re-fetch on focus so
  // this queue doesn't keep offering a JO that's already been asked.
  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === 'visible') router.refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
    }
  }, [router])

  // `withMessage` copies the full personalized Messenger/Viber text rather than the bare URL.
  // Only the FIRST send stamps feedback_requested_at — a re-copy while chasing a
  // client must not reset the clock, or a JO could never age into No response.
  async function copyLink(jo: any, withMessage: boolean) {
    const joId = jo.job_order_id
    const clientName = clientNameOf(jo)
    setCopying(joId)
    try {
      const url = buildFeedbackUrl(window.location.origin, joId, clientName, primaryService(jo))
      await navigator.clipboard.writeText(withMessage ? buildFeedbackMessage(url, clientName) : url)

      if (!jo.feedback_requested_at) {
        const requestedAt = new Date().toISOString()
        const supabase = createSupabaseBrowserClient()
        const { error } = await supabase
          .from('job_orders')
          .update({ feedback_requested_at: requestedAt })
          .eq('job_order_id', joId)
        if (error) { alert(error.message || 'Copied, but failed to record that feedback was requested.'); return }
        // The row belongs to another bucket now; drop it here and let the counts re-derive.
        setRows(prev => prev.filter(r => r.job_order_id !== joId))
        router.refresh()
      }
      setToast(withMessage ? 'Message copied — paste it into Messenger or Viber.' : 'Link copied.')
      setTimeout(() => setToast(null), 3500)
    } finally {
      setCopying(null)
    }
  }

  const emptyText: Record<Bucket, string> = {
    to_send: 'Nothing waiting — every completed job order has been asked for feedback.',
    awaiting: 'No links are currently waiting on a reply.',
    no_response: `No links have gone unanswered for ${NO_RESPONSE_AFTER_DAYS}+ days.`,
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h1 style={{ color: '#7A1828', fontSize: '1.4rem', fontWeight: 700 }}>Send Client Feedback</h1>
          <p style={{ color: '#777', fontSize: '0.8rem', marginTop: 2 }}>
            Completed &amp; fully paid job orders from the last 90 days. Copy the link, paste it into Messenger or Viber.
          </p>
        </div>
        <form
          onSubmit={e => { e.preventDefault(); go({ q: searchInput, page: 1 }) }}
          style={{ display: 'flex', gap: 6 }}
        >
          <input
            type="text"
            placeholder="Client or JO ID..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            style={{ background: '#FDF5EC', border: '1.5px solid #d0d0d0', borderRadius: 8, padding: '0.5rem 0.85rem', color: '#1a1a1a', fontSize: '0.82rem', width: 200, outline: 'none' }}
          />
          <button type="submit" style={{ background: '#7A1828', border: 'none', color: '#fff', borderRadius: 8, padding: '0.5rem 0.85rem', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
            Search
          </button>
          {search && (
            <button type="button" onClick={() => go({ q: '', page: 1 })} style={{ background: '#fff', border: '1.5px solid #d0d0d0', color: '#666', borderRadius: 8, padding: '0.5rem 0.7rem', fontSize: '0.78rem', cursor: 'pointer' }}>
              Clear
            </button>
          )}
        </form>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {(Object.keys(BUCKET_LABELS) as Bucket[]).map(b => {
          const active = bucket === b
          return (
            <button
              key={b}
              onClick={() => go({ bucket: b, page: 1 })}
              style={{
                background: active ? '#7A1828' : '#FDF5EC',
                border: `1.5px solid ${active ? '#7A1828' : '#EDE0CC'}`,
                color: active ? '#fff' : '#7A1828',
                borderRadius: 20, padding: '0.4rem 0.95rem', fontSize: '0.78rem',
                fontWeight: 700, cursor: 'pointer',
              }}
            >
              {BUCKET_LABELS[b]} ({counts[b]})
            </button>
          )
        })}
      </div>

      {rows.length === 0 ? (
        <div style={{ color: '#aaa', textAlign: 'center', marginTop: '3rem', fontSize: '0.9rem' }}>
          {search ? 'No job orders match that search.' : emptyText[bucket]}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {rows.map(jo => {
            const c = Array.isArray(jo.clients) ? jo.clients[0] : jo.clients
            const clientName = clientNameOf(jo)
            const service = primaryService(jo)
            const isCopying = copying === jo.job_order_id
            const sentDays = jo.feedback_requested_at ? daysSince(jo.feedback_requested_at) : null

            return (
              <div key={jo.job_order_id} style={{ background: '#FDF5EC', borderRadius: 10, padding: '0.85rem 1rem', border: '1px solid #EDE0CC' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ color: '#1a1a1a', fontWeight: 700, fontSize: '0.88rem' }}>{clientName}</div>
                    <div style={{ color: '#999', fontSize: '0.72rem', marginTop: 1 }}>
                      {jo.job_order_id}
                      {jo.date_time_received && ` · ${fmtDate(jo.date_time_received)}`}
                      {jo.received_by && ` · ${jo.received_by}`}
                    </div>
                    {service && <div style={{ color: '#777', fontSize: '0.75rem', marginTop: 3 }}>{service}</div>}
                    {c?.contact_number && <div style={{ color: '#777', fontSize: '0.72rem', marginTop: 2 }}>📞 {c.contact_number}</div>}
                    {sentDays !== null && jo.feedback_requested_at && (
                      <div style={{ color: bucket === 'no_response' ? '#c0392b' : '#c05a00', fontSize: '0.72rem', marginTop: 4, fontWeight: 600 }}>
                        {bucket === 'no_response' ? 'No reply — link sent' : 'Link sent'} {fmtDate(jo.feedback_requested_at)} ({agoLabel(sentDays)})
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    <button
                      onClick={() => copyLink(jo, true)}
                      disabled={isCopying}
                      title="Copy a ready-to-paste message with one link per star rating"
                      style={{ background: '#7A1828', border: '1.5px solid #7A1828', color: '#fff', fontSize: '0.73rem', padding: '0.4rem 0.8rem', borderRadius: 6, cursor: isCopying ? 'not-allowed' : 'pointer', fontWeight: 700 }}
                    >
                      ⭐ Copy message
                    </button>
                    <button
                      onClick={() => copyLink(jo, false)}
                      disabled={isCopying}
                      title="Copy just the feedback form link"
                      style={{ background: '#fff', border: '1.5px solid #d0d0d0', color: '#666', fontSize: '0.73rem', padding: '0.4rem 0.8rem', borderRadius: 6, cursor: isCopying ? 'not-allowed' : 'pointer', fontWeight: 600 }}
                    >
                      🔗 Link only
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Pagination page={page} totalItems={totalItems} pageSize={PAGE_SIZE} onPageChange={p => go({ page: p })} />

      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: '#7A1828', color: '#fff', padding: '0.7rem 1.2rem', borderRadius: 10,
          fontSize: '0.82rem', fontWeight: 600, boxShadow: '0 6px 20px rgba(0,0,0,0.25)', zIndex: 50,
        }}>
          {toast}
        </div>
      )}
    </div>
  )
}
