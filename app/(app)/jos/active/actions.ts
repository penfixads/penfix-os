'use server'

import { getCurrentUser } from '@/lib/user'
import { sendSMS } from '@/lib/semaphore'

export async function sendTrackingLink(jobOrderId: string, contactNumber: string, origin: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')
  if (!contactNumber) throw new Error('This client has no contact number on file.')

  const trackingUrl = `${origin}/track/${jobOrderId}`
  const message = `Hi! Track your Penfix job order ${jobOrderId} here: ${trackingUrl}`
  await sendSMS(contactNumber, message)
  return { success: true }
}
