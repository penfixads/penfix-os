import QRCode from 'qrcode'
import { buildClientJoLink } from '@/lib/jo-helpers'

// Renders the exact same loyalty-card layout as ClientQrDisplay.tsx, but via native
// Canvas 2D drawing instead of html2canvas capturing a live DOM node. html2canvas's own
// text layout doesn't reliably match a given CSS `top`/`line-height` — confirmed twice,
// with different (and inconsistent-across-browsers) vertical offsets each time. Canvas
// `fillText` with `textBaseline: 'top'` has no such ambiguity: the glyph top always lands
// exactly at the y you specify, the same way in every browser.
//
// Coordinates are in the card's native 350x220 design space — `ctx.scale(SCALE, SCALE)`
// maps that onto a (350*SCALE)x(220*SCALE) canvas, so every number below matches what
// you'd measure directly on the 350x220 template image regardless of SCALE.
const SCALE = 3 // 3x = 1050x660 download — sharper than the original 2x, still a downscale
// from the QR source below (not an upscale, which would blur it) and a mild upscale of the
// 525x330 background JPEG (unavoidable without a higher-res source template).

export async function generateLoyaltyCardDataUrl(clientId: string, clientLabel: string, origin: string): Promise<string> {
  const canvas = document.createElement('canvas')
  canvas.width = 350 * SCALE
  canvas.height = 220 * SCALE
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported')
  ctx.scale(SCALE, SCALE)

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  const bg = await loadImage('/loyalty-card-template.jpg')
  ctx.drawImage(bg, 0, 0, 350, 220)

  // QR — centered over "Valid until 01/27", moved up slightly from directly touching it.
  const qrValue = buildClientJoLink(origin, clientId)
  const qrDataUrl = await QRCode.toDataURL(qrValue, { margin: 0, width: 300 })
  const qrImg = await loadImage(qrDataUrl)
  ctx.fillStyle = '#fff'
  roundRect(ctx, 237, 30, 76, 76, 4)
  ctx.fill()
  // QR modules must stay crisp black/white — smoothing would blur their edges and hurt
  // scannability, unlike the background photo which benefits from smoothing.
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(qrImg, 241, 34, 68, 68)
  ctx.imageSmoothingEnabled = true

  // I.D NO. / NAME values — left-aligned with each other, pixel-matched to the template's
  // own printed labels (measured directly off the template image).
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 8px Arial, Helvetica, sans-serif'
  ctx.textBaseline = 'top'
  drawTruncated(ctx, clientId, 248, 137, 98)
  drawTruncated(ctx, clientLabel, 248, 151, 98)

  return canvas.toDataURL('image/png')
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load ${src}`))
    img.src = src
  })
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

// Truncates with an ellipsis if the text won't fit in maxWidth — same intent as the
// CSS text-overflow:ellipsis on the live preview, just computed manually since canvas
// text has no such built-in behavior.
function drawTruncated(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number) {
  let t = text
  if (ctx.measureText(t).width > maxWidth) {
    while (t.length > 1 && ctx.measureText(t + '…').width > maxWidth) {
      t = t.slice(0, -1)
    }
    t += '…'
  }
  ctx.fillText(t, x, y)
}
