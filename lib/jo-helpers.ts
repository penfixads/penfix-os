export function generateJobOrderId(seq: number, date: Date = new Date()): string {
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const yyyy = date.getFullYear()
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

export function generateDeliveryId(): string {
  const now = new Date()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const yy = String(now.getFullYear()).slice(2)
  const rand = String(Math.floor(Math.random() * 9000000) + 1000000)
  return `DEL${mm}${dd}${yy}-${rand}`
}

export function generatePurchaseId(): string {
  const now = new Date()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const yy = String(now.getFullYear()).slice(2)
  const rand = String(Math.floor(Math.random() * 9000000) + 1000000)
  return `PUR${mm}${dd}${yy}-${rand}`
}

export function generateOverheadId(): string {
  const now = new Date()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const yy = String(now.getFullYear()).slice(2)
  const rand = String(Math.floor(Math.random() * 9000000) + 1000000)
  return `OVH${mm}${dd}${yy}-${rand}`
}

// A delivery received this month is billed via next month's cheque — "2026-07-15" received
// becomes billing_month "2026-08-01" (always normalized to the 1st, since only the month matters).
export function nextMonthFirst(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const next = new Date(d.getFullYear(), d.getMonth() + 1, 1)
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-01`
}

export function generateFeedbackToken(): string {
  return Array.from({ length: 12 }, () => Math.floor(Math.random() * 36).toString(36)).join('')
}

export function buildFeedbackUrl(origin: string, jobOrderId: string, clientName: string): string {
  const token = generateFeedbackToken()
  return `${origin}/feedback/${token}?jo=${encodeURIComponent(jobOrderId)}&name=${encodeURIComponent(clientName)}`
}

// Scanning a client's QR (printed, or shown on their phone from shop.penfixads.com) should
// drop staff straight into a pre-filled New JO instead of a dead client_id string — this is
// what that QR encodes. Lands on Today's Received JOs since a scan only happens when a
// client is physically here starting a transaction.
export function buildClientJoLink(origin: string, clientId: string): string {
  return `${origin}/jos/today?client=${encodeURIComponent(clientId)}`
}

// Plain .includes() search fails when staff type a name without the spaces the client
// record has (e.g. "mariposa" vs stored "Mari Posa") — strip whitespace from both sides
// so search matches regardless of spacing.
export function fuzzyMatch(text: string, query: string): boolean {
  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, '')
  return norm(text).includes(norm(query))
}

export function formatPeso(amount: number): string {
  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// Multiple proponents on one status step (e.g. "Maria Clara Santos, Juan Dela Cruz, ...")
// gets unreadable fast on a receipt sized for a phone screen — initials keep it scannable.
export function nameInitials(name: string): string {
  return name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase()
}

export function formatAge(dateStr: string): string {
  const ms = Math.max(0, Date.now() - new Date(dateStr).getTime())
  const days = Math.floor(ms / (1000 * 60 * 60 * 24))
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((ms / (1000 * 60)) % 60)
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
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

// Splits the legacy freeform `subcategories.job_flow` text into individual step names,
// trimmed and de-duped (some entries have "For Production" listed twice, inconsistent
// spacing, etc.) — used as a fallback status list until real subcategory_sop steps exist.
export function parseJobFlow(jobFlow: string | null | undefined): string[] {
  if (!jobFlow) return []
  const seen = new Set<string>()
  const result: string[] = []
  for (const raw of jobFlow.split(',')) {
    const name = raw.trim()
    if (name && !seen.has(name)) {
      seen.add(name)
      result.push(name)
    }
  }
  return result
}

export interface StatusStep {
  status_name: string
  sequence: number
  is_terminal: boolean
  is_production_start: boolean
  visible_to_client: boolean
}

// Prefers real subcategory_sop steps; falls back to parsing job_flow (excluding "Done"/
// "Cancelled", which are handled by the Dispatch flow and Cancel button respectively, not
// this dropdown) so the status dropdown has real options before SOPs are set up.
export function getEffectiveSteps(sopSteps: any[], jobFlow: string | null | undefined): StatusStep[] {
  if (sopSteps.length > 0) return sopSteps
  const parsed = parseJobFlow(jobFlow).filter(s => s !== 'Done' && s !== 'Cancelled')
  return parsed.map((status_name, i) => ({
    status_name,
    sequence: i + 1,
    is_terminal: i === parsed.length - 1,
    is_production_start: false,
    visible_to_client: false,
  }))
}

export function getNextJOSequence(existingIds: string[], dateStr: string): number {
  // dateStr format: MMDDYYYY
  const prefix = `JO-${dateStr}-`
  const seqs = existingIds
    .filter(id => id.startsWith(prefix))
    .map(id => parseInt(id.replace(prefix, '')) || 0)
  return seqs.length > 0 ? Math.max(...seqs) + 1 : 1
}

// The Node process running this code (dev, or Vercel) may run in UTC, not Philippine Time —
// `new Date().toISOString().split('T')[0]` silently lags PH by up to 8 hours. These force
// Asia/Manila (UTC+8, same offset as Singapore) regardless of the server/browser's own timezone.
export function getPhilippineDateStr(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
}

export function getPhilippineDayBoundsUTC(dateStr: string): { startUTC: string; endUTC: string } {
  const start = new Date(`${dateStr}T00:00:00+08:00`)
  const end = new Date(`${dateStr}T23:59:59.999+08:00`)
  return { startUTC: start.toISOString(), endUTC: end.toISOString() }
}

export function getPhilippineDayOfWeek(dateStr: string): number {
  // 0=Sun...6=Sat. Noon UTC avoids any day-boundary edge case entirely.
  return new Date(`${dateStr}T12:00:00Z`).getUTCDay()
}

// Formats an ISO string for a <input type="datetime-local"> value, in the browser's local time.
export function toLocalDateTimeInput(isoString: string): string {
  const d = new Date(isoString)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
