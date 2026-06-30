'use client'

import { useState, useMemo } from 'react'
import { computeLineTotal, formatPeso } from '@/lib/jo-helpers'

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

export default function JOItemForm({ categories, subcategories, onSave, onClose }: Props) {
  const [categoryId, setCategoryId] = useState('')
  const [subcategoryId, setSubcategoryId] = useState('')
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

  const filteredSubs = subcategories.filter(s => !categoryId || s.category_id === categoryId)

  const selectedSub = subcategories.find(s => s.subcategory_id === subcategoryId)
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
      letter_count: parseFloat(letterCount) || null,
      production_specs: productionSpecs,
      remarks,
      date_time_needed: dateNeeded ? new Date(dateNeeded).toISOString() : null,
      job_status: jobStatus,
      item_discount: parseFloat(discount) || 0,
      computed_line_total: lineTotal,
    })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}>
      <div style={{ background: '#1a1a1a', borderRadius: 14, width: '100%', maxWidth: 480, padding: '1.5rem', marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>Add Job Order Item</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#aaa', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={field}>
          <label style={lbl}>Category</label>
          <select value={categoryId} onChange={e => { setCategoryId(e.target.value); setSubcategoryId('') }} style={inp}>
            <option value="">-- All Categories --</option>
            {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
          </select>
        </div>

        <div style={field}>
          <label style={lbl}>Subcategory / Item <span style={{ color: '#e74c3c' }}>*</span></label>
          <select value={subcategoryId} onChange={e => {
            setSubcategoryId(e.target.value)
            const sub = subcategories.find(s => s.subcategory_id === e.target.value)
            if (sub) { setPricingModel(sub.pricing_model || ''); setBasePrice(String(sub.base_price || '')) }
          }} style={inp}>
            <option value="">-- Select Item --</option>
            {filteredSubs.map(s => <option key={s.subcategory_id} value={s.subcategory_id}>{s.subcategory_name}</option>)}
          </select>
        </div>

        {subcategoryId && (
          <>
            <div style={field}>
              <label style={lbl}>Pricing Model</label>
              <select value={effectivePricing} onChange={e => setPricingModel(e.target.value)} style={inp}>
                {Object.entries(PRICING_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: '0.85rem' }}>
              <div>
                <label style={lbl}>Base Price (₱)</label>
                <input type="number" value={basePrice} onChange={e => setBasePrice(e.target.value)} style={inp} />
              </div>
              <div>
                <label style={lbl}>Quantity</label>
                <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} min="1" style={inp} />
              </div>
            </div>

            {needsDims && (
              <div style={{ display: 'grid', gridTemplateColumns: needsDepth ? '1fr 1fr 1fr' : '1fr 1fr', gap: 8, marginBottom: '0.85rem' }}>
                <div>
                  <label style={lbl}>Width</label>
                  <input type="number" value={width} onChange={e => setWidth(e.target.value)} placeholder="ft" style={inp} />
                </div>
                <div>
                  <label style={lbl}>Height</label>
                  <input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="ft" style={inp} />
                </div>
                {needsDepth && (
                  <div>
                    <label style={lbl}>Depth</label>
                    <input type="number" value={depth} onChange={e => setDepth(e.target.value)} placeholder="ft" style={inp} />
                  </div>
                )}
              </div>
            )}

            {needsMins && (
              <div style={field}>
                <label style={lbl}>No. of Minutes</label>
                <input type="number" value={noOfMins} onChange={e => setNoOfMins(e.target.value)} style={inp} />
              </div>
            )}

            {needsLetters && (
              <div style={field}>
                <label style={lbl}>Letter Count</label>
                <input type="number" value={letterCount} onChange={e => setLetterCount(e.target.value)} style={inp} />
              </div>
            )}

            <div style={field}>
              <label style={lbl}>Production Specs / Description</label>
              <textarea value={productionSpecs} onChange={e => setProductionSpecs(e.target.value)} rows={2} placeholder="Material, size details, color, etc." style={{ ...inp, resize: 'vertical' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: '0.85rem' }}>
              <div>
                <label style={lbl}>Deadline / Date Needed</label>
                <input type="datetime-local" value={dateNeeded} onChange={e => setDateNeeded(e.target.value)} style={inp} />
              </div>
              <div>
                <label style={lbl}>Item Discount (₱)</label>
                <input type="number" value={discount} onChange={e => setDiscount(e.target.value)} min="0" style={inp} />
              </div>
            </div>

            <div style={field}>
              <label style={lbl}>Remarks</label>
              <input type="text" value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Optional" style={inp} />
            </div>

            <div style={{ background: '#111', borderRadius: 8, padding: '0.65rem 0.85rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#aaa', fontSize: '0.82rem' }}>Line Total</span>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>{formatPeso(lineTotal)}</span>
            </div>
          </>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, background: '#2a2a2a', color: '#fff', border: 'none', borderRadius: 8, padding: '0.7rem', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSave} disabled={!subcategoryId} style={{ flex: 2, background: subcategoryId ? '#7B1C1C' : '#333', color: '#fff', border: 'none', borderRadius: 8, padding: '0.7rem', fontWeight: 700, cursor: subcategoryId ? 'pointer' : 'not-allowed' }}>
            Add Item
          </button>
        </div>
      </div>
    </div>
  )
}

const field: React.CSSProperties = { marginBottom: '0.85rem' }
const lbl: React.CSSProperties = { display: 'block', color: '#aaa', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.3rem' }
const inp: React.CSSProperties = { width: '100%', background: '#111', border: '1.5px solid #333', borderRadius: 7, padding: '0.5rem 0.7rem', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box', outline: 'none' }
