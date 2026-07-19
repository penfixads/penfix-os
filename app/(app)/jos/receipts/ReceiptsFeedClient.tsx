'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import ReceiptLightbox from '@/components/ReceiptLightbox'
import { IconImage, IconX } from '@/components/icons'
import { PAGE_SIZE, TILE_SELECT, applyDateRange, type ReceiptTile } from './shared'

interface Props {
  initialItems: ReceiptTile[]
  totalCount: number
  dateFrom: string
  dateTo: string
}

const inp: React.CSSProperties = { background: '#FDF5EC', border: '1.5px solid #d0d0d0', borderRadius: 8, padding: '0.5rem 0.75rem', color: '#1a1a1a', fontSize: '0.82rem', outline: 'none' }

// Replicates the "browse every JO receipt that's gone out" workflow Treasury already does
// by scrolling through the shop's Messenger group history — same receipt image, just as an
// in-app scrollable feed instead of a chat log. Tiles stay lightweight (thumbnail + a few
// fields) so hundreds of receipts can load without shipping every full ReceiptCard's worth
// of DOM at once; the full card only renders once, inside the lightbox.
export default function ReceiptsFeedClient({ initialItems, totalCount, dateFrom, dateTo }: Props) {
  const router = useRouter()
  const [items, setItems] = useState<ReceiptTile[]>(initialItems)
  const [loadingMore, setLoadingMore] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)

  // The date range lives in the URL (?from=&to=) so the server page can apply it to the
  // very first fetch — these fields just mirror that for editing. Changing either navigates
  // to the new URL, which re-runs the server page and remounts this component (keyed by the
  // range in the page above) with a fresh first page already filtered.
  function updateRange(nextFrom: string, nextTo: string) {
    const params = new URLSearchParams()
    if (nextFrom) params.set('from', nextFrom)
    if (nextTo) params.set('to', nextTo)
    const qs = params.toString()
    router.push(qs ? `/jos/receipts?${qs}` : '/jos/receipts')
  }

  const loadMore = useCallback(async () => {
    if (loadingRef.current || items.length >= totalCount) return
    loadingRef.current = true
    setLoadingMore(true)
    const supabase = createSupabaseBrowserClient()
    const { data } = await applyDateRange(
      supabase.from('job_order_items').select(TILE_SELECT),
      dateFrom, dateTo,
    )
      .order('date_time_received', { ascending: false })
      .range(items.length, items.length + PAGE_SIZE - 1)
    setItems(prev => [...prev, ...((data as any) || [])])
    loadingRef.current = false
    setLoadingMore(false)
  }, [items.length, totalCount, dateFrom, dateTo])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) loadMore()
    }, { rootMargin: '600px' })
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore])

  // "Next" past the currently-loaded window needs a page fetched first, so the lightbox's
  // sideways browsing feels continuous instead of dead-ending at whatever happened to be
  // loaded when it was opened.
  async function ensureIndexLoaded(index: number) {
    if (index < items.length) return true
    if (index >= totalCount) return false
    await loadMore()
    return true
  }

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#5C001F' }}>Job Order Receipts</h1>
          <div style={{ fontSize: '0.82rem', color: '#777' }}>{totalCount} receipt{totalCount === 1 ? '' : 's'} issued</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.78rem', color: '#777' }}>From</label>
          <input type="date" value={dateFrom} onChange={e => updateRange(e.target.value, dateTo)} style={inp} />
          <label style={{ fontSize: '0.78rem', color: '#777' }}>To</label>
          <input type="date" value={dateTo} onChange={e => updateRange(dateFrom, e.target.value)} style={inp} />
          {(dateFrom || dateTo) && (
            <button onClick={() => updateRange('', '')} className="pf-btn pf-btn-secondary" style={{ padding: '0.4rem 0.6rem' }}>
              <IconX style={{ width: 12, height: 12 }} />
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
        {items.map((item, index) => {
          const client = item.job_orders?.clients
          const clientName = client?.client_name || client?.company_name || '—'
          const dateLabel = new Date(item.date_time_received).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
          const thumb = item.item_preview_thumb || item.item_preview
          return (
            <button
              key={item.item_id}
              onClick={() => setActiveIndex(index)}
              style={{
                textAlign: 'left', background: '#fff', border: '1px solid #eee', borderRadius: 10,
                overflow: 'hidden', cursor: 'pointer', padding: 0, display: 'flex', flexDirection: 'column',
              }}
            >
              <div style={{ background: '#f5f5f5', aspectRatio: '1 / 1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {thumb ? (
                  <img src={thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <IconImage style={{ width: 28, height: 28, color: '#ccc' }} />
                )}
              </div>
              <div style={{ padding: '0.6rem 0.7rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#5C001F', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.subcategories?.subcategory_name || item.job_order_id}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#777', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{clientName}</div>
                <div style={{ fontSize: '0.68rem', color: '#aaa' }}>{dateLabel}</div>
              </div>
            </button>
          )
        })}
      </div>

      <div ref={sentinelRef} style={{ height: 1 }} />
      {loadingMore && <div style={{ textAlign: 'center', color: '#999', fontSize: '0.8rem', padding: '1.5rem' }}>Loading more…</div>}
      {!loadingMore && items.length >= totalCount && items.length > 0 && (
        <div style={{ textAlign: 'center', color: '#bbb', fontSize: '0.78rem', padding: '1.5rem' }}>— end of receipts —</div>
      )}

      {activeIndex !== null && (
        <ReceiptLightbox
          item={items[activeIndex]}
          hasPrev={activeIndex > 0}
          hasNext={activeIndex < totalCount - 1}
          onPrev={() => setActiveIndex(i => (i !== null ? i - 1 : i))}
          onNext={async () => {
            const nextIndex = activeIndex + 1
            const ok = await ensureIndexLoaded(nextIndex)
            if (ok) setActiveIndex(nextIndex)
          }}
          onClose={() => setActiveIndex(null)}
        />
      )}
    </div>
  )
}
