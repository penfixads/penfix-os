import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/user'
import { redirect } from 'next/navigation'
import SubcategorySopsClient from './SubcategorySopsClient'

export default async function SubcategorySopsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (user.role !== 'Admin') redirect('/jos/active')

  const supabase = createSupabaseServerClient()

  const [{ data: subcategories }, { data: categories }, { data: sopSteps }] = await Promise.all([
    supabase.from('subcategories').select('subcategory_id, subcategory_name, category_id').order('subcategory_name'),
    supabase.from('categories').select('category_id, category_name').order('category_name'),
    supabase.from('subcategory_sop').select('*').order('subcategory_id').order('sequence'),
  ])

  return (
    <SubcategorySopsClient
      subcategories={subcategories || []}
      categories={categories || []}
      sopSteps={sopSteps || []}
    />
  )
}
