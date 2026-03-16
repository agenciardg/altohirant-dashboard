import { memo } from 'react'

function TipoBadgeInner({ tipo }) {
  const map = { Reservas: 'br', Cardapio: 'bc', Localizacao: 'bl' }
  return <span className={`b ${map[tipo] || 'bo'}`}>{tipo}</span>
}

function StBadgeInner({ st }) {
  const map = { Positivo: ['bp', '↑'], Neutro: ['bn', '→'], Negativo: ['be', '↓'] }
  const info = map[st] || ['bo', '·']
  return <span className={`b ${info[0]}`}>{info[1]} {st}</span>
}

export const TipoBadge = memo(TipoBadgeInner)
export const StBadge = memo(StBadgeInner)
