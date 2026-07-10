import React from 'react'

/**
 * Small stroke icons for buttons. Sized by the parent (.pf-btn svg = 0.9rem);
 * inherit color via currentColor. Drop one inside a button before the label.
 */
const S = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p} />
)

export const IconPlus = () => <S><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></S>
export const IconCirclePlus = () => <S><circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></S>
export const IconCheck = () => <S><polyline points="20 6 9 17 4 12" /></S>
export const IconX = () => <S><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></S>
export const IconSave = () => <S><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></S>
export const IconEdit = (p: React.SVGProps<SVGSVGElement>) => <S {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></S>
export const IconKey = () => <S><path d="M21 2l-2 2m-3.5 3.5a5 5 0 1 0-7 7 5 5 0 0 0 7-7zm0 0L19 4l3 3-3.5 3.5" /></S>
export const IconLogin = () => <S><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></S>
export const IconSend = () => <S><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></S>
export const IconCard = () => <S><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></S>
export const IconUserPlus = () => <S><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></S>
export const IconMessage = (p: React.SVGProps<SVGSVGElement>) => <S {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></S>
export const IconStar = (p: React.SVGProps<SVGSVGElement>) => <S fill="currentColor" {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></S>
export const IconDownload = (p: React.SVGProps<SVGSVGElement>) => <S {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></S>
export const IconQrCode = (p: React.SVGProps<SVGSVGElement>) => <S {...p}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><line x1="14" y1="14" x2="14" y2="17" /><line x1="14" y1="21" x2="14" y2="21" /><line x1="17" y1="14" x2="21" y2="14" /><line x1="21" y1="17" x2="17" y2="17" /><line x1="17" y1="21" x2="21" y2="21" /></S>
