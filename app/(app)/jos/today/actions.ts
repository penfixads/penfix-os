'use server'

import { getCurrentUser } from '@/lib/user'
import { sendEmail } from '@/lib/email'

export async function sendTrackingEmail(jobOrderId: string, clientEmail: string, clientName: string, origin: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')
  if (!clientEmail) return { skipped: true }

  const trackingUrl = `${origin}/track/${jobOrderId}`
  const html = `
    <p>Hi ${clientName},</p>
    <p>Thank you for your order! You can track the progress of your Penfix job order <strong>${jobOrderId}</strong> anytime using the link below:</p>
    <p><a href="${trackingUrl}">${trackingUrl}</a></p>
    <p>— Penfix Advertising &amp; Business Solutions</p>
  `
  await sendEmail(clientEmail, `Track your Penfix job order ${jobOrderId}`, html)
  return { success: true }
}
