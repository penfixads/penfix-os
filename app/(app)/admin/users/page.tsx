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

  // Tools ecosystem access lives in its own table (tools.penfixads.com's
  // authorization); merge each person's tools role in for display.
  const { data: toolUsers } = await supabase
    .from('tool_users')
    .select('user_email, role')
  const toolsRoleByEmail = new Map((toolUsers || []).map(t => [t.user_email, t.role]))
  const merged = (users || []).map(u => ({ ...u, tools_role: toolsRoleByEmail.get(u.user_email) ?? null }))

  return <UsersClient users={merged} />
}
