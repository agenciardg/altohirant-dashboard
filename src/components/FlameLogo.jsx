import { memo } from 'react'

function FlameLogoInner({ size = 46 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="fg" x1="24" y1="40" x2="24" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#DC2626" />
          <stop offset="48%" stopColor="#E85D04" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="22.5" stroke="var(--t1)" strokeWidth="1.5" fill="none" />
      <path d="M24 39 C17 35 13 28 15.5 21 C17 16 20 12.5 24 10 C24 10 21.5 17 25 20.5 C26.2 18.2 27.5 15.5 28.5 13.5 C31 18 32 23.5 29.5 28 C33 24.5 33 20 31.5 17 C35 21.5 36 28 32.5 32 C30 36 27 39 24 39Z" fill="url(#fg)" />
      <path d="M24 35 C21 32 20 28 22 23.5 C23.2 26.5 25 28 25 31 C27 28.5 27 25.5 26 23 C28 25.5 29 29 27 32.5 C26 34.5 25 35.5 24 35Z" fill="rgba(255,255,255,0.28)" />
    </svg>
  )
}

export const FlameLogo = memo(FlameLogoInner)
