export function generateJobOrderId(seq: number): string {
  const now = new Date()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const yyyy = now.getFullYear()
  return `JO-${mm}${dd}${yyyy}-${String(seq).padStart(3, '0')}`
}

export function generateItemId(jobOrderId: string, seq: number): string {
  return `${jobOrderId}-ITEM-${seq}`
}

export function generateClientId(): string {
  const now = new Date()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const yy = String(now.getFullYear()).slice(2)
  const rand = String(Math.floor(Math.random() * 9000000) + 1000000)
  return `C${mm}${dd}${yy}-${rand}`
}

export function generatePaymentId(jobOrderId: string, seq: number): string {
  return `${jobOrderId}-PAY-${seq}`
}

export function formatPeso(amount: number): string {
  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function computeLineTotal(
  pricingModel: string,
  basePrice: number,
  width?: number,
  height?: number,
  depth?: number,
  quantity: number = 1,
  noOfMins?: number,
  letterCount?: number,
  discount: number = 0
): number {
  let total = 0
  switch (pricingModel) {
    case 'per_piece':
    case 'fixed':
    case 'per_set':
    case 'per_sheet':
    case 'starts_with':
      total = basePrice * quantity
      break
    case 'area':
      total = basePrice * (width || 0) * (height || 0) * quantity
      break
    case 'dimension':
      total = basePrice * (width || 0) * (height || 0) * quantity
      break
    case 'area_cube':
      total = basePrice * (width || 0) * (height || 0) * (depth || 0) * quantity
      break
    case 'per_minute':
      total = basePrice * (noOfMins || 0) * quantity
      break
    case 'per_lettersqft':
      total = basePrice * (letterCount || 0) * (width || 0) * (height || 0)
      break
    default:
      total = basePrice * quantity
  }
  return Math.max(0, total - discount)
}

export function getNextJOSequence(existingIds: string[], dateStr: string): number {
  // dateStr format: MMDDYYYY
  const prefix = `JO-${dateStr}-`
  const seqs = existingIds
    .filter(id => id.startsWith(prefix))
    .map(id => parseInt(id.replace(prefix, '')) || 0)
  return seqs.length > 0 ? Math.max(...seqs) + 1 : 1
}
