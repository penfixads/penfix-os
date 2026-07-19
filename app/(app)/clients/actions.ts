'use server'

import bcrypt from 'bcryptjs'
import { getCurrentUser } from '@/lib/user'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'

// Admin-only, same as the Credit Line toggle in this same Edit Client form — this sets
// what the client types into shop.penfixads.com's login (see shop's app/actions.ts
// loginClient/registerClient, which hash with the same bcryptjs cost factor of 10).
export async function setClientPassword(clientId: string, newPassword: string) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'Admin') return { success: false, message: 'Unauthorized' }
  if (!newPassword || newPassword.length < 6) return { success: false, message: 'Password must be at least 6 characters.' }

  const password_hash = await bcrypt.hash(newPassword, 10)
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.from('clients').update({ password_hash }).eq('client_id', clientId)
  if (error) return { success: false, message: error.message || 'Failed to set password.' }
  return { success: true }
}
