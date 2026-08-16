// How a client reached us for a given JO — matches job_orders.source_channel's check
// constraint (migration 028). Captured on New JO/Add Historical Records, correctable
// via Edit JO, so a channel is traceable if an issue comes up later.
export const JO_SOURCE_CHANNELS = ['Walk-in', 'Messenger', 'Viber', 'WhatsApp', 'Phone Call', 'Email'] as const

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

// Not sequence-numbered (was `${jobOrderId}-PAY-${seq}`) — that collided with
// payments_pkey whenever a JO's payment history had a gap (a payment deleted, or
// two staff editing the same JO around the same time), since seq was derived from
// how many payments happened to be loaded locally rather than the true DB state.
export function generatePaymentId(jobOrderId: string): string {
  const rand = Math.floor(Math.random() * 900000) + 100000
  return `${jobOrderId}-PAY-${Date.now()}-${rand}`
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

// Suggests a category_id in the existing "CAT_XXX" convention (see PENFIX_CRM master
// list) — just a starting point in the Add Category form; admin can edit it before saving.
export function generateCategoryId(categoryName: string): string {
  const letters = categoryName.toUpperCase().replace(/[^A-Z]/g, '')
  return `CAT_${(letters || 'NEW').slice(0, 3)}`
}

// Suggests a subcategory_id as <category-prefix>-<name-slug>-<random 2 digits>, echoing
// the shape of the seeded IDs (e.g. "ACRYL-CPL01") without trying to replicate their exact
// abbreviations — admin can edit it before saving.
export function generateSubcategoryId(categoryId: string, subcategoryName: string): string {
  const prefix = categoryId.replace(/^CAT_/, '') || 'SUB'
  const slug = subcategoryName.toUpperCase().replace(/[^A-Z0-9]+/g, '').slice(0, 8) || 'ITEM'
  const rand = String(Math.floor(Math.random() * 90) + 10)
  return `${prefix}-${slug}-${rand}`
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

// The JO id, client name, and service used to be passed as URL query params since there was
// nothing to look them up by — that made the link long and put the client's name in plain
// text in a link forwarded through Messenger/Viber. Now the token itself (persisted on the JO
// by the caller — see FeedbackQueueClient.copyLink) is the only thing the link carries; the
// feedback page looks up everything else server-side via job_orders.feedback_token.
export function buildFeedbackUrl(origin: string, token: string): string {
  return `${origin}/feedback/${token}`
}

// The message staff paste into Messenger/Viber. A single clean link reads as legitimate —
// five stacked star-rating links (one per `r=N`) looked like a phishing/scam message, so the
// client rates on the form itself after opening it instead of via the link they tap.
export function buildFeedbackMessage(feedbackUrl: string, clientName: string): string {
  return `A brilliant day po, ${clientName}! \n\nThank you so much for trusting Penfix! 💙\n\nQuick feedback lang po—we’d love to know how we did and how we can continue to serve you better. 😊\n\nPlease tap your preferred rating using the link below. ⭐️\n\n${feedbackUrl}\n\n1-3 minutes lang po ito, promise! 😊\n\nThank you po for your time and support. We truly appreciate it! 💙`
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

// PILOT MODE (turned off 2026-08-11): while we're pilot testing we're not enforcing the 50%
// downpayment rule, because every below-50% JO was landing in the Admin's approval queue and
// clearing that queue by hand had become the bottleneck. Staff are STILL required to type a
// reason why the client can't pay the downpayment (it's saved to job_orders.request_override),
// the reason just no longer holds the job — the JO is stamped 'Approved' on save and production
// can start right away. Flip this back to true once downpayments are established with the
// regular clients: that alone restores the old behaviour everywhere (this file's
// canPushToProduction, plus NewJOModal.tsx / EditJOModal.tsx which stamp the override status).
// JOs auto-approved while this was false stay approved — re-gating only affects new saves.
export const DOWNPAYMENT_GATE_ENABLED = false

// What to stamp on job_orders.override_status when a JO is below the 50% threshold: 'Pending'
// parks it in the Admin's Pending Approval queue, 'Approved' lets it straight through while
// still keeping the typed reason on the record.
export const BELOW_DOWNPAYMENT_OVERRIDE_STATUS = DOWNPAYMENT_GATE_ENABLED ? 'Pending' : 'Approved'

// A JO can't advance past "Received" — not just the fabricator-flagged production step,
// ANY step, including GA-owned ones like layout/design — until either it's settled enough
// (50%+ down, fully paid, or billing) or Admin has approved the override request. Shared by
// EditJOModal.tsx (GA/Admin/Treasury) and ProductionClient.tsx (Fabricator queue) so both
// enforce the exact same rule instead of two independently-maintained copies drifting apart.
export function canPushToProduction(jo: { is_for_billing?: boolean | null; payment_status?: string | null; override_status?: string | null } | null | undefined): boolean {
  if (!jo) return false
  // Pilot mode — nothing is gated on the downpayment. Checked before the payment rules (rather
  // than only auto-approving new saves) so JOs already sitting at 'Pending' from before the
  // switch stop being blocked too, instead of needing one last round of manual approvals.
  if (!DOWNPAYMENT_GATE_ENABLED) return true
  if (jo.is_for_billing) return true
  if (jo.payment_status === 'Fully Paid' || jo.payment_status === 'Downpayment Received') return true
  if (jo.override_status === 'Approved') return true
  return false
}

// An item shouldn't reach a terminal status (Done / dispatched) while money is still owed —
// unlike canPushToProduction above, a 50% downpayment isn't enough here, an Admin override
// doesn't bypass it either (it only unblocks production from starting, not the job shipping
// out unpaid), and being a billing client doesn't bypass it either — a billing client can start
// production without paying up front, but still needs to be fully paid before the item is
// marked done, same as everyone else. Checked against balance_due (the generated
// grand_total - total_amount_paid - discount - cashback_discount column) rather than
// payment_status, because a billing client's payment_status is pinned to 'For Billing' by
// design and would never read 'Fully Paid' even once the balance actually hits zero. Shared by
// DispatchClient.tsx, ProductionClient.tsx, and EditJOModal.tsx so the same rule applies
// everywhere an item's status can be advanced to its terminal step.
export function canMarkItemDone(jo: { balance_due?: number | null } | null | undefined): boolean {
  if (!jo) return false
  return (jo.balance_due ?? Infinity) <= 0
}

// Loyalty program start — purchases before this date don't earn rewards, even if the JO
// happens to get completed (and its rewards recorded) after this date. Also the cutoff for
// "lifetime total" below, so that figure tracks the reward-eligible amount instead of a
// client's full pre-program history. Shared with lib/jo-completion.ts (the actual reward
// ledger gate) so the two dates can't drift apart.
export const REWARDS_START_DATE = new Date('2026-05-01T00:00:00+08:00')

// A job order counts toward a client's "lifetime total" only once it's actually completed
// and paid for, on/after the loyalty program's May 1 start date -- the same gates
// syncJobOrderDoneStatus uses before recording a reward (see lib/jo-completion.ts). Shared so
// "lifetime total" means the same thing everywhere it's shown (Active JOs, Clients list, ...)
// instead of each screen quietly using its own definition -- it exists specifically so staff
// can eyeball it against Earned Rewards as a counter-check (lifetime total × 1% should
// roughly track the rewards balance). Still doesn't exclude billing JOs, which also don't earn
// rewards -- so it's a close anchor, not an exact recomputation of the reward-eligible amount.
export function isLifetimeEligible(jo: { job_status?: string | null; is_fully_paid?: boolean | null; date_time_received?: string | null } | null | undefined): boolean {
  if (!jo) return false
  if (jo.job_status !== 'Done' || !jo.is_fully_paid) return false
  return !!jo.date_time_received && new Date(jo.date_time_received) >= REWARDS_START_DATE
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

// Breaks a single item's stored computed_line_total back down into the price + add-on fees
// that made it up, for the receipt's per-item "computation details" — the fees are stored
// pre-summed into computed_line_total, so the base price line is derived by subtracting them
// back out rather than re-deriving it from pricing_model/width/height (which would drift from
// whatever was actually charged if that item was manually overridden).
export function buildItemCostBreakdown(item: {
  computed_line_total?: number | null
  layout_fee?: number | null
  delivery_fee?: number | null
  installation_fee?: number | null
  seaming_fee?: number | null
} | null | undefined): { label: string; amount: number }[] {
  if (!item) return []
  const layoutFee = item.layout_fee || 0
  const deliveryFee = item.delivery_fee || 0
  const installationFee = item.installation_fee || 0
  const seamingFee = item.seaming_fee || 0
  const basePrice = (item.computed_line_total || 0) - layoutFee - deliveryFee - installationFee - seamingFee
  const rows = [{ label: 'Item Price', amount: basePrice }]
  if (layoutFee > 0) rows.push({ label: 'Layout & Design Fee', amount: layoutFee })
  if (deliveryFee > 0) rows.push({ label: 'Delivery Fee', amount: deliveryFee })
  if (installationFee > 0) rows.push({ label: 'Installation Fee', amount: installationFee })
  if (seamingFee > 0) rows.push({ label: 'Seaming Fee', amount: seamingFee })
  return rows
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
