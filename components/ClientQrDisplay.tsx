'use client'

import QRCode from 'react-qr-code'
import { buildClientJoLink } from '@/lib/jo-helpers'

interface Props {
  clientId: string
  clientLabel: string
}

// On-screen preview of the branded loyalty-card QR, shown by ClientQrButton (Clients page,
// All Job Orders). The actual downloaded PNG is drawn separately via lib/loyaltyCard.ts's
// generateLoyaltyCardDataUrl using native Canvas 2D (fillText etc.) rather than capturing
// this DOM node — html2canvas doesn't reliably reproduce a given CSS top/line-height,
// confirmed to render text at inconsistent offsets across browsers. Keep the coordinates
// here in sync with loyaltyCard.ts if the template image or layout ever changes.
export default function ClientQrDisplay({ clientId, clientLabel }: Props) {
  return (
    <div
      style={{
        width: 350, height: 220, margin: '0 auto 1rem', borderRadius: 8, overflow: 'hidden',
        position: 'relative', fontFamily: 'Arial, Helvetica, sans-serif',
      }}
    >
      <img src="/loyalty-card-template.jpg" alt="" width={350} height={220} style={{ position: 'absolute', top: 0, left: 0, width: 350, height: 220, objectFit: 'cover' }} />
      {/* Horizontally centered over "Valid until". */}
      <div style={{ position: 'absolute', top: 30, left: 237, width: 68, height: 68, background: '#fff', padding: 4, borderRadius: 4 }}>
        <QRCode value={buildClientJoLink(typeof window !== 'undefined' ? window.location.origin : '', clientId)} size={60} style={{ width: '100%', height: '100%' }} />
      </div>
      {/* Same left for both so ID/Name values line up with each other, not with their
          (differently-indented) labels. Top values match the template's own printed
          "I.D NO.:" / "NAME:" label rows. */}
      <div style={{
        position: 'absolute', left: 248, top: 137, width: 98, color: '#fff', fontWeight: 700, fontSize: 8,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {clientId}
      </div>
      <div style={{
        position: 'absolute', left: 248, top: 151, width: 98, color: '#fff', fontWeight: 700, fontSize: 8,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {clientLabel}
      </div>
    </div>
  )
}
