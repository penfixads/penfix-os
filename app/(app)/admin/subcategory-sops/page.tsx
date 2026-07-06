import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/user'
import { redirect } from 'next/navigation'
import SubcategorySopsClient from './SubcategorySopsClient'

// This admin page manages every subcategory's SOP, so (unlike the item-checklist pages)
// it genuinely needs every row — subcategory_sop alone has 1200+ rows across 221
// subcategories, past Supabase's 1000-row-per-request cap, so it has to be paged through.
async function fetchAllRows(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  table: string,
  selectExpr: string,
  orderCols: string[],
  activeOnly = false,
) {
  const pageSize = 1000
  let all: any[] = []
  let from = 0
  while (true) {
    let query = supabase.from(table).select(selectExpr).range(from, from + pageSize - 1)
    if (activeOnly) query = query.eq('is_active', true)
    for (const col of orderCols) query = query.order(col)
    const { data } = await query
    all = all.concat(data || [])
    if (!data || data.length < pageSize) break
    from += pageSize
  }
  return all
}

export default async function SubcategorySopsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (user.role !== 'Admin') redirect('/jos/active')

  const supabase = createSupabaseServerClient()

  const [{ data: subcategories }, { data: categories }, sopSteps, procedures] = await Promise.all([
    supabase.from('subcategories').select('subcategory_id, subcategory_name, category_id').order('subcategory_name'),
    supabase.from('categories').select('category_id, category_name').order('category_name'),
    fetchAllRows(supabase, 'subcategory_sop', '*', ['subcategory_id', 'sequence']),
    fetchAllRows(supabase, 'subcategory_sop_procedures', '*', ['sequence'], true),
  ])

  return (
    <SubcategorySopsClient
      subcategories={subcategories || []}
      categories={categories || []}
      sopSteps={sopSteps || []}
      procedures={procedures || []}
    />
  )
}
