import { memo } from 'react'

function AlertBarInner({ feedbackNegativo, aniversarios, foraHorario }) {
  const items = []

  if (feedbackNegativo > 0) {
    items.push(
      <span key="fb" style={{
        padding: '0.25rem 0.75rem',
        borderRadius: 999,
        fontSize: '0.8rem',
        fontWeight: 600,
        background: 'rgba(239, 68, 68, 0.15)',
        color: '#ef4444',
      }}>
        ⚠ {feedbackNegativo} feedback negativo
      </span>
    )
  }

  if (aniversarios > 0) {
    items.push(
      <span key="niver" style={{
        padding: '0.25rem 0.75rem',
        borderRadius: 999,
        fontSize: '0.8rem',
        fontWeight: 600,
        background: 'rgba(232, 160, 32, 0.15)',
        color: '#e8a020',
      }}>
        🎂 {aniversarios} aniversário hoje
      </span>
    )
  }

  if (foraHorario > 0) {
    items.push(
      <span key="fora" style={{
        padding: '0.25rem 0.75rem',
        borderRadius: 999,
        fontSize: '0.8rem',
        fontWeight: 600,
        background: 'rgba(150, 150, 150, 0.15)',
        color: '#9a9590',
      }}>
        🕐 {foraHorario} fora do horário
      </span>
    )
  }

  if (items.length === 0) return null

  return (
    <div style={{
      display: 'flex',
      gap: '0.75rem',
      padding: '0.5rem 1.5rem',
      background: 'rgba(232, 160, 32, 0.08)',
      borderBottom: '1px solid rgba(232, 160, 32, 0.15)',
      flexWrap: 'wrap',
      alignItems: 'center',
    }}>
      {items}
    </div>
  )
}

export const AlertBar = memo(AlertBarInner)
