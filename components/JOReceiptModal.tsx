'use client'

import { useState, useEffect, useRef } from 'react'
import html2canvas from 'html2canvas'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { nameInitials } from '@/lib/jo-helpers'
import ReceiptCard from '@/components/ReceiptCard'
import { IconX, IconDownload } from '@/components/icons'

interface Props {
  jobOrderId: string
  onClose: () => void
}

// Mirrors the branded paper/AppSheet "e-job order" the shop already sends clients via
// Messenger/Viber for approval — same fields (item preview, size/qty, deadline, remarks,
// payment breakdown), just generated from the data already captured when the JO was created.
export default function JOReceiptModal({ jobOrderId, onClose }: Props) {
  const [jo, setJo] = useState<any | null>(null)
  const [payments, setPayments] = useState<any[]>([])
  const [statusLogs, setStatusLogs] = useState<any[]>([])
  const [selectedItemId, setSelectedItemId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState<'download' | 'copy' | 'link' | null>(null)
  const [message, setMessage] = useState('')
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    Promise.all([
      supabase.from('job_orders').select(`
        *, clients(client_name, company_name, contact_number, email),
        job_order_items(*, subcategories(subcategory_name, categories(category_name)))
      `).eq('job_order_id', jobOrderId).single(),
      supabase.from('payments').select('*').eq('job_order_id', jobOrderId).order('created_at'),
    ]).then(async ([{ data: joData }, { data: pays }]) => {
      const itemIds = (joData?.job_order_items || []).map((i: any) => i.item_id)
      const { data: logs } = itemIds.length > 0
        ? await supabase.from('job_order_item_status_log').select('*').in('item_id', itemIds).order('created_at')
        : { data: [] }
      setJo(joData)
      setPayments(pays || [])
      setStatusLogs(logs || [])
      setSelectedItemId(joData?.job_order_items?.[0]?.item_id || '')
      setLoading(false)
    })
  }, [jobOrderId])

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
      // navigator.clipboard.write must be called synchronously within the click's user-gesture
      // window, or Chrome silently rejects it (leaving whatever was on the clipboard before).
      // Passing a Promise<Blob> straight into ClipboardItem lets the write "start" immediately
      // while the (async) html2canvas capture finishes in the background — the documented
      // workaround for async clipboard writes.
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
    const url = `${window.location.origin}/receipt/${jobOrderId}`
    navigator.clipboard.writeText(url)
    setMessage('Link copied — paste it into Messenger, Viber, or wherever the client is.')
    setWorking(null)
  }

  if (loading || !jo) {
    return (
      <div className="pf-modal-overlay" style={{ background: 'rgba(0,0,0,0.7)' }}>
        <div className="pf-modal-card pf-modal-wine" style={{ maxWidth: 460 }}>
          <div style={{ color: '#E8B9C6', textAlign: 'center', padding: '2rem' }}>Loading…</div>
        </div>
      </div>
    )
  }

  const items: any[] = jo.job_order_items || []
  const item = items.find(i => i.item_id === selectedItemId) || items[0]
  const client = jo.clients
  const clientName = client?.client_name || client?.company_name || jo.client_id
  const methodsUsed = Array.from(new Set(payments.map(p => p.payment_method).filter(Boolean))) as string[]
  const sizeLabel = item?.width && item?.height ? `${item.width} × ${item.height} ft` : (item?.width ? `${item.width} ft` : '')
  // "Accomplished By" reflects whoever confirmed the item's current status — blank while it's
  // still sitting at "Received" (nothing beyond intake has happened yet).
  const accomplishedBy = item && item.job_status !== 'Received'
    ? Array.from(new Set(statusLogs.filter(l => l.item_id === item.item_id && l.status_name === item.job_status).map(l => l.changed_by_name))).map(nameInitials).join(', ')
    : ''

  return (
    <div className="pf-modal-overlay" style={{ background: 'rgba(0,0,0,0.7)', alignItems: 'flex-start' }}>
      <div className="pf-modal-card pf-modal-wine" style={{ maxWidth: 540, marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
          <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700 }}>Job Order Receipt</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#E8B9C6', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
        </div>

        {items.length > 1 && (
          <div className="pf-field">
            <label className="pf-label">Item</label>
            <select value={selectedItemId} onChange={e => setSelectedItemId(e.target.value)} className="pf-select">
              {items.map(i => <option key={i.item_id} value={i.item_id}>{i.subcategories?.subcategory_name || i.item_id}</option>)}
            </select>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <div style={{ width: 460 }}>
            <ReceiptCard
              ref={cardRef}
              jobOrderId={jo.job_order_id}
              dateReceived={jo.date_time_received}
              clientName={clientName}
              contactNumber={client?.contact_number}
              itemPreview={item?.item_preview}
              itemName={item?.subcategories?.subcategory_name || '—'}
              categoryName={item?.subcategories?.categories?.category_name}
              size={sizeLabel}
              quantity={item?.quantity ?? 1}
              specs={item?.production_specs}
              remarks={item?.notes}
              dateNeeded={item?.date_time_needed}
              receivedBy={jo.received_by}
              accomplishedBy={accomplishedBy}
              totalAmount={jo.grand_total || 0}
              amountPaid={jo.total_amount_paid || 0}
              balance={jo.balance_due || 0}
              paymentMethods={methodsUsed}
              status={jo.payment_status}
              discount={jo.discount}
            />
          </div>
        </div>

        {message && <div style={{ color: message.startsWith('Could not copy') ? '#f1c40f' : '#2ecc71', fontSize: '0.78rem', marginBottom: '0.75rem', textAlign: 'center' }}>{message}</div>}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button onClick={onClose} className="pf-btn pf-btn-secondary"><IconX />Close</button>
          <button onClick={copyLink} disabled={!!working} className="pf-btn pf-btn-secondary">
            {working === 'link' ? '…' : 'Copy Receipt Link'}
          </button>
          <button onClick={copyImage} disabled={!!working} className="pf-btn pf-btn-secondary">
            {working === 'copy' ? 'Copying…' : 'Copy Image'}
          </button>
          <button onClick={downloadImage} disabled={!!working} className="pf-btn">
            <IconDownload />{working === 'download' ? 'Saving…' : 'Download Image'}
          </button>
        </div>
      </div>
    </div>
  )
}
