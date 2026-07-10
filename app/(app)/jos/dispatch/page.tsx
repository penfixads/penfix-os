import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/user'
import { redirect } from 'next/navigation'
import { getEffectiveSteps } from '@/lib/jo-helpers'
import DispatchClient from './DispatchClient'

export default async function DispatchPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const supabase = createSupabaseServerClient()

  const { data: items } = await supabase
    .from('job_order_items')
    .select(`
      *,
      job_orders(
        job_order_id, payment_status, balance_due, grand_total,
        clients(client_name, company_name, contact_number)
      ),
      subcategories(subcategory_name, job_flow)
    `)
    .not('job_status', 'in', '("Done","Cancelled","Unclaimed")')
    .order('date_time_needed', { ascending: true, nullsFirst: false })

  // subcategory_sop has 1200+ rows across all 221 subcategories — well past Supabase's
  // 1000-row-per-request cap, which was silently truncating the terminal step off of most
  // subcategories' checklists. Scope the query to only the subcategories actually in play.
  const subcategoryIds = Array.from(new Set((items || []).map(i => i.subcategory_id).filter(Boolean)))
  const { data: sopSteps } = subcategoryIds.length > 0
    ? await supabase.from('subcategory_sop').select('*').eq('is_active', true).in('subcategory_id', subcategoryIds).order('sequence')
    : { data: [] }

  const sopBySubcategory: Record<string, any[]> = {}
  for (const s of sopSteps || []) {
    if (!sopBySubcategory[s.subcategory_id]) sopBySubcategory[s.subcategory_id] = []
    sopBySubcategory[s.subcategory_id].push(s)
  }

  // "Ready for dispatch" means the item has reached the terminal step of its own flow
  // (curated SOP or job_flow fallback) — not a fixed list of status name strings, since
  // those vary per subcategory (e.g. "Ready For Pickup/Delivery/Installation"). Once
  // dispatched, an item moves to Done and drops off this queue — it's still visible in
  // All Job Order Items for the historical record.
  const readyItems = (items || []).filter(item => {
    const steps = getEffectiveSteps(sopBySubcategory[item.subcategory_id] || [], item.subcategories?.job_flow)
    return !!steps.find(s => s.status_name === item.job_status)?.is_terminal
  })

  return <DispatchClient items={readyItems} currentUser={user} />
}
