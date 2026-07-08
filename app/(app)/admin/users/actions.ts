'use server'

import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { getCurrentUser } from '@/lib/user'

type ActionResult = { success: true } | { success: false; message: string }

async function assertAdmin(): Promise<string | null> {
  const user = await getCurrentUser()
  if (!user || user.role !== 'Admin') return 'Unauthorized'
  return null
}

export async function createUser(formData: {
  name: string
  email: string
  password: string
  role: string
  toolsRole?: 'Custodian' | 'Fabricator' | null
}): Promise<ActionResult> {
  const authErrMsg = await assertAdmin()
  if (authErrMsg) return { success: false, message: authErrMsg }
  const admin = createSupabaseAdminClient()

  const { data: authData, error: authErr } = await admin.auth.admin.createUser({
    email: formData.email,
    password: formData.password,
    email_confirm: true,
    user_metadata: { name: formData.name, role: formData.role },
  })
  if (authErr) return { success: false, message: authErr.message }

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
    return { success: false, message: dbErr.message }
  }

  // Tools access is a separate grant: a tool_users row is what lets this
  // identity into tools.penfixads.com (see project tools' middleware).
  if (formData.toolsRole) {
    const { error: toolsErr } = await admin.from('tool_users').upsert({
      user_email: formData.email,
      name: formData.name,
      role: formData.toolsRole,
      is_active: true,
    }, { onConflict: 'user_email' })
    if (toolsErr) return { success: false, message: `User created, but granting Tools access failed: ${toolsErr.message}` }
  }

  return { success: true }
}

export async function setToolsAccess(email: string, toolsRole: 'Custodian' | 'Fabricator' | null): Promise<ActionResult> {
  const authErrMsg = await assertAdmin()
  if (authErrMsg) return { success: false, message: authErrMsg }
  const admin = createSupabaseAdminClient()

  if (toolsRole === null) {
    const { error } = await admin.from('tool_users').delete().eq('user_email', email)
    if (error) return { success: false, message: error.message }
    return { success: true }
  }

  const { data: profile } = await admin.from('users').select('name, is_active').eq('user_email', email).single()
  const { error } = await admin.from('tool_users').upsert({
    user_email: email,
    name: profile?.name ?? email.split('@')[0],
    role: toolsRole,
    is_active: profile?.is_active ?? true,
  }, { onConflict: 'user_email' })
  if (error) return { success: false, message: error.message }
  return { success: true }
}

export async function updateUserInfo(oldEmail: string, formData: {
  name: string
  email: string
  role: string
}): Promise<ActionResult> {
  const authErrMsg = await assertAdmin()
  if (authErrMsg) return { success: false, message: authErrMsg }
  const admin = createSupabaseAdminClient()

  const emailChanged = formData.email !== oldEmail
  if (emailChanged) {
    const { data: authUsers } = await admin.auth.admin.listUsers()
    const authUser = authUsers?.users.find(u => u.email === oldEmail)
    if (!authUser) return { success: false, message: 'User not found in auth' }
    const { error: authErr } = await admin.auth.admin.updateUserById(authUser.id, { email: formData.email, email_confirm: true })
    if (authErr) return { success: false, message: authErr.message }
  }

  const { error } = await admin.from('users')
    .update({ name: formData.name, role: formData.role, user_email: formData.email })
    .eq('user_email', oldEmail)
  if (error) return { success: false, message: error.message }

  // Keep the Tools-access profile (if any) pointing at the same identity
  await admin.from('tool_users')
    .update({ name: formData.name, user_email: formData.email })
    .eq('user_email', oldEmail)

  return { success: true }
}

export async function deleteUser(email: string): Promise<ActionResult> {
  const admin = createSupabaseAdminClient()
  const current = await getCurrentUser()
  if (!current || current.role !== 'Admin') return { success: false, message: 'Unauthorized' }
  if (current.email === email) return { success: false, message: 'You cannot delete your own account.' }

  const { data: target } = await admin.from('users').select('role').eq('user_email', email).single()
  if (target?.role === 'Admin') {
    const { count } = await admin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'Admin')
    if ((count ?? 0) <= 1) return { success: false, message: 'Cannot delete the last remaining Admin.' }
  }

  const { data: authUsers } = await admin.auth.admin.listUsers()
  const authUser = authUsers?.users.find(u => u.email === email)
  if (authUser) await admin.auth.admin.deleteUser(authUser.id)

  // Deleting the identity also revokes its Tools access
  await admin.from('tool_users').delete().eq('user_email', email)

  const { error } = await admin.from('users').delete().eq('user_email', email)
  if (error) return { success: false, message: error.message }
  return { success: true }
}

export async function toggleUserActive(email: string, is_active: boolean): Promise<ActionResult> {
  const authErrMsg = await assertAdmin()
  if (authErrMsg) return { success: false, message: authErrMsg }
  const admin = createSupabaseAdminClient()

  const { data: authUsers } = await admin.auth.admin.listUsers()
  const authUser = authUsers?.users.find(u => u.email === email)
  if (authUser) {
    await admin.auth.admin.updateUserById(authUser.id, { ban_duration: is_active ? 'none' : '876600h' })
  }

  // Deactivation is identity-wide: mirror it to the Tools profile so the
  // tools app's own is_active check agrees (the auth ban already blocks
  // login everywhere, this keeps the profile state consistent).
  await admin.from('tool_users').update({ is_active }).eq('user_email', email)

  const { error } = await admin.from('users').update({ is_active }).eq('user_email', email)
  if (error) return { success: false, message: error.message }
  return { success: true }
}

export async function resetUserPassword(email: string, newPassword: string): Promise<ActionResult> {
  const authErrMsg = await assertAdmin()
  if (authErrMsg) return { success: false, message: authErrMsg }
  const admin = createSupabaseAdminClient()
  const { data: authUsers } = await admin.auth.admin.listUsers()
  const authUser = authUsers?.users.find(u => u.email === email)
  if (!authUser) return { success: false, message: 'User not found in auth' }
  const { error } = await admin.auth.admin.updateUserById(authUser.id, { password: newPassword })
  if (error) return { success: false, message: error.message }
  return { success: true }
}
