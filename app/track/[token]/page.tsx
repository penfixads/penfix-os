import { createSupabaseServerClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import TrackItems from './TrackItems'
import PaymentProofUpload from './PaymentProofUpload'
import { formatPeso } from '@/lib/jo-helpers'

export default async function TrackPage({ params }: { params: { token: string } }) {
  const supabase = createSupabaseServerClient()

  // Looked up by public_token (a random uuid), not job_order_id — job_order_id is sequential
  // and guessable (JO-MMDDYYYY-001, -002, ...), which would let anyone enumerate every other
  // client's items/prices/payment status just by editing the URL.
  const { data: jo, error } = await supabase
    .from('public_job_order_tracking')
    .select('*')
    .eq('public_token', params.token)
    .maybeSingle()

  if (error) console.error('Track page query failed:', error.message)
  if (!jo) notFound()

  const { data: items, error: itemsError } = await supabase
    .from('public_job_order_items_tracking')
    .select('*')
    .eq('job_order_id', jo.job_order_id)

  if (itemsError) console.error('Track page items query failed:', itemsError.message)

  const clientName = jo.client_name || jo.company_name || 'Client'
  const receivedDate = new Date(jo.date_time_received)

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: 'url(/backgroundpenfix.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      padding: '1.5rem',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Image src="/penfixtwhhite.png" alt="Penfix" width={40} height={40} style={{ objectFit: 'contain' }} />
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>PENFIX OS</div>
            <div style={{ color: '#F5C842', fontSize: '0.7rem' }}>Job Order Tracker</div>
          </div>
        </div>

        {/* JO Info */}
        <div style={{ background: '#FDF5EC', borderRadius: 14, padding: '1.25rem', marginBottom: '1rem', border: '1px solid #EDE0CC', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
          <div style={{ color: '#999', fontSize: '0.72rem', marginBottom: 4 }}>JOB ORDER</div>
          <div style={{ color: '#7A1828', fontWeight: 700, fontSize: '1.1rem' }}>{jo.job_order_id}</div>
          <div style={{ color: '#333', fontSize: '0.85rem', marginTop: 2 }}>{clientName}</div>
          <div style={{ color: '#777', fontSize: '0.72rem', marginTop: 4 }}>
            Received: {receivedDate.toLocaleString('en-PH', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
          <div style={{ color: '#777', fontSize: '0.72rem', marginTop: 2 }}>
            Received by: {jo.received_by || '—'}
          </div>
        </div>

        {/* Items */}
        <TrackItems jobOrderId={jo.job_order_id} initialItems={items || []} />

        {/* Payment Summary */}
        <div style={{ background: '#FDF5EC', borderRadius: 14, padding: '1.25rem', marginTop: '1rem', border: '1px solid #EDE0CC', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
          {[
            { label: 'Total', value: formatPeso(jo.grand_total || 0) },
            { label: 'Amount Paid', value: formatPeso(jo.total_amount_paid || 0) },
            { label: 'Balance Due', value: formatPeso(jo.balance_due || 0), warn: (jo.balance_due || 0) > 0 },
          ].map((row, i) => (
            <div key={row.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              paddingTop: i > 0 ? 8 : 0, marginTop: i > 0 ? 8 : 0,
              borderTop: i > 0 ? '1px solid #EDE0CC' : 'none',
            }}>
              <span style={{ color: '#777', fontSize: '0.82rem' }}>{row.label}</span>
              <span style={{ color: row.warn ? '#c0392b' : '#1a1a1a', fontWeight: 700, fontSize: '0.95rem' }}>{row.value}</span>
            </div>
          ))}
        </div>

        {(jo.balance_due || 0) > 0 && (
          <PaymentProofUpload jobOrderId={jo.job_order_id} balanceDue={jo.balance_due} />
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '2rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem' }}>
          Penfix Advertising &amp; Business Solutions<br />
          For inquiries, contact your GA directly.
        </div>
      </div>
    </div>
  )
}
