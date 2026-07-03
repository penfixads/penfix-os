import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/user'
import AccountClient from './AccountClient'

export default async function AccountPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  return <AccountClient name={user.name} email={user.email} role={user.role} />
}
