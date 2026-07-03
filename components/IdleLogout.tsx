'use client'

import { useEffect, useRef } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

const IDLE_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes

const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll'] as const

export default function IdleLogout() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()

    function resetTimer() {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(async () => {
        await supabase.auth.signOut()
        window.location.href = '/login?error=idle'
      }, IDLE_TIMEOUT_MS)
    }

    resetTimer()
    ACTIVITY_EVENTS.forEach(event => window.addEventListener(event, resetTimer, { passive: true }))

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      ACTIVITY_EVENTS.forEach(event => window.removeEventListener(event, resetTimer))
    }
  }, [])

  return null
}
