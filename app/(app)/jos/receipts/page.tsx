import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/user'
import { redirect } from 'next/navigation'
import ReceiptsFeedClient from './ReceiptsFeedClient'
import { PAGE_SIZE, TILE_SELECT, applyDateRange } from './shared'

interface Props {
  searchParams: { from?: string; to?: string }
}

export default async function ReceiptsFeedPage({ searchParams }: Props) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (!['Admin', 'GA', 'Treasury'].includes(user.role)) redirect('/jos/active')

  const dateFrom = searchParams.from || ''
  const dateTo = searchParams.to || ''
  const supabase = createSupabaseServerClient()

  const { data: items, count } = await applyDateRange(
    supabase.from('job_order_items').select(TILE_SELECT, { count: 'exact' }),
    dateFrom, dateTo,
  )
    .order('date_time_received', { ascending: false })
    .range(0, PAGE_SIZE - 1)

  return (
    <ReceiptsFeedClient
      key={`${dateFrom}_${dateTo}`}
      initialItems={(items as any) || []}
      totalCount={count || 0}
      dateFrom={dateFrom}
      dateTo={dateTo}
    />
  )
}
