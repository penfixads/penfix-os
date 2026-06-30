'use client'

import { useState } from 'react'
import { createUser, updateUserRole, toggleUserActive, resetUserPassword } from './actions'

const ROLES = ['Admin', 'GA', 'Treasury', 'Fabricator']

const ROLE_COLORS: Record<string, string> = {
  Admin:     '#7A1828',
  GA:        '#1a4a7a',
  Treasury:  '#1a5a1a',
  Fabricator:'#4a3a00',
}

interface Props {
  users: any[]
}

export default function UsersClient({ users: initialUsers }: Props) {
  const [users, setUsers] = useState(initialUsers)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [actingOn, setActingOn] = useState<string | null>(null)
  const [resetTarget, setResetTarget] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')

  // New user form
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('GA')

  function resetForm() {
    setName(''); setEmail(''); setPassword(''); setRole('GA')
    setError(''); setSuccess('')
  }

  async function handleCreate() {
    if (!name || !email || !password) { setError('All fields are required.'); return }
    setSaving(true); setError(''); setSuccess('')
    try {
      await createUser({ name, email, password, role })
      setUsers(prev => [...prev, { user_email: email, name, role, is_active: true }])
      setSuccess(`User ${name} created successfully.`)
      resetForm()
      setShowForm(false)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleRoleChange(email: string, newRole: string) {
    setActingOn(email)
    try {
      await updateUserRole(email, newRole)
      setUsers(prev => prev.map(u => u.user_email === email ? { ...u, role: newRole } : u))
    } catch (e: any) {
      alert(e.message)
    } finally {
      setActingOn(null)
    }
  }

  async function handleToggleActive(email: string, current: boolean) {
    if (!confirm(`${current ? 'Deactivate' : 'Activate'} user ${email}?`)) return
    setActingOn(email)
    try {
      await toggleUserActive(email, !current)
      setUsers(prev => prev.map(u => u.user_email === email ? { ...u, is_active: !current } : u))
    } catch (e: any) {
      alert(e.message)
    } finally {
      setActingOn(null)
    }
  }

  async function handleResetPassword() {
    if (!resetTarget || !newPassword) return
    setActingOn(resetTarget)
    try {
      await resetUserPassword(resetTarget, newPassword)
      setResetTarget(null)
      setNewPassword('')
      setSuccess(`Password reset for ${resetTarget}.`)
    } catch (e: any) {
      alert(e.message)
    } finally {
      setActingOn(null)
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ color: '#7A1828', fontSize: '1.4rem', fontWeight: 700 }}>User Management</h1>
          <p style={{ color: '#777', fontSize: '0.8rem', marginTop: 2 }}>{users.length} registered user(s)</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true) }}
          style={{ background: '#7A1828', color: '#fff', border: '2px solid #C9A84C', borderRadius: 999, padding: '0.6rem 1.2rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
          + New User
        </button>
      </div>

      {success && (
        <div style={{ background: '#1a3a1a', border: '1px solid #27ae60', color: '#2ecc71', borderRadius: 8, padding: '0.65rem 1rem', marginBottom: '1rem', fontSize: '0.82rem' }}>
          {success}
        </div>
      )}

      {/* Users Table */}
      <div style={{ background: '#FDF5EC', borderRadius: 12, border: '1px solid #EDE0CC', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ background: '#3a3a3a' }}>
              <th style={th}>Name</th>
              <th style={th}>Email</th>
              <th style={th}>Role</th>
              <th style={{ ...th, textAlign: 'center' }}>Status</th>
              <th style={{ ...th, textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.user_email} style={{ borderBottom: '1px solid #EDE0CC', background: i % 2 === 0 ? '#FDF5EC' : '#faf0e0' }}>
                <td style={td}>
                  <div style={{ fontWeight: 700, color: '#1a1a1a' }}>{u.name}</div>
                </td>
                <td style={{ ...td, color: '#555' }}>{u.user_email}</td>
                <td style={td}>
                  <select
                    value={u.role}
                    disabled={actingOn === u.user_email}
                    onChange={e => handleRoleChange(u.user_email, e.target.value)}
                    style={{ background: ROLE_COLORS[u.role] || '#333', color: '#fff', border: 'none', borderRadius: 20, padding: '0.25rem 0.6rem', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', outline: 'none' }}
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td style={{ ...td, textAlign: 'center' }}>
                  <span style={{ background: u.is_active ? '#1a3a1a' : '#3a1a1a', color: u.is_active ? '#2ecc71' : '#e74c3c', borderRadius: 20, padding: '0.2rem 0.6rem', fontSize: '0.7rem', fontWeight: 700 }}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ ...td, textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleToggleActive(u.user_email, u.is_active)}
                      disabled={actingOn === u.user_email}
                      style={{ background: u.is_active ? '#5a1010' : '#1a3a1a', color: u.is_active ? '#e74c3c' : '#2ecc71', border: 'none', borderRadius: 6, padding: '0.3rem 0.6rem', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 600 }}>
                      {u.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => { setResetTarget(u.user_email); setNewPassword('') }}
                      style={{ background: '#2a2a4a', color: '#7a9cdc', border: 'none', borderRadius: 6, padding: '0.3rem 0.6rem', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 600 }}>
                      Reset PW
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New User Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#FDF5EC', borderRadius: 14, width: '100%', maxWidth: 440, padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ color: '#7A1828', fontSize: '1.1rem', fontWeight: 700 }}>Register New User</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#999', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={field}>
              <label style={lbl}>Full Name <span style={{ color: '#e74c3c' }}>*</span></label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Juan dela Cruz" style={inp} />
            </div>
            <div style={field}>
              <label style={lbl}>Email Address <span style={{ color: '#e74c3c' }}>*</span></label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="user@penfix.com" style={inp} />
            </div>
            <div style={field}>
              <label style={lbl}>Temporary Password <span style={{ color: '#e74c3c' }}>*</span></label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" style={inp} />
            </div>
            <div style={field}>
              <label style={lbl}>Role <span style={{ color: '#e74c3c' }}>*</span></label>
              <select value={role} onChange={e => setRole(e.target.value)} style={inp}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {error && <div style={{ color: '#e74c3c', fontSize: '0.82rem', marginBottom: '0.75rem' }}>{error}</div>}

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, background: '#f0f0f0', color: '#333', border: 'none', borderRadius: 8, padding: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={handleCreate} disabled={saving}
                style={{ flex: 2, background: '#7A1828', color: '#fff', border: '2px solid #C9A84C', borderRadius: 999, padding: '0.75rem', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700 }}>
                {saving ? 'Creating…' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#FDF5EC', borderRadius: 14, width: '100%', maxWidth: 380, padding: '1.5rem' }}>
            <h2 style={{ color: '#7A1828', fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Reset Password</h2>
            <p style={{ color: '#777', fontSize: '0.78rem', marginBottom: '1rem' }}>{resetTarget}</p>
            <div style={field}>
              <label style={lbl}>New Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 6 characters" style={inp} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setResetTarget(null)} style={{ flex: 1, background: '#f0f0f0', color: '#333', border: 'none', borderRadius: 8, padding: '0.65rem', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleResetPassword} disabled={!newPassword || actingOn === resetTarget}
                style={{ flex: 2, background: '#7A1828', color: '#fff', border: '2px solid #C9A84C', borderRadius: 999, padding: '0.65rem', cursor: 'pointer', fontWeight: 700 }}>
                {actingOn === resetTarget ? 'Saving…' : 'Reset Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const field: React.CSSProperties = { marginBottom: '1rem' }
const lbl: React.CSSProperties = { display: 'block', color: '#999', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem' }
const inp: React.CSSProperties = { width: '100%', background: '#fff', border: '1.5px solid #d0d0d0', borderRadius: 7, padding: '0.55rem 0.75rem', color: '#1a1a1a', fontSize: '0.85rem', boxSizing: 'border-box', outline: 'none' }
const th: React.CSSProperties = { padding: '0.6rem 0.85rem', textAlign: 'left', color: '#ccc', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.04em' }
const td: React.CSSProperties = { padding: '0.65rem 0.85rem', verticalAlign: 'middle' }
