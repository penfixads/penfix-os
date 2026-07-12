'use server'

import { getCurrentUser } from '@/lib/user'
import { sendEmail } from '@/lib/email'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function sendTrackingEmail(jobOrderId: string, clientEmail: string, clientName: string, origin: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')
  if (!clientEmail) return { skipped: true }

  const supabase = createSupabaseServerClient()
  const { data: jo } = await supabase.from('job_orders').select('public_token').eq('job_order_id', jobOrderId).single()
  if (!jo) throw new Error('Job order not found.')

  const trackingUrl = `${origin}/track/${jo.public_token}`
  const html = `
    <p>Hi ${clientName},</p>
    <p>Thank you for your order! You can track the progress of your Penfix job order <strong>${jobOrderId}</strong> anytime using the link below:</p>
    <p><a href="${trackingUrl}">${trackingUrl}</a></p>
    <p>— Penfix Advertising &amp; Business Solutions</p>
  `
  await sendEmail(clientEmail, `Track your Penfix job order ${jobOrderId}`, html)
  return { success: true }
}
