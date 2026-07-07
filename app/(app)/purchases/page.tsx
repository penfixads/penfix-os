import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/user'
import { redirect } from 'next/navigation'
import PurchasesClient from './PurchasesClient'

export default async function PurchasesPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (user.role !== 'Admin' && user.role !== 'Treasury') redirect('/jos/active')

  const supabase = createSupabaseServerClient()
  const { data: purchases } = await supabase
    .from('purchases')
    .select('*')
    .order('purchase_date', { ascending: false })

  return <PurchasesClient purchases={purchases || []} currentUser={user} />
}
