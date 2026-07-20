import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/user'
import { redirect } from 'next/navigation'
import PaymentProofsClient from './PaymentProofsClient'

export default async function PaymentProofsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (!['Admin', 'GA', 'Treasury'].includes(user.role)) redirect('/jos/active')

  const supabase = createSupabaseServerClient()
  const { data: proofs } = await supabase
    .from('payment_proofs')
    .select(`
      *,
      job_orders(client_id, grand_total, total_amount_paid, balance_due, payment_status, is_for_billing,
        clients(client_name, company_name))
    `)
    .eq('status', 'Pending')
    .order('created_at', { ascending: true })

  return <PaymentProofsClient initialProofs={(proofs as any) || []} currentUser={user} />
}
