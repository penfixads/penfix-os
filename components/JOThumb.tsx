// Shows the first item with a saved layout thumbnail (item_preview_thumb — the small,
// pre-compressed column used everywhere a list needs to show many images at once, see
// ProductionClient.tsx). Falls back to a plain image-placeholder glyph when none of a JO's
// items have one yet (older migrated records never got images backfilled).
export default function JOThumb({ items, size = 48 }: { items: any[]; size?: number }) {
  const thumb = (items || []).find((i: any) => i.item_preview_thumb)?.item_preview_thumb

  return (
    <div style={{
      width: size, height: size, borderRadius: 8, overflow: 'hidden', flexShrink: 0,
      background: '#EDE0CC', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {thumb ? (
        <img src={thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <svg width={size * 0.45} height={size * 0.45} viewBox="0 0 24 24" fill="none" stroke="#b89a6a" strokeWidth="1.6">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      )}
    </div>
  )
}
