'use server'

import bcrypt from 'bcryptjs'
import { getCurrentUser } from '@/lib/user'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { creditReferralIfEligible } from '@/lib/referral-rewards'

// Admin-only, same as the Credit Line toggle in this same Edit Client form — this sets
// what the client types into shop.penfixads.com's login (see shop's app/actions.ts
// loginClient/registerClient, which hash with the same bcryptjs cost factor of 10).
export async function setClientPassword(clientId: string, newPassword: string) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'Admin') return { success: false, message: 'Unauthorized' }
  if (!newPassword || newPassword.length < 6) return { success: false, message: 'Password must be at least 6 characters.' }

  const password_hash = await bcrypt.hash(newPassword, 10)
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.from('clients').update({ password_hash }).eq('client_id', clientId)
  if (error) return { success: false, message: error.message || 'Failed to set password.' }
  return { success: true }
}

// Called after the Edit Client form saves a referred_by_client_id (newly linked, or
// corrected from an unresolved Messenger/Viber name typed at shop registration) — checks
// whether the referred client already completed their first qualifying JO before the
// link existed, and if so credits the referrer's +20 now instead of it being missed.
// Safe to call unconditionally on every save that has a referred_by_client_id; the
// ledger_id inside creditReferralIfEligible makes repeat calls a no-op once paid.
export async function syncReferralCredit(clientId: string) {
  const user = await getCurrentUser()
  if (!user) return { success: false, message: 'Unauthorized' }
  const supabase = createSupabaseAdminClient()
  await creditReferralIfEligible(supabase, clientId)
  return { success: true }
}

// Merges two client records confirmed by an Admin to be the same client (e.g. "Karyl
// Santiago" / "Karyl Collene Santiago") — moves every job_order/payment/rewards_ledger/
// rewards_redemptions row from `sourceClientId` onto `targetClientId`, then writes
// `fields` (the admin's per-field picks from the merge screen) onto the target. The
// source client row is intentionally left in place with zero linked records rather than
// deleted, so the merge is inspectable/reversible by re-pointing rows back if needed.
export async function mergeClients(
  targetClientId: string,
  sourceClientId: string,
  fields: Record<string, string | boolean | null>
) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'Admin') return { success: false, message: 'Unauthorized' }
  if (!targetClientId || !sourceClientId || targetClientId === sourceClientId) {
    return { success: false, message: 'Pick two different clients to merge.' }
  }

  const supabase = createSupabaseAdminClient()

  const { count: joCount } = await supabase
    .from('job_orders')
    .select('job_order_id', { count: 'exact', head: true })
    .eq('client_id', sourceClientId)

  const { error: joErr } = await supabase.from('job_orders').update({ client_id: targetClientId }).eq('client_id', sourceClientId)
  if (joErr) return { success: false, message: `Failed moving job orders: ${joErr.message}` }

  const { error: paymentsErr } = await supabase.from('payments').update({ client_id: targetClientId }).eq('client_id', sourceClientId)
  if (paymentsErr) return { success: false, message: `Failed moving payments: ${paymentsErr.message}` }

  const { error: ledgerErr } = await supabase.from('rewards_ledger').update({ client_id: targetClientId }).eq('client_id', sourceClientId)
  if (ledgerErr) return { success: false, message: `Failed moving rewards history: ${ledgerErr.message}` }

  const { error: redemptionsErr } = await supabase.from('rewards_redemptions').update({ client_id: targetClientId }).eq('client_id', sourceClientId)
  if (redemptionsErr) return { success: false, message: `Failed moving rewards redemptions: ${redemptionsErr.message}` }

  if (Object.keys(fields).length > 0) {
    const { error: updateErr } = await supabase.from('clients').update(fields).eq('client_id', targetClientId)
    if (updateErr) return { success: false, message: `Records were moved, but updating the kept client's details failed: ${updateErr.message}` }
  }

  return { success: true, jobOrdersMoved: joCount ?? 0 }
}
