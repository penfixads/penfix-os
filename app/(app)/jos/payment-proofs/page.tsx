import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/user'
import { redirect } from 'next/navigation'
import PaymentProofsClient, { type StatusFilter } from './PaymentProofsClient'

interface Props {
  searchParams: { status?: string }
}

export default async function PaymentProofsPage({ searchParams }: Props) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (!['Admin', 'GA', 'Treasury'].includes(user.role)) redirect('/jos/active')

  const statusFilter = (['Pending', 'Confirmed', 'Rejected', 'All'].includes(searchParams.status || '')
    ? searchParams.status
    : 'Pending') as StatusFilter

  const supabase = createSupabaseServerClient()
  let query = supabase
    .from('payment_proofs')
    .select(`
      *,
      job_orders(client_id, grand_total, total_amount_paid, balance_due, payment_status, is_for_billing,
        clients(client_name, company_name))
    `)
  // Pending is a queue (oldest first, work it down); everything else is a browsable
  // archive (newest first, matches how Job Order Receipts and other galleries read).
  query = statusFilter === 'All'
    ? query.order('created_at', { ascending: false })
    : query.eq('status', statusFilter).order('created_at', { ascending: statusFilter === 'Pending' })

  const { data: proofs } = await query

  return <PaymentProofsClient key={statusFilter} initialProofs={(proofs as any) || []} currentUser={user} statusFilter={statusFilter} />
}
