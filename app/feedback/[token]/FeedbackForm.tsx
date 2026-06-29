'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useParams, useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const SERVICES = [
  'Banners & Tarpaulin',
  'Business & Marketing Collaterals',
  'Custom Acrylic Products',
  'Custom Merchandise',
  'Desktop Publishing',
  'Display Ads',
  'Lighted Signages',
  'Non-Lighted Signages',
  'Stickers',
  'Materials for Advertising',
  'Production Services',
]

const BEST_AREAS = ['Product Quality', 'Fast Service', 'Professional Staff', 'Installation Work', 'Communication', 'Pricing']
const IMPROVE_AREAS = ['Response Time', 'Production Time', 'Installation', 'Communication', 'Quality Control', 'Pricing']

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  )
}

const BG: React.CSSProperties = {
  minHeight: '100vh',
  backgroundImage: 'url(/backgroundpenfix.png)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
  fontFamily: 'sans-serif',
}

const CARD: React.CSSProperties = {
  background: 'rgba(255,255,255,0.92)',
  backdropFilter: 'blur(6px)',
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
  maxWidth: 540,
  margin: '0 auto',
  padding: '2rem 1.75rem 2.5rem',
}

export default function FeedbackForm() {
  const params = useParams()
  const searchParams = useSearchParams()
  const token = params.token as string
  const jo = searchParams.get('jo') ?? ''
  const name = searchParams.get('name') ?? ''

  const [service, setService] = useState('')
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [bestAreas, setBestAreas] = useState<string[]>([])
  const [improveAreas, setImproveAreas] = useState<string[]>([])
  const [comments, setComments] = useState('')
  const [recommend, setRecommend] = useState('')
  const [testimonialConsent, setTestimonialConsent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  function toggleChip(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter(v => v !== value) : [...list, value])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!rating) { setError('Please select a star rating.'); return }
    setError('')
    setSubmitting(true)
    try {
      const supabase = getSupabase()
      const { error: dbError } = await supabase.from('client_feedback').insert({
        token, jo, client_name: name, service, rating,
        best_areas: bestAreas, improve_areas: improveAreas,
        comments, recommend, testimonial_consent: testimonialConsent,
      })
      if (dbError) { setError(dbError.message); return }
      setSubmitted(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div style={{ ...BG, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ ...CARD, textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ background: '#7B1C1C', borderRadius: '50%', width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#F5C842" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h1 style={{ color: '#7B1C1C', fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>Thank you, {name}!</h1>
          <p style={{ color: '#555', fontSize: '1rem', maxWidth: 340, margin: '0 auto' }}>Your feedback means a lot to us. We&apos;ll keep improving to serve you better.</p>
          <Image src="/penfixtwhhite.png" alt="Penfix" width={120} height={60} style={{ objectFit: 'contain', marginTop: '2rem', filter: 'invert(1) sepia(1) saturate(3) hue-rotate(340deg)', opacity: 0.85 }} />
        </div>
      </div>
    )
  }

  return (
    <div style={BG}>
      {/* Header */}
      <div style={{ background: 'rgba(123,28,28,0.92)', backdropFilter: 'blur(4px)', padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Image src="/penfixtwhhite.png" alt="Penfix" width={120} height={48} style={{ objectFit: 'contain' }} priority />
        <div style={{ width: '1px', height: 36, background: 'rgba(255,255,255,0.3)' }} />
        <span style={{ color: '#fff', fontSize: '16px', fontWeight: 400 }}>Client Feedback</span>
      </div>

      <div style={{ padding: '2rem 1.25rem 3rem' }}>
        <form onSubmit={handleSubmit} style={CARD}>
          <h2 style={{ color: '#7B1C1C', fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.25rem' }}>How did we do?</h2>
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.75rem' }}>We&apos;d love your honest feedback on your recent order.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <Field label="Job Order #"><input readOnly value={jo} style={inputStyle} /></Field>
            <Field label="Client Name"><input readOnly value={name} style={inputStyle} /></Field>
          </div>

          <Field label="Service Availed" style={{ marginBottom: '1.5rem' }}>
            <select required value={service} onChange={e => setService(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="">Select a service…</option>
              {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Overall Rating <span style={{ color: '#c00' }}>*</span></label>
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem' }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)} onClick={() => setRating(n)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }} aria-label={`${n} star`}>
                  <svg width="38" height="38" viewBox="0 0 24 24" fill={(hovered || rating) >= n ? '#F5C842' : '#ddd'} stroke={(hovered || rating) >= n ? '#e6a800' : '#ccc'} strokeWidth="1.2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </button>
              ))}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.25rem' }}>
              {rating === 1 ? 'Poor' : rating === 2 ? 'Fair' : rating === 3 ? 'Good' : rating === 4 ? 'Very Good' : rating === 5 ? 'Excellent!' : ''}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>What did we do best? <span style={{ color: '#aaa', fontWeight: 400 }}>(optional)</span></label>
            <ChipGroup options={BEST_AREAS} selected={bestAreas} onToggle={v => toggleChip(bestAreas, setBestAreas, v)} color="#7B1C1C" />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>What can we improve? <span style={{ color: '#aaa', fontWeight: 400 }}>(optional)</span></label>
            <ChipGroup options={IMPROVE_AREAS} selected={improveAreas} onToggle={v => toggleChip(improveAreas, setImproveAreas, v)} color="#c05a00" />
          </div>

          <Field label="Additional Comments" style={{ marginBottom: '1.5rem' }}>
            <textarea value={comments} onChange={e => setComments(e.target.value)} rows={4} placeholder="Tell us more about your experience…" style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} />
          </Field>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Would you recommend Penfix to others?</label>
            <RadioGroup options={['Yes!', 'Maybe', 'No']} value={recommend} onChange={setRecommend} name="recommend" />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={labelStyle}>May we use your feedback as a testimonial?</label>
            <RadioGroup options={['Sure!', 'No thanks']} value={testimonialConsent} onChange={setTestimonialConsent} name="testimonial" />
          </div>

          {error && <p style={{ color: '#c00', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>}

          <button type="submit" disabled={submitting} style={{ width: '100%', background: submitting ? '#b26060' : '#7B1C1C', color: '#fff', border: 'none', borderRadius: 8, padding: '0.85rem', fontSize: '1rem', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', letterSpacing: 0.5 }}>
            {submitting ? 'Submitting…' : 'Submit Feedback'}
          </button>
        </form>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = { display: 'block', fontWeight: 600, fontSize: '0.875rem', color: '#444', marginBottom: '0.4rem' }

const inputStyle: React.CSSProperties = { width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid #ddd', borderRadius: 7, fontSize: '0.9rem', background: '#fff', color: '#333', boxSizing: 'border-box' }

function Field({ label, children, style }: { label: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={style}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  )
}

function ChipGroup({ options, selected, onToggle, color }: { options: string[]; selected: string[]; onToggle: (v: string) => void; color: string }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.4rem' }}>
      {options.map(opt => {
        const active = selected.includes(opt)
        return (
          <button key={opt} type="button" onClick={() => onToggle(opt)} style={{ padding: '0.35rem 0.85rem', borderRadius: 20, border: `1.5px solid ${active ? color : '#ccc'}`, background: active ? color : '#fff', color: active ? '#fff' : '#555', fontSize: '0.8rem', fontWeight: active ? 600 : 400, cursor: 'pointer' }}>
            {opt}
          </button>
        )
      })}
    </div>
  )
}

function RadioGroup({ options, value, onChange, name }: { options: string[]; value: string; onChange: (v: string) => void; name: string }) {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
      {options.map(opt => {
        const active = value === opt
        return (
          <label key={opt} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0.4rem 0.9rem', borderRadius: 20, border: `1.5px solid ${active ? '#7B1C1C' : '#ccc'}`, background: active ? '#7B1C1C' : '#fff', color: active ? '#fff' : '#555', fontSize: '0.875rem', fontWeight: active ? 600 : 400 }}>
            <input type="radio" name={name} value={opt} checked={active} onChange={() => onChange(opt)} style={{ display: 'none' }} />
            {opt}
          </label>
        )
      })}
    </div>
  )
}
