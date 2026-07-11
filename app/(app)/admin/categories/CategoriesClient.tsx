'use client'

import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { generateCategoryId, generateSubcategoryId, formatPeso } from '@/lib/jo-helpers'
import { IconPlus, IconEdit, IconCheck, IconX } from '@/components/icons'
import Pagination from '@/components/Pagination'

const PAGE_SIZE = 10

const PRICING_MODELS: { value: string; label: string }[] = [
  { value: 'per_piece', label: 'Per Piece — price × quantity' },
  { value: 'area', label: 'Area — price × width × height × quantity' },
  { value: 'dimension', label: 'Dimension — price × (width + height) × quantity' },
  { value: 'per_set', label: 'Per Set — price × quantity' },
  { value: 'fixed', label: 'Fixed — flat price regardless of quantity' },
  { value: 'area_cube', label: 'Area Cube — price × width × height × depth × quantity' },
  { value: 'per_sheet', label: 'Per Sheet — price × quantity' },
  { value: 'per_minute', label: 'Per Minute — price × minutes' },
  { value: 'starts_with', label: 'Starts With — base price, quantity add-on' },
  { value: 'per_lettersqft', label: 'Per Letter Sq Ft — price × letters × size' },
]

interface Category {
  category_id: string
  category_name: string
  description: string | null
  is_active: boolean
}

interface Subcategory {
  subcategory_id: string
  subcategory_name: string
  category_id: string
  subcategory_type: string | null
  description: string | null
  pricing_model: string
  base_price: number
  unit: string | null
  active: boolean
}

interface Props {
  categories: Category[]
  subcategories: Subcategory[]
}

