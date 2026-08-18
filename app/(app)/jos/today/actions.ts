'use server'

import { getCurrentUser } from '@/lib/user'
import { sendEmail } from '@/lib/email'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'

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

// The client's full-resolution print file, uploaded via shop.penfixads.com's Create
// Specs modal (uploadOriginalFile/submitJobOrder in the shop repo), lands in the
// private "jo-print-files" Storage bucket -- there's no public/anon read policy on
// it (see migration 025), so a plain getPublicUrl() would 404. Only staff-created
// items via New JO / Add Item never set original_file_path at all, since that upload
// path only exists in the shop -- so this only ever has something to return for
// shop-submitted items, which is exactly when the "Download Original File" button
// in EditJOModal should show up.
export async function getOriginalFileUrl(itemId: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')

  const supabase = createSupabaseServerClient()
  const { data: item } = await supabase.from('job_order_items').select('original_file_path').eq('item_id', itemId).single()
  if (!item?.original_file_path) return { success: false as const, message: 'No file on record for this item.' }

  // Signed URL requires the service-role client since the bucket has no read policy
  // for the logged-in staff session.
  const admin = createSupabaseAdminClient()
  const { data, error } = await admin.storage.from('jo-print-files').createSignedUrl(item.original_file_path, 120)
  if (error || !data?.signedUrl) return { success: false as const, message: error?.message || 'Failed to generate download link.' }
  return { success: true as const, url: data.signedUrl }
}
