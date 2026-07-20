export const MAX_LAYOUT_BYTES = 20 * 1024
// Item cards on the public tracker only ever show this at 56x56 CSS px — a separate, much
// smaller thumbnail keeps that page light instead of shipping the full ~20KB preview just to
// display it tiny.
export const MAX_THUMB_BYTES = 5 * 1024
export const MAX_THUMB_DIM = 200

// Resizes/re-encodes as JPEG, backing off dimensions then quality, until the data URL's
// underlying byte size is under the target — images get stored inline as a text column
// (e.g. job_order_items.item_preview), not a storage bucket, so they need to stay small.
export async function compressImageToDataUrl(file: File, maxBytes = MAX_LAYOUT_BYTES, startDim = 1200): Promise<{ dataUrl: string; bytes: number }> {
  const objectUrl = URL.createObjectURL(file)
  let img: HTMLImageElement
  try {
    img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = () => reject(new Error('Could not read image file.'))
      image.src = objectUrl
    })
  } finally {
    URL.revokeObjectURL(objectUrl)
  }

  let maxDim = Math.min(startDim, Math.max(img.width, img.height))
  let quality = 0.85
  let dataUrl = ''
  let bytes = Infinity

  for (let i = 0; i < 25 && bytes > maxBytes && maxDim >= 20; i++) {
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
    const w = Math.max(1, Math.round(img.width * scale))
    const h = Math.max(1, Math.round(img.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) break
    ctx.drawImage(img, 0, 0, w, h)
    dataUrl = canvas.toDataURL('image/jpeg', quality)
    bytes = Math.round((dataUrl.length - (dataUrl.indexOf(',') + 1)) * 0.75)

    if (bytes > maxBytes) {
      if (quality > 0.35) quality -= 0.1
      else maxDim = Math.round(maxDim * 0.85)
    }
  }
  return { dataUrl, bytes }
}