export default function CategoriesClient({ categories: initialCategories, subcategories: initialSubs }: Props) {
  const [categories, setCategories] = useState(initialCategories)
  const [subcategories, setSubcategories] = useState(initialSubs)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(initialCategories[0]?.category_id || '')
  const [subSearch, setSubSearch] = useState('')
  const [page, setPage] = useState(1)

  const [showCatForm, setShowCatForm] = useState(false)
  const [editingCat, setEditingCat] = useState<Category | null>(null)
  const [catId, setCatId] = useState('')
  const [catName, setCatName] = useState('')
  const [catDesc, setCatDesc] = useState('')
  const [catActive, setCatActive] = useState(true)
  const [catSaving, setCatSaving] = useState(false)
  const [catError, setCatError] = useState('')

  const [showSubForm, setShowSubForm] = useState(false)
  const [editingSub, setEditingSub] = useState<Subcategory | null>(null)
  const [subId, setSubId] = useState('')
  const [subName, setSubName] = useState('')
  const [subType, setSubType] = useState('')
  const [subDesc, setSubDesc] = useState('')
  const [subPricingModel, setSubPricingModel] = useState('per_piece')
  const [subBasePrice, setSubBasePrice] = useState('')
  const [subUnit, setSubUnit] = useState('')
  const [subActive, setSubActive] = useState(true)
  const [subSaving, setSubSaving] = useState(false)
  const [subError, setSubError] = useState('')

  const selectedCategory = categories.find(c => c.category_id === selectedCategoryId)

  function subCountFor(categoryId: string) {
    return subcategories.filter(s => s.category_id === categoryId).length
  }

  const subsInCategory = subcategories.filter(s => s.category_id === selectedCategoryId)
  const filteredSubs = subsInCategory.filter(s => !subSearch || s.subcategory_name.toLowerCase().includes(subSearch.toLowerCase()))
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filteredSubs.length / PAGE_SIZE)))
  const pageSubs = filteredSubs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function openAddCategory() {
    setEditingCat(null)
    setCatId(''); setCatName(''); setCatDesc(''); setCatActive(true); setCatError('')
    setShowCatForm(true)
  }

  function openEditCategory(c: Category) {
    setEditingCat(c)
    setCatId(c.category_id); setCatName(c.category_name); setCatDesc(c.description || ''); setCatActive(c.is_active)
    setCatError('')
    setShowCatForm(true)
  }

  async function saveCategory() {
    if (!catName.trim()) { setCatError('Category name is required.'); return }
    const id = editingCat ? editingCat.category_id : (catId.trim() || generateCategoryId(catName))
    if (!id) { setCatError('Category ID is required.'); return }
    setCatSaving(true); setCatError('')
    try {
      const supabase = createSupabaseBrowserClient()
      const payload = { category_name: catName.trim(), description: catDesc || null, is_active: catActive }
      if (editingCat) {
        const { data, error } = await supabase.from('categories').update(payload).eq('category_id', id).select().single()
        if (error) throw error
        setCategories(prev => prev.map(c => c.category_id === id ? data : c))
      } else {
        const { data, error } = await supabase.from('categories').insert({ category_id: id, ...payload }).select().single()
        if (error) throw error
        setCategories(prev => [...prev, data].sort((a, b) => a.category_name.localeCompare(b.category_name)))
        setSelectedCategoryId(id)
      }
      setShowCatForm(false)
    } catch (e: any) {
      setCatError(e.code === '23505' ? `Category ID "${id}" is already in use — pick a different one.` : (e.message || 'Failed to save category.'))
    } finally {
      setCatSaving(false)
    }
  }

  async function deleteCategory(c: Category) {
    if (subCountFor(c.category_id) > 0) {
      alert(`"${c.category_name}" has ${subCountFor(c.category_id)} subcategory(ies) under it. Move or delete those first.`)
      return
    }
    if (!confirm(`Delete category "${c.category_name}"?`)) return
    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase.from('categories').delete().eq('category_id', c.category_id)
    if (error) { alert(error.message); return }
    setCategories(prev => prev.filter(x => x.category_id !== c.category_id))
    if (selectedCategoryId === c.category_id) setSelectedCategoryId('')
  }

  function openAddSub() {
    if (!selectedCategoryId) return
    setEditingSub(null)
    setSubId(''); setSubName(''); setSubType(''); setSubDesc('')
    setSubPricingModel('per_piece'); setSubBasePrice(''); setSubUnit(''); setSubActive(true)
    setSubError('')
    setShowSubForm(true)
  }

  function openEditSub(s: Subcategory) {
    setEditingSub(s)
    setSubId(s.subcategory_id); setSubName(s.subcategory_name); setSubType(s.subcategory_type || '')
    setSubDesc(s.description || ''); setSubPricingModel(s.pricing_model); setSubBasePrice(String(s.base_price ?? ''))
    setSubUnit(s.unit || ''); setSubActive(s.active)
    setSubError('')
    setShowSubForm(true)
  }

  async function saveSub() {
    if (!subName.trim()) { setSubError('Subcategory name is required.'); return }
    if (!subPricingModel) { setSubError('Pricing model is required.'); return }
    const id = editingSub ? editingSub.subcategory_id : (subId.trim() || generateSubcategoryId(selectedCategoryId, subName))
    setSubSaving(true); setSubError('')
    try {
      const supabase = createSupabaseBrowserClient()
      const payload = {
        subcategory_name: subName.trim(),
        category_id: selectedCategoryId,
        subcategory_type: subType || null,
        description: subDesc || null,
        pricing_model: subPricingModel,
        base_price: parseFloat(subBasePrice) || 0,
        unit: subUnit || null,
        active: subActive,
      }
      if (editingSub) {
        const { data, error } = await supabase.from('subcategories').update(payload).eq('subcategory_id', id).select().single()
        if (error) throw error
        setSubcategories(prev => prev.map(s => s.subcategory_id === id ? data : s))
      } else {
        const { data, error } = await supabase.from('subcategories').insert({ subcategory_id: id, ...payload }).select().single()
        if (error) throw error
        setSubcategories(prev => [...prev, data])
      }
      setShowSubForm(false)
    } catch (e: any) {
      setSubError(e.code === '23505' ? `Subcategory ID "${id}" is already in use — pick a different one.` : (e.message || 'Failed to save subcategory.'))
    } finally {
      setSubSaving(false)
    }
  }

  async function deleteSub(s: Subcategory) {
    const supabase = createSupabaseBrowserClient()
    const { count } = await supabase.from('job_order_items').select('item_id', { count: 'exact', head: true }).eq('subcategory_id', s.subcategory_id)
    if (count && count > 0) {
      alert(`"${s.subcategory_name}" is used on ${count} job order item(s) and can't be deleted. Mark it Inactive instead so it stops showing up for new job orders.`)
      return
    }
    if (!confirm(`Delete subcategory "${s.subcategory_name}"?`)) return
    const { error } = await supabase.from('subcategories').delete().eq('subcategory_id', s.subcategory_id)
    if (error) { alert(error.message); return }
    setSubcategories(prev => prev.filter(x => x.subcategory_id !== s.subcategory_id))
  }

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ color: '#7A1828', fontSize: '1.4rem', fontWeight: 700 }}>Categories &amp; Pricing</h1>
        <p style={{ color: '#777', fontSize: '0.8rem', marginTop: 2 }}>The master catalog of product categories and subcategories used across every Job Order — this drives what staff can select and how each item is priced.</p>
      </div>

      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
        {/* Category list */}
        <div style={{ flex: '0 0 280px', minWidth: 240 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ color: '#7A1828', fontWeight: 700, fontSize: '0.85rem' }}>Categories ({categories.length})</span>
            <button onClick={openAddCategory} className="pf-link-btn" style={{ color: '#7A1828', fontSize: '0.75rem' }}>
              <IconPlus />Add
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {categories.map(c => (
              <button
                key={c.category_id}
                onClick={() => { setSelectedCategoryId(c.category_id); setSubSearch(''); setPage(1) }}
                style={{
                  textAlign: 'left', background: c.category_id === selectedCategoryId ? '#7A1828' : '#FDF5EC',
                  color: c.category_id === selectedCategoryId ? '#fff' : '#1a1a1a',
                  border: '1px solid #EDE0CC', borderRadius: 8, padding: '0.5rem 0.65rem', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6,
                }}
              >
                <span>
                  {c.category_name}
                  {!c.is_active && <span style={{ marginLeft: 6, opacity: 0.7, fontWeight: 400 }}>(inactive)</span>}
                  <div style={{ fontSize: '0.65rem', fontWeight: 400, opacity: 0.75, marginTop: 2 }}>{subCountFor(c.category_id)} subcategory(ies)</div>
                </span>
                <span onClick={(e) => { e.stopPropagation(); openEditCategory(c) }} style={{ opacity: 0.85, display: 'flex' }}><IconEdit /></span>
              </button>
            ))}
            {categories.length === 0 && <div style={{ color: '#aaa', fontSize: '0.8rem', padding: '0.5rem 0' }}>No categories yet.</div>}
          </div>
        </div>

        {/* Subcategories for selected category */}
        <div style={{ flex: 1, minWidth: 320 }}>
          {selectedCategory ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <h2 style={{ color: '#7A1828', fontSize: '1rem', fontWeight: 700 }}>{selectedCategory.category_name}</h2>
                  {selectedCategory.description && <div style={{ color: '#777', fontSize: '0.75rem', marginTop: 2 }}>{selectedCategory.description}</div>}
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <button onClick={() => deleteCategory(selectedCategory)} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '0.75rem' }}>Delete Category</button>
                  <button onClick={openAddSub} className="pf-link-btn" style={{ color: '#7A1828' }}>
                    <IconPlus />Add Subcategory
                  </button>
                </div>
              </div>

              <input type="text" placeholder="Search subcategory…" value={subSearch} onChange={e => { setSubSearch(e.target.value); setPage(1) }}
                style={{ width: '100%', background: '#FDF5EC', border: '1.5px solid #d0d0d0', borderRadius: 8, padding: '0.5rem 0.75rem', color: '#1a1a1a', fontSize: '0.8rem', outline: 'none', marginBottom: 10 }} />

              {pageSubs.length === 0 ? (
                <div style={{ color: '#aaa', fontSize: '0.85rem', padding: '1.5rem 0', textAlign: 'center' }}>No subcategories yet in this category.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {pageSubs.map(s => (
                    <div key={s.subcategory_id} style={{ background: '#FDF5EC', border: '1px solid #EDE0CC', borderRadius: 8, padding: '0.6rem 0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: '#1a1a1a', fontWeight: 600, fontSize: '0.85rem' }}>
                          {s.subcategory_name}
                          {!s.active && <span style={{ marginLeft: 6, color: '#999', fontWeight: 400, fontSize: '0.7rem' }}>(inactive)</span>}
                        </div>
                        <div style={{ color: '#777', fontSize: '0.72rem', marginTop: 1 }}>
                          {s.subcategory_id} · {PRICING_MODELS.find(p => p.value === s.pricing_model)?.label.split(' — ')[0] || s.pricing_model} · {formatPeso(s.base_price || 0)}{s.unit ? ` / ${s.unit}` : ''}
                        </div>
                      </div>
                      <button onClick={() => openEditSub(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A1828', padding: 2 }}><IconEdit /></button>
                      <button onClick={() => deleteSub(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c', padding: 2, fontSize: '0.9rem' }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
              <Pagination page={currentPage} totalItems={filteredSubs.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
            </>
          ) : (
            <div style={{ color: '#aaa', textAlign: 'center', marginTop: '2rem' }}>Select or add a category on the left.</div>
          )}
        </div>
      </div>

      {/* Add/Edit Category modal */}
      {showCatForm && (
        <div className="pf-modal-overlay" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="pf-modal-card pf-modal-wine" style={{ maxWidth: 400 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1.5rem' }}>{editingCat ? 'Edit Category' : 'Add Category'}</h3>
              <button onClick={() => setShowCatForm(false)} style={{ background: 'none', border: 'none', color: '#E8B9C6', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>
            <div className="pf-field">
              <label className="pf-label">Category Name <span className="pf-req">*</span></label>
              <input type="text" value={catName} onChange={e => { setCatName(e.target.value); if (!editingCat) setCatId(generateCategoryId(e.target.value)) }} className="pf-input" />
            </div>
            <div className="pf-field">
              <label className="pf-label">Category ID {editingCat && <span style={{ color: '#999', fontWeight: 400 }}>(locked)</span>}</label>
              <input type="text" value={catId} disabled={!!editingCat} onChange={e => setCatId(e.target.value.toUpperCase())} placeholder="Auto-suggested from name" className="pf-input" style={{ opacity: editingCat ? 0.6 : 1 }} />
            </div>
            <div className="pf-field">
              <label className="pf-label">Description</label>
              <textarea value={catDesc} onChange={e => setCatDesc(e.target.value)} rows={2} className="pf-textarea" />
            </div>
            <div className="pf-field" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="checkbox" id="catActive" checked={catActive} onChange={e => setCatActive(e.target.checked)} style={{ accentColor: '#C9A84C', width: 16, height: 16 }} />
              <label htmlFor="catActive" className="pf-label" style={{ marginBottom: 0, cursor: 'pointer' }}>Active</label>
            </div>
            {catError && <div style={{ color: '#e74c3c', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{catError}</div>}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowCatForm(false)} className="pf-btn pf-btn-secondary"><IconX />Cancel</button>
              <button onClick={saveCategory} disabled={catSaving} className="pf-btn"><IconCheck />{catSaving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Subcategory modal */}
      {showSubForm && (
        <div className="pf-modal-overlay" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="pf-modal-card pf-modal-wine" style={{ maxWidth: 440 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1.5rem' }}>{editingSub ? 'Edit Subcategory' : 'Add Subcategory'}</h3>
              <button onClick={() => setShowSubForm(false)} style={{ background: 'none', border: 'none', color: '#E8B9C6', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>
            <div className="pf-field">
              <label className="pf-label">Subcategory Name <span className="pf-req">*</span></label>
              <input type="text" value={subName} onChange={e => { setSubName(e.target.value); if (!editingSub) setSubId(generateSubcategoryId(selectedCategoryId, e.target.value)) }} className="pf-input" />
            </div>
            <div className="pf-field">
              <label className="pf-label">Subcategory ID {editingSub && <span style={{ color: '#999', fontWeight: 400 }}>(locked)</span>}</label>
              <input type="text" value={subId} disabled={!!editingSub} onChange={e => setSubId(e.target.value.toUpperCase())} placeholder="Auto-suggested from name" className="pf-input" style={{ opacity: editingSub ? 0.6 : 1 }} />
            </div>
            <div className="pf-field">
              <label className="pf-label">Type</label>
              <input type="text" value={subType} onChange={e => setSubType(e.target.value)} placeholder="e.g. Car Plate" className="pf-input" />
            </div>
            <div className="pf-field">
              <label className="pf-label">Description</label>
              <textarea value={subDesc} onChange={e => setSubDesc(e.target.value)} rows={2} className="pf-textarea" />
            </div>
            <div className="pf-field">
              <label className="pf-label">Pricing Model <span className="pf-req">*</span></label>
              <select value={subPricingModel} onChange={e => setSubPricingModel(e.target.value)} className="pf-select">
                {PRICING_MODELS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div className="pf-grid-2" style={{ marginBottom: '0.85rem' }}>
              <div>
                <label className="pf-label">Base Price</label>
                <input type="number" value={subBasePrice} onChange={e => setSubBasePrice(e.target.value)} placeholder="0.00" className="pf-input" />
              </div>
              <div>
                <label className="pf-label">Unit</label>
                <input type="text" value={subUnit} onChange={e => setSubUnit(e.target.value)} placeholder="e.g. piece, sqft" className="pf-input" />
              </div>
            </div>
            <div className="pf-field" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="checkbox" id="subActive" checked={subActive} onChange={e => setSubActive(e.target.checked)} style={{ accentColor: '#C9A84C', width: 16, height: 16 }} />
              <label htmlFor="subActive" className="pf-label" style={{ marginBottom: 0, cursor: 'pointer' }}
                title="Only Active subcategories show up when staff add a Job Order item">Active</label>
            </div>
            {subError && <div style={{ color: '#e74c3c', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{subError}</div>}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowSubForm(false)} className="pf-btn pf-btn-secondary"><IconX />Cancel</button>
              <button onClick={saveSub} disabled={subSaving} className="pf-btn"><IconCheck />{subSaving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
