import { getCurrentUser } from '@/lib/user'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import UsersClient from './UsersClient'

export default async function UsersPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (user.role !== 'Admin') redirect('/jos/today')

  const supabase = createSupabaseServerClient()
  const { data: users } = await supabase
    .from('users')
    .select('user_email, name, role, is_active')
    .order('name')

  return <UsersClient users={users || []} />
}
