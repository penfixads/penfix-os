// Loyalty program start — purchases before this date don't earn rewards, even if the JO
// happens to get completed (and its rewards recorded) after this date.
const REWARDS_START_DATE = new Date('2026-05-01T00:00:00+08:00')

// Call after any job_order_item's job_status changes. Rolls the parent job_order up to
// 'Done' (so it drops off Active JOs) once every item is Done/Cancelled AND the JO is
// settled (fully paid, or on an approved billing arrangement), and records the loyalty
// reward earned. This must run from every place an item status can change (Production
// checklist, Edit JO modal, Dispatch) — not just Dispatch — since items can reach a
// terminal status without ever going through Dispatch.
export async function syncJobOrderDoneStatus(supabase: any, joId: string) {
  const [{ data: siblings }, { data: jo }] = await Promise.all([
    supabase.from('job_order_items').select('item_id, job_status').eq('job_order_id', joId),
    supabase.from('job_orders').select('is_fully_paid, grand_total, client_id, is_for_billing, date_time_received, job_status').eq('job_order_id', joId).single(),
  ])
  if (!jo || jo.job_status === 'Done') return

  const allDone = (siblings || []).length > 0 && siblings.every((s: any) => s.job_status === 'Done' || s.job_status === 'Cancelled')
  const isSettled = !!jo.is_fully_paid || !!jo.is_for_billing
  if (!allDone || !isSettled) return

  await supabase.from('job_orders').update({ job_status: 'Done' }).eq('job_order_id', joId)

  // Record earned rewards in ledger only when fully paid, all done, and the JO was
  // actually received on/after the loyalty program's start date — a JO backdated to
  // before then (e.g. via Add Historical Records) shouldn't earn rewards just because
  // it happens to get completed today.
  const purchasedAfterRewardsStart = !!jo.date_time_received && new Date(jo.date_time_received) >= REWARDS_START_DATE
  if (jo.is_fully_paid && !jo.is_for_billing && jo.client_id && purchasedAfterRewardsStart) {
    const ledgerId = `EARN-${joId}`
    const { data: existing } = await supabase.from('rewards_ledger').select('ledger_id').eq('ledger_id', ledgerId).single()
    if (!existing) {
      await supabase.from('rewards_ledger').insert({
        ledger_id: ledgerId,
        client_id: jo.client_id,
        job_order_id: joId,
        type: 'earned',
        amount: (jo.grand_total || 0) * 0.01,
        notes: `Rewards for JO ${joId}`,
      })
    }
  }
}
