import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/user'
import { redirect } from 'next/navigation'
import ClientFeedbackClient from './ClientFeedbackClient'

export default async function ClientFeedbackPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const supabase = createSupabaseServerClient()

  const { data: feedback } = await supabase
    .from('client_feedback')
    .select('id, jo, client_name, service, rating, best_areas, improve_areas, comments, recommend, created_at, job_orders(received_by)')
    .order('created_at', { ascending: false })
    .limit(1000)

  return <ClientFeedbackClient feedback={feedback || []} />
}
