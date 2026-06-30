'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

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
          <Image src="/penfixtwhhite.png" alt="Penfix" width={80} height={80} style={{ objectFit: 'contain', filter: 'brightness(0) saturate(100%) invert(14%) sepia(60%) saturate(1200%) hue-rotate(330deg)' }} />
          <h1 style={{ color: '#7B1C1C', fontSize: '1.4rem', fontWeight: 700, marginTop: '0.75rem', marginBottom: '0.25rem' }}>Penfix OS</h1>
          <p style={{ color: '#888', fontSize: '0.85rem' }}>Set a new password</p>
        </div>

        {done ? (
          <p style={{ textAlign: 'center', color: '#444', fontSize: '0.9rem' }}>
            Password updated! Redirecting to sign in…
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>New Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Confirm Password</label>
              <input
                type="password"
                required
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
              />
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
              {loading ? 'Updating…' : 'Update Password'}
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
