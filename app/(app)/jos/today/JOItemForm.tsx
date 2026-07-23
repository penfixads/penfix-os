'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { computeLineTotal, formatPeso, toLocalDateTimeInput, type StatusStep } from '@/lib/jo-helpers'
import { compressImageToDataUrl, MAX_THUMB_BYTES, MAX_THUMB_DIM } from '@/lib/image-compress'
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
  // When set, no step past the current one can be actioned (checkboxes disabled) — used to
  // enforce the 50%-down/Admin-override rule so status can't skip ahead of that approval.
  blocked?: boolean
  blockedReason?: string
  // Narrower than `blocked` above — only disables the checklist's terminal (last) step, so
  // earlier production steps stay actionable while payment is still being collected. Used to
  // enforce full payment (or billing) before an item can be marked done.
  terminalBlocked?: boolean
  terminalBlockedReason?: string
  onRequestAdvance: (completedStatus: string, targetStatus: string) => void
  onToggleProponent: (email: string) => void
  onConfirmAdvance: () => void
  onCancelPending: () => void
}

interface Props {
  categories: any[]
  subcategories: any[]
  editingItem?: any
  clientName?: string
  onSave: (item: any) => void
  onClose: () => void
  currentUser?: AppUser
  readOnly?: boolean
  statusChecklist?: StatusChecklistProps
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
    blocked, blockedReason, terminalBlocked, terminalBlockedReason, onRequestAdvance, onToggleProponent, onConfirmAdvance, onCancelPending } = statusChecklist
  if (steps.length === 0) return null
  const currentIndex = steps.findIndex(s => s.status_name === currentStatus)
  // Steps from is_production_start up to (but excluding) the terminal step are the actual
  // fabrication checklist — grouped visually under a "Production" heading. Steps before that
  // (Received, layout/design, etc.) render as flat milestones.
  const productionStartIndex = steps.findIndex(s => s.is_production_start)

  return (
    <div className="pf-field">
      <label className="pf-label">Status</label>
      {blocked && (
        <div style={{ background: 'rgba(230,126,34,0.15)', border: '1px solid #e67e22', borderRadius: 8, padding: '0.5rem 0.65rem', marginBottom: 8, color: '#f0b27a', fontSize: '0.75rem' }}>
          🔒 {blockedReason || 'Status can\'t advance past Received yet.'}
        </div>
      )}
      <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, overflow: 'hidden' }}>
        {steps.map((step, i) => {
          const isPast = currentIndex >= 0 && i < currentIndex
          const isCurrentRow = i === currentIndex
          // The terminal step (e.g. "Ready For Pickup/Delivery/Installation") is a real action
          // someone performs, not an automatic side-effect of arriving at it — it only counts
          // as done once it has its own logged proponent(s), same as every other step.
          const terminalConfirmed = step.is_terminal && !!(namesByStatus[step.status_name]?.length)
          const isDone = isPast || (isCurrentRow && step.is_terminal && terminalConfirmed)
          // Temporary: historically-migrated items often carry a job_status from before this
          // SOP checklist existed (or from a subcategory whose steps changed since import), so
          // it matches none of the steps here — currentIndex comes out -1, isCurrentRow is never
          // true for any step, and every checkbox stays permanently disabled with no way to fix
          // it. While historical-import verification is ongoing, treat every step as actionable
          // (not just the one at currentIndex) so staff can click the checkbox that reflects
          // reality and correct the item. Pull the `currentIndex === -1 ||` once that's done.
          const isActionable = (currentIndex === -1 || isCurrentRow ? (!step.is_terminal || !terminalConfirmed) : false) && !(step.is_terminal && terminalBlocked)
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
                background: isActionable ? 'rgba(201,168,76,0.18)' : 'transparent',
                opacity: (isDone || isActionable) ? 1 : 0.45,
              }}>
                <input
                  type="checkbox"
                  checked={isDone}
                  disabled={!isActionable || advancing || blocked}
                  onChange={() => onRequestAdvance(step.status_name, nextStep ? nextStep.status_name : step.status_name)}
                  style={{ accentColor: '#C9A84C', width: 15, height: 15, marginTop: 1, cursor: isActionable && !blocked ? 'pointer' : 'default' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: isActionable ? 700 : 400, color: isActionable ? '#fff' : '#E8B9C6', textDecoration: isDone ? 'line-through' : 'none' }}>
                    {step.status_name}
                  </span>
                  {names && names.length > 0 && (
                    <div style={{ color: '#c99', fontSize: '0.68rem', marginTop: 1 }}>by {names.join(', ')}</div>
                  )}
                  {step.is_terminal && terminalBlocked && !isDone && (
                    <div style={{ color: '#f0b27a', fontSize: '0.68rem', marginTop: 1 }}>🔒 {terminalBlockedReason || 'Balance due before this can be marked done.'}</div>
                  )}
                </div>
                {advancing && isActionable && <span style={{ color: '#E8B9C6', fontSize: '0.7rem' }}>Saving…</span>}
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

export default function JOItemForm({ categories, editingItem, clientName, onSave, onClose, currentUser, readOnly, statusChecklist }: Props) {
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
  const [needsLayout, setNeedsLayout] = useState((editingItem?.layout_fee || 0) > 0)
  const [layoutFee, setLayoutFee] = useState(editingItem?.layout_fee != null && editingItem.layout_fee > 0 ? String(editingItem.layout_fee) : '150')
  const [needsDelivery, setNeedsDelivery] = useState((editingItem?.delivery_fee || 0) > 0)
  const [deliveryFee, setDeliveryFee] = useState(editingItem?.delivery_fee != null && editingItem.delivery_fee > 0 ? String(editingItem.delivery_fee) : '')
  const [needsInstallation, setNeedsInstallation] = useState((editingItem?.installation_fee || 0) > 0)
  const [installationFee, setInstallationFee] = useState(editingItem?.installation_fee != null && editingItem.installation_fee > 0 ? String(editingItem.installation_fee) : '')
  const [needsSeaming, setNeedsSeaming] = useState((editingItem?.seaming_fee || 0) > 0)
  const [seamingFee, setSeamingFee] = useState(editingItem?.seaming_fee != null && editingItem.seaming_fee > 0 ? String(editingItem.seaming_fee) : '')
  const [needsLaminate, setNeedsLaminate] = useState((editingItem?.laminate_fee || 0) > 0)
  const [laminateFee, setLaminateFee] = useState(editingItem?.laminate_fee != null && editingItem.laminate_fee > 0 ? String(editingItem.laminate_fee) : '')
  const [layoutPreview, setLayoutPreview] = useState(editingItem?.item_preview || '')
  const [layoutThumb, setLayoutThumb] = useState(editingItem?.item_preview_thumb || '')
  const [layoutBytes, setLayoutBytes] = useState<number | null>(null)
  const [compressing, setCompressing] = useState(false)
  const [layoutError, setLayoutError] = useState('')
  const [formError, setFormError] = useState('')

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
      .select('subcategory_id, subcategory_name, category_id, pricing_model, base_price, unit')
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
  // The subcategory's base_price is scaled per its own unit (e.g. ₱12/sqin vs ₱20/sqft) —
  // width/height/depth must be entered in that same linear unit or the computed line total
  // is off by orders of magnitude. Falls back to ft when a subcategory has no unit set.
  const rawUnit = (selectedSub?.unit || '').toLowerCase()
  const dimUnit = rawUnit.startsWith('sq') ? rawUnit.slice(2) || 'ft' : (rawUnit || 'ft')
  // Production Services (e.g. laser cutting, plotting done on materials the client already
  // brought/owns) has nothing to preview at intake — there's no layout or purchased item yet.
  const isProductionServices = categoryId === 'CAT_FPS'

  const baseLineTotal = useMemo(() => computeLineTotal(
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
  const effectiveLayoutFee = needsLayout ? (parseFloat(layoutFee) || 0) : 0
  const effectiveDeliveryFee = needsDelivery ? (parseFloat(deliveryFee) || 0) : 0
  const effectiveInstallationFee = needsInstallation ? (parseFloat(installationFee) || 0) : 0
  const effectiveSeamingFee = needsSeaming ? (parseFloat(seamingFee) || 0) : 0
  const effectiveLaminateFee = needsLaminate ? (parseFloat(laminateFee) || 0) : 0
  const lineTotal = baseLineTotal + effectiveLayoutFee + effectiveDeliveryFee + effectiveInstallationFee + effectiveSeamingFee + effectiveLaminateFee

  const needsDims = ['area','dimension','area_cube','per_lettersqft'].includes(effectivePricing)
  const needsDepth = effectivePricing === 'area_cube'
  const needsMins = effectivePricing === 'per_minute'
  const needsLetters = effectivePricing === 'per_lettersqft'

  async function handleLayoutFile(file: File | null) {
    if (!file) return
    setLayoutError('')
    setCompressing(true)
    try {
      const [{ dataUrl, bytes }, { dataUrl: thumbUrl }] = await Promise.all([
        compressImageToDataUrl(file),
        compressImageToDataUrl(file, MAX_THUMB_BYTES, MAX_THUMB_DIM),
      ])
      setLayoutPreview(dataUrl)
      setLayoutThumb(thumbUrl)
      setLayoutBytes(bytes)
    } catch (e: any) {
      setLayoutError(e.message || 'Failed to process image.')
    } finally {
      setCompressing(false)
    }
  }

  // Lets someone paste a clipboard screenshot (e.g. Win+Shift+S) straight into the
  // preview box instead of having to save it to a file first and browse for it.
  function handleLayoutPaste(e: React.ClipboardEvent) {
    const item = Array.from(e.clipboardData.items).find(i => i.type.startsWith('image/'))
    if (!item) return
    e.preventDefault()
    handleLayoutFile(item.getAsFile())
  }

  function handleSave() {
    if (!subcategoryId) { setFormError('Please select a subcategory/item.'); return }
    // TEMPORARILY not required (2026-07-19) — Facebook/Messenger (where the original layout
    // files live for the January backlog) is under maintenance, so staff can't pull the images
    // to attach while catching up on unentered January job orders. Restore this check once
    // Facebook access is back and the backlog is caught up.
    if (!dateNeeded) { setFormError('Please set a deadline/date needed.'); return }
    setFormError('')
    const selectedCat = categories.find(c => c.category_id === categoryId)
    onSave({
      ...(editingItem?.item_id ? { item_id: editingItem.item_id } : {}),
      ...(editingItem?._tempId ? { _tempId: editingItem._tempId } : {}),
      job_status: editingItem?.job_status || jobStatus,
      category_id: categoryId,
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
      layout_fee: effectiveLayoutFee,
      delivery_fee: effectiveDeliveryFee,
      installation_fee: effectiveInstallationFee,
      seaming_fee: effectiveSeamingFee,
      laminate_fee: effectiveLaminateFee,
      computed_line_total: lineTotal,
      item_preview: layoutPreview,
      item_preview_thumb: layoutThumb,
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

        {clientName && (
          <div className="pf-field">
            <label className="pf-label">Client</label>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>{clientName}</div>
          </div>
        )}

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

            {!isProductionServices && (
              <div className="pf-field">
                <label className="pf-label">Item Preview <span style={{ color: '#999', fontWeight: 400 }}>(optional for now — Facebook is under maintenance)</span></label>
                {layoutPreview ? (
                  <div onPaste={handleLayoutPaste} tabIndex={!readOnly ? 0 : undefined} style={{ display: 'flex', alignItems: 'center', gap: 12, outline: 'none' }}>
                    <img
                      src={layoutPreview}
                      alt="Item preview"
                      onClick={() => window.open(layoutPreview, '_blank')}
                      title="Click to view full size"
                      style={{ width: 140, height: 140, objectFit: 'contain', background: 'rgba(0,0,0,0.2)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', cursor: 'zoom-in' }}
                    />
                    <div style={{ flex: 1 }}>
                      {layoutBytes != null && (
                        <div style={{ color: '#E8B9C6', fontSize: '0.72rem' }}>Compressed to {(layoutBytes / 1024).toFixed(1)} KB</div>
                      )}
                      {!readOnly && (
                        <>
                          <label className="pf-link-btn" style={{ cursor: 'pointer', fontSize: '0.78rem' }}>
                            Change image
                            <input type="file" accept="image/*" onChange={e => handleLayoutFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
                          </label>
                          <div style={{ color: '#E8B9C6', fontSize: '0.68rem', marginTop: 2 }}>...or click here and paste (Ctrl+V) to replace</div>
                        </>
                      )}
                    </div>
                  </div>
                ) : !readOnly && (
                  <div
                    onPaste={handleLayoutPaste}
                    tabIndex={0}
                    style={{ border: '1.5px dashed rgba(255,255,255,0.3)', borderRadius: 8, padding: '0.6rem 0.75rem', outline: 'none' }}
                  >
                    <input type="file" accept="image/*" onChange={e => handleLayoutFile(e.target.files?.[0] || null)} className="pf-input" style={{ border: 'none', padding: 0 }} />
                    <div style={{ color: '#E8B9C6', fontSize: '0.7rem', marginTop: 6 }}>...or click here and paste (Ctrl+V) a screenshot</div>
                  </div>
                )}
                {compressing && <div style={{ color: '#E8B9C6', fontSize: '0.72rem', marginTop: 4 }}>Compressing image…</div>}
                {layoutError && <div style={{ color: '#e74c3c', fontSize: '0.72rem', marginTop: 4 }}>{layoutError}</div>}
                {!readOnly && !layoutPreview && !compressing && (
                  <div style={{ color: '#E8B9C6', fontSize: '0.7rem', marginTop: 4 }}>Optional for now — you can save without one while Facebook is under maintenance.</div>
                )}
              </div>
            )}

            <div className={canSeeLineTotal ? 'pf-grid-2' : undefined} style={{ marginBottom: '0.85rem' }}>
              {canSeeLineTotal && (
                <div>
                  <label className="pf-label">Base Price (₱)</label>
                  <input type="number" value={basePrice} disabled={readOnly} onChange={e => setBasePrice(e.target.value)} className="pf-input" />
                </div>
              )}
              <div>
                <label className="pf-label">Quantity</label>
                <input type="number" value={quantity} disabled={readOnly} onChange={e => setQuantity(e.target.value)} min="1" className="pf-input" />
              </div>
            </div>

            {needsDims && (
              <div className={needsDepth ? 'pf-grid-3' : 'pf-grid-2'} style={{ marginBottom: '0.85rem' }}>
                <div>
                  <label className="pf-label">Width ({dimUnit})</label>
                  <input type="number" value={width} disabled={readOnly} onChange={e => setWidth(e.target.value)} placeholder={dimUnit} className="pf-input" />
                </div>
                <div>
                  <label className="pf-label">Height ({dimUnit})</label>
                  <input type="number" value={height} disabled={readOnly} onChange={e => setHeight(e.target.value)} placeholder={dimUnit} className="pf-input" />
                </div>
                {needsDepth && (
                  <div>
                    <label className="pf-label">Depth ({dimUnit})</label>
                    <input type="number" value={depth} disabled={readOnly} onChange={e => setDepth(e.target.value)} placeholder={dimUnit} className="pf-input" />
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

            <div className="pf-field">
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: readOnly ? 'default' : 'pointer' }}>
                <input type="checkbox" checked={needsLayout} disabled={readOnly} onChange={e => setNeedsLayout(e.target.checked)} />
                <span className="pf-label" style={{ marginBottom: 0 }}>Needs layout/design for this item?</span>
              </label>
              {needsLayout && canSeeLineTotal && (
                <div style={{ marginTop: 6 }}>
                  <label className="pf-label">Layout Fee (₱)</label>
                  <input type="number" value={layoutFee} disabled={readOnly} onChange={e => setLayoutFee(e.target.value)} min="0" className="pf-input" />
                </div>
              )}
            </div>

            <div className="pf-field">
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: readOnly ? 'default' : 'pointer' }}>
                <input type="checkbox" checked={needsDelivery} disabled={readOnly} onChange={e => setNeedsDelivery(e.target.checked)} />
                <span className="pf-label" style={{ marginBottom: 0 }}>Needs delivery for this item?</span>
              </label>
              {needsDelivery && canSeeLineTotal && (
                <div style={{ marginTop: 6 }}>
                  <label className="pf-label">Delivery Fee (₱)</label>
                  <input type="number" value={deliveryFee} disabled={readOnly} onChange={e => setDeliveryFee(e.target.value)} min="0" placeholder="0.00" className="pf-input" />
                </div>
              )}
            </div>

            <div className="pf-field">
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: readOnly ? 'default' : 'pointer' }}>
                <input type="checkbox" checked={needsInstallation} disabled={readOnly} onChange={e => setNeedsInstallation(e.target.checked)} />
                <span className="pf-label" style={{ marginBottom: 0 }}>Needs installation for this item?</span>
              </label>
              {needsInstallation && canSeeLineTotal && (
                <div style={{ marginTop: 6 }}>
                  <label className="pf-label">Installation Fee (₱)</label>
                  <input type="number" value={installationFee} disabled={readOnly} onChange={e => setInstallationFee(e.target.value)} min="0" placeholder="0.00" className="pf-input" />
                </div>
              )}
            </div>

            <div className="pf-field">
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: readOnly ? 'default' : 'pointer' }}>
                <input
                  type="checkbox"
                  checked={needsSeaming}
                  disabled={readOnly}
                  onChange={e => {
                    setNeedsSeaming(e.target.checked)
                    if (e.target.checked && !seamingFee) {
                      const w = parseFloat(width) || 0
                      const h = parseFloat(height) || 0
                      if (w && h) setSeamingFee(String(w * h * 10))
                    }
                  }}
                />
                <span className="pf-label" style={{ marginBottom: 0 }}>Needs seaming for this item? (₱10/sqft)</span>
              </label>
              {needsSeaming && canSeeLineTotal && (
                <div style={{ marginTop: 6 }}>
                  <label className="pf-label">Seaming Fee (₱)</label>
                  <input type="number" value={seamingFee} disabled={readOnly} onChange={e => setSeamingFee(e.target.value)} min="0" placeholder="0.00" className="pf-input" />
                </div>
              )}
            </div>

            <div className="pf-field">
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: readOnly ? 'default' : 'pointer' }}>
                <input
                  type="checkbox"
                  checked={needsLaminate}
                  disabled={readOnly}
                  onChange={e => {
                    setNeedsLaminate(e.target.checked)
                    if (e.target.checked && !laminateFee) {
                      const w = parseFloat(width) || 0
                      const h = parseFloat(height) || 0
                      if (w && h) setLaminateFee(String(w * h * 20))
                    }
                  }}
                />
                <span className="pf-label" style={{ marginBottom: 0 }}>Needs laminate for this item? (₱20/sqft)</span>
              </label>
              {needsLaminate && canSeeLineTotal && (
                <div style={{ marginTop: 6 }}>
                  <label className="pf-label">Laminate Fee (₱)</label>
                  <input type="number" value={laminateFee} disabled={readOnly} onChange={e => setLaminateFee(e.target.value)} min="0" placeholder="0.00" className="pf-input" />
                </div>
              )}
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
              <div className="pf-totals-box">
                {(effectiveLayoutFee > 0 || effectiveDeliveryFee > 0 || effectiveInstallationFee > 0 || effectiveSeamingFee > 0) && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ color: '#555', fontSize: '0.75rem' }}>Item Price</span>
                      <span style={{ color: '#555', fontSize: '0.8rem' }}>{formatPeso(baseLineTotal)}</span>
                    </div>
                    {effectiveLayoutFee > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ color: '#555', fontSize: '0.75rem' }}>Layout Fee</span>
                        <span style={{ color: '#555', fontSize: '0.8rem' }}>{formatPeso(effectiveLayoutFee)}</span>
                      </div>
                    )}
                    {effectiveDeliveryFee > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ color: '#555', fontSize: '0.75rem' }}>Delivery Fee</span>
                        <span style={{ color: '#555', fontSize: '0.8rem' }}>{formatPeso(effectiveDeliveryFee)}</span>
                      </div>
                    )}
                    {effectiveInstallationFee > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ color: '#555', fontSize: '0.75rem' }}>Installation Fee</span>
                        <span style={{ color: '#555', fontSize: '0.8rem' }}>{formatPeso(effectiveInstallationFee)}</span>
                      </div>
                    )}
                    {effectiveSeamingFee > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ color: '#555', fontSize: '0.75rem' }}>Seaming Fee</span>
                        <span style={{ color: '#555', fontSize: '0.8rem' }}>{formatPeso(effectiveSeamingFee)}</span>
                      </div>
                    )}
                  </>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#000', fontSize: '0.82rem' }}>Line Total</span>
                  <span style={{ color: '#000', fontWeight: 700, fontSize: '1rem' }}>{formatPeso(lineTotal)}</span>
                </div>
              </div>
            )}
          </>
        )}

        {formError && <div style={{ color: '#e74c3c', fontSize: '0.82rem', marginBottom: '0.75rem', textAlign: 'right' }}>{formError}</div>}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          {readOnly ? (
            <button onClick={onClose} className="pf-btn"><IconX />Close</button>
          ) : (
            <>
              <button onClick={onClose} className="pf-btn pf-btn-secondary"><IconX />Cancel</button>
              <button onClick={handleSave} disabled={compressing} className="pf-btn">
                {isEditing ? <><IconCheck />Save Changes</> : <><IconPlus />Add Item</>}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
