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
//
// The ID/name `top` values look ~6px higher than where the label actually sits on-screen —
// that's deliberate. html2canvas (what the Download button uses to export a PNG) renders
// text roughly 6px lower than the live DOM does for identical `top`/`lineHeight`, confirmed
// by capturing 1px marker divs at the same coordinates and measuring the exported pixels
// directly. These values were calibrated against the *exported PNG*, not the live preview —
// don't "fix" them to match what looks right in the browser, that will break the download.
const ClientQrDisplay = forwardRef<HTMLDivElement, Props>(function ClientQrDisplay({ clientId, clientLabel }, ref) {
  return (
    <div
      ref={ref}
      style={{
        width: 350, height: 220, margin: '0 auto 1rem', borderRadius: 8, overflow: 'hidden',
        position: 'relative', fontFamily: 'Arial, Helvetica, sans-serif',
      }}
    >
      {/* Plain <img> rather than a CSS background-image — html2canvas (used by the
          Download button) doesn't reliably respect background-size/position, which was
          shifting every absolutely-positioned overlay below in the exported PNG even
          though the live DOM looked correct. */}
      <img src="/loyalty-card-template.jpg" alt="" width={350} height={220} style={{ position: 'absolute', top: 0, left: 0, width: 350, height: 220, objectFit: 'cover' }} />
      <div style={{ position: 'absolute', top: 42, right: 15, width: 68, height: 68, background: '#fff', padding: 4, borderRadius: 4 }}>
        <QRCode value={buildClientJoLink(typeof window !== 'undefined' ? window.location.origin : '', clientId)} size={60} style={{ width: '100%', height: '100%' }} />
      </div>
      <div style={{
        position: 'absolute', left: 252, top: 131, width: 92, height: 9, lineHeight: '9px', color: '#fff', fontWeight: 700, fontSize: 8,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {clientId}
      </div>
      <div style={{
        position: 'absolute', left: 244, top: 145, width: 100, height: 9, lineHeight: '9px', color: '#fff', fontWeight: 700, fontSize: 8,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {clientLabel}
      </div>
    </div>
  )
})

export default ClientQrDisplay
