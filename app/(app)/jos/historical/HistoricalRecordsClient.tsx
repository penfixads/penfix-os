'use client'

import { useState } from 'react'
import { formatPeso } from '@/lib/jo-helpers'
import type { AppUser } from '@/lib/user'
import NewJOModal from '@/components/NewJOModal'
import { IconPlus } from '@/components/icons'

interface Props {
  clients: any[]
  categories: any[]
  subcategories: any[]
  backdatedJOs: any[]
  currentUser: AppUser
}

export default function HistoricalRecordsClient({ clients, categories, subcategories, backdatedJOs: initialBackdated, currentUser }: Props) {
  const [backdatedJOs, setBackdatedJOs] = useState(initialBackdated)
  const [showForm, setShowForm] = useState(false)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ color: '#7A1828', fontSize: '1.4rem', fontWeight: 700 }}>Add Historical Records</h1>
          <p style={{ color: '#888', fontSize: '0.85rem' }}>Backdate a job order with admin approval</p>
        </div>
        <button onClick={() => setShowForm(true)} className="pf-btn">
          <IconPlus />Add Historical Job Order
        </button>
      </div>

      <div style={{ background: '#FDF5EC', borderRadius: 10, padding: '1rem', border: '1px solid #EDE0CC', marginBottom: '1.25rem' }}>
        <div style={{ color: '#666', fontSize: '0.8rem' }}>
          The Date Received field defaults to today and is locked. An Admin must enter their credentials to unlock it before a different date can be chosen — every backdated entry below is logged with which Admin authorized it.
        </div>
      </div>

      <div style={{ color: '#7A1828', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.6rem' }}>Backdated Job Orders ({backdatedJOs.length})</div>
      {backdatedJOs.length === 0 ? (
        <div style={{ color: '#aaa', textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem' }}>No historical job orders have been added yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {backdatedJOs.map(jo => {
            const clientName = jo.clients?.client_name || jo.clients?.company_name || jo.client_id
            return (
              <div key={jo.job_order_id} style={{ background: '#FDF5EC', borderRadius: 10, padding: '0.75rem 1rem', border: '1px solid #EDE0CC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: '#1a1a1a', fontWeight: 700, fontSize: '0.88rem' }}>{clientName}</div>
                  <div style={{ color: '#777', fontSize: '0.73rem', marginTop: 2 }}>{jo.job_order_id}</div>
                  <div style={{ color: '#999', fontSize: '0.72rem' }}>
                    Backdated to {new Date(jo.date_time_received).toLocaleString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div style={{ color: '#c9a84c', fontSize: '0.72rem' }}>
                    Authorized by {jo.date_override_authorized_by} · entered by {jo.received_by}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#1a1a1a', fontWeight: 700, fontSize: '0.88rem' }}>{formatPeso(jo.grand_total || 0)}</div>
                  <div style={{ color: '#7A1828', fontSize: '0.68rem', marginTop: 2 }}>{jo.payment_status}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showForm && (
        <NewJOModal
          clients={clients}
          categories={categories}
          subcategories={subcategories}
          currentUser={currentUser}
          allowDateOverride
          onClose={() => setShowForm(false)}
          onCreated={(newJO) => {
            if (newJO.date_override_authorized_by) {
              setBackdatedJOs(prev => [{ ...newJO, created_at: new Date().toISOString() }, ...prev])
            }
            setShowForm(false)
          }}
        />
      )}
    </div>
  )
}
