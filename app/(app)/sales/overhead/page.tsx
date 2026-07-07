import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/user'
import { redirect } from 'next/navigation'
import OverheadExpensesClient from './OverheadExpensesClient'

export default async function OverheadExpensesPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (user.role !== 'Admin') redirect('/jos/active')

  const supabase = createSupabaseServerClient()
  const { data: overheadExpenses } = await supabase
    .from('overhead_expenses')
    .select('*')
    .order('month', { ascending: false })

  return <OverheadExpensesClient overheadExpenses={overheadExpenses || []} currentUser={user} />
}
