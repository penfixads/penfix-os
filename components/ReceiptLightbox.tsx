'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import html2canvas from 'html2canvas'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { nameInitials, buildItemCostBreakdown } from '@/lib/jo-helpers'
import ReceiptCard from '@/components/ReceiptCard'
import { IconX, IconDownload, IconChevronLeft, IconChevronRight } from '@/components/icons'
import type { ReceiptTile } from '@/app/(app)/jos/receipts/shared'

interface Props {
  item: ReceiptTile
  hasPrev: boolean
  hasNext: boolean
  onPrev: () => void
  onNext: () => void
  onClose: () => void
}

// Full-size receipt viewer with sideways (prev/next) browsing across the whole feed —
// the in-app equivalent of paging through Facebook's photo viewer, which is how Treasury
// currently browses issued receipts inside the shop's Messenger group.
export default function ReceiptLightbox({ item, hasPrev, hasNext, onPrev, onNext, onClose }: Props) {
  const [jo, setJo] = useState<any | null>(null)
  const [statusLogs, setStatusLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState<'download' | 'copy' | 'link' | null>(null)
  const [message, setMessage] = useState('')
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLoading(true)
    setMessage('')
    const supabase = createSupabaseBrowserClient()
    supabase.from('job_orders').select(`
      *, clients(client_name, company_name, contact_number, email),
      job_order_items(*, subcategories(subcategory_name, categories(category_name)))
    `).eq('job_order_id', item.job_order_id).single().then(async ({ data: joData }) => {
      const itemIds = (joData?.job_order_items || []).map((i: any) => i.item_id)
      const { data: logs } = itemIds.length > 0
        ? await supabase.from('job_order_item_status_log').select('*').in('item_id', itemIds).order('created_at')
        : { data: [] }
      setJo(joData)
      setStatusLogs(logs || [])
      setLoading(false)
    })
  }, [item.job_order_id])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && hasPrev) onPrev()
      if (e.key === 'ArrowRight' && hasNext) onNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [hasPrev, hasNext, onPrev, onNext, onClose])

  async function captureCard(): Promise<HTMLCanvasElement | null> {
    if (!cardRef.current) return null
    return html2canvas(cardRef.current, { backgroundColor: '#ffffff', scale: 2, useCORS: true })
  }

  async function downloadImage() {
    setWorking('download')
    setMessage('')
    try {
      const canvas = await captureCard()
      if (!canvas) return
      const url = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = url
      a.download = `${jo.job_order_id}-receipt.png`
      a.click()
    } finally {
      setWorking(null)
    }
  }

  async function copyImage() {
    setWorking('copy')
    setMessage('')
    try {
      const blobPromise = captureCard().then(canvas => new Promise<Blob>((resolve, reject) => {
        if (!canvas) { reject(new Error('Failed to render receipt.')); return }
        canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Failed to render receipt.')), 'image/png')
      }))
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blobPromise })])
      setMessage('Image copied — paste it into Messenger, Viber, or wherever the client is.')
    } catch {
      setMessage('Could not copy automatically — use Download Image instead.')
    } finally {
      setWorking(null)
    }
  }

  function copyLink() {
    setWorking('link')
    setMessage('')
    const url = `${window.location.origin}/receipt/${jo.public_token}`
    navigator.clipboard.writeText(url)
    setMessage('Link copied — paste it into Messenger, Viber, or wherever the client is.')
    setWorking(null)
  }

  const items: any[] = jo?.job_order_items || []
  const receiptItem = items.find(i => i.item_id === item.item_id)
  const client = jo?.clients
  const clientName = client?.client_name || client?.company_name || jo?.client_id
  const sizeLabel = receiptItem?.width && receiptItem?.height ? `${receiptItem.width} × ${receiptItem.height} ft` : (receiptItem?.width ? `${receiptItem.width} ft` : '')
  const accomplishedBy = receiptItem && receiptItem.job_status !== 'Received'
    ? Array.from(new Set(statusLogs.filter(l => l.item_id === receiptItem.item_id && l.status_name === receiptItem.job_status).map(l => l.changed_by_name))).map(nameInitials).join(', ')
    : ''

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <button onClick={onClose} aria-label="Close" style={{ ...navBtnBase, top: '1rem', right: '1rem' }}>
        <IconX style={{ width: 20, height: 20 }} />
      </button>

      {hasPrev && (
        <button onClick={onPrev} aria-label="Previous" style={{ ...navBtnBase, left: '1rem', top: '50%', transform: 'translateY(-50%)' }}>
          <IconChevronLeft style={{ width: 22, height: 22 }} />
        </button>
      )}
      {hasNext && (
        <button onClick={onNext} aria-label="Next" style={{ ...navBtnBase, right: '1rem', top: '50%', transform: 'translateY(-50%)' }}>
          <IconChevronRight style={{ width: 22, height: 22 }} />
        </button>
      )}

      <div style={{ width: '100%', maxWidth: 460, maxHeight: '92vh', overflowY: 'auto', padding: '0 1rem' }} onClick={e => e.stopPropagation()}>
        {loading || !jo ? (
          <div style={{ color: '#E8B9C6', textAlign: 'center', padding: '3rem' }}>Loading…</div>
        ) : (
          <>
            <ReceiptCard
              ref={cardRef}
              jobOrderId={jo.job_order_id}
              dateReceived={jo.date_time_received}
              clientName={clientName}
              contactNumber={client?.contact_number}
              itemPreview={receiptItem?.item_preview}
              itemName={receiptItem?.subcategories?.subcategory_name || '—'}
              categoryName={receiptItem?.subcategories?.categories?.category_name}
              size={sizeLabel}
              quantity={receiptItem?.quantity ?? 1}
              specs={receiptItem?.production_specs}
              remarks={receiptItem?.notes}
              dateNeeded={receiptItem?.date_time_needed}
              receivedBy={jo.received_by}
              accomplishedBy={accomplishedBy}
              sourceChannel={jo.source_channel}
              itemCost={receiptItem?.computed_line_total || 0}
              costBreakdown={buildItemCostBreakdown(receiptItem)}
              billingSummary={items.length === 1 ? {
                totalAmount: jo.grand_total || 0,
                amountPaid: jo.total_amount_paid || 0,
                balance: jo.balance_due || 0,
                status: jo.payment_status,
                discount: jo.discount,
              } : undefined}
            />

            {message && <div style={{ color: message.startsWith('Could not copy') ? '#f1c40f' : '#2ecc71', fontSize: '0.78rem', margin: '0.75rem 0', textAlign: 'center' }}>{message}</div>}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', margin: '1rem 0 2rem' }}>
              <button onClick={copyLink} disabled={!!working} className="pf-btn pf-btn-secondary" style={{ background: '#fff' }}>
                {working === 'link' ? '…' : 'Copy Receipt Link'}
              </button>
              <button onClick={copyImage} disabled={!!working} className="pf-btn pf-btn-secondary" style={{ background: '#fff' }}>
                {working === 'copy' ? 'Copying…' : 'Copy Image'}
              </button>
              <button onClick={downloadImage} disabled={!!working} className="pf-btn">
                <IconDownload />{working === 'download' ? 'Saving…' : 'Download Image'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const navBtnBase: CSSProperties = {
  position: 'absolute', width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.12)',
  border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', zIndex: 401,
}
