import FeedbackForm from './FeedbackForm'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'

const BG: React.CSSProperties = {
  minHeight: '100vh',
  backgroundImage: 'url(/backgroundpenfix.png)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
  fontFamily: 'sans-serif',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
}

// The link only ever carries the token (see lib/jo-helpers.ts buildFeedbackUrl) — everything
// else needed to render the form is looked up here, server-side, via job_orders.feedback_token.
// Runs with the service-role client since this route is unauthenticated (no session to check
// RLS against) and the anon key has no read access to job_orders; the query below is the only
// thing this admin client is used for, and it returns nothing beyond what the form needs.
async function getFeedbackContext(token: string) {
  const supabase = createSupabaseAdminClient()
  const { data } = await supabase
    .from('job_orders')
    .select(`
      job_order_id,
      clients(client_name, company_name),
      job_order_items(subcategories(categories(category_name)))
    `)
    .eq('feedback_token', token)
    .maybeSingle()
  if (!data) return null

  const client = Array.isArray(data.clients) ? data.clients[0] : data.clients
  const clientName = (client as any)?.client_name || (client as any)?.company_name || ''

  // A JO can span several categories; the first is close enough for a prefill the client
  // can't change, and beats making them pick from eleven options themselves.
  let service: string | null = null
  for (const item of data.job_order_items || []) {
    const sub = Array.isArray(item.subcategories) ? item.subcategories[0] : item.subcategories
    const cat = Array.isArray((sub as any)?.categories) ? (sub as any).categories[0] : (sub as any)?.categories
    if (cat?.category_name) { service = cat.category_name; break }
  }

  return { jobOrderId: data.job_order_id as string, clientName, service }
}

export default async function FeedbackPage({ params }: { params: { token: string } }) {
  const context = await getFeedbackContext(params.token)

  if (!context) {
    return (
      <div style={BG}>
        <div style={{ background: 'rgba(255,255,255,0.92)', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', maxWidth: 420, padding: '2.5rem 2rem', textAlign: 'center' }}>
          <h1 style={{ color: '#7A1828', fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>Link not found</h1>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>This feedback link is invalid or has expired. Please reach out to Penfix and we&apos;ll send a fresh one.</p>
        </div>
      </div>
    )
  }

  return <FeedbackForm token={params.token} jobOrderId={context.jobOrderId} clientName={context.clientName} service={context.service} />
}
