import { useState, useMemo, memo } from 'react'
import { BAR_CHART, COLORS } from '../../lib/constants'

const { BAR_H } = BAR_CHART

function CssBarInner({ data, barAlt = '#8A6A3A', activeDay, setActiveDay, activeTurno, onOpenModal }) {
  const [hov, setHov] = useState(null)
  const maxV = useMemo(() => Math.max(...data.map(d => Math.max(d.a, d.j, 1))), [data])
  const hasFilt = !!activeDay

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', height: BAR_H + 52, width: '100%' }}>
      {data.map((d, i) => {
        const aH = Math.round((d.a / maxV) * BAR_H)
        const jH = Math.round((d.j / maxV) * BAR_H)
        const isAct = activeDay === d.d
        const isDim = hasFilt && !isAct
        const isHov = hov === i
        const dimA = activeTurno === 'j'
        const dimJ = activeTurno === 'a'
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', cursor: 'pointer', opacity: isDim ? 0.25 : 1, transition: 'opacity 0.22s' }}
            role="button" aria-label={`${d.d}: Almoço/HH ${d.a}, Jantar ${d.j}`}
            onClick={() => setActiveDay(isAct ? null : d.d)}
            onDoubleClick={() => onOpenModal && onOpenModal(d.d)}
            onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}>
            <div style={{ height: 36, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', flexDirection: 'column', gap: 1, marginBottom: 4, opacity: (isHov || isAct) ? 1 : 0, transition: 'opacity 0.15s' }}>
              {d.a > 0 && !dimA && <div style={{ fontSize: 9, fontWeight: 700, color: barAlt, textAlign: 'center' }}>{d.a}</div>}
              {d.j > 0 && !dimJ && <div style={{ fontSize: 9, fontWeight: 700, color: COLORS.primary, textAlign: 'center' }}>{d.j}</div>}
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: BAR_H }}>
              <div style={{ width: 10, height: Math.max(aH, 2), background: barAlt, borderRadius: '4px 4px 0 0', transition: 'height .4s ease, opacity .3s', opacity: dimA ? 0.12 : 1, boxShadow: isAct && !dimA ? `0 0 10px ${barAlt}` : 'none' }} />
              <div style={{ width: 10, height: Math.max(jH, 2), background: COLORS.primary, borderRadius: '4px 4px 0 0', transition: 'height .4s ease, opacity .3s', opacity: dimJ ? 0.12 : 1, boxShadow: isAct && !dimJ ? `0 0 10px rgba(232,93,4,0.6)` : 'none' }} />
            </div>
            <div style={{ fontSize: 9, fontWeight: isAct ? 700 : 600, color: isAct ? COLORS.primary : 'var(--t2)', marginTop: 6, letterSpacing: '0.06em', textTransform: 'uppercase', textAlign: 'center', transition: 'color 0.2s' }}>
              {d.d}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export const CssBar = memo(CssBarInner)
