export default function PageSkeleton({ title }: { title?: string }) {
  return (
    <div style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
      {title && (
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ background: '#e0e0e0', borderRadius: 6, height: 28, width: 220, marginBottom: 8 }} />
          <div style={{ background: '#e8e8e8', borderRadius: 4, height: 14, width: 120 }} />
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: '1.25rem' }}>
        {[1,2,3].map(i => (
          <div key={i} style={{ background: '#EDE0CC', borderRadius: 10, height: 64 }} />
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{ background: '#EDE0CC', borderRadius: 10, height: 80 }} />
        ))}
      </div>
    </div>
  )
}
