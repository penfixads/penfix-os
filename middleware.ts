import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes — no auth required
  if (
    pathname.startsWith('/feedback') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/track') ||
    pathname.startsWith('/receipt')
  ) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // This refreshes the session and writes updated cookies to supabaseResponse
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Role-based access control
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('user_email', user.email)
    .single()

  const role = userData?.role as string | undefined

  const ROLE_RESTRICTIONS: Record<string, string[]> = {
    // Purchases/Supplier Deliveries are Admin + Treasury only. Overhead Expenses
    // (carries salary data) is Admin-only — also enforced at the DB layer via RLS.
    GA:        ['/jos/pending-approval', '/sales/summary', '/sales/reports', '/sales/overhead', '/admin', '/purchases'],
    Treasury:  ['/jos/pending-approval', '/sales/reports', '/sales/overhead', '/admin'],
    Fabricator:['/jos/active', '/jos/today', '/sales/summary', '/jos/pending-approval', '/mvp', '/jos/historical', '/jos/items', '/jos/all', '/clients', '/sales/reports', '/sales/overhead', '/admin', '/client-feedback', '/purchases'],
  }

  if (role && ROLE_RESTRICTIONS[role]) {
    const blocked = ROLE_RESTRICTIONS[role].some(path => pathname.startsWith(path))
    if (blocked) {
      const defaultRoutes: Record<string, string> = {
        GA: '/jos/today',
        Treasury: '/jos/today',
        Fabricator: '/production',
      }
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = defaultRoutes[role] || '/jos/today'
      return NextResponse.redirect(redirectUrl)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon|icon|.*\\.png$|.*\\.ico$).*)'],
}
