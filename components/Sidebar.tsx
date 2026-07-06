'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import type { UserRole } from '@/lib/user'

interface NavItem {
  label: string
  href: string
  roles: UserRole[]
  icon: React.ReactNode
}

const I = (p: React.SVGProps<SVGSVGElement>) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }} {...p} />
)

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Active JOs', href: '/jos/active', roles: ['Admin','GA','Treasury'],
    icon: <I><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></I>
  },
  {
    label: "Today's Received JOs", href: '/jos/today', roles: ['Admin','GA','Treasury'],
    icon: <I><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></I>
  },
  {
    label: 'Daily Sales Summary', href: '/sales/summary', roles: ['Admin','Treasury'],
    icon: <I><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></I>
  },
  {
    label: 'Pending Approval', href: '/jos/pending-approval', roles: ['Admin'],
    icon: <I><path d="M10 15l-3-3 3-3M14 9l3 3-3 3"/><circle cx="12" cy="12" r="10"/></I>
  },
  {
    label: 'Daily MVP', href: '/mvp', roles: ['Admin','GA','Treasury'],
    icon: <I><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></I>
  },
  {
    label: 'Add Historical Records', href: '/jos/historical', roles: ['Admin','GA','Treasury'],
    icon: <I><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 9 15"/></I>
  },
  {
    label: 'All Job Order Items', href: '/jos/items', roles: ['Admin','GA','Treasury'],
    icon: <I><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></I>
  },
  {
    label: 'All Job Orders', href: '/jos/all', roles: ['Admin','GA','Treasury'],
    icon: <I><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></I>
  },
  {
    label: 'Clients', href: '/clients', roles: ['Admin','GA','Treasury'],
    icon: <I><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></I>
  },
  {
    label: "Fabricator's Production", href: '/production', roles: ['Admin','GA','Treasury','Fabricator'],
    icon: <I><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M12 2v2M12 20v2M20 12h2M2 12h2M17.66 17.66l-1.41-1.41M6.34 17.66l1.41-1.41"/></I>
  },
  {
    label: 'Ready for Dispatch', href: '/jos/dispatch', roles: ['Admin','GA','Treasury','Fabricator'],
    icon: <I><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></I>
  },
  {
    label: 'Daily Job Order Record', href: '/jos/daily-record', roles: ['Admin','GA','Treasury','Fabricator'],
    icon: <I><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14l2 2 4-4"/></I>
  },
  {
    label: 'Sales Reports', href: '/sales/reports', roles: ['Admin'],
    icon: <I><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></I>
  },
  {
    label: 'Client Feedback', href: '/client-feedback', roles: ['Admin','GA','Treasury'],
    icon: <I fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></I>
  },
  {
    label: 'User Management', href: '/admin/users', roles: ['Admin'],
    icon: <I><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></I>
  },
  {
    label: 'Subcategory SOPs', href: '/admin/subcategory-sops', roles: ['Admin'],
    icon: <I><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></I>
  },
]

interface Props {
  role: UserRole
  name: string
}

