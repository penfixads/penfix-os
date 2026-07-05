'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { formatPeso, generateClientId } from '@/lib/jo-helpers'
import type { AppUser } from '@/lib/user'
import { IconUserPlus, IconEdit, IconCheck, IconX } from '@/components/icons'

interface Props { clients: any[]; currentUser: AppUser }

export default function ClientsClient({ clients: initClients, currentUser }: Props) {
  const router = useRouter()
  const [clients, setClients] = useState(initClients)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [clientType, setClientType] = useState<'Individual' | 'Company'>('Individual')
  const [clientName, setClientName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [contact, setContact] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [creditLine, setCreditLine] = useState(false)

  function openAdd() {
    setEditing(null); setClientType('Individual'); setClientName(''); setCompanyName('')
    setContact(''); setEmail(''); setAddress(''); setCreditLine(false); setError(''); setShowForm(true)
  }

  function openEdit(c: any) {
    setEditing(c)
    setClientType(c.client_type || 'Individual')
    setClientName(c.client_name || '')
    setCompanyName(c.company_name || '')
    setContact(c.contact_number || '')
    setEmail(c.email || '')
    setAddress(c.address || '')
    setCreditLine(!!c.credit_line_status)
    setError('')
    setShowForm(true)
  }

  async function handleSave() {
    if (!clientName && !companyName) { setError('Provide at least a name.'); return }
    setSaving(true); setError('')
    try {
      const supabase = createSupabaseBrowserClient()
      const payload: Record<string, any> = {
        client_type: clientType,
        client_name: clientName || companyName,
        company_name: companyName || null,
        contact_number: contact || null,
        email: email || null,
        address: address || null,
      }
      // Only Admin can set credit line / for-billing status directly. GA/Treasury checking
      // the box just files a request for Admin to approve on the Pending Approval page —
      // it never flips credit_line_status itself.
      if (currentUser.role === 'Admin') {
        payload.credit_line_status = creditLine
        payload.credit_line_request_status = null
        payload.credit_line_requested_by = null
      } else if (creditLine && !editing?.credit_line_status && editing?.credit_line_request_status !== 'Pending') {
        payload.credit_line_request_status = 'Pending'
        payload.credit_line_requested_by = currentUser.name
      }
      if (editing) {
        const { data } = await supabase.from('clients').update(payload).eq('client_id', editing.client_id).select('*, job_orders(job_order_id, grand_total, payment_status)').single()
        setClients(prev => prev.map(c => c.client_id === editing.client_id ? data : c))
      } else {
        const { data } = await supabase.from('clients').insert({ ...payload, client_id: generateClientId(), earned_rewards: 0, claimed_rewards: 0 }).select('*, job_orders(job_order_id, grand_total, payment_status)').single()
        setClients(prev => [data, ...prev])
      }
      setShowForm(false)
    } catch (e: any) {
      setError(e.message || 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const filtered = clients.filter(c => {
    const q = search.toLowerCase()
    const matchSearch = !search
      || (c.client_name || '').toLowerCase().includes(q)
      || (c.company_name || '').toLowerCase().includes(q)
      || (c.client_id || '').toLowerCase().includes(q)
    const matchType = typeFilter === 'all' || c.client_type === typeFilter
    return matchSearch && matchType
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ color: '#7A1828', fontSize: '1.4rem', fontWeight: 700 }}>Clients</h1>
          <p style={{ color: '#777', fontSize: '0.8rem', marginTop: 2 }}>{filtered.length} of {clients.length} clients</p>
        </div>
        <button onClick={openAdd} className="pf-btn">
          <IconUserPlus />New Client
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input type="text" placeholder="Search name or ID…" value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 180, background: '#FDF5EC', border: '1.5px solid #d0d0d0', borderRadius: 8, padding: '0.5rem 0.75rem', color: '#1a1a1a', fontSize: '0.82rem', outline: 'none' }} />
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          style={{ background: '#FDF5EC', border: '1.5px solid #d0d0d0', borderRadius: 8, padding: '0.5rem 0.75rem', color: '#1a1a1a', fontSize: '0.82rem', outline: 'none' }}>
          <option value="all">All Types</option>
          <option value="Individual">Individual</option>
          <option value="Company">Company</option>
        </select>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {filtered.map(c => {
          const totalSales = (c.job_orders || []).reduce((s: number, j: any) => s + (j.grand_total || 0), 0)
          const totalJOs = c.job_orders?.length || 0
          return (
            <div key={c.client_id} style={{ background: '#FDF5EC', borderRadius: 10, padding: '0.85rem 1rem', border: '1px solid #EDE0CC', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#1a1a1a', fontWeight: 700, fontSize: '0.88rem' }}>{c.client_name || c.company_name}</span>
                  {c.company_name && c.client_name && (
                    <span style={{ color: '#7A1828', fontWeight: 600, fontSize: '0.78rem' }}>· {c.company_name}</span>
                  )}
                  {c.credit_line_status && <span style={{ background: '#1a2a4a', color: '#3498db', fontSize: '0.6rem', padding: '0.1rem 0.4rem', borderRadius: 10, fontWeight: 700 }}>CREDIT</span>}
                  {!c.credit_line_status && c.credit_line_request_status === 'Pending' && <span style={{ background: '#4a3a1a', color: '#f39c12', fontSize: '0.6rem', padding: '0.1rem 0.4rem', borderRadius: 10, fontWeight: 700 }}>CREDIT PENDING</span>}
                  {c.client_type === 'Company' && <span style={{ background: '#2a2a1a', color: '#f1c40f', fontSize: '0.6rem', padding: '0.1rem 0.4rem', borderRadius: 10, fontWeight: 700 }}>CO.</span>}
                </div>
                <div style={{ color: '#aaa', fontSize: '0.68rem', marginTop: 1 }}>{c.client_id} {c.contact_number ? `· ${c.contact_number}` : ''}</div>
                <div style={{ color: '#999', fontSize: '0.7rem', marginTop: 2 }}>
                  {totalJOs} JO(s) · {formatPeso(totalSales)} total sales · Rewards: {formatPeso(c.rewards_balance || 0)}
                </div>
              </div>
              <button onClick={() => openEdit(c)} className="pf-btn pf-btn-secondary" style={{ fontSize: '0.75rem', padding: '0.35rem 0.7rem' }}>
                <IconEdit />Edit
              </button>
            </div>
          )
        })}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="pf-modal-overlay" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="pf-modal-card pf-modal-wine" style={{ maxWidth: 400 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1.7rem' }}>{editing ? 'Edit Client' : 'New Client'}</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#E8B9C6', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div className="pf-field">
              <label className="pf-label">Type</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['Individual','Company'] as const).map(t => (
                  <button key={t} onClick={() => setClientType(t)}
                    className={clientType === t ? 'pf-btn' : 'pf-btn pf-btn-secondary'} style={{ minWidth: 100 }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="pf-field">
              <label className="pf-label">{clientType === 'Individual' ? 'Full Name' : 'Contact Person'} *</label>
              <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} className="pf-input" />
            </div>
            {clientType === 'Company' && (
              <div className="pf-field">
                <label className="pf-label">Company Name</label>
                <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value.toUpperCase())} className="pf-input" style={{ textTransform: 'uppercase' }} />
              </div>
            )}
            <div className="pf-field">
              <label className="pf-label">Contact Number</label>
              <input type="text" value={contact} onChange={e => setContact(e.target.value)} className="pf-input" />
            </div>
            <div className="pf-field">
              <label className="pf-label">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="pf-input" />
            </div>
            <div className="pf-field">
              <label className="pf-label">Address</label>
              <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="pf-input" />
            </div>
            {(() => {
              const isAdmin = currentUser.role === 'Admin'
              const alreadyApproved = !!editing?.credit_line_status
              const isPending = editing?.credit_line_request_status === 'Pending'
              const locked = !isAdmin && (alreadyApproved || isPending)
              return (
                <div className="pf-field" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input type="checkbox" checked={creditLine} disabled={locked}
                    onChange={e => setCreditLine(e.target.checked)} style={{ accentColor: '#C9A84C', width: 16, height: 16 }} />
                  <label className="pf-label" style={{ marginBottom: 0, cursor: locked ? 'not-allowed' : 'pointer' }}
                    title={isAdmin ? undefined : isPending ? 'Already pending Admin approval' : alreadyApproved ? 'Only an Admin can remove credit line status' : 'Requesting this will need Admin approval before it takes effect'}>
                    Credit Line Client
                    {!isAdmin && isPending && <span style={{ color: '#f39c12', fontWeight: 400 }}> (Pending Admin approval)</span>}
                    {!isAdmin && !isPending && !alreadyApproved && <span style={{ color: '#999', fontWeight: 400 }}> (needs Admin approval)</span>}
                    {!isAdmin && alreadyApproved && <span style={{ color: '#999', fontWeight: 400 }}> (Admin only to remove)</span>}
                  </label>
                </div>
              )
            })()}

            {error && <div style={{ color: '#e74c3c', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{error}</div>}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)} className="pf-btn pf-btn-secondary"><IconX />Cancel</button>
              <button onClick={handleSave} disabled={saving} className="pf-btn">
                <IconCheck />{saving ? 'Saving…' : editing ? 'Update Client' : 'Add Client'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
