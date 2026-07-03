'use client'

import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { updateMyName } from './actions'
import { IconSave, IconKey } from '@/components/icons'

const ROLE_COLORS: Record<string, string> = {
  Admin:     '#7A1828',
  GA:        '#1a4a7a',
  Treasury:  '#1a5a1a',
  Fabricator:'#4a3a00',
}

interface Props {
  name: string
  email: string
  role: string
}

export default function AccountClient({ name: initialName, email, role }: Props) {
  const [name, setName] = useState(initialName)
  const [savingName, setSavingName] = useState(false)
  const [nameError, setNameError] = useState('')
  const [nameSuccess, setNameSuccess] = useState('')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  async function handleSaveName() {
    setSavingName(true); setNameError(''); setNameSuccess('')
    try {
      await updateMyName(name)
      setNameSuccess('Name updated successfully.')
    } catch (e: any) {
      setNameError(e.message)
    } finally {
      setSavingName(false)
    }
  }

  async function handleChangePassword() {
    setPasswordError(''); setPasswordSuccess('')
    if (newPassword.length < 6) { setPasswordError('Password must be at least 6 characters.'); return }
    if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match.'); return }
    setSavingPassword(true)
    try {
      const supabase = createSupabaseBrowserClient()
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw new Error(error.message)
      setPasswordSuccess('Password updated successfully.')
      setNewPassword(''); setConfirmPassword('')
    } catch (e: any) {
      setPasswordError(e.message)
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div style={{ maxWidth: 480 }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ color: '#7A1828', fontSize: '1.4rem', fontWeight: 700 }}>My Account</h1>
        <p style={{ color: '#777', fontSize: '0.8rem', marginTop: 2 }}>Manage your own name and password.</p>
      </div>

      {/* My Info */}
      <div style={{ background: '#FDF5EC', borderRadius: 12, border: '1px solid #EDE0CC', padding: '1.25rem', marginBottom: '1.25rem' }}>
        <h2 style={{ color: '#1a1a1a', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>My Info</h2>

        <div className="pf-field">
          <label className="pf-label">Full Name</label>
          <input value={name} onChange={e => setName(e.target.value)} className="pf-input" />
        </div>

        <div className="pf-field">
          <label className="pf-label">Email Address</label>
          <input value={email} disabled className="pf-input" style={{ opacity: 0.6, cursor: 'not-allowed' }} />
        </div>

        <div className="pf-field">
          <label className="pf-label">Role</label>
          <div>
            <span style={{ background: ROLE_COLORS[role] || '#333', color: '#fff', borderRadius: 20, padding: '0.25rem 0.7rem', fontSize: '0.72rem', fontWeight: 700 }}>
              {role}
            </span>
          </div>
          <p style={{ color: '#999', fontSize: '0.7rem', marginTop: 4 }}>Only an Admin can change your role.</p>
        </div>

        {nameError && <div style={{ color: '#e74c3c', fontSize: '0.82rem', marginBottom: '0.75rem' }}>{nameError}</div>}
        {nameSuccess && <div style={{ color: '#2ecc71', fontSize: '0.82rem', marginBottom: '0.75rem' }}>{nameSuccess}</div>}

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={handleSaveName} disabled={savingName} className="pf-btn">
            <IconSave />{savingName ? 'Saving…' : 'Save Name'}
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div style={{ background: '#FDF5EC', borderRadius: 12, border: '1px solid #EDE0CC', padding: '1.25rem' }}>
        <h2 style={{ color: '#1a1a1a', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Change Password</h2>

        <div className="pf-field">
          <label className="pf-label">New Password</label>
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 6 characters" className="pf-input" />
        </div>

        <div className="pf-field">
          <label className="pf-label">Confirm New Password</label>
          <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" className="pf-input" />
        </div>

        {passwordError && <div style={{ color: '#e74c3c', fontSize: '0.82rem', marginBottom: '0.75rem' }}>{passwordError}</div>}
        {passwordSuccess && <div style={{ color: '#2ecc71', fontSize: '0.82rem', marginBottom: '0.75rem' }}>{passwordSuccess}</div>}

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={handleChangePassword} disabled={savingPassword} className="pf-btn">
            <IconKey />{savingPassword ? 'Updating…' : 'Update Password'}
          </button>
        </div>
      </div>
    </div>
  )
}
