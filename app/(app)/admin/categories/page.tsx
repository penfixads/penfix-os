import { getCurrentUser } from '@/lib/user'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import CategoriesClient from './CategoriesClient'

export default async function CategoriesPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (user.role !== 'Admin') redirect('/jos/today')

  const supabase = createSupabaseServerClient()
  const [{ data: categories }, { data: subcategories }] = await Promise.all([
    supabase.from('categories').select('*').order('category_name'),
    supabase.from('subcategories').select('subcategory_id, subcategory_name, category_id, subcategory_type, description, pricing_model, base_price, unit, active').order('subcategory_name'),
  ])

  return <CategoriesClient categories={categories || []} subcategories={subcategories || []} />
}
