'use client'

import { useState, useRef } from 'react'
import html2canvas from 'html2canvas'
import ReceiptCard from '@/components/ReceiptCard'
import { IconDownload } from '@/components/icons'
import { nameInitials } from '@/lib/jo-helpers'

interface Item {
  item_id: string
  item_preview?: string | null
  quantity?: number | null
  width?: number | null
  height?: number | null
  production_specs?: string | null
  notes?: string | null
  date_time_needed?: string | null
  job_status?: string | null
  subcategory_name?: string | null
  category_name?: string | null
}

interface StatusLog {
  item_id: string
  status_name: string
  changed_by_name: string
}

interface Jo {
  job_order_id: string
  date_time_received: string
  received_by?: string | null
  grand_total: number
  total_amount_paid: number
  balance_due: number
  payment_status?: string | null
  discount?: number | null
  client_name?: string | null
  company_name?: string | null
  contact_number?: string | null
}

interface Props {
  jo: Jo
  items: Item[]
  statusLogs: StatusLog[]
  paymentMethods: string[]
}

// Lets the client flip between items themselves (same picker as the in-app "Generate Receipt"
// modal) instead of only ever seeing the JO's first item — the Payment Details block inside
// ReceiptCard stays fixed regardless of which item is selected, since payment is tracked per JO, not per item.
export default function PublicReceiptView({ jo, items, statusLogs, paymentMethods }: Props) {
  const [selectedItemId, setSelectedItemId] = useState(items[0]?.item_id || '')
  const [downloading, setDownloading] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const item = items.find(i => i.item_id === selectedItemId) || items[0]

  const clientName = jo.client_name || jo.company_name || 'Client'
  const sizeLabel = item?.width && item?.height ? `${item.width} × ${item.height} ft` : (item?.width ? `${item.width} ft` : '')
  const accomplishedBy = item && item.job_status !== 'Received'
    ? Array.from(new Set(statusLogs.filter(l => l.item_id === item.item_id && l.status_name === item.job_status).map(l => l.changed_by_name))).map(nameInitials).join(', ')
    : ''

  async function downloadImage() {
    if (!cardRef.current) return
    setDownloading(true)
    try {
      const canvas = await html2canvas(cardRef.current, { backgroundColor: '#ffffff', scale: 2, useCORS: true })
      const url = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = url
      a.download = `${jo.job_order_id}-receipt.png`
      a.click()
    } finally {
      setDownloading(false)
    }
  }

  return (
    <>
      {items.length > 1 && (
        <div className="pf-field" style={{ width: '100%', maxWidth: 460 }}>
          <label className="pf-label" style={{ color: '#fff' }}>Item</label>
          <select value={selectedItemId} onChange={e => setSelectedItemId(e.target.value)} className="pf-select" style={{ color: '#fff', borderBottomColor: 'rgba(255,255,255,0.35)' }}>
            {items.map(i => <option key={i.item_id} value={i.item_id}>{i.subcategory_name || i.item_id}</option>)}
          </select>
        </div>
      )}

      <div style={{ width: '100%', maxWidth: 460, boxShadow: '0 4px 20px rgba(0,0,0,0.25)', borderRadius: 12, overflow: 'hidden' }}>
        <ReceiptCard
          ref={cardRef}
          jobOrderId={jo.job_order_id}
          dateReceived={jo.date_time_received}
          clientName={clientName}
          contactNumber={jo.contact_number}
          itemPreview={item?.item_preview}
          itemName={item?.subcategory_name || '—'}
          categoryName={item?.category_name}
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
          paymentMethods={paymentMethods}
          status={jo.payment_status}
          discount={jo.discount}
        />
      </div>

      <button onClick={downloadImage} disabled={downloading} className="pf-btn" style={{ marginTop: '1.25rem' }}>
        <IconDownload />{downloading ? 'Saving…' : 'Download Image'}
      </button>
    </>
  )
}
