import { useState, useMemo, memo } from 'react'
import { BAR_CHART, COLORS } from '../../lib/constants'

const { BAR_H } = BAR_CHART

function CssBarInner({ data, activeDay, setActiveDay, activeTurno, onOpenModal }) {
  const [hov, setHov] = useState(null)
  const maxV = useMemo(() => Math.max(...data.map(d => Math.max(d.al || 0, d.hh || 0, d.j || 0, d.f || 0, 1))), [data])
  const hasFilt = !!activeDay

  const cAl = COLORS.almoco
  const cHh = COLORS.happyHour
  const cJ = COLORS.jantar
  const cF = COLORS.fora

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', height: BAR_H + 56, width: '100%' }}>
      {data.map((d, i) => {
        const alH = Math.round(((d.al || 0) / maxV) * BAR_H)
        const hhH = Math.round(((d.hh || 0) / maxV) * BAR_H)
        const jH = Math.round(((d.j || 0) / maxV) * BAR_H)
        const fH = Math.round(((d.f || 0) / maxV) * BAR_H)
        const isAct = activeDay === d.d
        const isDim = hasFilt && !isAct
        const isHov = hov === i
        const dimAl = activeTurno && activeTurno !== 'al'
        const dimHh = activeTurno && activeTurno !== 'hh'
        const dimJ = activeTurno && activeTurno !== 'j'
        const dimF = activeTurno && activeTurno !== 'f'
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', cursor: 'pointer', opacity: isDim ? 0.25 : 1, transition: 'opacity 0.22s' }}
            role="button" aria-label={`${d.d}: Almoço ${d.al || 0}, HH ${d.hh || 0}, Jantar ${d.j || 0}, Fora ${d.f || 0}`}
            onClick={() => setActiveDay(isAct ? null : d.d)}
            onDoubleClick={() => onOpenModal && onOpenModal(d.d)}
            onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}>
            <div style={{ height: 44, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', flexDirection: 'column', gap: 1, marginBottom: 4, opacity: (isHov || isAct) ? 1 : 0, transition: 'opacity 0.15s' }}>
              {(d.al || 0) > 0 && !dimAl && <div style={{ fontSize: 9, fontWeight: 700, color: cAl, textAlign: 'center' }}>{d.al}</div>}
              {(d.hh || 0) > 0 && !dimHh && <div style={{ fontSize: 9, fontWeight: 700, color: cHh, textAlign: 'center' }}>{d.hh}</div>}
              {(d.j || 0) > 0 && !dimJ && <div style={{ fontSize: 9, fontWeight: 700, color: cJ, textAlign: 'center' }}>{d.j}</div>}
              {(d.f || 0) > 0 && !dimF && <div style={{ fontSize: 9, fontWeight: 700, color: cF, textAlign: 'center' }}>{d.f}</div>}
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: BAR_H }}>
              <div style={{ width: 8, height: Math.max(alH, 2), background: cAl, borderRadius: '3px 3px 0 0', transition: 'height .4s ease, opacity .3s', opacity: dimAl ? 0.12 : 1, boxShadow: isAct && !dimAl ? `0 0 8px ${cAl}` : 'none' }} />
              <div style={{ width: 8, height: Math.max(hhH, 2), background: cHh, borderRadius: '3px 3px 0 0', transition: 'height .4s ease, opacity .3s', opacity: dimHh ? 0.12 : 1, boxShadow: isAct && !dimHh ? `0 0 8px ${cHh}` : 'none' }} />
              <div style={{ width: 8, height: Math.max(jH, 2), background: cJ, borderRadius: '3px 3px 0 0', transition: 'height .4s ease, opacity .3s', opacity: dimJ ? 0.12 : 1, boxShadow: isAct && !dimJ ? `0 0 8px rgba(232,93,4,0.6)` : 'none' }} />
              {(d.f || 0) > 0 && <div style={{ width: 8, height: Math.max(fH, 2), background: cF, borderRadius: '3px 3px 0 0', transition: 'height .4s ease, opacity .3s', opacity: dimF ? 0.12 : 1, boxShadow: isAct && !dimF ? `0 0 8px rgba(239,68,68,0.6)` : 'none' }} />}
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
