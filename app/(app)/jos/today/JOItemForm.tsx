'use client'

import { useState, useMemo, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { computeLineTotal, formatPeso } from '@/lib/jo-helpers'
import { IconPlus, IconX } from '@/components/icons'

interface Props {
  categories: any[]
  subcategories: any[]
  onSave: (item: any) => void
  onClose: () => void
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

export default function JOItemForm({ categories, onSave, onClose }: Props) {
  const [categoryId, setCategoryId] = useState('')
  const [subcategoryId, setSubcategoryId] = useState('')
  const [filteredSubs, setFilteredSubs] = useState<any[]>([])
  const [loadingSubs, setLoadingSubs] = useState(false)
  const [pricingModel, setPricingModel] = useState('')
  const [basePrice, setBasePrice] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [depth, setDepth] = useState('')
  const [noOfMins, setNoOfMins] = useState('')
  const [letterCount, setLetterCount] = useState('')
  const [productionSpecs, setProductionSpecs] = useState('')
  const [remarks, setRemarks] = useState('')
  const [dateNeeded, setDateNeeded] = useState('')
  const [jobStatus] = useState('Received')
  const [discount, setDiscount] = useState('0')

  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    if (!categoryId) {
      setFilteredSubs([])
      return
    }
    setLoadingSubs(true)
    setFilteredSubs([])
    setSubcategoryId('')
    supabase
      .from('subcategories')
      .select('subcategory_id, subcategory_name, category_id, pricing_model, base_price')
      .eq('category_id', categoryId)
      .eq('active', true)
      .order('subcategory_name')
      .then(({ data }) => {
        setFilteredSubs(data || [])
        setLoadingSubs(false)
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
    if (!subcategoryId) return
    const selectedCat = categories.find(c => c.category_id === categoryId)
    onSave({
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
      job_status: jobStatus,
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
      <div className="pf-modal-card pf-modal-wine" style={{ maxWidth: 480, marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1.7rem' }}>Add Job Order Item</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#E8B9C6', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
        </div>

        <div className="pf-field">
          <label className="pf-label">Category</label>
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="pf-select">
            <option value="">-- Select a Category --</option>
            {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
          </select>
        </div>

        <div className="pf-field">
          <label className="pf-label">Subcategory / Item <span className="pf-req">*</span></label>
          <select
            value={subcategoryId}
            disabled={!categoryId || loadingSubs}
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
            <div className="pf-field">
              <label className="pf-label">Pricing Model</label>
              <input type="text" value={PRICING_LABELS[effectivePricing] || effectivePricing || '—'} disabled className="pf-input" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: '0.85rem' }}>
              <div>
                <label className="pf-label">Base Price (₱)</label>
                <input type="number" value={basePrice} onChange={e => setBasePrice(e.target.value)} className="pf-input" />
              </div>
              <div>
                <label className="pf-label">Quantity</label>
                <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} min="1" className="pf-input" />
              </div>
            </div>

            {needsDims && (
              <div style={{ display: 'grid', gridTemplateColumns: needsDepth ? '1fr 1fr 1fr' : '1fr 1fr', gap: 8, marginBottom: '0.85rem' }}>
                <div>
                  <label className="pf-label">Width</label>
                  <input type="number" value={width} onChange={e => setWidth(e.target.value)} placeholder="ft" className="pf-input" />
                </div>
                <div>
                  <label className="pf-label">Height</label>
                  <input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="ft" className="pf-input" />
                </div>
                {needsDepth && (
                  <div>
                    <label className="pf-label">Depth</label>
                    <input type="number" value={depth} onChange={e => setDepth(e.target.value)} placeholder="ft" className="pf-input" />
                  </div>
                )}
              </div>
            )}

            {needsMins && (
              <div className="pf-field">
                <label className="pf-label">No. of Minutes</label>
                <input type="number" value={noOfMins} onChange={e => setNoOfMins(e.target.value)} className="pf-input" />
              </div>
            )}

            {needsLetters && (
              <div className="pf-field">
                <label className="pf-label">Letter Count</label>
                <input type="number" value={letterCount} onChange={e => setLetterCount(e.target.value)} className="pf-input" />
              </div>
            )}

            <div className="pf-field">
              <label className="pf-label">Production Specs / Description</label>
              <textarea value={productionSpecs} onChange={e => setProductionSpecs(e.target.value)} rows={2} placeholder="Material, size details, color, etc." className="pf-textarea" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: '0.85rem' }}>
              <div>
                <label className="pf-label">Deadline / Date Needed</label>
                <input type="datetime-local" value={dateNeeded} onChange={e => setDateNeeded(e.target.value)} className="pf-input" />
              </div>
              <div>
                <label className="pf-label">Item Discount (₱)</label>
                <input type="number" value={discount} onChange={e => setDiscount(e.target.value)} min="0" className="pf-input" />
              </div>
            </div>

            <div className="pf-field">
              <label className="pf-label">Remarks</label>
              <input type="text" value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Optional" className="pf-input" />
            </div>

            <div className="pf-totals-box" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#000', fontSize: '0.82rem' }}>Line Total</span>
              <span style={{ color: '#000', fontWeight: 700, fontSize: '1rem' }}>{formatPeso(lineTotal)}</span>
            </div>
          </>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="pf-btn pf-btn-secondary"><IconX />Cancel</button>
          <button onClick={handleSave} disabled={!subcategoryId} className="pf-btn">
            <IconPlus />Add Item
          </button>
        </div>
      </div>
    </div>
  )
}
