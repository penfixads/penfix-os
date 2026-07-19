'use client'

import { forwardRef } from 'react'
import QRCode from 'react-qr-code'
import { buildClientJoLink } from '@/lib/jo-helpers'

interface Props {
  clientId: string
  clientLabel: string
}

// The branded loyalty-card graphic + QR, shared by ClientQrButton (Clients page, All Job
// Orders) — same encoded deep link, captured by html2canvas the same way. Positions are
// pixel-matched to loyalty-card-template.jpg's own blank fields (350x220 native): a QR in
// the empty space above "Valid until", and the client's ID/name typed in next to the
// template's printed "I.D NO.:" / "NAME:" labels.
const ClientQrDisplay = forwardRef<HTMLDivElement, Props>(function ClientQrDisplay({ clientId, clientLabel }, ref) {
  return (
    <div
      ref={ref}
      style={{
        width: 350, height: 220, margin: '0 auto 1rem', borderRadius: 8, overflow: 'hidden',
        position: 'relative', backgroundImage: 'url(/loyalty-card-template.jpg)',
        backgroundSize: 'cover', fontFamily: 'Arial, Helvetica, sans-serif',
      }}
    >
      <div style={{ position: 'absolute', top: 10, right: 15, width: 68, height: 68, background: '#fff', padding: 4, borderRadius: 4 }}>
        <QRCode value={buildClientJoLink(typeof window !== 'undefined' ? window.location.origin : '', clientId)} size={60} style={{ width: '100%', height: '100%' }} />
      </div>
      <div style={{
        position: 'absolute', left: 252, top: 134, width: 92, color: '#fff', fontWeight: 700, fontSize: 8,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {clientId}
      </div>
      <div style={{
        position: 'absolute', left: 244, top: 149, width: 100, color: '#fff', fontWeight: 700, fontSize: 8,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {clientLabel}
      </div>
    </div>
  )
})

export default ClientQrDisplay
