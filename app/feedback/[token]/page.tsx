import { Suspense } from 'react'
import FeedbackForm from './FeedbackForm'

export default function FeedbackPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#fdf8ee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', color: '#7B1C1C' }}>
        Loading…
      </div>
    }>
      <FeedbackForm />
    </Suspense>
  )
}
