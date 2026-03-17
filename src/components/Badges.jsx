import { memo } from 'react'

function TipoBadgeInner({ tipo }) {
  const map = { Reservas: 'br', Cardapio: 'bc', Localizacao: 'bl' }
  return <span className={`b ${map[tipo] || 'bo'}`}>{tipo}</span>
}

function StBadgeInner({ st }) {
  const styles = {
    Positivo: { bg: 'rgba(74, 222, 128, 0.15)', color: '#4ade80', icon: '↑' },
    Negativo: { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', icon: '↓' },
    Neutro:   { bg: 'rgba(150, 150, 150, 0.15)', color: '#9a9590', icon: '→' },
  }
  const s = styles[st] || styles.Neutro
  return (
    <span style={{
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '0.06em',
      padding: '3px 9px',
      borderRadius: 20,
      whiteSpace: 'nowrap',
      background: s.bg,
      color: s.color,
    }}>
      {s.icon} {st}
    </span>
  )
}

export const TipoBadge = memo(TipoBadgeInner)
export const StBadge = memo(StBadgeInner)
