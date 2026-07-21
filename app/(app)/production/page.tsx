import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/user'
import { redirect } from 'next/navigation'
import ProductionClient from './ProductionClient'

export default async function ProductionPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (!['Admin', 'GA', 'Treasury', 'Fabricator'].includes(user.role)) redirect('/jos/active')

  const supabase = createSupabaseServerClient()

  const { data: items, error: itemsError } = await supabase
    .from('job_order_items')
    .select(`
      *,
      job_orders(
        job_order_id, payment_status, override_status, client_id, is_for_billing,
        received_by, source_channel,
        clients(client_name, company_name, contact_number)
      ),
      subcategories(subcategory_name, category_id, job_flow)
    `)
    .not('job_status', 'in', '("Done","Cancelled","Unclaimed")')
    .order('date_time_needed', { ascending: true, nullsFirst: false })

  if (itemsError) console.error('Production queue query failed:', itemsError.message)

  // subcategory_sop has 1200+ rows across all 221 subcategories — well past Supabase's
  // 1000-row-per-request cap, which was silently truncating the terminal step off of most
  // subcategories' checklists. Scope the query to only the subcategories actually in the
  // queue instead of pulling the whole table.
  const subcategoryIds = Array.from(new Set((items || []).map(i => i.subcategory_id).filter(Boolean)))
  const itemIds = (items || []).map(i => i.item_id)

  const [{ data: sopSteps }, { data: staff }, { data: categories }, { data: subcategories }, { data: statusLogs }] = await Promise.all([
    subcategoryIds.length > 0
      ? supabase.from('subcategory_sop').select('*').eq('is_active', true).in('subcategory_id', subcategoryIds).order('sequence')
      : Promise.resolve({ data: [] }),
    // Fabricators, GAs, and Treasury (who sometimes help on the floor) who can be tagged
    // as having worked together on a step
    supabase.from('users').select('user_email, name, role').in('role', ['Fabricator', 'GA', 'Treasury']).eq('is_active', true).order('name'),
    supabase.from('categories').select('*').eq('is_active', true).order('category_name'),
    supabase.from('subcategories').select('*').eq('active', true).order('subcategory_name'),
    itemIds.length > 0
      ? supabase.from('job_order_item_status_log').select('item_id, status_name, changed_by_name').in('item_id', itemIds)
      : Promise.resolve({ data: [] }),
  ])

  return (
    <ProductionClient
      items={items || []}
      sopSteps={sopSteps || []}
      staff={staff || []}
      statusLogs={statusLogs || []}
      categories={categories || []}
      subcategories={subcategories || []}
      currentUser={user}
    />
  )
}
