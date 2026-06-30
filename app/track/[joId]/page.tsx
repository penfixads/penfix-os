import { createSupabaseServerClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Image from 'next/image'

export default async function TrackPage({ params }: { params: { joId: string } }) {
  const supabase = createSupabaseServerClient()

  const { data: jo } = await supabase
    .from('job_orders')
    .select(`
      *,
      clients(client_name, company_name),
      job_order_items(
        item_id, job_status, subcategory_id, production_specs, date_time_needed, date_time_done, quantity,
        subcategories(subcategory_name, process_type_id),
        process_type_sop: subcategories(process_types(process_type_name))
      )
    `)
    .eq('job_order_id', params.joId)
    .maybeSingle()

  if (!jo) notFound()

  // For each item, get the SOP steps visible to client
  const processTypeIds = [...new Set(
    (jo.job_order_items || [])
      .map((i: any) => i.subcategories?.process_type_id)
      .filter(Boolean)
  )]

  const { data: sopSteps } = await supabase
    .from('process_type_sop')
    .select('*')
    .in('process_type_id', processTypeIds as string[])
    .eq('visible_to_client', true)
    .eq('is_active', true)
    .order('sequence')

  const sopByType: Record<string, any[]> = {}
  for (const s of sopSteps || []) {
    if (!sopByType[s.process_type_id]) sopByType[s.process_type_id] = []
    sopByType[s.process_type_id].push(s)
  }

  const clientName = jo.clients?.client_name || jo.clients?.company_name || 'Client'
  const items: any[] = jo.job_order_items || []
  const receivedDate = new Date(jo.date_time_received)

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', padding: '1.5rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Image src="/penfixtwhhite.png" alt="Penfix" width={40} height={40} style={{ objectFit: 'contain' }} />
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>PENFIX OS</div>
            <div style={{ color: '#7A1828', fontSize: '0.7rem' }}>Job Order Tracker</div>
          </div>
        </div>

        {/* JO Info */}
        <div style={{ background: '#3a3a3a', borderRadius: 14, padding: '1.25rem', marginBottom: '1rem', border: '1px solid #2a2a2a' }}>
          <div style={{ color: '#aaa', fontSize: '0.72rem', marginBottom: 4 }}>JOB ORDER</div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>{jo.job_order_id}</div>
          <div style={{ color: '#ccc', fontSize: '0.85rem', marginTop: 2 }}>{clientName}</div>
          <div style={{ color: '#666', fontSize: '0.72rem', marginTop: 4 }}>
            Received: {receivedDate.toLocaleString('en-PH', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
          <div style={{ color: '#666', fontSize: '0.72rem', marginTop: 2 }}>
            Received by: {jo.received_by || '—'}
          </div>
        </div>

        {/* Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {items.map((item: any) => {
            const processTypeId = item.subcategories?.process_type_id
            const steps = sopByType[processTypeId] || []
            const currentIdx = steps.findIndex((s: any) => s.status_name === item.job_status)
            const isDone = item.job_status === 'Done' || steps.find((s: any) => s.status_name === item.job_status)?.is_terminal

            return (
              <div key={item.item_id} style={{ background: '#3a3a3a', borderRadius: 12, padding: '1rem', border: '1px solid #2a2a2a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>{item.subcategories?.subcategory_name}</div>
                    {item.production_specs && (
                      <div style={{ color: '#888', fontSize: '0.75rem', marginTop: 2 }}>{item.production_specs}</div>
                    )}
                    {item.date_time_needed && (
                      <div style={{ color: '#f39c12', fontSize: '0.72rem', marginTop: 4 }}>
                        Deadline: {new Date(item.date_time_needed).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '0.25rem 0.65rem', borderRadius: 20, background: isDone ? '#1a4a1a' : '#1a1a2a', border: `1px solid ${isDone ? '#27ae60' : '#2a2a5a'}`, color: isDone ? '#2ecc71' : '#7b8cde', fontSize: '0.68rem', fontWeight: 700, whiteSpace: 'nowrap', marginLeft: 8 }}>
                    {item.job_status}
                  </div>
                </div>

                {/* SOP Progress */}
                {steps.length > 0 && (
                  <div style={{ position: 'relative' }}>
                    {steps.map((step: any, i: number) => {
                      const isCompleted = currentIdx >= 0 ? i <= currentIdx : false
                      const isCurrent = step.status_name === item.job_status
                      return (
                        <div key={step.sop_id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: i < steps.length - 1 ? '0.4rem' : 0 }}>
                          {/* Dot + line */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                            <div style={{
                              width: 14, height: 14, borderRadius: '50%',
                              background: isCurrent ? '#7A1828' : isCompleted ? '#27ae60' : '#555',
                              border: `2px solid ${isCurrent ? '#c0392b' : isCompleted ? '#27ae60' : '#3a3a3a'}`,
                              marginTop: 2,
                            }} />
                            {i < steps.length - 1 && (
                              <div style={{ width: 2, flex: 1, minHeight: 16, background: isCompleted && currentIdx > i ? '#27ae60' : '#555', marginTop: 2 }} />
                            )}
                          </div>
                          <div style={{ paddingBottom: i < steps.length - 1 ? '0.4rem' : 0 }}>
                            <div style={{ color: isCurrent ? '#fff' : isCompleted ? '#aaa' : '#555', fontSize: '0.78rem', fontWeight: isCurrent ? 700 : 400 }}>
                              {step.status_name}
                              {isCurrent && <span style={{ color: '#7A1828', marginLeft: 6, fontSize: '0.68rem' }}>← current</span>}
                            </div>
                            {step.description && (
                              <div style={{ color: '#555', fontSize: '0.68rem', marginTop: 1 }}>{step.description}</div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {item.date_time_done && (
                  <div style={{ marginTop: 10, color: '#2ecc71', fontSize: '0.72rem' }}>
                    ✓ Completed: {new Date(item.date_time_done).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '2rem', color: '#333', fontSize: '0.7rem' }}>
          Penfix Advertising & Business Solutions<br />
          For inquiries, contact your GA directly.
        </div>
      </div>
    </div>
  )
}