export default function Sidebar({ role, name }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const items = NAV_ITEMS.filter(i => i.roles.includes(role))
  const [mobileOpen, setMobileOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => { setMobileOpen(false) }, [pathname])

  useEffect(() => {
    if (role !== 'Admin') return
    const supabase = createSupabaseBrowserClient()

    async function loadPendingCount() {
      const [{ count: joCount }, { count: creditCount }, { count: unlockCount }] = await Promise.all([
        supabase.from('job_orders').select('*', { count: 'exact', head: true }).eq('override_status', 'Pending'),
        supabase.from('clients').select('*', { count: 'exact', head: true }).eq('credit_line_request_status', 'Pending'),
        supabase.from('historical_unlock_requests').select('*', { count: 'exact', head: true }).eq('status', 'Pending'),
      ])
      setPendingCount((joCount || 0) + (creditCount || 0) + (unlockCount || 0))
    }

    loadPendingCount()
    // Historical-unlock requests need faster feedback than the other two — the GA is
    // actively waiting on this one (it blocks their form), not just checking back later.
    const interval = setInterval(loadPendingCount, 10000)
    return () => clearInterval(interval)
  }, [role, pathname])

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      <style>{`
        .nav-link { display: flex; align-items: center; gap: 0.6rem; padding: 0.55rem 1rem; font-size: 0.8rem; text-decoration: none; transition: all 0.15s; }
        .nav-link:hover { background: rgba(255,255,255,0.08) !important; color: #fff !important; }
        .nav-link:hover svg { stroke: #fff !important; }
        .pf-hamburger { display: none; }
        .pf-sidebar-backdrop { display: none; }
        @media (max-width: 768px) {
          .pf-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
            z-index: 300;
            transform: translateX(-100%);
            transition: transform 0.25s ease;
          }
          .pf-sidebar.pf-sidebar-open { transform: translateX(0); }
          .pf-hamburger {
            display: flex;
            position: fixed;
            top: 0.85rem;
            left: 1rem;
            z-index: 310;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            background: #5C001F;
            border: 1px solid #3a0000;
            border-radius: 8px;
            color: #C9A84C;
            cursor: pointer;
          }
          .pf-sidebar-backdrop.pf-sidebar-backdrop-open {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            z-index: 290;
          }
        }
      `}</style>

      {!mobileOpen && (
        <button className="pf-hamburger" onClick={() => setMobileOpen(v => !v)} aria-label="Open menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      )}

      <div
        className={`pf-sidebar-backdrop${mobileOpen ? ' pf-sidebar-backdrop-open' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      <aside className={`pf-sidebar${mobileOpen ? ' pf-sidebar-open' : ''}`} style={{
        width: 240,
        minHeight: '100vh',
        background: '#5C001F',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #3a0000',
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid #3a0000', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Image src="/penfixtwhhite.png" alt="Penfix" width={36} height={36} style={{ objectFit: 'contain' }} />
          <div>
            <div style={{ color: '#C9A84C', fontFamily: 'var(--font-cormorant), "Cormorant Garamond", serif', fontWeight: 600, fontSize: '1.25rem', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Penfix OS</div>
            <div style={{ color: '#C9A84C', fontFamily: 'var(--font-inter), Inter, sans-serif', fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.75 }}>Job Orders</div>
          </div>
        </div>

        {/* Nav */}
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
                  color: active ? '#fff' : '#ddd',
                  background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                  borderLeft: active ? '3px solid #C9A84C' : '3px solid transparent',
                }}
              >
                <span style={{ color: active ? '#C9A84C' : '#ccc', display: 'flex' }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.href === '/jos/pending-approval' && pendingCount > 0 && (
                  <span style={{
                    background: '#e74c3c',
                    color: '#fff',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    lineHeight: 1,
                    borderRadius: 999,
                    padding: '0.2rem 0.42rem',
                    minWidth: 18,
                    textAlign: 'center',
                  }}>
                    {pendingCount > 99 ? '99+' : pendingCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User + Sign out */}
        <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid #3a0000' }}>
          <div style={{ color: '#fff', fontSize: '0.78rem', fontWeight: 600 }}>{name}</div>
          <div style={{ color: '#C9A84C', fontSize: '0.68rem', marginBottom: '0.5rem' }}>{role}</div>
          <Link
            href="/account"
            style={{ display: 'block', textAlign: 'center', background: 'none', border: '1px solid #3a0000', color: '#ddd', fontSize: '0.72rem', padding: '0.3rem 0.75rem', borderRadius: 6, marginBottom: '0.4rem', textDecoration: 'none' }}
          >
            My Account
          </Link>
          <button
            onClick={handleSignOut}
            style={{ background: 'none', border: '1px solid #3a0000', color: '#aaa', fontSize: '0.72rem', padding: '0.3rem 0.75rem', borderRadius: 6, cursor: 'pointer', width: '100%' }}
          >
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
