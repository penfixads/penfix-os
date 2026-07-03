'use server'

import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { getCurrentUser } from '@/lib/user'

export async function updateMyName(name: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')
  if (!name.trim()) throw new Error('Name is required.')

  const admin = createSupabaseAdminClient()
  const { error } = await admin.from('users').update({ name: name.trim() }).eq('user_email', user.email)
  if (error) throw new Error(error.message)
  return { success: true }
}
