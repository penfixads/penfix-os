import jsQR from 'jsqr'

// A client's QR encodes a deep link built by buildClientJoLink (jo-helpers.ts)
// — extract the client_id from that, but fall back to treating the decoded
// value as a bare client_id in case an older-format QR (pre-deep-link) or the
// shop's own QR ever gets scanned here.
export function extractClientIdFromQr(raw: string): string | null {
  try {
    const url = new URL(raw)
    const id = url.searchParams.get('client')
    if (id) return id
  } catch {
    // Not a URL — fall through to treating it as a bare client_id.
  }
  const trimmed = raw.trim()
  return trimmed || null
}

// Mirrors the shop's app/HelpDeskModals.tsx decodeQrFromFile — same
// canvas + jsQR approach so an uploaded photo/screenshot of a client's QR
// can stand in for an actual phone-camera scan.
export function decodeQrFromFile(file: File): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      URL.revokeObjectURL(url)
      if (!ctx) { resolve(null); return }
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, imageData.width, imageData.height)
      resolve(code?.data ?? null)
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image.')) }
    img.src = url
  })
}
