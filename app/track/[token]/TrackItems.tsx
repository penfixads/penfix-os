'use client'

import { useEffect, useRef, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { formatPeso } from '@/lib/jo-helpers'

const POLL_MS = 15000

interface Item {
  item_id: string
  job_order_id: string
  job_status: string | null
  subcategory_id: string | null
  subcategory_name: string | null
  production_specs: string | null
  date_time_needed: string | null
  date_time_done: string | null
  quantity: number | null
  item_preview_thumb: string | null
  computed_line_total: number | null
}

interface Step {
  subcategory_id: string
  status_name: string
  sequence: number
  is_terminal: boolean
}

interface Props {
  jobOrderId: string
  initialItems: Item[]
}

export default function TrackItems({ jobOrderId, initialItems }: Props) {
  const [items, setItems] = useState(initialItems)
  const [stepsBySub, setStepsBySub] = useState<Record<string, Step[]>>({})
  const supabaseRef = useRef(createSupabaseBrowserClient())

  useEffect(() => {
    const supabase = supabaseRef.current
    const subIds = [...new Set(initialItems.map(i => i.subcategory_id).filter(Boolean))] as string[]
    if (subIds.length === 0) return
    supabase
      .from('public_subcategory_sop_tracking')
      .select('*')
      .in('subcategory_id', subIds)
      .order('sequence')
      .then(({ data }) => {
        const grouped: Record<string, Step[]> = {}
        for (const step of data || []) {
          grouped[step.subcategory_id] = grouped[step.subcategory_id] || []
          grouped[step.subcategory_id].push(step)
        }
        setStepsBySub(grouped)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Polls so the page reflects GA/Fabricator status changes without the client having to
  // manually refresh — this is meant to sit open as a "live" order monitor on their phone.
  useEffect(() => {
    const supabase = supabaseRef.current

    async function refresh() {
      const { data } = await supabase
        .from('public_job_order_items_tracking')
        .select('*')
        .eq('job_order_id', jobOrderId)
      if (data) setItems(data)
    }

    const interval = setInterval(refresh, POLL_MS)
    function onVisible() { if (document.visibilityState === 'visible') refresh() }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [jobOrderId])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {items.map(item => (
        <ItemCard key={item.item_id} item={item} steps={item.subcategory_id ? stepsBySub[item.subcategory_id] : undefined} />
      ))}
    </div>
  )
}

function ItemCard({ item, steps }: { item: Item; steps?: Step[] }) {
  const isCancelled = item.job_status === 'Cancelled'
  const isDone = !!item.date_time_done || item.job_status === 'Done' || steps?.find(s => s.status_name === item.job_status)?.is_terminal

  // Current status may be an internal step not visible to clients (e.g. "For Layout/Design"
  // on a category whose steps aren't all client-visible) — in that case we still know it's
  // past the first step and not yet at the last one, just not exactly which step.
  const currentIndex = steps?.findIndex(s => s.status_name === item.job_status) ?? -1
  const knownStep = currentIndex >= 0

  return (
    <div style={{ background: '#FDF5EC', borderRadius: 12, padding: '1rem', border: '1px solid #EDE0CC', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
        <div>
          <div style={{ color: '#1a1a1a', fontWeight: 700, fontSize: '0.9rem' }}>{item.subcategory_name}</div>
          {item.production_specs && (
            <div style={{ color: '#777', fontSize: '0.75rem', marginTop: 2 }}>{item.production_specs}</div>
          )}
          {item.date_time_needed && (
            <div style={{ color: '#c0782b', fontSize: '0.72rem', marginTop: 4 }}>
              Deadline: {new Date(item.date_time_needed).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
          {item.computed_line_total != null && (
            <div style={{ color: '#333', fontWeight: 700, fontSize: '0.78rem', marginTop: 4 }}>
              {formatPeso(item.computed_line_total)}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, marginLeft: 8, flexShrink: 0 }}>
          <div style={{
            padding: '0.25rem 0.65rem', borderRadius: 20, whiteSpace: 'nowrap', fontSize: '0.68rem', fontWeight: 700,
            background: isCancelled ? '#4a1a1a22' : isDone ? '#1a4a1a22' : '#2980b922',
            border: `1px solid ${isCancelled ? '#e74c3c' : isDone ? '#27ae60' : '#2980b9'}`,
            color: isCancelled ? '#c0392b' : isDone ? '#1e8449' : '#2471a3',
          }}>
            {isCancelled ? 'Cancelled' : isDone ? '✓ Completed' : 'In Progress'}
          </div>
          {item.item_preview_thumb && (
            <img
              src={item.item_preview_thumb}
              alt={item.subcategory_name || 'Item preview'}
              style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, border: '1px solid #EDE0CC' }}
            />
          )}
        </div>
      </div>

      {!isCancelled && steps && steps.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {steps.map((step, i) => {
            // isDone (whole item wrapped up) always wins. Otherwise, if the current job_status
            // exactly matches one of these client-visible steps, highlight it precisely; if it's
            // on a hidden internal step instead, just mark "Received" done and leave the rest
            // pending — the note below explains it's in progress without overclaiming which step.
            const state: 'done' | 'current' | 'pending' = isDone
              ? 'done'
              : knownStep
                ? (i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'pending')
                : (i === 0 ? 'done' : 'pending')
            return (
              <div key={step.status_name} style={{ display: 'flex', gap: 10 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                    background: state === 'done' ? '#27ae60' : state === 'current' ? '#2980b9' : '#e5d9c3',
                    border: state === 'pending' ? '2px solid #d8c9ab' : 'none',
                  }} />
                  {i < steps.length - 1 && (
                    <div style={{ width: 2, flex: 1, minHeight: 18, background: state === 'done' ? '#27ae60' : '#e5d9c3' }} />
                  )}
                </div>
                <div style={{ paddingBottom: i < steps.length - 1 ? 14 : 0 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: state === 'pending' ? 500 : 700, color: state === 'pending' ? '#aaa' : '#1a1a1a' }}>
                    {step.status_name}
                  </div>
                  {state === 'current' && !step.is_terminal && (
                    <div style={{ fontSize: '0.68rem', color: '#2980b9' }}>In progress</div>
                  )}
                </div>
              </div>
            )
          })}
          {!knownStep && !isDone && (
            <div style={{ fontSize: '0.7rem', color: '#999', marginTop: 2 }}>Currently in production…</div>
          )}
        </div>
      )}

      {item.date_time_done && (
        <div style={{ marginTop: 10, color: '#27ae60', fontSize: '0.72rem' }}>
          ✓ Completed: {new Date(item.date_time_done).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
    </div>
  )
}
