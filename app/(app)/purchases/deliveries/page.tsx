import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/user'
import { redirect } from 'next/navigation'
import SupplierDeliveriesClient from './SupplierDeliveriesClient'

export default async function SupplierDeliveriesPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (user.role !== 'Admin' && user.role !== 'Treasury') redirect('/jos/active')

  const supabase = createSupabaseServerClient()
  const { data: deliveries } = await supabase
    .from('supplier_deliveries')
    .select('*')
    .order('billing_month', { ascending: false })
    .order('delivery_date', { ascending: false })

  return <SupplierDeliveriesClient deliveries={deliveries || []} currentUser={user} />
}
