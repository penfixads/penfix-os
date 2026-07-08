'use client'

interface Props {
  page: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
}

export default function Pagination({ page, totalItems, pageSize, onPageChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const currentPage = Math.min(Math.max(1, page), totalPages)
  if (totalItems === 0) return null

  const from = (currentPage - 1) * pageSize + 1
  const to = Math.min(currentPage * pageSize, totalItems)

  const btnStyle = (disabled: boolean): React.CSSProperties => ({
    background: disabled ? '#f5f5f5' : '#FDF5EC',
    border: '1.5px solid #d0d0d0',
    color: disabled ? '#bbb' : '#7A1828',
    borderRadius: 8,
    padding: '0.4rem 0.75rem',
    fontSize: '0.78rem',
    fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer',
  })

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginTop: '1rem' }}>
      <span style={{ color: '#999', fontSize: '0.75rem' }}>
        Showing {from}–{to} of {totalItems}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)} style={btnStyle(currentPage <= 1)}>
          ‹ Prev
        </button>
        <span style={{ color: '#666', fontSize: '0.78rem', padding: '0 0.4rem' }}>
          Page {currentPage} of {totalPages}
        </span>
        <button disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)} style={btnStyle(currentPage >= totalPages)}>
          Next ›
        </button>
      </div>
    </div>
  )
}
