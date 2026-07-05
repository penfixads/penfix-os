'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { IconKey } from '@/components/icons'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)

  // The emailed reset link redirects here with ?code=... — that code has to be
  // exchanged for a real session before updateUser() can do anything with it.
  useEffect(() => {
    const code = searchParams.get('code')
    if (!code) { setError('This reset link is invalid or has expired. Please request a new one.'); return }
    const supabase = createSupabaseBrowserClient()
    supabase.auth.exchangeCodeForSession(code).then(({ error: exchangeError }) => {
      if (exchangeError) { setError('This reset link is invalid or has expired. Please request a new one.'); return }
      setSessionReady(true)
    })
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    const supabase = createSupabaseBrowserClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (updateError) { setError(updateError.message); return }
    setDone(true)
    setTimeout(() => router.push('/login'), 2000)
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: 'url(/backgroundpenfix.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif',
      padding: '1.5rem',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        borderRadius: 16,
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        padding: '2.5rem 2rem',
        width: '100%',
        maxWidth: 400,
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Image src="/penfix-logo.png" alt="Penfix" width={80} height={80} style={{ objectFit: 'contain', display: 'block', margin: '0 auto' }} />
          <h1 style={{ color: '#7A1828', fontSize: '1.4rem', fontWeight: 700, marginTop: '0.75rem', marginBottom: '0.25rem' }}>Penfix OS</h1>
          <p style={{ color: '#888', fontSize: '0.85rem' }}>Set a new password</p>
        </div>

        {done ? (
          <p style={{ textAlign: 'center', color: '#444', fontSize: '0.9rem' }}>
            Password updated! Redirecting to sign in…
          </p>
        ) : !sessionReady ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: error ? '#c00' : '#888', fontSize: '0.9rem', marginBottom: error ? '1rem' : 0 }}>
              {error || 'Verifying reset link…'}
            </p>
            {error && (
              <a href="/login" className="pf-btn pf-btn-block" style={{ padding: '0.85rem', fontSize: '1rem', letterSpacing: 0.5, display: 'inline-flex', textDecoration: 'none' }}>
                Back to Sign In
              </a>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label className="pf-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pf-input"
                  style={{ paddingRight: '2.5rem' }}
                />
                <button type="button" onClick={() => setShowPassword(v => !v)} style={eyeBtnStyle} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? eyeOffIcon : eyeIcon}
                </button>
              </div>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="pf-label">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="pf-input"
                  style={{ paddingRight: '2.5rem' }}
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)} style={eyeBtnStyle} aria-label={showConfirm ? 'Hide password' : 'Show password'}>
                  {showConfirm ? eyeOffIcon : eyeIcon}
                </button>
              </div>
            </div>
            {error && (
              <p style={{ color: '#c00', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="pf-btn pf-btn-block"
              style={{ padding: '0.85rem', fontSize: '1rem', letterSpacing: 0.5 }}
            >
              <IconKey />{loading ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem', color: '#aaa' }}>
          Penfix Advertising &amp; Business Solutions
        </p>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}

const eyeBtnStyle: React.CSSProperties = { position: 'absolute', right: '0.65rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#888', lineHeight: 1 }
const eyeIcon = <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
const eyeOffIcon = <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
