'use client'

import { forwardRef } from 'react'
import QRCode from 'react-qr-code'
import { buildClientJoLink } from '@/lib/jo-helpers'

interface Props {
  clientId: string
  clientLabel: string
}

// The QR graphic + label block, shared by ClientQrButton (Clients page) and the
// "here's your QR" step right after registering a new client in Today's Received
// JOs — same markup, same encoded deep link, captured by html2canvas the same way.
const ClientQrDisplay = forwardRef<HTMLDivElement, Props>(function ClientQrDisplay({ clientId, clientLabel }, ref) {
  return (
    <div ref={ref} style={{
      width: 200, padding: 16, margin: '0 auto 1rem', background: '#fff', borderRadius: 8,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
    }}>
      <QRCode value={buildClientJoLink(window.location.origin, clientId)} size={168} style={{ width: '100%', height: 'auto' }} />
      <div style={{ color: '#1a1a1a', fontWeight: 700, fontSize: '0.8rem', textAlign: 'center' }}>{clientLabel}</div>
      <div style={{ color: '#777', fontSize: '0.7rem' }}>{clientId}</div>
    </div>
  )
})

export default ClientQrDisplay
