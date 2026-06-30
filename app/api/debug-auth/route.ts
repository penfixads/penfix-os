import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = cookies()
  const allCookies = cookieStore.getAll()
  const supabaseCookies = allCookies.filter(c => c.name.includes('supabase') || c.name.includes('sb-'))

  const supabase = createSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  const { data: userRow } = user ? await supabase
    .from('users')
    .select('*')
    .eq('user_email', user.email)
    .single() : { data: null }

  return NextResponse.json({
    supabaseCookieCount: supabaseCookies.length,
    supabaseCookieNames: supabaseCookies.map(c => c.name),
    authUser: user ? { id: user.id, email: user.email } : null,
    authError: error?.message,
    dbUser: userRow,
  })
}
