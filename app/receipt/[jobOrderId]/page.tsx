import { createSupabaseServerClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import ReceiptCard from '@/components/ReceiptCard'

export default async function ReceiptPage({ params }: { params: { jobOrderId: string } }) {
  const supabase = createSupabaseServerClient()

  const { data: jo, error } = await supabase
    .from('public_job_order_receipt')
    .select('*')
    .eq('job_order_id', params.jobOrderId)
    .maybeSingle()

  if (error) console.error('Receipt page query failed:', error.message)
  if (!jo) notFound()

  const [{ data: items }, { data: methodRows }] = await Promise.all([
    supabase.from('public_job_order_items_receipt').select('*').eq('job_order_id', params.jobOrderId),
    supabase.from('public_job_order_payment_methods').select('payment_method').eq('job_order_id', params.jobOrderId),
  ])

  const item = (items || [])[0]
  const clientName = jo.client_name || jo.company_name || 'Client'
  const sizeLabel = item?.width && item?.height ? `${item.width} × ${item.height} ft` : (item?.width ? `${item.width} ft` : '')
  const paymentMethods = Array.from(new Set((methodRows || []).map(r => r.payment_method).filter(Boolean))) as string[]

  // "Accomplished By" reflects whoever confirmed the item's current status — blank while it's
  // still sitting at "Received" (nothing beyond intake has happened yet).
  let accomplishedBy = ''
  if (item && item.job_status !== 'Received') {
    const { data: logs } = await supabase
      .from('public_job_order_item_status_log')
      .select('changed_by_name')
      .eq('item_id', item.item_id)
      .eq('status_name', item.job_status)
    accomplishedBy = Array.from(new Set((logs || []).map(l => l.changed_by_name))).join(', ')
  }

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

      <div style={{ width: '100%', maxWidth: 460, boxShadow: '0 4px 20px rgba(0,0,0,0.25)', borderRadius: 12, overflow: 'hidden' }}>
        <ReceiptCard
          jobOrderId={jo.job_order_id}
          dateReceived={jo.date_time_received}
          clientName={clientName}
          contactNumber={jo.contact_number}
          itemPreview={item?.item_preview}
          itemName={item?.subcategory_name || '—'}
          categoryName={item?.category_name}
          size={sizeLabel}
          quantity={item?.quantity ?? 1}
          specs={item?.production_specs}
          remarks={item?.notes}
          dateNeeded={item?.date_time_needed}
          receivedBy={jo.received_by}
          accomplishedBy={accomplishedBy}
          totalAmount={jo.grand_total || 0}
          amountPaid={jo.total_amount_paid || 0}
          balance={jo.balance_due || 0}
          paymentMethods={paymentMethods}
          status={jo.payment_status}
        />
      </div>

      <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem' }}>
        Penfix Advertising &amp; Business Solutions<br />
        For inquiries, contact your GA directly.
      </div>
    </div>
  )
}
