import { cache } from 'react'
import { createSupabaseServerClient } from './supabase-server'

export type UserRole = 'Admin' | 'Frontdesk' | 'Treasury' | 'Production'

export interface AppUser {
  email: string
  name: string
  role: UserRole
  is_active: boolean
}

export const getCurrentUser = cache(async (): Promise<AppUser | null> => {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('users')
    .select('user_email, name, role, is_active')
    .eq('user_email', user.email)
    .single()

  if (!data) return null
  return {
    email: data.user_email,
    name: data.name,
    role: data.role as UserRole,
    is_active: data.is_active,
  }
})
