'use client'

import type { RecordMatch } from '@/lib/record-dedupe'

interface Props<T> {
  title: string
  message: string
  matches: RecordMatch<T>[]
  getKey: (record: T) => string
  renderMatch: (record: T) => React.ReactNode
  onUseExisting: (record: T) => void
  onSaveAnyway: () => void
  onCancel: () => void
}

const REASON_LABEL: Record<RecordMatch<unknown>['reason'], string> = {
  exact: 'Looks identical to this entry',
  similar: 'Very similar to this entry',
}

export default function DuplicateRecordPrompt<T>({ title, message, matches, getKey, renderMatch, onUseExisting, onSaveAnyway, onCancel }: Props<T>) {
  return (
    <div className="pf-modal-overlay" style={{ background: 'rgba(0,0,0,0.85)', zIndex: 400 }}>
      <div className="pf-modal-card pf-modal-wine" style={{ maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1.3rem' }}>{title}</h3>
          <p style={{ color: '#E8B9C6', fontSize: '0.8rem', marginTop: 6 }}>{message}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: '1.1rem' }}>
          {matches.map(m => (
            <div key={getKey(m.record)} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: '0.6rem 0.75rem' }}>
              {renderMatch(m.record)}
              <div style={{ color: '#C99', fontSize: '0.72rem', margin: '4px 0 6px' }}>{REASON_LABEL[m.reason]}</div>
              <button onClick={() => onUseExisting(m.record)} className="pf-btn" style={{ width: '100%' }}>
                Yes, edit this existing entry instead
              </button>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button onClick={onCancel} className="pf-btn pf-btn-secondary">Cancel</button>
          <button onClick={onSaveAnyway} className="pf-btn pf-btn-secondary">No, this is a different entry — save anyway</button>
        </div>
      </div>
    </div>
  )
}
