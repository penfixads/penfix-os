import { getCurrentUser } from '@/lib/user'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  if (user.role === 'Production') redirect('/production')
  if (user.role === 'Treasury') redirect('/sales/summary')
  redirect('/jos/active')
}
