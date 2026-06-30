import { getCurrentUser } from '@/lib/user'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  if (user.role === 'Fabricator') redirect('/production')
  redirect('/jos/active')
}
