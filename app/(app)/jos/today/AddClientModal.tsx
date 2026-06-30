'use client'

import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { generateClientId } from '@/lib/jo-helpers'

interface Props {
  onSave: (client: any) => void
  onClose: () => void
}

export default function AddClientModal({ onSave, onClose }: Props) {
  const [clientType, setClientType] = useState<'Individual' | 'Company'>('Individual')
  const [clientName, setClientName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [creditLine, setCreditLine] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    if (!clientName && !companyName) { setError('Provide at least a name or company.'); return }
    setSaving(true)
    setError('')
    try {
      const supabase = createSupabaseBrowserClient()
      const clientId = generateClientId()
      const { data, error: err } = await supabase.from('clients').insert({
        client_id: clientId,
        client_type: clientType,
        client_name: clientName || companyName,
        company_name: companyName || null,
        contact_number: contactNumber || null,
        email: email || null,
        address: address || null,
        credit_line_status: creditLine,
        earned_rewards: 0,
        claimed_rewards: 0,
      }).select().single()
      if (err) throw err
      onSave(data)
    } catch (e: any) {
      setError(e.message || 'Failed to save client.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#FDF5EC', borderRadius: 14, width: '100%', maxWidth: 400, padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>Add New Client</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={field}>
          <label style={lbl}>Client Type</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['Individual', 'Company'] as const).map(t => (
              <button key={t} type="button" onClick={() => setClientType(t)}
                style={{ flex: 1, padding: '0.45rem', borderRadius: 7, border: '1.5px solid', borderColor: clientType === t ? '#7A1828' : '#333', background: clientType === t ? '#7A1828' : 'transparent', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div style={field}>
          <label style={lbl}>{clientType === 'Individual' ? 'Full Name' : 'Contact Person'} <span style={{ color: '#e74c3c' }}>*</span></label>
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
          <input type="text" value={contactNumber} onChange={e => setContactNumber(e.target.value)} placeholder="09XXXXXXXXX" style={inp} />
        </div>

        <div style={field}>
          <label style={lbl}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inp} />
        </div>

        <div style={field}>
          <label style={lbl}>Address</label>
          <input type="text" value={address} onChange={e => setAddress(e.target.value)} style={inp} />
        </div>

        <div style={{ ...field, display: 'flex', alignItems: 'center', gap: 10 }}>
          <input type="checkbox" id="creditLine" checked={creditLine} onChange={e => setCreditLine(e.target.checked)} style={{ accentColor: '#7A1828', width: 16, height: 16 }} />
          <label htmlFor="creditLine" style={{ ...lbl, marginBottom: 0, cursor: 'pointer' }}>Credit Line Client</label>
        </div>

        {error && <div style={{ color: '#e74c3c', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{error}</div>}

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, background: '#eee', color: '#333', border: 'none', borderRadius: 8, padding: '0.7rem', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ flex: 2, background: '#7A1828', color: '#fff', border: 'none', borderRadius: 8, padding: '0.7rem', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Saving…' : 'Save Client'}
          </button>
        </div>
      </div>
    </div>
  )
}

const field: React.CSSProperties = { marginBottom: '0.85rem' }
const lbl: React.CSSProperties = { display: 'block', color: '#888', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.3rem' }
const inp: React.CSSProperties = { width: '100%', background: '#fff', border: '1.5px solid #d0c9b0', borderRadius: 7, padding: '0.5rem 0.7rem', color: '#1a1a1a', fontSize: '0.85rem', boxSizing: 'border-box', outline: 'none' }
