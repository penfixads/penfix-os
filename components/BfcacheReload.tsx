'use client'

import { useEffect } from 'react'

// Browsers can restore a page from the back/forward cache (bfcache) instead of doing a
// real navigation — this replays the exact in-memory React state from before you left,
// including whatever an open form modal (e.g. New Job Order) had half-filled in and never
// saved. That's how an abandoned draft can silently reappear later looking "new". Forcing
// a real reload on a bfcache restore guarantees every page always starts from fresh
// server data instead of a stale snapshot.
export default function BfcacheReload() {
  useEffect(() => {
    function onPageShow(e: PageTransitionEvent) {
      if (e.persisted) window.location.reload()
    }
    window.addEventListener('pageshow', onPageShow)
    return () => window.removeEventListener('pageshow', onPageShow)
  }, [])

  return null
}
