import type { CSSProperties } from 'react'

// ─── Design tokens ───────────────────────────────────────────────
export const COLOR = {
  primary:     '#7A1828',
  gold:        '#C9A84C',
  cream:       '#FDF5EC',
  cardBorder:  '#EDE0CC',
  heading:     '#7A1828',
  subtext:     '#777',
  label:       '#999',
  bodyText:    '#1a1a1a',
  muted:       '#aaa',
  success:     '#2ecc71',
  danger:      '#e74c3c',
  darkBlock:   '#3a3a3a',
  darkBorder:  '#555',
  inputBg:     '#FDF5EC',
  inputBorder: '#d0d0d0',
}

// ─── Page-level styles ───────────────────────────────────────────
export const pageHeading: CSSProperties = {
  color: COLOR.heading,
  fontSize: '1.4rem',
  fontWeight: 700,
}

export const pageSubtitle: CSSProperties = {
  color: COLOR.subtext,
  fontSize: '0.8rem',
  marginTop: 2,
}

// ─── Card styles ─────────────────────────────────────────────────
export const card: CSSProperties = {
  background: COLOR.cream,
  borderRadius: 10,
  padding: '0.85rem 1rem',
  border: `1px solid ${COLOR.cardBorder}`,
}

export const modalCard: CSSProperties = {
  background: COLOR.cream,
  borderRadius: 14,
  padding: '1.5rem',
}

export const darkBlock: CSSProperties = {
  background: COLOR.darkBlock,
  borderRadius: 8,
  border: `1px solid ${COLOR.darkBorder}`,
  padding: '0.65rem 0.85rem',
}

// ─── Form styles ─────────────────────────────────────────────────
export const fieldLabel: CSSProperties = {
  display: 'block',
  color: COLOR.label,
  fontSize: '0.75rem',
  fontWeight: 600,
  marginBottom: '0.3rem',
}

export const inputStyle: CSSProperties = {
  width: '100%',
  background: COLOR.inputBg,
  border: `1.5px solid ${COLOR.inputBorder}`,
  borderRadius: 7,
  padding: '0.55rem 0.75rem',
  color: COLOR.bodyText,
  fontSize: '0.85rem',
  boxSizing: 'border-box',
  outline: 'none',
}

// ─── Button styles ───────────────────────────────────────────────
export const btnPrimary: CSSProperties = {
  background: COLOR.primary,
  color: '#fff',
  border: `2px solid ${COLOR.gold}`,
  borderRadius: 999,
  padding: '0.65rem 1.25rem',
  fontWeight: 700,
  fontSize: '0.85rem',
  cursor: 'pointer',
}

export const btnSecondary: CSSProperties = {
  background: '#f0f0f0',
  color: COLOR.bodyText,
  border: 'none',
  borderRadius: 8,
  padding: '0.65rem 1.25rem',
  fontWeight: 600,
  fontSize: '0.85rem',
  cursor: 'pointer',
}
