'use client'

import type { ClientMatch } from '@/lib/client-dedupe'

interface Props {
  enteredName: string
  matches: ClientMatch[]
  onUseExisting: (client: ClientMatch['client']) => void
  onSaveAnyway: () => void
  onCancel: () => void
}

const REASON_LABEL: Record<ClientMatch['reason'], string> = {
  exact: 'Same name on file',
  contact: 'Same phone/email on file',
  subset: 'Name looks like a shorter/longer version of this one',
  similar: 'Very similar name on file',
}

export default function DuplicateClientPrompt({ enteredName, matches, onUseExisting, onSaveAnyway, onCancel }: Props) {
  return (
    <div className="pf-modal-overlay" style={{ background: 'rgba(0,0,0,0.85)', zIndex: 400 }}>
      <div className="pf-modal-card pf-modal-wine" style={{ maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1.3rem' }}>Possible Existing Client</h3>
          <p style={{ color: '#E8B9C6', fontSize: '0.8rem', marginTop: 6 }}>
            &quot;{enteredName}&quot; looks similar to {matches.length === 1 ? 'a client' : 'clients'} already on file. Is this the same person?
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: '1.1rem' }}>
          {matches.map(m => (
            <div key={m.client.client_id} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: '0.6rem 0.75rem' }}>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.88rem' }}>
                {m.client.client_name || m.client.company_name}
                {m.client.company_name && m.client.client_name && (
                  <span style={{ color: '#E8B9C6', fontWeight: 400 }}> · {m.client.company_name}</span>
                )}
              </div>
              <div style={{ color: '#C99', fontSize: '0.72rem', marginBottom: 6 }}>
                {m.client.client_id} · {REASON_LABEL[m.reason]}
              </div>
              <button onClick={() => onUseExisting(m.client)} className="pf-btn" style={{ width: '100%' }}>
                Yes, this is the same person
              </button>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button onClick={onCancel} className="pf-btn pf-btn-secondary">Cancel</button>
          <button onClick={onSaveAnyway} className="pf-btn pf-btn-secondary">No, different person — save as new</button>
        </div>
      </div>
    </div>
  )
}
