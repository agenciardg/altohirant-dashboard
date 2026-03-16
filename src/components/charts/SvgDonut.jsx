import { useMemo, memo } from 'react'

const CX = 100, CY = 82, OUTER = 68, INNER = 55, GAP = (3 * Math.PI) / 180

function SvgDonutInner({ data, filterType, setFilterType, onOpenModal }) {
  const total = useMemo(() => data.reduce((s, d) => s + d.value, 0), [data])

  const segs = useMemo(() => {
    let angle = -Math.PI / 2
    return data.map(d => {
      const pct = d.value / total
      let arc = pct * 2 * Math.PI - GAP
      if (arc < 0.01) arc = 0.01
      const sa = angle + GAP / 2, ea = sa + arc
      const large = arc > Math.PI ? 1 : 0
      const px = (a, r) => CX + r * Math.cos(a)
      const py = (a, r) => CY + r * Math.sin(a)
      const path = `M ${px(sa, OUTER)} ${py(sa, OUTER)} A ${OUTER} ${OUTER} 0 ${large} 1 ${px(ea, OUTER)} ${py(ea, OUTER)} L ${px(ea, INNER)} ${py(ea, INNER)} A ${INNER} ${INNER} 0 ${large} 0 ${px(sa, INNER)} ${py(sa, INNER)} Z`
      angle += pct * 2 * Math.PI
      return { path, color: d.color, name: d.name }
    })
  }, [data, total])

  const hasFilt = !!filterType
  return (
    <svg width="100%" height="160" viewBox="0 0 200 160" style={{ display: 'block' }}>
      {segs.map((s, i) => {
        const isAct = filterType === s.name
        const isDim = hasFilt && !isAct
        return (
          <path key={i} d={s.path} fill={s.color}
            role="button" aria-label={`${s.name}`}
            stroke={isAct ? 'white' : 'none'} strokeWidth={isAct ? 2.5 : 0}
            style={{ opacity: isDim ? 0.25 : 1, cursor: 'pointer', transition: 'opacity 0.22s', filter: isAct ? 'drop-shadow(0 0 5px rgba(0,0,0,0.4))' : 'none' }}
            onClick={() => { setFilterType(isAct ? null : s.name); if (onOpenModal) onOpenModal(s.name) }}
          />
        )
      })}
      <text x={CX} y={CY - 8} textAnchor="middle" fontSize="20"
        fontFamily="Playfair Display,serif" fontWeight="900" style={{ fill: 'var(--t1)', pointerEvents: 'none' }}>
        {filterType ? (data.find(d => d.name === filterType) || { value: 0 }).value : total}
      </text>
      <text x={CX} y={CY + 9} textAnchor="middle" fontSize="8"
        fontWeight="600" letterSpacing="2" style={{ fill: 'var(--t2)', pointerEvents: 'none', textTransform: 'uppercase' }}>
        {filterType || 'TOTAL'}
      </text>
    </svg>
  )
}

export const SvgDonut = memo(SvgDonutInner)
