'use client'

import { useState, useEffect, forwardRef } from 'react'
import { formatPeso } from '@/lib/jo-helpers'

export interface ReceiptCardProps {
  jobOrderId: string
  dateReceived: string
  clientName: string
  contactNumber?: string | null
  itemPreview?: string | null
  itemName: string
  categoryName?: string | null
  size?: string | null
  quantity: number
  specs?: string | null
  remarks?: string | null
  dateNeeded?: string | null
  receivedBy?: string | null
  accomplishedBy?: string | null
  sourceChannel?: string | null
  itemCost: number
  costBreakdown: { label: string; amount: number }[]
  // Only passed for single-item job orders — the Billing Statement covers the
  // JO/aggregate totals for multi-item JOs, but that button never appears for a
  // JO with just one item, so this item's own receipt needs to carry the totals.
  billingSummary?: { totalAmount: number; amountPaid: number; balance: number; status?: string | null; discount?: number | null }
}

// Shared by the in-app "Generate Receipt" modal and the public /receipt/[token] link so
// both look identical — the branded e-JO the shop already sends clients via Messenger/Viber,
// just rebuilt from the data already captured when the JO was created.
const ReceiptCard = forwardRef<HTMLDivElement, ReceiptCardProps>(function ReceiptCard(props, ref) {
  const {
    jobOrderId, dateReceived, clientName, contactNumber, itemPreview, itemName, categoryName,
    size, quantity, specs, remarks, dateNeeded, receivedBy, accomplishedBy, itemCost, costBreakdown, sourceChannel,
    billingSummary,
  } = props

  // html2canvas doesn't reliably respect CSS object-fit, so the image's displayed size is
  // computed here (preserving aspect ratio) instead of relying on object-fit: contain —
  // otherwise a square/portrait photo gets squashed to fill a fixed-height box in the export.
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null)
  useEffect(() => {
    if (!itemPreview) { setDims(null); return }
    const img = new window.Image()
    img.onload = () => {
      const maxW = 380
      const maxH = 340
      const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight)
      setDims({ w: Math.round(img.naturalWidth * scale), h: Math.round(img.naturalHeight * scale) })
    }
    img.src = itemPreview
  }, [itemPreview])

  const dateLabel = new Date(dateReceived).toLocaleDateString('en-PH', { month: '2-digit', day: '2-digit', year: 'numeric' })

  return (
    <div ref={ref} style={{ width: '100%', background: '#fff', fontFamily: 'Arial, sans-serif', border: '1px solid #ddd', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ background: '#5C001F', color: '#fff', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <img src="/penfixtwhhite.png" alt="Penfix" style={{ height: 44, width: 'auto', display: 'block' }} />
        <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
          <span style={{ opacity: 0.85 }}>DATE: </span>
          <span style={{ fontWeight: 700 }}>{dateLabel}</span>
        </div>
      </div>

      {itemPreview && (
        <div style={{ background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.1rem' }}>
          {dims && <img src={itemPreview} width={dims.w} height={dims.h} alt="Item preview" style={{ display: 'block', borderRadius: 6 }} />}
        </div>
      )}

      <div style={{ padding: '1.1rem 1.25rem' }}>
        <Row label="JO Number" value={jobOrderId} />
        <Row label="Client / Contact" value={`${clientName}${contactNumber ? ' · ' + contactNumber : ''}`} />
        {sourceChannel && <Row label="Received Via" value={sourceChannel} />}
        <Row label="Item" value={itemName} />
        {categoryName && <Row label="Category" value={categoryName} />}
        {size && <Row label="Size" value={size} />}
        <Row label="No. of Pcs" value={String(quantity ?? 1)} />
        {specs && <Row label="Specs" value={specs} />}
        {remarks && <Row label="Remarks" value={remarks} />}
        {dateNeeded && (
          <Row label="Time / Date Needed" value={new Date(dateNeeded).toLocaleString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })} />
        )}
      </div>

      {/* Separator band — matches the shop's original paper/AppSheet job order layout */}
      <div style={{ background: '#5C001F', color: '#fff', padding: '0.75rem 1.25rem', display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontSize: '0.65rem', opacity: 0.8, letterSpacing: '0.04em' }}>RECEIVED BY</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{receivedBy || '—'}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.65rem', opacity: 0.8, letterSpacing: '0.04em' }}>ACCOMPLISHED BY</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{accomplishedBy || '—'}</div>
        </div>
      </div>

      <div style={{ padding: '1.1rem 1.25rem' }}>
        <div style={{ color: '#5C001F', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.04em', marginBottom: 8 }}>ITEM COST BREAKDOWN</div>
        {costBreakdown.map(row => <Row key={row.label} label={row.label} value={formatPeso(row.amount)} />)}
        <Row label="Item Cost" value={formatPeso(itemCost)} bold />
      </div>

      {billingSummary && (
        <div style={{ padding: '1.1rem 1.25rem', borderTop: '1px solid #eee' }}>
          <div style={{ color: '#5C001F', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.04em', marginBottom: 8 }}>BILLING SUMMARY</div>
          <Row label="Total Amount" value={formatPeso(billingSummary.totalAmount)} bold />
          <Row label="Amount Paid" value={formatPeso(billingSummary.amountPaid)} />
          <Row label="Balance" value={formatPeso(billingSummary.balance)} bold color={billingSummary.balance > 0 ? '#c0392b' : '#1a7a3a'} />
          {billingSummary.status && <Row label="Status" value={billingSummary.status} />}
          {!!billingSummary.discount && billingSummary.discount > 0 && <Row label="Discount" value={formatPeso(billingSummary.discount)} />}
        </div>
      )}
    </div>
  )
})

export default ReceiptCard

function Row({ label, value, bold, color }: { label: string; value: string; bold?: boolean; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '0.28rem 0', fontSize: '0.85rem' }}>
      <span style={{ color: '#777', flexShrink: 0 }}>{label}</span>
      <span style={{ color: color || '#1a1a1a', fontWeight: bold ? 700 : 400, textAlign: 'right' }}>{value}</span>
    </div>
  )
}
