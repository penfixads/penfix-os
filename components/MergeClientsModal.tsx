'use client'

import { useState } from 'react'
import { formatPeso } from '@/lib/jo-helpers'
import { mergeClients } from '@/app/(app)/clients/actions'
import { IconMerge, IconX } from '@/components/icons'

type Client = {
  client_id: string
  client_type: string | null
  client_name: string | null
  company_name: string | null
  contact_number: string | null
  email: string | null
  messenger: string | null
  viber: string | null
  whatsapp: string | null
  address: string | null
  credit_line_status: boolean | null
  job_orders?: { job_order_id: string; grand_total: number | null }[]
  rewards_balance?: number
}

const FIELD_LABELS: [key: keyof Client, label: string][] = [
  ['client_name', 'Name'],
  ['company_name', 'Company'],
  ['contact_number', 'Contact Number'],
  ['email', 'Email'],
  ['messenger', 'Messenger'],
  ['viber', 'Viber'],
  ['whatsapp', 'WhatsApp'],
  ['address', 'Address'],
]

function summarize(c: Client) {
  const jos = c.job_orders?.length || 0
  const sales = (c.job_orders || []).reduce((s, j) => s + (j.grand_total || 0), 0)
  return { jos, sales }
}

export default function MergeClientsModal({ clientA, clientB, onClose, onMerged }: {
  clientA: Client
  clientB: Client
  onClose: () => void
  onMerged: (targetId: string, sourceId: string, resolved: Record<string, string | boolean | null>) => void
}) {
  const aSummary = summarize(clientA)
  const bSummary = summarize(clientB)
  // Default the record with more job orders to be the one that survives — it's the
  // more "established" record, so the other one's history moves into it.
  const [targetId, setTargetId] = useState(aSummary.jos >= bSummary.jos ? clientA.client_id : clientB.client_id)
  const target = targetId === clientA.client_id ? clientA : clientB
  const source = targetId === clientA.client_id ? clientB : clientA
  const targetSummary = targetId === clientA.client_id ? aSummary : bSummary
  const sourceSummary = targetId === clientA.client_id ? bSummary : aSummary

  const [picks, setPicks] = useState<Record<string, string>>({})
  const [merging, setMerging] = useState(false)
  const [error, setError] = useState('')

  function valueFor(key: keyof Client, from: Client) {
    return (from[key] as string | null | undefined) || ''
  }

  function resolvedValue(key: keyof Client) {
    if (picks[key] === 'source') return valueFor(key, source)
    if (picks[key] === 'target') return valueFor(key, target)
    // No explicit pick yet — default to target's value, falling back to source's if target is blank.
    return valueFor(key, target) || valueFor(key, source)
  }

  async function handleConfirm() {
    setMerging(true)
    setError('')
    const fields: Record<string, string | boolean | null> = {}
    for (const [key] of FIELD_LABELS) {
      const resolved = resolvedValue(key)
      if (resolved !== valueFor(key, target)) fields[key] = resolved || null
    }
    const result = await mergeClients(target.client_id, source.client_id, fields)
    setMerging(false)
    if (!result.success) { setError(result.message || 'Merge failed.'); return }
    onMerged(target.client_id, source.client_id, fields)
  }

  return (
    <div className="pf-modal-overlay" style={{ background: 'rgba(0,0,0,0.85)', zIndex: 400 }}>
      <div className="pf-modal-card pf-modal-wine" style={{ maxWidth: 620 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1.5rem' }}>Merge Client Records</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#E8B9C6', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
        </div>

        <p style={{ color: '#E8B9C6', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          Only merge these if you&apos;re sure they&apos;re the same client — this moves job orders, payments, and rewards history permanently.
        </p>

        {/* Which one survives */}
        <div className="pf-field">
          <label className="pf-label">Keep records under</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[clientA, clientB].map(c => {
              const s = summarize(c)
              const isTarget = c.client_id === targetId
              return (
                <button
                  key={c.client_id}
                  type="button"
                  onClick={() => setTargetId(c.client_id)}
                  className={isTarget ? 'pf-btn' : 'pf-btn pf-btn-secondary'}
                  style={{ flex: 1, flexDirection: 'column', alignItems: 'flex-start', padding: '0.6rem 0.85rem', gap: 2 }}
                >
                  <span style={{ fontWeight: 700 }}>{c.client_name || c.company_name}</span>
                  <span style={{ fontWeight: 400, fontSize: '0.75rem', opacity: 0.85 }}>{s.jos} JO(s) · {formatPeso(s.sales)}</span>
                </button>
              )
            })}
          </div>
        </div>

        <p style={{ color: '#fff', fontSize: '0.85rem', margin: '1rem 0' }}>
          <b>{sourceSummary.jos} job order{sourceSummary.jos === 1 ? '' : 's'}</b>, its payments, and rewards history will move from{' '}
          <b>{source.client_name || source.company_name}</b> into <b>{target.client_name || target.company_name}</b>, which will then have{' '}
          <b>{targetSummary.jos + sourceSummary.jos} job order{targetSummary.jos + sourceSummary.jos === 1 ? '' : 's'}</b>. The &quot;{source.client_name || source.company_name}&quot; record stays on file, just empty.
        </p>

        {/* Per-field picks, only shown where the two disagree */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
          {FIELD_LABELS.map(([key, label]) => {
            const targetVal = valueFor(key, target)
            const sourceVal = valueFor(key, source)
            if (!targetVal && !sourceVal) return null
            if (targetVal === sourceVal) return null
            const picked = picks[key] === 'source' ? 'source' : 'target'
            return (
              <div key={key} className="pf-field" style={{ marginBottom: 0 }}>
                <label className="pf-label">{label}</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" onClick={() => setPicks(p => ({ ...p, [key]: 'target' }))}
                    className={picked === 'target' ? 'pf-btn' : 'pf-btn pf-btn-secondary'} style={{ flex: 1, justifyContent: 'flex-start', fontSize: '0.78rem' }}>
                    {targetVal || <span style={{ opacity: 0.6 }}>(blank)</span>}
                  </button>
                  <button type="button" onClick={() => setPicks(p => ({ ...p, [key]: 'source' }))}
                    className={picked === 'source' ? 'pf-btn' : 'pf-btn pf-btn-secondary'} style={{ flex: 1, justifyContent: 'flex-start', fontSize: '0.78rem' }}>
                    {sourceVal || <span style={{ opacity: 0.6 }}>(blank)</span>}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {error && <div style={{ color: '#e74c3c', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{error}</div>}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="pf-btn pf-btn-secondary" disabled={merging}><IconX />Cancel</button>
          <button onClick={handleConfirm} disabled={merging} className="pf-btn">
            <IconMerge />{merging ? 'Merging…' : 'Merge Clients'}
          </button>
        </div>
      </div>
    </div>
  )
}
