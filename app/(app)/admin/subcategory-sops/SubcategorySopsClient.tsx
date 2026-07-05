'use client'

import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { IconPlus, IconEdit, IconCheck, IconX } from '@/components/icons'

interface Props {
  subcategories: any[]
  categories: any[]
  sopSteps: any[]
}

export default function SubcategorySopsClient({ subcategories, categories, sopSteps: initialSteps }: Props) {
  const [sopSteps, setSopSteps] = useState(initialSteps)
  const [selectedSubId, setSelectedSubId] = useState<string>('')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const [showStepForm, setShowStepForm] = useState(false)
  const [editingStep, setEditingStep] = useState<any | null>(null)
  const [stepName, setStepName] = useState('')
  const [stepDesc, setStepDesc] = useState('')
  const [stepTerminal, setStepTerminal] = useState(false)
  const [stepVisible, setStepVisible] = useState(false)
  const [stepProductionStart, setStepProductionStart] = useState(false)
  const [saving, setSaving] = useState(false)

  const [showCopyFrom, setShowCopyFrom] = useState(false)
  const [copySearch, setCopySearch] = useState('')

  const filteredSubs = subcategories.filter(s => {
    const q = search.toLowerCase()
    const matchSearch = !q || (s.subcategory_name || '').toLowerCase().includes(q)
    const matchCategory = categoryFilter === 'all' || s.category_id === categoryFilter
    return matchSearch && matchCategory
  })

  const selectedSub = subcategories.find(s => s.subcategory_id === selectedSubId)
  const stepsForSub = sopSteps.filter(s => s.subcategory_id === selectedSubId).sort((a, b) => a.sequence - b.sequence)

  function subStepCount(subId: string) {
    return sopSteps.filter(s => s.subcategory_id === subId).length
  }

  function openAddStep() {
    setEditingStep(null)
    setStepName(''); setStepDesc(''); setStepTerminal(false); setStepVisible(false); setStepProductionStart(false)
    setShowStepForm(true)
  }

  function openEditStep(step: any) {
    setEditingStep(step)
    setStepName(step.status_name || '')
    setStepDesc(step.description || '')
    setStepTerminal(!!step.is_terminal)
    setStepVisible(!!step.visible_to_client)
    setStepProductionStart(!!step.is_production_start)
    setShowStepForm(true)
  }

  async function saveStep() {
    if (!stepName.trim() || !selectedSubId) return
    setSaving(true)
    try {
      const supabase = createSupabaseBrowserClient()
      // Only one step per subcategory can be the production-start marker.
      if (stepProductionStart) {
        await supabase.from('subcategory_sop').update({ is_production_start: false }).eq('subcategory_id', selectedSubId)
      }
      if (editingStep) {
        const { data, error } = await supabase.from('subcategory_sop').update({
          status_name: stepName.trim(), description: stepDesc || null, is_terminal: stepTerminal,
          visible_to_client: stepVisible, is_production_start: stepProductionStart,
        }).eq('sop_id', editingStep.sop_id).select().single()
        if (error) throw error
        setSopSteps(prev => prev.map(s => {
          if (s.sop_id === editingStep.sop_id) return data
          if (stepProductionStart && s.subcategory_id === selectedSubId) return { ...s, is_production_start: false }
          return s
        }))
      } else {
        const nextSeq = (stepsForSub[stepsForSub.length - 1]?.sequence || 0) + 1
        const sopId = `${selectedSubId}-STEP-${nextSeq}`
        const { data, error } = await supabase.from('subcategory_sop').insert({
          sop_id: sopId, subcategory_id: selectedSubId, status_name: stepName.trim(),
          sequence: nextSeq, is_active: true, is_terminal: stepTerminal, visible_to_client: stepVisible,
          is_production_start: stepProductionStart, description: stepDesc || null,
        }).select().single()
        if (error) throw error
        setSopSteps(prev => [
          ...prev.map(s => stepProductionStart && s.subcategory_id === selectedSubId ? { ...s, is_production_start: false } : s),
          data,
        ])
      }
      setShowStepForm(false)
    } finally {
      setSaving(false)
    }
  }

  async function deleteStep(sopId: string) {
    if (!confirm('Delete this SOP step? Items currently at this status will keep it, but it will no longer show as an option.')) return
    const supabase = createSupabaseBrowserClient()
    await supabase.from('subcategory_sop').delete().eq('sop_id', sopId)
    setSopSteps(prev => prev.filter(s => s.sop_id !== sopId))
  }

  async function moveStep(step: any, direction: -1 | 1) {
    const idx = stepsForSub.findIndex(s => s.sop_id === step.sop_id)
    const swapWith = stepsForSub[idx + direction]
    if (!swapWith) return
    const supabase = createSupabaseBrowserClient()
    await Promise.all([
      supabase.from('subcategory_sop').update({ sequence: swapWith.sequence }).eq('sop_id', step.sop_id),
      supabase.from('subcategory_sop').update({ sequence: step.sequence }).eq('sop_id', swapWith.sop_id),
    ])
    setSopSteps(prev => prev.map(s => {
      if (s.sop_id === step.sop_id) return { ...s, sequence: swapWith.sequence }
      if (s.sop_id === swapWith.sop_id) return { ...s, sequence: step.sequence }
      return s
    }))
  }

  async function copyStepsFrom(sourceSubId: string) {
    if (!selectedSubId || sourceSubId === selectedSubId) return
    const sourceSteps = sopSteps.filter(s => s.subcategory_id === sourceSubId).sort((a, b) => a.sequence - b.sequence)
    if (sourceSteps.length === 0) return
    if (stepsForSub.length > 0 && !confirm(`This will add ${sourceSteps.length} step(s) after the existing ones on this subcategory. Continue?`)) return
    const supabase = createSupabaseBrowserClient()
    const startSeq = (stepsForSub[stepsForSub.length - 1]?.sequence || 0) + 1
    const inserts = sourceSteps.map((s, i) => ({
      sop_id: `${selectedSubId}-STEP-${startSeq + i}`,
      subcategory_id: selectedSubId,
      status_name: s.status_name,
      sequence: startSeq + i,
      is_active: true,
      is_terminal: s.is_terminal,
      visible_to_client: s.visible_to_client,
      is_production_start: s.is_production_start,
      description: s.description,
    }))
    const { data, error } = await supabase.from('subcategory_sop').insert(inserts).select()
    if (!error && data) setSopSteps(prev => [...prev, ...data])
    setShowCopyFrom(false)
  }

  const copyFromOptions = subcategories.filter(s =>
    s.subcategory_id !== selectedSubId &&
    subStepCount(s.subcategory_id) > 0 &&
    (!copySearch || (s.subcategory_name || '').toLowerCase().includes(copySearch.toLowerCase()))
  )

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ color: '#7A1828', fontSize: '1.4rem', fontWeight: 700 }}>Subcategory SOPs</h1>
        <p style={{ color: '#777', fontSize: '0.8rem', marginTop: 2 }}>Each subcategory gets its own step-by-step production flow — even similar items (e.g. tarpaulin vs sticker printing) often need different steps</p>
      </div>

      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
        {/* Subcategory list */}
        <div style={{ flex: '0 0 280px', minWidth: 240 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <input type="text" placeholder="Search subcategory…" value={search} onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: 140, background: '#FDF5EC', border: '1.5px solid #d0d0d0', borderRadius: 8, padding: '0.45rem 0.65rem', color: '#1a1a1a', fontSize: '0.78rem', outline: 'none' }} />
          </div>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            style={{ width: '100%', background: '#FDF5EC', border: '1.5px solid #d0d0d0', borderRadius: 8, padding: '0.45rem 0.65rem', color: '#1a1a1a', fontSize: '0.78rem', outline: 'none', marginBottom: 8 }}>
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
          </select>
          <div style={{ maxHeight: 520, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {filteredSubs.map(s => {
              const count = subStepCount(s.subcategory_id)
              return (
                <button
                  key={s.subcategory_id}
                  onClick={() => setSelectedSubId(s.subcategory_id)}
                  style={{
                    textAlign: 'left', background: s.subcategory_id === selectedSubId ? '#7A1828' : '#FDF5EC',
                    color: s.subcategory_id === selectedSubId ? '#fff' : '#1a1a1a',
                    border: '1px solid #EDE0CC', borderRadius: 8, padding: '0.5rem 0.65rem', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
                  }}
                >
                  {s.subcategory_name}
                  <div style={{ fontSize: '0.65rem', fontWeight: 400, opacity: 0.75, marginTop: 2 }}>
                    {count} step(s)
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* SOP steps for selected subcategory */}
        <div style={{ flex: 1, minWidth: 280 }}>
          {selectedSub ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: 8 }}>
                <h2 style={{ color: '#7A1828', fontSize: '1rem', fontWeight: 700 }}>{selectedSub.subcategory_name}</h2>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => setShowCopyFrom(true)} className="pf-link-btn" style={{ color: '#666', fontSize: '0.85rem' }}>
                    Copy steps from…
                  </button>
                  <button onClick={openAddStep} className="pf-link-btn" style={{ color: '#7A1828' }}>
                    <IconPlus />Add Step
                  </button>
                </div>
              </div>

              {stepsForSub.length === 0 ? (
                <div style={{ color: '#aaa', fontSize: '0.85rem', padding: '1.5rem 0', textAlign: 'center' }}>No SOP steps defined yet for this subcategory.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {stepsForSub.map((step, i) => (
                    <div key={step.sop_id} style={{ background: '#FDF5EC', border: '1px solid #EDE0CC', borderRadius: 8, padding: '0.6rem 0.85rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <button onClick={() => moveStep(step, -1)} disabled={i === 0} style={{ background: 'none', border: 'none', cursor: i === 0 ? 'default' : 'pointer', color: i === 0 ? '#ccc' : '#7A1828', padding: 0, lineHeight: 1 }}>▲</button>
                        <button onClick={() => moveStep(step, 1)} disabled={i === stepsForSub.length - 1} style={{ background: 'none', border: 'none', cursor: i === stepsForSub.length - 1 ? 'default' : 'pointer', color: i === stepsForSub.length - 1 ? '#ccc' : '#7A1828', padding: 0, lineHeight: 1 }}>▼</button>
                      </div>
                      <div style={{ color: '#999', fontSize: '0.7rem', minWidth: 20 }}>#{step.sequence}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: '#1a1a1a', fontWeight: 600, fontSize: '0.85rem' }}>
                          {step.status_name}
                          {step.is_production_start && <span style={{ marginLeft: 6, background: '#4a3a1a', color: '#f39c12', fontSize: '0.6rem', padding: '0.1rem 0.4rem', borderRadius: 10, fontWeight: 700 }}>FABRICATORS START HERE</span>}
                          {step.is_terminal && <span style={{ marginLeft: 6, background: '#1a4a1a', color: '#2ecc71', fontSize: '0.6rem', padding: '0.1rem 0.4rem', borderRadius: 10, fontWeight: 700 }}>TERMINAL</span>}
                          {step.visible_to_client && <span style={{ marginLeft: 6, background: '#1a2a4a', color: '#3498db', fontSize: '0.6rem', padding: '0.1rem 0.4rem', borderRadius: 10, fontWeight: 700 }}>VISIBLE TO CLIENT</span>}
                        </div>
                        {step.description && <div style={{ color: '#777', fontSize: '0.72rem', marginTop: 1 }}>{step.description}</div>}
                      </div>
                      <button onClick={() => openEditStep(step)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A1828', padding: 2 }}><IconEdit /></button>
                      <button onClick={() => deleteStep(step.sop_id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c', padding: 2, fontSize: '0.9rem' }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{ color: '#aaa', textAlign: 'center', marginTop: '2rem' }}>Select a subcategory on the left.</div>
          )}
        </div>
      </div>

      {/* Copy steps from another subcategory */}
      {showCopyFrom && (
        <div className="pf-modal-overlay" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="pf-modal-card pf-modal-wine" style={{ maxWidth: 420 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1.5rem' }}>Copy Steps From</h3>
              <button onClick={() => setShowCopyFrom(false)} style={{ background: 'none', border: 'none', color: '#E8B9C6', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>
            <div className="pf-field">
              <input type="text" placeholder="Search subcategory with existing steps…" value={copySearch} onChange={e => setCopySearch(e.target.value)} className="pf-input" />
            </div>
            <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {copyFromOptions.length === 0 ? (
                <div style={{ color: '#E8B9C6', fontSize: '0.82rem', textAlign: 'center', padding: '1rem 0' }}>No other subcategory has steps defined yet.</div>
              ) : copyFromOptions.map(s => (
                <button key={s.subcategory_id} onClick={() => copyStepsFrom(s.subcategory_id)}
                  style={{ textAlign: 'left', background: '#3a3a3a', border: '1px solid #4a4a4a', borderRadius: 8, padding: '0.5rem 0.75rem', color: '#fff', cursor: 'pointer', fontSize: '0.82rem' }}>
                  {s.subcategory_name}
                  <span style={{ color: '#999', fontSize: '0.7rem', marginLeft: 6 }}>({subStepCount(s.subcategory_id)} steps)</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add/edit SOP step modal */}
      {showStepForm && (
        <div className="pf-modal-overlay" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="pf-modal-card pf-modal-wine" style={{ maxWidth: 420 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1.5rem' }}>{editingStep ? 'Edit Step' : 'Add Step'}</h3>
              <button onClick={() => setShowStepForm(false)} style={{ background: 'none', border: 'none', color: '#E8B9C6', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>
            <div className="pf-field">
              <label className="pf-label">Status Name *</label>
              <input type="text" value={stepName} onChange={e => setStepName(e.target.value)} placeholder="e.g. For Layout, Drying / Curing" className="pf-input" />
            </div>
            <div className="pf-field">
              <label className="pf-label">Description</label>
              <textarea value={stepDesc} onChange={e => setStepDesc(e.target.value)} rows={2} className="pf-textarea" />
            </div>
            <div className="pf-field" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#E8B9C6', fontSize: '0.82rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={stepTerminal} onChange={e => setStepTerminal(e.target.checked)} style={{ accentColor: '#C9A84C', width: 15, height: 15 }} />
                Terminal (marks item complete)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#E8B9C6', fontSize: '0.82rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={stepVisible} onChange={e => setStepVisible(e.target.checked)} style={{ accentColor: '#C9A84C', width: 15, height: 15 }} />
                Visible to client (tracking page)
              </label>
            </div>
            <div className="pf-field">
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#E8B9C6', fontSize: '0.82rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={stepProductionStart} onChange={e => setStepProductionStart(e.target.checked)} style={{ accentColor: '#C9A84C', width: 15, height: 15 }} />
                Fabricators start seeing the item here
              </label>
              <div style={{ color: '#999', fontSize: '0.7rem', marginTop: 4 }}>
                Steps before this one (e.g. layout, client approval) stay GA-only. Only one step per subcategory can be marked.
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowStepForm(false)} className="pf-btn pf-btn-secondary"><IconX />Cancel</button>
              <button onClick={saveStep} disabled={saving} className="pf-btn"><IconCheck />{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
