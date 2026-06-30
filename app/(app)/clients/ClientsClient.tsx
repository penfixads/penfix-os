'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { formatPeso, generateClientId } from '@/lib/jo-helpers'
import type { AppUser } from '@/lib/user'

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
      const payload = {
        client_type: clientType,
        client_name: clientName || companyName,
        company_name: companyName || null,
        contact_number: contact || null,
        email: email || null,
        address: address || null,
        credit_line_status: creditLine,
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
    const name = (c.client_name || c.company_name || '').toLowerCase()
    const matchSearch = !search || name.includes(search.toLowerCase()) || (c.client_id || '').toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'all' || c.client_type === typeFilter
    return matchSearch && matchType
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ color: '#1a1a1a', fontSize: '1.4rem', fontWeight: 700 }}>Clients</h1>
          <p style={{ color: '#777', fontSize: '0.8rem', marginTop: 2 }}>{filtered.length} of {clients.length} clients</p>
        </div>
        <button onClick={openAdd} style={{ background: '#7B1C1C', color: '#fff', border: 'none', borderRadius: 999, borderRadius: 8, padding: '0.6rem 1.2rem', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
          + New Client
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
        <input type="text" placeholder="Search name or ID…" value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, background: '#f5f5f5', border: '1.5px solid #d0d0d0', borderRadius: 8, padding: '0.5rem 0.75rem', color: '#1a1a1a', fontSize: '0.82rem', outline: 'none' }} />
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          style={{ background: '#f5f5f5', border: '1.5px solid #d0d0d0', borderRadius: 8, padding: '0.5rem 0.75rem', color: '#1a1a1a', fontSize: '0.82rem', outline: 'none' }}>
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
            <div key={c.client_id} style={{ background: '#f5f5f5', borderRadius: 10, padding: '0.85rem 1rem', border: '1px solid #ebebeb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#1a1a1a', fontWeight: 700, fontSize: '0.88rem' }}>{c.client_name || c.company_name}</span>
                  {c.credit_line_status && <span style={{ background: '#1a2a4a', color: '#3498db', fontSize: '0.6rem', padding: '0.1rem 0.4rem', borderRadius: 10, fontWeight: 700 }}>CREDIT</span>}
                  {c.client_type === 'Company' && <span style={{ background: '#2a2a1a', color: '#f1c40f', fontSize: '0.6rem', padding: '0.1rem 0.4rem', borderRadius: 10, fontWeight: 700 }}>CO.</span>}
                </div>
                <div style={{ color: '#aaa', fontSize: '0.68rem', marginTop: 1 }}>{c.client_id} {c.contact_number ? `· ${c.contact_number}` : ''}</div>
                <div style={{ color: '#999', fontSize: '0.7rem', marginTop: 2 }}>
                  {totalJOs} JO(s) · {formatPeso(totalSales)} total sales · Rewards: {formatPeso(c.earned_rewards || 0)}
                </div>
              </div>
              <button onClick={() => openEdit(c)} style={{ background: '#f0f0f0', border: '1px solid #d0d0d0', color: '#666', borderRadius: 7, padding: '0.35rem 0.7rem', cursor: 'pointer', fontSize: '0.75rem' }}>
                Edit
              </button>
            </div>
          )
        })}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#f5f5f5', borderRadius: 14, width: '100%', maxWidth: 400, padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ color: '#1a1a1a', fontWeight: 700 }}>{editing ? 'Edit Client' : 'New Client'}</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#999', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={field}>
              <label style={lbl}>Type</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['Individual','Company'] as const).map(t => (
                  <button key={t} onClick={() => setClientType(t)}
                    style={{ flex: 1, padding: '0.45rem', borderRadius: 7, border: '1.5px solid', borderColor: clientType === t ? '#7B1C1C' : '#333', background: clientType === t ? '#7B1C1C' : 'transparent', color: '#1a1a1a', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div style={field}>
              <label style={lbl}>{clientType === 'Individual' ? 'Full Name' : 'Contact Person'} *</label>
              <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} style={inp} />
            </div>
            {clientType === 'Company' && (
              <div style={field}>
                <label style={lbl}>Company Name</label>
                <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} style={inp} />
              </div>
            )}
            <div style={field}>
              <label style={lbl}>Contact Number</label>
              <input type="text" value={contact} onChange={e => setContact(e.target.value)} style={inp} />
            </div>
            <div style={field}>
              <label style={lbl}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inp} />
            </div>
            <div style={field}>
              <label style={lbl}>Address</label>
              <input type="text" value={address} onChange={e => setAddress(e.target.value)} style={inp} />
            </div>
            <div style={{ ...field, display: 'flex', gap: 10, alignItems: 'center' }}>
              <input type="checkbox" checked={creditLine} onChange={e => setCreditLine(e.target.checked)} style={{ accentColor: '#7B1C1C', width: 16, height: 16 }} />
              <label style={{ ...lbl, marginBottom: 0, cursor: 'pointer' }}>Credit Line Client</label>
            </div>

            {error && <div style={{ color: '#e74c3c', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{error}</div>}

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, background: '#f0f0f0', color: '#1a1a1a', border: 'none', borderRadius: 8, padding: '0.7rem', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{ flex: 2, background: saving ? '#5a1010' : '#7B1C1C', color: '#1a1a1a', border: 'none', borderRadius: 8, padding: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>
                {saving ? 'Saving…' : editing ? 'Update Client' : 'Add Client'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const field: React.CSSProperties = { marginBottom: '0.85rem' }
const lbl: React.CSSProperties = { display: 'block', color: '#999', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.3rem' }
const inp: React.CSSProperties = { width: '100%', background: '#f5f5f5', border: '1.5px solid #d0d0d0', borderRadius: 7, padding: '0.5rem 0.7rem', color: '#1a1a1a', fontSize: '0.85rem', boxSizing: 'border-box', outline: 'none' }
