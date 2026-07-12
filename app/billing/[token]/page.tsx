import { createSupabaseServerClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { formatPeso } from '@/lib/jo-helpers'

export default async function BillingStatementPage({ params }: { params: { token: string } }) {
  const supabase = createSupabaseServerClient()

  // Looked up by public_token (a random uuid), not client_id — client_id isn't secret, but
  // it shouldn't be usable as a guessable public entry key either (same reasoning as
  // migration 034's job_orders.public_token).
  const { data: client, error } = await supabase
    .from('public_client_billing')
    .select('*')
    .eq('public_token', params.token)
    .maybeSingle()

  if (error) console.error('Billing statement query failed:', error.message)
  if (!client) notFound()

  const { data: jobs, error: jobsError } = await supabase
    .from('public_client_billing_jobs')
    .select('*')
    .eq('client_id', client.client_id)
    .gt('balance_due', 0)
    .order('date_time_received', { ascending: false })

  if (jobsError) console.error('Billing statement jobs query failed:', jobsError.message)

  const clientName = client.client_name || client.company_name || 'Client'
  const openJobs = jobs || []
  const jobIds = openJobs.map(j => j.job_order_id)

  const { data: items, error: itemsError } = jobIds.length > 0
    ? await supabase.from('public_client_billing_items').select('*').in('job_order_id', jobIds)
    : { data: [], error: null }
  if (itemsError) console.error('Billing statement items query failed:', itemsError.message)

  const itemsByJO: Record<string, any[]> = {}
  for (const it of items || []) {
    if (!itemsByJO[it.job_order_id]) itemsByJO[it.job_order_id] = []
    itemsByJO[it.job_order_id].push(it)
  }
  const totalGrand = openJobs.reduce((s, j) => s + (j.grand_total || 0), 0)
  const totalPaid = openJobs.reduce((s, j) => s + (j.total_amount_paid || 0), 0)
  const totalBalance = openJobs.reduce((s, j) => s + (j.balance_due || 0), 0)

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
            <div style={{ color: '#F5C842', fontSize: '0.7rem' }}>Billing Statement</div>
          </div>
        </div>

        {/* Client Info */}
        <div style={{ background: '#FDF5EC', borderRadius: 14, padding: '1.25rem', marginBottom: '1rem', border: '1px solid #EDE0CC', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
          <div style={{ color: '#999', fontSize: '0.72rem', marginBottom: 4 }}>BILLING STATEMENT FOR</div>
          <div style={{ color: '#7A1828', fontWeight: 700, fontSize: '1.1rem' }}>{clientName}</div>
          {client.contact_number && (
            <div style={{ color: '#777', fontSize: '0.72rem', marginTop: 4 }}>{client.contact_number}</div>
          )}
        </div>

        {/* Job Orders */}
        {openJobs.length === 0 ? (
          <div style={{ background: '#FDF5EC', borderRadius: 14, padding: '1.25rem', textAlign: 'center', color: '#999', fontSize: '0.85rem', border: '1px solid #EDE0CC' }}>
            No open balance — every job order is fully settled. ✓
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {openJobs.map(jo => {
              const jobItems = itemsByJO[jo.job_order_id] || []
              return (
                <div key={jo.job_order_id} style={{ background: '#FDF5EC', borderRadius: 12, padding: '0.85rem 1rem', border: '1px solid #EDE0CC', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div>
                      <div style={{ color: '#7A1828', fontWeight: 700, fontSize: '0.85rem' }}>{jo.job_order_id}</div>
                      <div style={{ color: '#999', fontSize: '0.72rem', marginTop: 2 }}>
                        {new Date(jo.date_time_received).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#1a1a1a', fontWeight: 700, fontSize: '0.85rem' }}>{formatPeso(jo.grand_total || 0)}</div>
                      <div style={{ color: '#e74c3c', fontSize: '0.72rem' }}>Bal: {formatPeso(jo.balance_due || 0)}</div>
                    </div>
                  </div>
                  {jobItems.length > 0 && (
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #EDE0CC', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {jobItems.map(it => (
                        <div key={it.item_id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                          <span style={{ color: '#777' }}>{it.subcategory_name || it.item_id}{it.quantity > 1 ? ` × ${it.quantity}` : ''} <span style={{ color: '#aaa' }}>({it.job_status})</span></span>
                          <span style={{ color: '#333' }}>{formatPeso(it.computed_line_total || 0)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Summary */}
        <div style={{ background: '#FDF5EC', borderRadius: 14, padding: '1.25rem', marginTop: '1rem', border: '1px solid #EDE0CC', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
          {[
            { label: 'Total (all open JOs)', value: formatPeso(totalGrand) },
            { label: 'Total Paid', value: formatPeso(totalPaid) },
            { label: 'Total Balance Due', value: formatPeso(totalBalance), warn: totalBalance > 0 },
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

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '2rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem' }}>
          Penfix Advertising &amp; Business Solutions<br />
          For inquiries, contact your GA directly.
        </div>
      </div>
    </div>
  )
}
