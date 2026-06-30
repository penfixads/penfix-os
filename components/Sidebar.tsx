'use client'

import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import type { UserRole } from '@/lib/user'

interface NavItem {
  label: string
  href: string
  roles: UserRole[]
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Active JOs',              href: '/jos/active',         roles: ['Admin','Frontdesk','Treasury'] },
  { label: "Today's Received JOs",    href: '/jos/today',          roles: ['Admin','Frontdesk','Treasury'] },
  { label: 'Daily Sales Summary',     href: '/sales/summary',      roles: ['Admin','Frontdesk','Treasury'] },
  { label: 'Pending Approval',        href: '/jos/pending-approval', roles: ['Admin','Frontdesk','Treasury'] },
  { label: 'Daily MVP',               href: '/mvp',                roles: ['Admin','Frontdesk','Treasury'] },
  { label: 'Add Historical Records',  href: '/jos/historical',     roles: ['Admin','Frontdesk'] },
  { label: 'All Job Order Items',     href: '/jos/items',          roles: ['Admin','Frontdesk','Treasury'] },
  { label: 'All Job Orders',          href: '/jos/all',            roles: ['Admin','Frontdesk','Treasury'] },
  { label: 'Clients',                 href: '/clients',            roles: ['Admin','Frontdesk','Treasury'] },
  { label: "Fabricator's Production", href: '/production',         roles: ['Admin','Production'] },
  { label: 'Ready for Dispatch',      href: '/jos/dispatch',       roles: ['Admin','Frontdesk','Production'] },
  { label: 'Sales Reports',           href: '/sales/reports',      roles: ['Admin','Treasury'] },
]

interface Props {
  role: UserRole
  name: string
}

export default function Sidebar({ role, name }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const items = NAV_ITEMS.filter(i => i.roles.includes(role))

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside style={{
      width: 240,
      minHeight: '100vh',
      background: '#7A1828',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid #3a0000',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid #3a0000', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <Image src="/penfixtwhhite.png" alt="Penfix" width={36} height={36} style={{ objectFit: 'contain' }} />
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem', letterSpacing: 1 }}>PENFIX OS</div>
          <div style={{ color: '#aaa', fontSize: '0.65rem', letterSpacing: 0.5 }}>Job Orders</div>
        </div>
      </div>

      {/* Nav */}
      <style>{`
        .nav-link { display: block; padding: 0.55rem 1rem; font-size: 0.8rem; text-decoration: none; transition: all 0.15s; }
        .nav-link:hover { background: rgba(255,255,255,0.08) !important; color: #fff !important; }
      `}</style>
      <nav style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>
        {items.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className="nav-link"
              style={{
                color: active ? '#fff' : '#aaa',
                background: active ? '#7A1828' : 'transparent',
                borderLeft: active ? '3px solid #c0392b' : '3px solid transparent',
              }}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User + Sign out */}
      <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid #3a0000' }}>
        <div style={{ color: '#fff', fontSize: '0.78rem', fontWeight: 600 }}>{name}</div>
        <div style={{ color: '#7A1828', fontSize: '0.68rem', marginBottom: '0.5rem' }}>{role}</div>
        <button
          onClick={handleSignOut}
          style={{ background: 'none', border: '1px solid #3a0000', color: '#aaa', fontSize: '0.72rem', padding: '0.3rem 0.75rem', borderRadius: 6, cursor: 'pointer', width: '100%' }}
        >
          Sign Out
        </button>
      </div>
    </aside>
  )
}
