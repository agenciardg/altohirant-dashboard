import { memo } from 'react'

function TipoBadgeInner({ tipo }) {
  const map = { Reservas: 'br', Programacao: 'bprog', Cardapio: 'bc', Localizacao: 'bl', Aniversario: 'baniv', Reclamacao: 'brecl', Geral: 'bger' }
  return <span className={`b ${map[tipo] || 'bo'}`}>{tipo}</span>
}

function StBadgeInner({ st }) {
  if (st == null) return <span style={{
    fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
    padding: '3px 9px', borderRadius: 20, whiteSpace: 'nowrap',
    background: 'rgba(150, 150, 150, 0.08)', color: '#6b6560',
  }}>— Sem feedback</span>
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

function TurnoBadgeInner({ turno }) {
  const styles = {
    'Almoco':      { bg: 'rgba(232, 160, 32, 0.15)', color: '#e8a020' },
    'Happy Hour':  { bg: 'rgba(138, 106, 58, 0.18)', color: '#8A6A3A' },
    'Jantar':      { bg: 'rgba(232, 93, 4, 0.15)', color: '#E85D04' },
    'Fora Horário':{ bg: 'rgba(239, 68, 68, 0.13)', color: '#EF4444' },
  }
  const s = styles[turno] || styles.Jantar
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
      {turno}
    </span>
  )
}

export const TipoBadge = memo(TipoBadgeInner)
export const StBadge = memo(StBadgeInner)
export const TurnoBadge = memo(TurnoBadgeInner)
