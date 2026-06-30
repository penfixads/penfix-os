import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  let dbUser = null
  let dbError = null
  let rawQuery = null

  if (user) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_email', user.email)
      .single()
    dbUser = data
    dbError = error

    // Also try without single()
    const { data: raw, error: rawErr } = await supabase
      .from('users')
      .select('user_email, role')
    rawQuery = { data: raw, error: rawErr?.message }
  }

  return NextResponse.json({
    authUser: user ? { id: user.id, email: user.email } : null,
    authError: authError?.message,
    dbUser,
    dbError: dbError?.message,
    dbErrorCode: dbError?.code,
    rawQuery,
  })
}
