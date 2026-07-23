// Same idea as lib/client-dedupe.ts, applied to Purchases, Supplier Deliveries, and Overhead
// Expenses — flags a likely-duplicate entry (same supplier/expense, same date or month, similar
// specs/name) before it's saved, so staff get asked to confirm instead of silently logging the
// same purchase or expense twice.

import { normalizeText, textSimilarity } from './text-similarity'

const SIMILARITY_THRESHOLD = 0.8

export interface PurchaseCandidate {
  purchase_id: string
  purchase_date: string
  supplier_name: string
  specs: string
  amount?: number | null
}

export interface DeliveryCandidate {
  delivery_id: string
  delivery_date: string
  supplier_name: string
  specs: string
  unit_price?: number | null
}

export interface ExpenseCandidate {
  overhead_id: string
  month: string
  expense_name: string
  amount?: number | null
}

export interface RecordMatch<T> {
  record: T
  reason: 'exact' | 'similar'
}

// Same supplier (exact) + same date is the trigger — specs similarity only decides exact vs
// similar, since staff re-entering the same delivery slip almost always keeps the date/supplier
// identical but may reword the specs slightly.
export function findLikelyDuplicatePurchases(
  input: { purchaseDate: string; supplierName: string; specs: string },
  candidates: PurchaseCandidate[],
  excludeId?: string
): RecordMatch<PurchaseCandidate>[] {
  const supplier = normalizeText(input.supplierName)
  const specs = normalizeText(input.specs)
  if (!supplier || !input.purchaseDate) return []

  const matches: RecordMatch<PurchaseCandidate>[] = []
  for (const c of candidates) {
    if (excludeId && c.purchase_id === excludeId) continue
    if (c.purchase_date !== input.purchaseDate) continue
    if (normalizeText(c.supplier_name) !== supplier) continue
    const sim = textSimilarity(specs, normalizeText(c.specs))
    if (sim === 1) matches.push({ record: c, reason: 'exact' })
    else if (sim >= SIMILARITY_THRESHOLD) matches.push({ record: c, reason: 'similar' })
  }
  return matches.slice(0, 5)
}

export function findLikelyDuplicateDeliveries(
  input: { deliveryDate: string; supplierName: string; specs: string },
  candidates: DeliveryCandidate[],
  excludeId?: string
): RecordMatch<DeliveryCandidate>[] {
  const supplier = normalizeText(input.supplierName)
  const specs = normalizeText(input.specs)
  if (!supplier || !input.deliveryDate) return []

  const matches: RecordMatch<DeliveryCandidate>[] = []
  for (const c of candidates) {
    if (excludeId && c.delivery_id === excludeId) continue
    if (c.delivery_date !== input.deliveryDate) continue
    if (normalizeText(c.supplier_name) !== supplier) continue
    const sim = textSimilarity(specs, normalizeText(c.specs))
    if (sim === 1) matches.push({ record: c, reason: 'exact' })
    else if (sim >= SIMILARITY_THRESHOLD) matches.push({ record: c, reason: 'similar' })
  }
  return matches.slice(0, 5)
}

// Overhead expenses recur monthly (rent, salaries, utilities), so the trigger is the same
// month + a similar expense name — e.g. "Electric Bill" entered twice for June.
export function findLikelyDuplicateExpenses(
  input: { month: string; expenseName: string },
  candidates: ExpenseCandidate[],
  excludeId?: string
): RecordMatch<ExpenseCandidate>[] {
  const name = normalizeText(input.expenseName)
  if (!name || !input.month) return []

  const matches: RecordMatch<ExpenseCandidate>[] = []
  for (const c of candidates) {
    if (excludeId && c.overhead_id === excludeId) continue
    if (c.month !== input.month) continue
    const cName = normalizeText(c.expense_name)
    const sim = textSimilarity(name, cName)
    if (sim === 1) matches.push({ record: c, reason: 'exact' })
    else if (sim >= SIMILARITY_THRESHOLD) matches.push({ record: c, reason: 'similar' })
  }
  return matches.slice(0, 5)
}
