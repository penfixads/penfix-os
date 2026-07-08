'use client'

import { useState, useRef, useEffect } from 'react'
import { createUser, updateUserInfo, deleteUser, toggleUserActive, resetUserPassword, setToolsAccess } from './actions'
import { IconUserPlus, IconCheck, IconX, IconKey } from '@/components/icons'
import Pagination from '@/components/Pagination'
import { FormField, Select } from '@/components/form'

const PAGE_SIZE = 10

// 'None' = zero jobs.penfixads.com access — for people who only need
// another Penfix app (e.g. a tools.penfixads.com-only Custodian). They
// still exist here (login, deactivate, reset password all work) but every
// protected page bounces them to /login since 'None' isn't a real role.
const ROLES = ['None', 'Admin', 'GA', 'Treasury', 'Fabricator']
const ROLE_LABELS: Record<string, string> = { None: 'No jobs access' }

// Access levels on tools.penfixads.com — independent of the jobs role above.
// '' = no Tools access (no tool_users row).
const TOOLS_ROLES = ['', 'Custodian', 'Fabricator'] as const

/** One block, used in both the Create and Edit modals — editing this
 * definition (options, styling, help text) updates both call sites. This
 * is what should have existed the first time instead of two hand-copied
 * <select> blocks, one of which then silently fell out of sync. */
function ToolsAccessField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <FormField label={<>Tools Access <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(tools.penfixads.com)</span></>}>
      <Select value={value} onChange={e => onChange(e.target.value)}>
        {TOOLS_ROLES.map(r => <option key={r} value={r}>{r || 'No access'}</option>)}
      </Select>
    </FormField>
  )
}

const ROLE_COLORS: Record<string, string> = {
  Admin:     '#7A1828',
  GA:        '#1a4a7a',
  Treasury:  '#1a5a1a',
  Fabricator:'#4a3a00',
  None:      '#555',
}

interface Props {
  users: any[]
}

