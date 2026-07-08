'use client'

import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { IconPlus, IconEdit, IconCheck, IconX } from '@/components/icons'
import Pagination from '@/components/Pagination'

const PAGE_SIZE = 10

interface Props {
  subcategories: any[]
  categories: any[]
  sopSteps: any[]
  procedures: any[]
}

export default function SubcategorySopsClient({ subcategories, categories, sopSteps: initialSteps, procedures: initialProcedures }: Props) {
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
  const [stepError, setStepError] = useState('')

  const [procedures, setProcedures] = useState(initialProcedures)
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const filteredSubs = subcategories.filter(s => {
    const q = search.toLowerCase()
    const matchSearch = !q || (s.subcategory_name || '').toLowerCase().includes(q)
    const matchCategory = categoryFilter === 'all' || s.category_id === categoryFilter
    return matchSearch && matchCategory
  })

  const currentPage = Math.min(page, Math.max(1, Math.ceil(filteredSubs.length / PAGE_SIZE)))
  const pageSubs = filteredSubs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const selectedSub = subcategories.find(s => s.subcategory_id === selectedSubId)
  const stepsForSub = sopSteps.filter(s => s.subcategory_id === selectedSubId).sort((a, b) => a.sequence - b.sequence)

  function subStepCount(subId: string) {
    return sopSteps.filter(s => s.subcategory_id === subId).length
  }

  function openAddStep() {
    setEditingStep(null)
    setStepName(''); setStepDesc(''); setStepTerminal(false); setStepVisible(false); setStepProductionStart(false)
    setStepError('')
    setShowStepForm(true)
  }

  function openEditStep(step: any) {
    setEditingStep(step)
    setStepName(step.status_name || '')
    setStepDesc(step.description || '')
    setStepTerminal(!!step.is_terminal)
    setStepVisible(!!step.visible_to_client)
    setStepProductionStart(!!step.is_production_start)
    setStepError('')
    setShowStepForm(true)
  }

  async function saveStep() {
    if (!stepName.trim()) { setStepError('Please enter a status name.'); return }
    if (!selectedSubId) { setStepError('Please select a subcategory first.'); return }
    setSaving(true)
    setStepError('')
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
    } catch (e: any) {
      setStepError(e.message || 'Failed to save step.')
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

  function proceduresForStep(sopId: string) {
    return procedures.filter(p => p.sop_id === sopId).sort((a, b) => a.sequence - b.sequence)
  }

  async function addProcedure(sopId: string) {
    const stepProcedures = proceduresForStep(sopId)
    const nextSeq = (stepProcedures[stepProcedures.length - 1]?.sequence || 0) + 1
    const procedureId = `${sopId}-PROC-${nextSeq}`
    const supabase = createSupabaseBrowserClient()
    const { data, error } = await supabase.from('subcategory_sop_procedures').insert({
      procedure_id: procedureId, sop_id: sopId, sequence: nextSeq, instruction: '', is_active: true,
    }).select().single()
    if (error) return
    setProcedures(prev => [...prev, data])
  }

  async function saveProcedureText(procedureId: string, instruction: string) {
    const supabase = createSupabaseBrowserClient()
    await supabase.from('subcategory_sop_procedures').update({ instruction }).eq('procedure_id', procedureId)
    setProcedures(prev => prev.map(p => p.procedure_id === procedureId ? { ...p, instruction } : p))
  }

  async function deleteProcedure(procedureId: string) {
    const supabase = createSupabaseBrowserClient()
    await supabase.from('subcategory_sop_procedures').delete().eq('procedure_id', procedureId)
    setProcedures(prev => prev.filter(p => p.procedure_id !== procedureId))
  }

  async function moveProcedure(procedure: any, direction: -1 | 1) {
    const stepProcedures = proceduresForStep(procedure.sop_id)
    const idx = stepProcedures.findIndex(p => p.procedure_id === procedure.procedure_id)
    const swapWith = stepProcedures[idx + direction]
    if (!swapWith) return
    const supabase = createSupabaseBrowserClient()
    await Promise.all([
      supabase.from('subcategory_sop_procedures').update({ sequence: swapWith.sequence }).eq('procedure_id', procedure.procedure_id),
      supabase.from('subcategory_sop_procedures').update({ sequence: procedure.sequence }).eq('procedure_id', swapWith.procedure_id),
    ])
    setProcedures(prev => prev.map(p => {
      if (p.procedure_id === procedure.procedure_id) return { ...p, sequence: swapWith.sequence }
      if (p.procedure_id === swapWith.procedure_id) return { ...p, sequence: procedure.sequence }
      return p
    }))
  }

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ color: '#7A1828', fontSize: '1.4rem', fontWeight: 700 }}>Job Flow</h1>
        <p style={{ color: '#777', fontSize: '0.8rem', marginTop: 2 }}>Each subcategory gets its own step-by-step production flow — even similar items (e.g. tarpaulin vs sticker printing) often need different steps. Expand a step to attach its own detailed SOP checklist.</p>
      </div>

      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
        {/* Subcategory list */}
        <div style={{ flex: '0 0 280px', minWidth: 240 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <input type="text" placeholder="Search subcategory…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              style={{ flex: 1, minWidth: 140, background: '#FDF5EC', border: '1.5px solid #d0d0d0', borderRadius: 8, padding: '0.45rem 0.65rem', color: '#1a1a1a', fontSize: '0.78rem', outline: 'none' }} />
          </div>
          <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1) }}
            style={{ width: '100%', background: '#FDF5EC', border: '1.5px solid #d0d0d0', borderRadius: 8, padding: '0.45rem 0.65rem', color: '#1a1a1a', fontSize: '0.78rem', outline: 'none', marginBottom: 8 }}>
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
          </select>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {pageSubs.map(s => {
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
          <Pagination page={currentPage} totalItems={filteredSubs.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
        </div>

        {/* SOP steps for selected subcategory */}
        <div style={{ flex: 1, minWidth: 280 }}>
          {selectedSub ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: 8 }}>
                <h2 style={{ color: '#7A1828', fontSize: '1rem', fontWeight: 700 }}>{selectedSub.subcategory_name}</h2>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={openAddStep} className="pf-link-btn" style={{ color: '#7A1828' }}>
                    <IconPlus />Add Step
                  </button>
                </div>
              </div>

              {stepsForSub.length === 0 ? (
                <div style={{ color: '#aaa', fontSize: '0.85rem', padding: '1.5rem 0', textAlign: 'center' }}>No SOP steps defined yet for this subcategory.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {stepsForSub.map((step, i) => {
                    const stepProcedures = proceduresForStep(step.sop_id)
                    const isExpanded = expandedStepId === step.sop_id
                    return (
                      <div key={step.sop_id} style={{ background: '#FDF5EC', border: '1px solid #EDE0CC', borderRadius: 8, overflow: 'hidden' }}>
                        <div style={{ padding: '0.6rem 0.85rem', display: 'flex', alignItems: 'center', gap: 8 }}>
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
                            <button onClick={() => setExpandedStepId(isExpanded ? null : step.sop_id)}
                              style={{ background: 'none', border: 'none', color: '#7A1828', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700, padding: 0, marginTop: 4 }}>
                              {isExpanded ? '▼' : '▶'} {stepProcedures.length} SOP item(s)
                            </button>
                          </div>
                          <button onClick={() => openEditStep(step)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A1828', padding: 2 }}><IconEdit /></button>
                          <button onClick={() => deleteStep(step.sop_id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c', padding: 2, fontSize: '0.9rem' }}>✕</button>
                        </div>

                        {isExpanded && (
                          <div style={{ borderTop: '1px dashed #EDE0CC', background: '#fff8ee', padding: '0.6rem 0.85rem 0.75rem 2.6rem' }}>
                            {stepProcedures.length === 0 && (
                              <div style={{ color: '#aaa', fontSize: '0.75rem', marginBottom: 6 }}>No SOP items yet for this step.</div>
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {stepProcedures.map((proc, pi) => (
                                <div key={proc.procedure_id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <button onClick={() => moveProcedure(proc, -1)} disabled={pi === 0}
                                      style={{ background: 'none', border: 'none', cursor: pi === 0 ? 'default' : 'pointer', color: pi === 0 ? '#ccc' : '#7A1828', padding: 0, fontSize: '0.65rem', lineHeight: 1 }}>▲</button>
                                    <button onClick={() => moveProcedure(proc, 1)} disabled={pi === stepProcedures.length - 1}
                                      style={{ background: 'none', border: 'none', cursor: pi === stepProcedures.length - 1 ? 'default' : 'pointer', color: pi === stepProcedures.length - 1 ? '#ccc' : '#7A1828', padding: 0, fontSize: '0.65rem', lineHeight: 1 }}>▼</button>
                                  </div>
                                  <input
                                    type="text"
                                    value={proc.instruction}
                                    onChange={e => setProcedures(prev => prev.map(p => p.procedure_id === proc.procedure_id ? { ...p, instruction: e.target.value } : p))}
                                    onBlur={e => saveProcedureText(proc.procedure_id, e.target.value)}
                                    placeholder="e.g. Confirm file resolution is at least 150dpi"
                                    style={{ flex: 1, background: '#fff', border: '1px solid #EDE0CC', borderRadius: 6, padding: '0.35rem 0.55rem', fontSize: '0.78rem', color: '#1a1a1a', outline: 'none' }}
                                  />
                                  <button onClick={() => deleteProcedure(proc.procedure_id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c', padding: 2, fontSize: '0.85rem' }}>✕</button>
                                </div>
                              ))}
                            </div>
                            <button onClick={() => addProcedure(step.sop_id)} className="pf-link-btn" style={{ color: '#7A1828', marginTop: 8, fontSize: '0.78rem' }}>
                              <IconPlus />Add SOP Item
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          ) : (
            <div style={{ color: '#aaa', textAlign: 'center', marginTop: '2rem' }}>Select a subcategory on the left.</div>
          )}
        </div>
      </div>

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
            {stepError && <div style={{ color: '#e74c3c', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{stepError}</div>}

            <div style={{ display: 'flex', gap: 8, justifyContent: editingStep ? 'space-between' : 'flex-end' }}>
              {editingStep && (
                <button onClick={() => { setShowStepForm(false); deleteStep(editingStep.sop_id) }} style={{ background: 'none', border: '1px solid #7A1828', color: '#e74c3c', borderRadius: 8, padding: '0.55rem 1rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                  Delete Step
                </button>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setShowStepForm(false)} className="pf-btn pf-btn-secondary"><IconX />Cancel</button>
                <button onClick={saveStep} disabled={saving} className="pf-btn"><IconCheck />{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
