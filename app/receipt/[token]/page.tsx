import { createSupabaseServerClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import PublicReceiptView from '@/components/PublicReceiptView'

export default async function ReceiptPage({ params }: { params: { token: string } }) {
  const supabase = createSupabaseServerClient()

  // Looked up by public_token (a random uuid), not job_order_id — job_order_id is sequential
  // and guessable (JO-MMDDYYYY-001, -002, ...), which would let anyone enumerate every other
  // client's items/prices/contact number just by editing the URL.
  const { data: jo, error } = await supabase
    .from('public_job_order_receipt')
    .select('*')
    .eq('public_token', params.token)
    .maybeSingle()

  if (error) console.error('Receipt page query failed:', error.message)
  if (!jo) notFound()

  const [{ data: items }, { data: methodRows }] = await Promise.all([
    supabase.from('public_job_order_items_receipt').select('*').eq('job_order_id', jo.job_order_id),
    supabase.from('public_job_order_payment_methods').select('payment_method').eq('job_order_id', jo.job_order_id),
  ])

  const paymentMethods = Array.from(new Set((methodRows || []).map(r => r.payment_method).filter(Boolean))) as string[]

  // "Accomplished By" per item reflects whoever confirmed that item's current status — fetched
  // for all items at once so the client can flip between them without extra round-trips.
  const itemIds = (items || []).map(i => i.item_id)
  const { data: statusLogs } = itemIds.length > 0
    ? await supabase.from('public_job_order_item_status_log').select('item_id, status_name, changed_by_name').in('item_id', itemIds)
    : { data: [] }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: 'url(/backgroundpenfix.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      padding: '1.5rem',
      fontFamily: 'system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', width: '100%', maxWidth: 460 }}>
        <Image src="/penfixtwhhite.png" alt="Penfix" width={40} height={40} style={{ objectFit: 'contain' }} />
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>PENFIX OS</div>
          <div style={{ color: '#F5C842', fontSize: '0.7rem' }}>Job Order Receipt</div>
        </div>
      </div>

      <PublicReceiptView jo={jo} items={items || []} statusLogs={statusLogs || []} paymentMethods={paymentMethods} />

      <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem' }}>
        Penfix Advertising &amp; Business Solutions<br />
        For inquiries, contact your GA directly.
      </div>
    </div>
  )
}
