'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { Suspense } from 'react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [forgotMode, setForgotMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createSupabaseBrowserClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) { setLoading(false); setError(authError.message); return }
    // Hard navigation so the server picks up the freshly-set session cookie
    window.location.href = next
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createSupabaseBrowserClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    if (resetError) { setError(resetError.message); return }
    setResetSent(true)
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
          <Image src="/penfixtwhhite.png" alt="Penfix" width={80} height={80} style={{ objectFit: 'contain', filter: 'brightness(0) saturate(100%) invert(14%) sepia(60%) saturate(1200%) hue-rotate(330deg)' }} />
          <h1 style={{ color: '#7B1C1C', fontSize: '1.4rem', fontWeight: 700, marginTop: '0.75rem', marginBottom: '0.25rem' }}>Penfix OS</h1>
          <p style={{ color: '#888', fontSize: '0.85rem' }}>{forgotMode ? 'Reset your password' : 'Sign in to continue'}</p>
        </div>

        {forgotMode ? (
          resetSent ? (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#444', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Check your email for a password reset link.
              </p>
              <button onClick={() => { setForgotMode(false); setResetSent(false) }} style={linkBtnStyle}>
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@penfix.com"
                  style={inputStyle}
                />
              </div>
              {error && (
                <p style={{ color: '#c00', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>
                  {error}
                </p>
              )}
              <button type="submit" disabled={loading} style={{
                width: '100%', background: loading ? '#b26060' : '#7B1C1C', color: '#fff',
                border: 'none', borderRadius: 8, padding: '0.85rem', fontSize: '1rem',
                fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: 0.5,
              }}>
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button type="button" onClick={() => { setForgotMode(false); setError('') }} style={linkBtnStyle}>
                  Back to Sign In
                </button>
              </div>
            </form>
          )
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@penfix.com"
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ ...inputStyle, paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{ position: 'absolute', right: '0.65rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#888', lineHeight: 1 }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
              <button type="button" onClick={() => { setForgotMode(true); setError('') }} style={linkBtnStyle}>
                Forgot password?
              </button>
            </div>

            {error && (
              <p style={{ color: '#c00', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? '#b26060' : '#7B1C1C',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '0.85rem',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                letterSpacing: 0.5,
              }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
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

const labelStyle: React.CSSProperties = { display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#444', marginBottom: '0.4rem' }
const inputStyle: React.CSSProperties = { width: '100%', padding: '0.65rem 0.75rem', border: '1.5px solid #ddd', borderRadius: 7, fontSize: '0.9rem', color: '#333', boxSizing: 'border-box', outline: 'none' }
const linkBtnStyle: React.CSSProperties = { background: 'none', border: 'none', color: '#7B1C1C', fontSize: '0.82rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
