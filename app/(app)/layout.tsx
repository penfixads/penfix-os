import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/user'
import Sidebar from '@/components/Sidebar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (!user.is_active) redirect('/login?error=inactive')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f2f2f2' }}>
      <Sidebar role={user.role} name={user.name} />
      <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
        {children}
      </main>
    </div>
  )
}