export default function UsersClient({ users: initialUsers }: Props) {
  const tableScrollRef = useRef<HTMLDivElement>(null)
  const [scrollX, setScrollX] = useState(0)
  const [maxScrollX, setMaxScrollX] = useState(0)

  useEffect(() => {
    function measure() {
      const el = tableScrollRef.current
      if (el) setMaxScrollX(Math.max(0, el.scrollWidth - el.clientWidth))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  function handleSliderChange(value: number) {
    setScrollX(value)
    if (tableScrollRef.current) tableScrollRef.current.scrollLeft = value
  }

  function handleTableScroll() {
    if (tableScrollRef.current) setScrollX(tableScrollRef.current.scrollLeft)
  }

  const [users, setUsers] = useState(initialUsers)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [actingOn, setActingOn] = useState<string | null>(null)
  const [resetTarget, setResetTarget] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [editingUser, setEditingUser] = useState<any | null>(null)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editRole, setEditRole] = useState('GA')
  const [editToolsRole, setEditToolsRole] = useState('')
  const [editError, setEditError] = useState('')
  const [page, setPage] = useState(1)
  const currentPage = Math.min(page, Math.max(1, Math.ceil(users.length / PAGE_SIZE)))
  const pageItems = users.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  // New user form
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('GA')
  const [toolsRole, setToolsRole] = useState('')

  function resetForm() {
    setName(''); setEmail(''); setPassword(''); setRole('GA'); setToolsRole('')
    setError(''); setSuccess('')
  }

  // Granting Tools access to a freshly-opened (still-default 'GA') form
  // nudges Role to 'None' — most people getting Tools access (Custodians
  // especially) have no reason to touch jobs.penfixads.com at all. Admin
  // can still pick a real jobs role afterwards if this person needs both.
  function handleToolsRoleChange(value: string) {
    setToolsRole(value)
    if (value && role === 'GA') setRole('None')
  }

  async function handleCreate() {
    if (!name || !email || !password) { setError('All fields are required.'); return }
    setSaving(true); setError(''); setSuccess('')
    const result = await createUser({ name, email, password, role, toolsRole: (toolsRole || null) as 'Custodian' | 'Fabricator' | null })
    if (!result.success) {
      setError(result.message)
    } else {
      setUsers(prev => [...prev, { user_email: email, name, role, is_active: true, tools_role: toolsRole || null }])
      setPage(prev => Math.ceil((users.length + 1) / PAGE_SIZE))
      setSuccess(`User ${name} created successfully.`)
      resetForm()
      setShowForm(false)
    }
    setSaving(false)
  }

  async function handleToolsAccessChange(email: string, newToolsRole: string) {
    const label = newToolsRole || 'No access'
    if (!confirm(`Set Tools (tools.penfixads.com) access for ${email} to "${label}"?`)) return
    setActingOn(email)
    const result = await setToolsAccess(email, (newToolsRole || null) as 'Custodian' | 'Fabricator' | null)
    if (!result.success) {
      alert(result.message)
    } else {
      setUsers(prev => prev.map(u => u.user_email === email ? { ...u, tools_role: newToolsRole || null } : u))
    }
    setActingOn(null)
  }

  async function handleToggleActive(email: string, current: boolean) {
    if (!confirm(`${current ? 'Deactivate' : 'Activate'} user ${email}?`)) return
    setActingOn(email)
    const result = await toggleUserActive(email, !current)
    if (!result.success) {
      alert(result.message)
    } else {
      setUsers(prev => prev.map(u => u.user_email === email ? { ...u, is_active: !current } : u))
    }
    setActingOn(null)
  }

  function openEdit(u: any) {
    setEditingUser(u)
    setEditName(u.name)
    setEditEmail(u.user_email)
    setEditRole(u.role)
    setEditToolsRole(u.tools_role || '')
    setEditError('')
  }

  async function handleEditSave() {
    if (!editingUser) return
    if (!editName || !editEmail) { setEditError('Name and email are required.'); return }
    setActingOn(editingUser.user_email)
    setEditError('')
    const result = await updateUserInfo(editingUser.user_email, { name: editName, email: editEmail, role: editRole })
    if (!result.success) {
      setEditError(result.message)
      setActingOn(null)
      return
    }
    const toolsChanged = editToolsRole !== (editingUser.tools_role || '')
    if (toolsChanged) {
      const toolsResult = await setToolsAccess(editEmail, (editToolsRole || null) as 'Custodian' | 'Fabricator' | null)
      if (!toolsResult.success) {
        setEditError(`Name/role saved, but Tools access update failed: ${toolsResult.message}`)
        setActingOn(null)
        return
      }
    }
    const oldEmail = editingUser.user_email
    setUsers(prev => prev.map(u => u.user_email === oldEmail ? { ...u, name: editName, user_email: editEmail, role: editRole, tools_role: editToolsRole || null } : u))
    setEditingUser(null)
    setSuccess(`User ${editName} updated successfully.`)
    setActingOn(null)
  }

  async function handleDelete(u: any) {
    if (!confirm(`Delete user ${u.name} (${u.user_email})? This cannot be undone.`)) return
    setActingOn(u.user_email)
    const result = await deleteUser(u.user_email)
    if (!result.success) {
      alert(result.message)
    } else {
      setUsers(prev => prev.filter(x => x.user_email !== u.user_email))
      setSuccess(`User ${u.name} deleted.`)
    }
    setActingOn(null)
  }

  async function handleResetPassword() {
    if (!resetTarget || !newPassword) return
    setActingOn(resetTarget)
    const result = await resetUserPassword(resetTarget, newPassword)
    if (!result.success) {
      alert(result.message)
    } else {
      setResetTarget(null)
      setNewPassword('')
      setSuccess(`Password reset for ${resetTarget}.`)
    }
    setActingOn(null)
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ color: '#7A1828', fontSize: '1.4rem', fontWeight: 700 }}>User Management</h1>
          <p style={{ color: '#777', fontSize: '0.8rem', marginTop: 2 }}>{users.length} registered user(s)</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true) }} className="pf-btn">
          <IconUserPlus />New User
        </button>
      </div>

      {success && (
        <div style={{ background: '#1a3a1a', border: '1px solid #27ae60', color: '#2ecc71', borderRadius: 8, padding: '0.65rem 1rem', marginBottom: '1rem', fontSize: '0.82rem' }}>
          {success}
        </div>
      )}

      {/* Users Table */}
      <div ref={tableScrollRef} onScroll={handleTableScroll} style={{ background: '#FDF5EC', borderRadius: 12, border: '1px solid #EDE0CC', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', minWidth: 900 }}>
          <thead>
            <tr style={{ background: '#3a3a3a' }}>
              <th style={th}>Name</th>
              <th style={th}>Email</th>
              <th style={th}>Role</th>
              <th style={th}>Tools Access</th>
              <th style={{ ...th, textAlign: 'center' }}>Status</th>
              <th style={{ ...th, textAlign: 'center' }}>Actions</th>
              <th style={{ ...th, textAlign: 'center' }}>Edit / Delete</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((u, i) => (
              <tr key={u.user_email} style={{ borderBottom: '1px solid #EDE0CC', background: i % 2 === 0 ? '#FDF5EC' : '#faf0e0' }}>
                <td style={td}>
                  <div style={{ fontWeight: 700, color: '#1a1a1a' }}>{u.name}</div>
                </td>
                <td style={{ ...td, color: '#555' }}>{u.user_email}</td>
                <td style={td}>
                  <span style={{ background: ROLE_COLORS[u.role] || '#333', color: '#fff', borderRadius: 20, padding: '0.25rem 0.6rem', fontSize: '0.72rem', fontWeight: 700 }}>
                    {ROLE_LABELS[u.role] || u.role}
                  </span>
                </td>
                <td style={td}>
                  <select
                    value={u.tools_role || ''}
                    disabled={actingOn === u.user_email}
                    onChange={e => handleToolsAccessChange(u.user_email, e.target.value)}
                    style={{ background: u.tools_role ? '#4a3a00' : 'transparent', color: u.tools_role ? '#fff' : '#999', border: u.tools_role ? 'none' : '1px solid #d8ccc0', borderRadius: 20, padding: '0.25rem 0.5rem', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>
                    {TOOLS_ROLES.map(r => <option key={r} value={r} style={{ background: '#FDF5EC', color: '#2a2426' }}>{r || 'No access'}</option>)}
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
                <td style={{ ...td, textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                    <button
                      title="Edit user"
                      onClick={() => openEdit(u)}
                      disabled={actingOn === u.user_email}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A1828', padding: '0.3rem', display: 'flex', alignItems: 'center' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button
                      title="Delete user"
                      onClick={() => handleDelete(u)}
                      disabled={actingOn === u.user_email}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c', padding: '0.3rem', display: 'flex', alignItems: 'center' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={currentPage} totalItems={users.length} pageSize={PAGE_SIZE} onPageChange={setPage} />

      {maxScrollX > 0 && (
        <input
          type="range"
          min={0}
          max={maxScrollX}
          value={scrollX}
          onChange={e => handleSliderChange(Number(e.target.value))}
          aria-label="Scroll table horizontally"
          style={{ width: '100%', marginTop: '0.6rem', accentColor: '#7A1828' }}
        />
      )}

      {/* New User Modal */}
      {showForm && (
        <div className="pf-modal-overlay">
          <div className="pf-modal-card pf-modal-wine" style={{ maxWidth: 440 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ color: '#fff', fontSize: '1.7rem', fontWeight: 700 }}>Register New User</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#E8B9C6', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div className="pf-field">
              <label className="pf-label">Full Name <span className="pf-req">*</span></label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Juan dela Cruz" className="pf-input" />
            </div>
            <div className="pf-field">
              <label className="pf-label">Email Address <span className="pf-req">*</span></label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="user@penfix.com" className="pf-input" />
            </div>
            <div className="pf-field">
              <label className="pf-label">Temporary Password <span className="pf-req">*</span></label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" className="pf-input" />
            </div>
            <div className="pf-field">
              <label className="pf-label">Role <span className="pf-req">*</span></label>
              <select value={role} onChange={e => setRole(e.target.value)} className="pf-select">
                {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>)}
              </select>
            </div>
            <ToolsAccessField value={toolsRole} onChange={handleToolsRoleChange} />

            {error && <div style={{ color: '#e74c3c', fontSize: '0.82rem', marginBottom: '0.75rem' }}>{error}</div>}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)} className="pf-btn pf-btn-secondary"><IconX />Cancel</button>
              <button onClick={handleCreate} disabled={saving} className="pf-btn">
                <IconCheck />{saving ? 'Creating…' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="pf-modal-overlay">
          <div className="pf-modal-card pf-modal-wine" style={{ maxWidth: 440 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ color: '#fff', fontSize: '1.7rem', fontWeight: 700 }}>Edit User</h2>
              <button onClick={() => setEditingUser(null)} style={{ background: 'none', border: 'none', color: '#E8B9C6', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div className="pf-field">
              <label className="pf-label">Full Name <span className="pf-req">*</span></label>
              <input value={editName} onChange={e => setEditName(e.target.value)} placeholder="e.g. Juan dela Cruz" className="pf-input" />
            </div>
            <div className="pf-field">
              <label className="pf-label">Email Address <span className="pf-req">*</span></label>
              <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} placeholder="user@penfix.com" className="pf-input" />
            </div>
            <div className="pf-field">
              <label className="pf-label">Role <span className="pf-req">*</span></label>
              <select value={editRole} onChange={e => setEditRole(e.target.value)} className="pf-select">
                {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>)}
              </select>
            </div>
            <ToolsAccessField value={editToolsRole} onChange={setEditToolsRole} />

            {editError && <div style={{ color: '#e74c3c', fontSize: '0.82rem', marginBottom: '0.75rem' }}>{editError}</div>}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setEditingUser(null)} className="pf-btn pf-btn-secondary"><IconX />Cancel</button>
              <button onClick={handleEditSave} disabled={actingOn === editingUser.user_email} className="pf-btn">
                <IconCheck />{actingOn === editingUser.user_email ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetTarget && (
        <div className="pf-modal-overlay">
          <div className="pf-modal-card pf-modal-wine" style={{ maxWidth: 380 }}>
            <h2 style={{ color: '#fff', fontSize: '1.7rem', fontWeight: 700, marginBottom: '0.5rem' }}>Reset Password</h2>
            <p style={{ color: '#E8B9C6', fontSize: '0.78rem', marginBottom: '1rem' }}>{resetTarget}</p>
            <div className="pf-field">
              <label className="pf-label">New Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 6 characters" className="pf-input" />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setResetTarget(null)} className="pf-btn pf-btn-secondary"><IconX />Cancel</button>
              <button onClick={handleResetPassword} disabled={!newPassword || actingOn === resetTarget} className="pf-btn">
                <IconKey />{actingOn === resetTarget ? 'Saving…' : 'Reset Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const th: React.CSSProperties = { padding: '0.6rem 0.85rem', textAlign: 'left', color: '#ccc', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.04em' }
const td: React.CSSProperties = { padding: '0.65rem 0.85rem', verticalAlign: 'middle' }
