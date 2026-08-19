import { REWARDS_START_DATE } from './jo-helpers'

const REFERRAL_BONUS = 20

// Credits the referrer +20 once their referred client's first Done + fully-paid JO
// (received on/after the loyalty program's start date, and not a billing JO — same
// gates as the ordinary 1% earn credit) exists. Called from two places, so a referral
// pays out whichever happens first:
//   - syncJobOrderDoneStatus (lib/jo-completion.ts), when that qualifying JO itself completes
//   - the Clients page, when staff link (or correct) a client's referred_by_client_id —
//     which may happen well after the friend already ordered, e.g. resolving a
//     Messenger-name referral typed at registration that couldn't be auto-matched
// Both funnel through here so "first qualifying JO" is defined exactly once, and the
// ledger_id is tied to that JO (not to when this happened to run), so calling this
// repeatedly — from either path, for the same client — never double-credits.
export async function creditReferralIfEligible(supabase: any, clientId: string) {
  const { data: client } = await supabase
    .from('clients')
    .select('referred_by_client_id')
    .eq('client_id', clientId)
    .single()
  if (!client?.referred_by_client_id) return

  const { data: jos } = await supabase
    .from('job_orders')
    .select('job_order_id, date_time_received')
    .eq('client_id', clientId)
    .eq('job_status', 'Done')
    .eq('is_fully_paid', true)
    .eq('is_for_billing', false)
    .gte('date_time_received', REWARDS_START_DATE.toISOString())
    .order('date_time_received', { ascending: true })
    .limit(1)
  const firstJo = jos?.[0]
  if (!firstJo) return

  const ledgerId = `REFERRAL-${firstJo.job_order_id}`
  const { data: existing } = await supabase.from('rewards_ledger').select('ledger_id').eq('ledger_id', ledgerId).single()
  if (existing) return

  await supabase.from('rewards_ledger').insert({
    ledger_id: ledgerId,
    client_id: client.referred_by_client_id,
    job_order_id: firstJo.job_order_id,
    type: 'earned',
    amount: REFERRAL_BONUS,
    notes: `Referral bonus for referring ${clientId}`,
  })
}
