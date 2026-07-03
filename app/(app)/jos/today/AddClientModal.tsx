'use client'

import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { generateClientId } from '@/lib/jo-helpers'
import { IconX, IconCheck } from '@/components/icons'

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
    <div className="pf-modal-overlay" style={{ background: 'rgba(0,0,0,0.85)', zIndex: 300 }}>
      <div className="pf-modal-card pf-modal-wine" style={{ maxWidth: 400 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1.7rem' }}>Add New Client</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#E8B9C6', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
        </div>

        <div className="pf-field">
          <label className="pf-label">Client Type</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['Individual', 'Company'] as const).map(t => (
              <button key={t} type="button" onClick={() => setClientType(t)}
                className={clientType === t ? 'pf-btn' : 'pf-btn pf-btn-secondary'} style={{ minWidth: 100 }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="pf-field">
          <label className="pf-label">{clientType === 'Individual' ? 'Full Name' : 'Contact Person'} <span className="pf-req">*</span></label>
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
          <input type="text" value={contactNumber} onChange={e => setContactNumber(e.target.value)} placeholder="09XXXXXXXXX" className="pf-input" />
        </div>

        <div className="pf-field">
          <label className="pf-label">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="pf-input" />
        </div>

        <div className="pf-field">
          <label className="pf-label">Address</label>
          <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="pf-input" />
        </div>

        <div className="pf-field" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input type="checkbox" id="creditLine" checked={creditLine} onChange={e => setCreditLine(e.target.checked)} style={{ accentColor: '#C9A84C', width: 16, height: 16 }} />
          <label htmlFor="creditLine" className="pf-label" style={{ marginBottom: 0, cursor: 'pointer' }}>Credit Line Client</label>
        </div>

        {error && <div style={{ color: '#e74c3c', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{error}</div>}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="pf-btn pf-btn-secondary"><IconX />Cancel</button>
          <button onClick={handleSave} disabled={saving} className="pf-btn">
            <IconCheck />{saving ? 'Saving…' : 'Save Client'}
          </button>
        </div>
      </div>
    </div>
  )
}
