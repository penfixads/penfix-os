'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { formatPeso } from '@/lib/jo-helpers'
import { syncJobOrderDoneStatus } from '@/lib/jo-completion'
import type { AppUser } from '@/lib/user'
import Pagination from '@/components/Pagination'

const PAGE_SIZE = 10

interface Props {
  items: any[]
  currentUser: AppUser
}

const DISPATCH_MODES = ['Pickup', 'Delivery', 'Installation']

export default function DispatchClient({ items, currentUser }: Props) {
  const router = useRouter()
  const [marking, setMarking] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const filtered = items.filter(item => {
    const c = item.job_orders?.clients
    const q = search.toLowerCase()
    return (
      (c?.client_name || c?.company_name || '').toLowerCase().includes(q) ||
      (item.job_orders?.job_order_id || '').toLowerCase().includes(q) ||
      (item.subcategories?.subcategory_name || '').toLowerCase().includes(q)
    )
  })

  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)))
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  async function markDispatched(itemId: string, mode: string) {
    setMarking(itemId)
    try {
      const supabase = createSupabaseBrowserClient()
      const { error: markErr } = await supabase.from('job_order_items').update({
        job_status: 'Done',
        dispatch_mode: mode,
        date_time_done: new Date().toISOString(),
      }).eq('item_id', itemId)
      if (markErr) { alert(markErr.message || 'Failed to mark item as dispatched.'); return }

      const item = items.find(i => i.item_id === itemId)
      if (item?.job_orders?.job_order_id) {
        await syncJobOrderDoneStatus(supabase, item.job_orders.job_order_id)
      }
      router.refresh()
    } finally {
      setMarking(null)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h1 style={{ color: '#7A1828', fontSize: '1.4rem', fontWeight: 700 }}>Ready for Dispatch</h1>
          <p style={{ color: '#777', fontSize: '0.8rem', marginTop: 2 }}>{filtered.length} item(s) ready</p>
        </div>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          style={{ background: '#FDF5EC', border: '1.5px solid #d0d0d0', borderRadius: 8, padding: '0.5rem 0.85rem', color: '#1a1a1a', fontSize: '0.82rem', width: 200, outline: 'none' }}
        />
      </div>

      {filtered.length === 0 ? (
        <div style={{ color: '#aaa', textAlign: 'center', marginTop: '3rem', fontSize: '0.9rem' }}>No items ready for dispatch.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {pageItems.map(item => {
            const jo = item.job_orders
            const c = jo?.clients
            const clientName = c?.client_name || c?.company_name || jo?.client_id
            const hasBalance = (jo?.balance_due || 0) > 0
            const isMarking = marking === item.item_id

            return (
              <div key={item.item_id} style={{ background: '#FDF5EC', borderRadius: 10, padding: '0.85rem 1rem', border: '1px solid #EDE0CC' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#1a1a1a', fontWeight: 700, fontSize: '0.88rem' }}>{clientName}</div>
                    <div style={{ color: '#999', fontSize: '0.72rem', marginTop: 1 }}>{jo?.job_order_id} · {item.item_id}</div>
                    <div style={{ color: '#999', fontSize: '0.8rem', marginTop: 3 }}>{item.subcategories?.subcategory_name}</div>
                    {item.production_specs && <div style={{ color: '#777', fontSize: '0.73rem', marginTop: 2 }}>{item.production_specs}</div>}
                    {c?.contact_number && <div style={{ color: '#777', fontSize: '0.72rem', marginTop: 2 }}>📞 {c.contact_number}</div>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: hasBalance ? '#e74c3c' : '#2ecc71' }}>
                      {hasBalance ? `Bal: ${formatPeso(jo?.balance_due)}` : 'Fully Paid'}
                    </div>
                    <div style={{ color: '#aaa', fontSize: '0.7rem' }}>{jo?.payment_status}</div>
                    <div style={{ marginTop: 4, padding: '0.2rem 0.5rem', borderRadius: 12, background: '#1a4a1a', color: '#2ecc71', fontSize: '0.68rem', fontWeight: 700 }}>
                      {item.job_status}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '0.75rem', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {DISPATCH_MODES.map(mode => (
                    <button
                      key={mode}
                      onClick={() => markDispatched(item.item_id, mode)}
                      disabled={!!isMarking}
                      style={{ background: '#1a1a2a', border: '1px solid #27ae60', color: '#2ecc71', fontSize: '0.73rem', padding: '0.4rem 0.8rem', borderRadius: 6, cursor: isMarking ? 'not-allowed' : 'pointer', fontWeight: 600 }}
                    >
                      {isMarking ? '…' : `✓ ${mode}`}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Pagination page={currentPage} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
    </div>
  )
}
