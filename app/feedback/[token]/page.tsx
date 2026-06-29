'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams, useSearchParams } from 'next/navigation'

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

const BEST_AREAS = ['Quality', 'Speed', 'Price', 'Communication', 'Design', 'Packaging', 'Customer Service']
const IMPROVE_AREAS = ['Quality', 'Speed', 'Price', 'Communication', 'Design', 'Packaging', 'Customer Service']

export default function FeedbackPage() {
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
    const { error: dbError } = await supabase.from('client_feedback').insert({
      token,
      jo,
      client_name: name,
      service,
      rating,
      best_areas: bestAreas,
      improve_areas: improveAreas,
      comments,
      recommend,
      testimonial_consent: testimonialConsent,
    })
    setSubmitting(false)
    if (dbError) { setError(dbError.message); return }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#fdf8ee', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'sans-serif' }}>
        <div style={{ background: '#7B1C1C', borderRadius: '50%', width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#F5C842" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h1 style={{ color: '#7B1C1C', fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', textAlign: 'center' }}>Thank you, {name}!</h1>
        <p style={{ color: '#555', fontSize: '1rem', textAlign: 'center', maxWidth: 380 }}>Your feedback means a lot to us. We'll keep improving to serve you better.</p>
        <div style={{ marginTop: '2rem', color: '#F5C842', fontWeight: 700, fontSize: '1.1rem', letterSpacing: 1 }}>PENFIX</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fdf8ee', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#7B1C1C', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ color: '#F5C842', fontWeight: 800, fontSize: '1.3rem', letterSpacing: 1 }}>PENFIX</span>
        <span style={{ color: '#fff', opacity: 0.7, fontSize: '0.9rem' }}>Client Feedback</span>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: 520, margin: '0 auto', padding: '2rem 1.25rem 3rem' }}>
        <h2 style={{ color: '#7B1C1C', fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.25rem' }}>How did we do?</h2>
        <p style={{ color: '#777', fontSize: '0.9rem', marginBottom: '1.75rem' }}>We'd love your honest feedback on your recent order.</p>

        {/* Read-only fields */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <Field label="Job Order #">
            <input readOnly value={jo} style={inputStyle} />
          </Field>
          <Field label="Client Name">
            <input readOnly value={name} style={inputStyle} />
          </Field>
        </div>

        {/* Service */}
        <Field label="Service Availed" style={{ marginBottom: '1.5rem' }}>
          <select required value={service} onChange={e => setService(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="">Select a service…</option>
            {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>

        {/* Star Rating */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>Overall Rating <span style={{ color: '#c00' }}>*</span></label>
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem' }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                type="button"
                onMouseEnter={() => setHovered(n)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(n)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                aria-label={`${n} star`}
              >
                <svg width="36" height="36" viewBox="0 0 24 24" fill={(hovered || rating) >= n ? '#F5C842' : '#ddd'} stroke={(hovered || rating) >= n ? '#e6a800' : '#ccc'} strokeWidth="1.2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </button>
            ))}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.25rem' }}>
            {rating === 1 ? 'Poor' : rating === 2 ? 'Fair' : rating === 3 ? 'Good' : rating === 4 ? 'Very Good' : rating === 5 ? 'Excellent!' : ''}
          </div>
        </div>

        {/* Best Areas */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>What did we do best? <span style={{ color: '#aaa', fontWeight: 400 }}>(optional)</span></label>
          <ChipGroup options={BEST_AREAS} selected={bestAreas} onToggle={v => toggleChip(bestAreas, setBestAreas, v)} color="#7B1C1C" />
        </div>

        {/* Improve Areas */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>What can we improve? <span style={{ color: '#aaa', fontWeight: 400 }}>(optional)</span></label>
          <ChipGroup options={IMPROVE_AREAS} selected={improveAreas} onToggle={v => toggleChip(improveAreas, setImproveAreas, v)} color="#c05a00" />
        </div>

        {/* Comments */}
        <Field label="Additional Comments" style={{ marginBottom: '1.5rem' }}>
          <textarea
            value={comments}
            onChange={e => setComments(e.target.value)}
            rows={4}
            placeholder="Tell us more about your experience…"
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
          />
        </Field>

        {/* Recommend */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>Would you recommend Penfix to others?</label>
          <RadioGroup options={['Yes!', 'Maybe', 'No']} value={recommend} onChange={setRecommend} />
        </div>

        {/* Testimonial Consent */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={labelStyle}>May we use your feedback as a testimonial?</label>
          <RadioGroup options={['Sure!', 'No thanks']} value={testimonialConsent} onChange={setTestimonialConsent} />
        </div>

        {error && <p style={{ color: '#c00', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: '100%',
            background: submitting ? '#b26060' : '#7B1C1C',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '0.85rem',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: submitting ? 'not-allowed' : 'pointer',
            letterSpacing: 0.5,
            transition: 'background 0.2s',
          }}
        >
          {submitting ? 'Submitting…' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  )
}

const labelStyle: React.CSSProperties = { display: 'block', fontWeight: 600, fontSize: '0.875rem', color: '#333', marginBottom: '0.4rem' }

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.6rem 0.75rem',
  border: '1.5px solid #ddd',
  borderRadius: 7,
  fontSize: '0.9rem',
  background: '#fff',
  color: '#333',
  boxSizing: 'border-box',
  outline: 'none',
}

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
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: 20,
              border: `1.5px solid ${active ? color : '#ccc'}`,
              background: active ? color : '#fff',
              color: active ? '#fff' : '#555',
              fontSize: '0.8rem',
              fontWeight: active ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

function RadioGroup({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
      {options.map(opt => {
        const active = value === opt
        return (
          <label
            key={opt}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
              padding: '0.4rem 0.9rem',
              borderRadius: 20,
              border: `1.5px solid ${active ? '#7B1C1C' : '#ccc'}`,
              background: active ? '#7B1C1C' : '#fff',
              color: active ? '#fff' : '#555',
              fontSize: '0.875rem',
              fontWeight: active ? 600 : 400,
              transition: 'all 0.15s',
            }}
          >
            <input
              type="radio"
              name={`radio-${options.join('')}`}
              value={opt}
              checked={active}
              onChange={() => onChange(opt)}
              style={{ display: 'none' }}
            />
            {opt}
          </label>
        )
      })}
    </div>
  )
}
