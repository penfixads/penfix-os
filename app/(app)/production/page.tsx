import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/user'
import { redirect } from 'next/navigation'
import ProductionClient from './ProductionClient'

export default async function ProductionPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (!['Admin', 'GA', 'Treasury', 'Fabricator'].includes(user.role)) redirect('/jos/active')

  const supabase = createSupabaseServerClient()

  const [{ data: items, error: itemsError }, { data: sopSteps }, { data: staff }, { data: categories }, { data: subcategories }] = await Promise.all([
    supabase
      .from('job_order_items')
      .select(`
        *,
        job_orders(
          job_order_id, payment_status, override_status, client_id, is_for_billing,
          clients(client_name, company_name)
        ),
        subcategories(subcategory_name, category_id, job_flow)
      `)
      .not('job_status', 'in', '("Done","Cancelled")')
      .order('date_time_needed', { ascending: true, nullsFirst: false }),
    supabase.from('subcategory_sop').select('*').eq('is_active', true).order('sequence'),
    // Fabricators and GAs who can be tagged as having worked together on a step
    supabase.from('users').select('user_email, name, role').in('role', ['Fabricator', 'GA']).eq('is_active', true).order('name'),
    supabase.from('categories').select('*').eq('is_active', true).order('category_name'),
    supabase.from('subcategories').select('*').eq('active', true).order('subcategory_name'),
  ])

  if (itemsError) console.error('Production queue query failed:', itemsError.message)

  const itemIds = (items || []).map(i => i.item_id)
  const { data: statusLogs } = itemIds.length > 0
    ? await supabase.from('job_order_item_status_log').select('item_id, status_name, changed_by_name').in('item_id', itemIds)
    : { data: [] }

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
