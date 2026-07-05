import { createSupabaseServerClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Image from 'next/image'

export default async function TrackPage({ params }: { params: { joId: string } }) {
  const supabase = createSupabaseServerClient()

  const { data: jo, error } = await supabase
    .from('public_job_order_tracking')
    .select('*')
    .eq('job_order_id', params.joId)
    .maybeSingle()

  if (error) console.error('Track page query failed:', error.message)
  if (!jo) notFound()

  const { data: items, error: itemsError } = await supabase
    .from('public_job_order_items_tracking')
    .select('*')
    .eq('job_order_id', params.joId)

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {(items || []).map((item: any) => {
            // SOP step names are internal-only (GA/Fabricator use), so clients only ever
            // see a generic in-progress/completed state here, never the granular status.
            const isDone = !!item.date_time_done || item.job_status === 'Done'

            return (
              <div key={item.item_id} style={{ background: '#FDF5EC', borderRadius: 12, padding: '1rem', border: '1px solid #EDE0CC', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                  <div>
                    <div style={{ color: '#1a1a1a', fontWeight: 700, fontSize: '0.9rem' }}>{item.subcategory_name}</div>
                    {item.production_specs && (
                      <div style={{ color: '#777', fontSize: '0.75rem', marginTop: 2 }}>{item.production_specs}</div>
                    )}
                    {item.date_time_needed && (
                      <div style={{ color: '#c0782b', fontSize: '0.72rem', marginTop: 4 }}>
                        Deadline: {new Date(item.date_time_needed).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '0.25rem 0.65rem', borderRadius: 20, background: isDone ? '#1a4a1a22' : '#2980b922', border: `1px solid ${isDone ? '#27ae60' : '#2980b9'}`, color: isDone ? '#1e8449' : '#2471a3', fontSize: '0.68rem', fontWeight: 700, whiteSpace: 'nowrap', marginLeft: 8 }}>
                    {isDone ? '✓ Completed' : 'In Progress'}
                  </div>
                </div>

                {item.date_time_done && (
                  <div style={{ marginTop: 10, color: '#27ae60', fontSize: '0.72rem' }}>
                    ✓ Completed: {new Date(item.date_time_done).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '2rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem' }}>
          Penfix Advertising &amp; Business Solutions<br />
          For inquiries, contact your GA directly.
        </div>
      </div>
    </div>
  )
}
