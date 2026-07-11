'use client'

import { useState } from 'react'
import ClientQrDisplay from '@/components/ClientQrDisplay'
import { useQrDownload } from '@/lib/useQrDownload'
import { IconQrCode, IconDownload, IconX } from '@/components/icons'

interface Props {
  clientId: string
  clientLabel: string
  buttonClassName?: string
  buttonStyle?: React.CSSProperties
  // Compact form for tight row layouts (e.g. All Job Orders' 🔗/📋 icon buttons) —
  // just the icon, no "QR Code" text.
  iconOnly?: boolean
}

export default function ClientQrButton({ clientId, clientLabel, buttonClassName, buttonStyle, iconOnly }: Props) {
  const [open, setOpen] = useState(false)
  const { ref, saving, download } = useQrDownload(`${clientId}-qr.png`)

  return (
    <>
      <button onClick={() => setOpen(true)} title="QR Code" className={buttonClassName ?? 'pf-btn pf-btn-secondary'} style={buttonStyle}>
        <IconQrCode />{!iconOnly && 'QR Code'}
      </button>

      {open && (
        <div className="pf-modal-overlay" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="pf-modal-card pf-modal-wine" style={{ maxWidth: 340 }}>
            <div style={{ position: 'relative', textAlign: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1.4rem' }}>Client QR Code</h3>
              <button onClick={() => setOpen(false)} style={{ position: 'absolute', top: 0, right: 0, background: 'none', border: 'none', color: '#E8B9C6', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <ClientQrDisplay ref={ref} clientId={clientId} clientLabel={clientLabel} />

            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button onClick={() => setOpen(false)} className="pf-btn pf-btn-secondary"><IconX />Close</button>
              <button onClick={download} disabled={saving} className="pf-btn">
                <IconDownload />{saving ? 'Saving…' : 'Download'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
