'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { computeLineTotal, formatPeso, type StatusStep } from '@/lib/jo-helpers'
import { IconPlus, IconCheck, IconX } from '@/components/icons'
import type { AppUser } from '@/lib/user'

export interface StatusChecklistProps {
  steps: StatusStep[]
  currentStatus: string
  namesByStatus: Record<string, string[]>
  staff: any[]
  pendingStatus: string | null
  selectedProponents: string[]
  advancing: boolean
  onRequestAdvance: (completedStatus: string, targetStatus: string) => void
  onToggleProponent: (email: string) => void
  onConfirmAdvance: () => void
  onCancelPending: () => void
}

interface Props {
  categories: any[]
  subcategories: any[]
  editingItem?: any
  onSave: (item: any) => void
  onClose: () => void
  currentUser?: AppUser
  readOnly?: boolean
  statusChecklist?: StatusChecklistProps
}

function toLocalDateTimeInput(isoString: string): string {
  const d = new Date(isoString)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const PRICING_LABELS: Record<string, string> = {
  per_piece: 'Per Piece',
  area: 'Area (W × H × Price)',
  dimension: 'Dimension (W × H × Price)',
  per_set: 'Per Set',
  fixed: 'Fixed Price',
  area_cube: 'Area Cube (W × H × D × Price)',
  per_sheet: 'Per Sheet',
  per_minute: 'Per Minute',
  starts_with: 'Starts With',
  per_lettersqft: 'Per Letter Sq Ft',
}

function StatusChecklist({ statusChecklist }: { statusChecklist: StatusChecklistProps }) {
  const { steps, currentStatus, namesByStatus, staff, pendingStatus, selectedProponents, advancing,
    onRequestAdvance, onToggleProponent, onConfirmAdvance, onCancelPending } = statusChecklist
  if (steps.length === 0) return null
  const currentIndex = steps.findIndex(s => s.status_name === currentStatus)
  const isTerminal = steps.find(s => s.status_name === currentStatus)?.is_terminal
  // Steps from is_production_start up to (but excluding) the terminal step are the actual
  // fabrication checklist — grouped visually under a "Production" heading. Steps before that
  // (Received, layout/design, etc.) and the terminal step itself render as flat milestones.
  const productionStartIndex = steps.findIndex(s => s.is_production_start)

  return (
    <div className="pf-field">
      <label className="pf-label">Status</label>
      <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, overflow: 'hidden' }}>
        {steps.map((step, i) => {
          const isDone = currentIndex >= 0 && i < currentIndex
          const isCurrent = i === currentIndex && !isTerminal
          const isReachedTerminal = i === currentIndex && isTerminal
          const names = namesByStatus[step.status_name]
          const nextStep = steps[i + 1]
          const inProductionPhase = productionStartIndex !== -1 && i >= productionStartIndex && !step.is_terminal
          return (
            <div key={step.status_name}>
              {i === productionStartIndex && (
                <div style={{ padding: '0.5rem 0.65rem 0.3rem', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.1)' : 'none', color: '#C9A84C', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Production
                </div>
              )}
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 8, padding: '0.45rem 0.65rem',
                paddingLeft: inProductionPhase ? '1.5rem' : '0.65rem',
                borderTop: i > 0 && i !== productionStartIndex ? '1px solid rgba(255,255,255,0.1)' : 'none',
                background: isCurrent ? 'rgba(201,168,76,0.18)' : 'transparent',
                opacity: (isDone || isCurrent || isReachedTerminal) ? 1 : 0.45,
              }}>
                <input
                  type="checkbox"
                  checked={isDone || isReachedTerminal}
                  disabled={!isCurrent || advancing}
                  onChange={() => nextStep && onRequestAdvance(step.status_name, nextStep.status_name)}
                  style={{ accentColor: '#C9A84C', width: 15, height: 15, marginTop: 1, cursor: isCurrent ? 'pointer' : 'default' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: isCurrent ? 700 : 400, color: isCurrent ? '#fff' : '#E8B9C6', textDecoration: isDone ? 'line-through' : 'none' }}>
                    {step.status_name}
                  </span>
                  {names && names.length > 0 && (
                    <div style={{ color: '#c99', fontSize: '0.68rem', marginTop: 1 }}>by {names.join(', ')}</div>
                  )}
                </div>
                {advancing && isCurrent && <span style={{ color: '#E8B9C6', fontSize: '0.7rem' }}>Saving…</span>}
              </div>
            </div>
          )
        })}
      </div>

      {pendingStatus && (
        <div style={{ marginTop: '0.6rem', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '0.6rem 0.75rem' }}>
          <div style={{ color: '#E8B9C6', fontSize: '0.72rem', marginBottom: 6 }}>Who worked on &quot;{pendingStatus}&quot;?</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
            {staff.map((s: any) => (
              <label key={s.user_email} style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#eee', fontSize: '0.75rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={selectedProponents.includes(s.user_email)} onChange={() => onToggleProponent(s.user_email)}
                  style={{ accentColor: '#C9A84C', width: 14, height: 14 }} />
                {s.name}
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={onCancelPending} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.25)', color: '#E8B9C6', fontSize: '0.72rem', padding: '0.3rem 0.65rem', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
            <button onClick={onConfirmAdvance} disabled={advancing} style={{ background: '#1a4a1a', border: '1px solid #27ae60', color: '#2ecc71', fontSize: '0.72rem', padding: '0.3rem 0.65rem', borderRadius: 6, cursor: advancing ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
              {advancing ? '…' : 'Confirm'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function JOItemForm({ categories, editingItem, onSave, onClose, currentUser, readOnly, statusChecklist }: Props) {
  const isEditing = !!editingItem
  const [categoryId, setCategoryId] = useState(editingItem?.category_id || '')
  const [subcategoryId, setSubcategoryId] = useState(editingItem?.subcategory_id || '')
  const [filteredSubs, setFilteredSubs] = useState<any[]>([])
  const [loadingSubs, setLoadingSubs] = useState(false)
  const [pricingModel, setPricingModel] = useState(editingItem?.pricing_model || '')
  const [basePrice, setBasePrice] = useState(editingItem?.base_price != null ? String(editingItem.base_price) : '')
  const [quantity, setQuantity] = useState(editingItem?.quantity ? String(editingItem.quantity) : '1')
  const [width, setWidth] = useState(editingItem?.width != null ? String(editingItem.width) : '')
  const [height, setHeight] = useState(editingItem?.height != null ? String(editingItem.height) : '')
  const [depth, setDepth] = useState(editingItem?.depth != null ? String(editingItem.depth) : '')
  const [noOfMins, setNoOfMins] = useState(editingItem?.no_of_mins != null ? String(editingItem.no_of_mins) : '')
  const [letterCount, setLetterCount] = useState(editingItem?.letter_count != null ? String(editingItem.letter_count) : '')
  const [productionSpecs, setProductionSpecs] = useState(editingItem?.production_specs || '')
  const [remarks, setRemarks] = useState(editingItem?.notes || '')
  const [dateNeeded, setDateNeeded] = useState(editingItem?.date_time_needed ? toLocalDateTimeInput(editingItem.date_time_needed) : '')
  const [jobStatus] = useState('Received')
  const [discount, setDiscount] = useState(editingItem?.discount != null ? String(editingItem.discount) : '0')

  const supabase = createSupabaseBrowserClient()
  const hasLoadedInitialSubs = useRef(false)
  const canSeeLineTotal = currentUser?.role !== 'Fabricator'

  useEffect(() => {
    if (!categoryId) {
      setFilteredSubs([])
      return
    }
    setLoadingSubs(true)
    setFilteredSubs([])
    // On the very first load in edit mode, keep the existing subcategory selection instead
    // of clearing it — subsequent category changes (a deliberate user action) still reset it.
    const keepSelection = isEditing && !hasLoadedInitialSubs.current
    if (!keepSelection) setSubcategoryId('')
    supabase
      .from('subcategories')
      .select('subcategory_id, subcategory_name, category_id, pricing_model, base_price')
      .eq('category_id', categoryId)
      .eq('active', true)
      .order('subcategory_name')
      .then(({ data }) => {
        setFilteredSubs(data || [])
        setLoadingSubs(false)
        hasLoadedInitialSubs.current = true
      })
  }, [categoryId])

  const selectedSub = filteredSubs.find(s => s.subcategory_id === subcategoryId)
  const effectivePricing = pricingModel || selectedSub?.pricing_model || ''
  const effectivePrice = parseFloat(basePrice) || selectedSub?.base_price || 0

  const lineTotal = useMemo(() => computeLineTotal(
    effectivePricing,
    effectivePrice,
    parseFloat(width) || undefined,
    parseFloat(height) || undefined,
    parseFloat(depth) || undefined,
    parseInt(quantity) || 1,
    parseFloat(noOfMins) || undefined,
    parseFloat(letterCount) || undefined,
    parseFloat(discount) || 0,
  ), [effectivePricing, effectivePrice, width, height, depth, quantity, noOfMins, letterCount, discount])

  const needsDims = ['area','dimension','area_cube','per_lettersqft'].includes(effectivePricing)
  const needsDepth = effectivePricing === 'area_cube'
  const needsMins = effectivePricing === 'per_minute'
  const needsLetters = effectivePricing === 'per_lettersqft'

  function handleSave() {
    if (!subcategoryId || !dateNeeded) return
    const selectedCat = categories.find(c => c.category_id === categoryId)
    onSave({
      ...(isEditing ? { item_id: editingItem.item_id } : { job_status: jobStatus }),
      subcategory_id: subcategoryId,
      subcategory_name: selectedSub?.subcategory_name,
      category_name: selectedCat?.category_name,
      pricing_model: effectivePricing,
      base_price: effectivePrice,
      quantity: parseInt(quantity) || 1,
      width: parseFloat(width) || null,
      height: parseFloat(height) || null,
      depth: parseFloat(depth) || null,
      no_of_mins: parseFloat(noOfMins) || null,
      letter_count: parseInt(letterCount) || null,
      production_specs: productionSpecs,
      notes: remarks,
      date_time_needed: dateNeeded ? new Date(dateNeeded).toISOString() : null,
      discount: parseFloat(discount) || 0,
      computed_line_total: lineTotal,
    })
  }

  function getSubPlaceholder() {
    if (!categoryId) return '-- Select a Category first --'
    if (loadingSubs) return 'Loading items...'
    if (filteredSubs.length === 0) return '-- No items found for this category --'
    return `-- Select Item (${filteredSubs.length} available) --`
  }

  return (
    <div className="pf-modal-overlay" style={{ background: 'rgba(0,0,0,0.8)', zIndex: 200, alignItems: 'flex-start' }}>
      <div className="pf-modal-card pf-modal-wine" style={{ maxWidth: 580, marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1.7rem' }}>{isEditing ? 'Edit Job Order Item' : 'Add Job Order Item'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#E8B9C6', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
        </div>

        <div className="pf-field">
          <label className="pf-label">Category</label>
          <select value={categoryId} disabled={readOnly} onChange={e => setCategoryId(e.target.value)} className="pf-select">
            <option value="">-- Select a Category --</option>
            {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
          </select>
        </div>

        <div className="pf-field">
          <label className="pf-label">Subcategory / Item <span className="pf-req">*</span></label>
          <select
            value={subcategoryId}
            disabled={readOnly || !categoryId || loadingSubs}
            onChange={e => {
              setSubcategoryId(e.target.value)
              const sub = filteredSubs.find(s => s.subcategory_id === e.target.value)
              if (sub) { setPricingModel(sub.pricing_model || ''); setBasePrice(String(sub.base_price || '')) }
            }}
            className="pf-select"
          >
            <option value="">{getSubPlaceholder()}</option>
            {filteredSubs.map(s => <option key={s.subcategory_id} value={s.subcategory_id}>{s.subcategory_name}</option>)}
          </select>
        </div>

        {subcategoryId && (
          <>
            {statusChecklist && <StatusChecklist statusChecklist={statusChecklist} />}

            <div className="pf-field">
              <label className="pf-label">Pricing Model</label>
              <input type="text" value={PRICING_LABELS[effectivePricing] || effectivePricing || '—'} disabled className="pf-input" />
            </div>

            <div className="pf-grid-2" style={{ marginBottom: '0.85rem' }}>
              <div>
                <label className="pf-label">Base Price (₱)</label>
                <input type="number" value={basePrice} disabled={readOnly} onChange={e => setBasePrice(e.target.value)} className="pf-input" />
              </div>
              <div>
                <label className="pf-label">Quantity</label>
                <input type="number" value={quantity} disabled={readOnly} onChange={e => setQuantity(e.target.value)} min="1" className="pf-input" />
              </div>
            </div>

            {needsDims && (
              <div className={needsDepth ? 'pf-grid-3' : 'pf-grid-2'} style={{ marginBottom: '0.85rem' }}>
                <div>
                  <label className="pf-label">Width</label>
                  <input type="number" value={width} disabled={readOnly} onChange={e => setWidth(e.target.value)} placeholder="ft" className="pf-input" />
                </div>
                <div>
                  <label className="pf-label">Height</label>
                  <input type="number" value={height} disabled={readOnly} onChange={e => setHeight(e.target.value)} placeholder="ft" className="pf-input" />
                </div>
                {needsDepth && (
                  <div>
                    <label className="pf-label">Depth</label>
                    <input type="number" value={depth} disabled={readOnly} onChange={e => setDepth(e.target.value)} placeholder="ft" className="pf-input" />
                  </div>
                )}
              </div>
            )}

            {needsMins && (
              <div className="pf-field">
                <label className="pf-label">No. of Minutes</label>
                <input type="number" value={noOfMins} disabled={readOnly} onChange={e => setNoOfMins(e.target.value)} className="pf-input" />
              </div>
            )}

            {needsLetters && (
              <div className="pf-field">
                <label className="pf-label">Letter Count</label>
                <input type="number" value={letterCount} disabled={readOnly} onChange={e => setLetterCount(e.target.value)} className="pf-input" />
              </div>
            )}

            <div className="pf-field">
              <label className="pf-label">Production Specs / Description</label>
              <textarea value={productionSpecs} disabled={readOnly} onChange={e => setProductionSpecs(e.target.value)} rows={2} placeholder="Material, size details, color, etc." className="pf-textarea" />
            </div>

            <div className="pf-grid-2" style={{ marginBottom: '0.85rem' }}>
              <div>
                <label className="pf-label">Deadline / Date Needed <span className="pf-req">*</span></label>
                <input type="datetime-local" value={dateNeeded} disabled={readOnly} onChange={e => setDateNeeded(e.target.value)} className="pf-input" />
              </div>
              {!readOnly && (
                <div>
                  <label className="pf-label">Item Discount (₱)</label>
                  <input type="number" value={discount} onChange={e => setDiscount(e.target.value)} min="0" className="pf-input" />
                </div>
              )}
            </div>

            <div className="pf-field">
              <label className="pf-label">Remarks</label>
              <input type="text" value={remarks} disabled={readOnly} onChange={e => setRemarks(e.target.value)} placeholder="Optional" className="pf-input" />
            </div>

            {canSeeLineTotal && (
              <div className="pf-totals-box" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#000', fontSize: '0.82rem' }}>Line Total</span>
                <span style={{ color: '#000', fontWeight: 700, fontSize: '1rem' }}>{formatPeso(lineTotal)}</span>
              </div>
            )}
          </>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          {readOnly ? (
            <button onClick={onClose} className="pf-btn"><IconX />Close</button>
          ) : (
            <>
              <button onClick={onClose} className="pf-btn pf-btn-secondary"><IconX />Cancel</button>
              <button onClick={handleSave} disabled={!subcategoryId || !dateNeeded} className="pf-btn">
                {isEditing ? <><IconCheck />Save Changes</> : <><IconPlus />Add Item</>}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
