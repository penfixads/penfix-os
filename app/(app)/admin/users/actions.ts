'use server'

import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { getCurrentUser } from '@/lib/user'

async function assertAdmin() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'Admin') throw new Error('Unauthorized')
}

export async function createUser(formData: {
  name: string
  email: string
  password: string
  role: string
}) {
  await assertAdmin()
  const admin = createSupabaseAdminClient()

  const { data: authData, error: authErr } = await admin.auth.admin.createUser({
    email: formData.email,
    password: formData.password,
    email_confirm: true,
    user_metadata: { name: formData.name, role: formData.role },
  })
  if (authErr) throw new Error(authErr.message)

  // The on_auth_user_created trigger auto-creates the profile from metadata;
  // this upsert (via service_role) guarantees the exact name/role and is idempotent.
  const { error: dbErr } = await admin.from('users').upsert({
    user_email: formData.email,
    name: formData.name,
    role: formData.role,
    is_active: true,
  }, { onConflict: 'user_email' })
  if (dbErr) {
    await admin.auth.admin.deleteUser(authData.user.id)
    throw new Error(dbErr.message)
  }

  return { success: true }
}

export async function updateUserInfo(oldEmail: string, formData: {
  name: string
  email: string
  role: string
}) {
  await assertAdmin()
  const admin = createSupabaseAdminClient()

  const emailChanged = formData.email !== oldEmail
  if (emailChanged) {
    const { data: authUsers } = await admin.auth.admin.listUsers()
    const authUser = authUsers?.users.find(u => u.email === oldEmail)
    if (!authUser) throw new Error('User not found in auth')
    const { error: authErr } = await admin.auth.admin.updateUserById(authUser.id, { email: formData.email, email_confirm: true })
    if (authErr) throw new Error(authErr.message)
  }

  const { error } = await admin.from('users')
    .update({ name: formData.name, role: formData.role, user_email: formData.email })
    .eq('user_email', oldEmail)
  if (error) throw new Error(error.message)
  return { success: true }
}

export async function deleteUser(email: string) {
  const admin = createSupabaseAdminClient()
  const current = await getCurrentUser()
  if (!current || current.role !== 'Admin') throw new Error('Unauthorized')
  if (current.email === email) throw new Error('You cannot delete your own account.')

  const { data: target } = await admin.from('users').select('role').eq('user_email', email).single()
  if (target?.role === 'Admin') {
    const { count } = await admin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'Admin')
    if ((count ?? 0) <= 1) throw new Error('Cannot delete the last remaining Admin.')
  }

  const { data: authUsers } = await admin.auth.admin.listUsers()
  const authUser = authUsers?.users.find(u => u.email === email)
  if (authUser) await admin.auth.admin.deleteUser(authUser.id)

  const { error } = await admin.from('users').delete().eq('user_email', email)
  if (error) throw new Error(error.message)
  return { success: true }
}

export async function toggleUserActive(email: string, is_active: boolean) {
  await assertAdmin()
  const admin = createSupabaseAdminClient()

  const { data: authUsers } = await admin.auth.admin.listUsers()
  const authUser = authUsers?.users.find(u => u.email === email)
  if (authUser) {
    await admin.auth.admin.updateUserById(authUser.id, { ban_duration: is_active ? 'none' : '876600h' })
  }

  const { error } = await admin.from('users').update({ is_active }).eq('user_email', email)
  if (error) throw new Error(error.message)
  return { success: true }
}

export async function resetUserPassword(email: string, newPassword: string) {
  await assertAdmin()
  const admin = createSupabaseAdminClient()
  const { data: authUsers } = await admin.auth.admin.listUsers()
  const authUser = authUsers?.users.find(u => u.email === email)
  if (!authUser) throw new Error('User not found in auth')
  const { error } = await admin.auth.admin.updateUserById(authUser.id, { password: newPassword })
  if (error) throw new Error(error.message)
  return { success: true }
}
