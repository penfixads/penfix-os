'use client'

import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'

// Captures whatever DOM node `ref` is attached to as a PNG and triggers a download.
// Shared by every "save this client's QR" surface (Clients page, post-registration).
export function useQrDownload(filename: string) {
  const ref = useRef<HTMLDivElement>(null)
  const [saving, setSaving] = useState(false)

  async function download() {
    if (!ref.current) return
    setSaving(true)
    try {
      const canvas = await html2canvas(ref.current, { backgroundColor: '#ffffff', scale: 2 })
      const url = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
    } finally {
      setSaving(false)
    }
  }

  return { ref, saving, download }
}
