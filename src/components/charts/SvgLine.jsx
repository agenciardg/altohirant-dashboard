import { useState, useMemo, memo } from 'react'
import { LINE_CHART, COLORS, MAX_LABEL_POINTS } from '../../lib/constants'

const { W, H, PL, PR, PT, PB, IW, IH } = LINE_CHART

function SvgLineInner({ data, activeDay, setActiveDay }) {
  const [tip, setTip] = useState(null)
  const n = data.length
  const maxV = useMemo(() => Math.max(...data.map(d => d.total), 1), [data])

  const gx = (i, len) => len < 2 ? PL + IW / 2 : PL + (i / (len - 1)) * IW
  const gy = (v, max) => PT + (1 - v / max) * IH

  // Build polyline segments, switching to dashed before a fechado point
  const segments = useMemo(() => {
    if (n < 2) return []
    const segs = []
    let solidPts = []
    for (let i = 0; i < n; i++) {
      const x = gx(i, n)
      const y = gy(data[i].total, maxV)
      const nextIsFechado = i < n - 1 && data[i + 1].fechado
      solidPts.push(`${x},${y}`)
      if (nextIsFechado || data[i].fechado) {
        if (solidPts.length >= 2) segs.push({ pts: solidPts.join(' '), dashed: data[i].fechado })
        else if (solidPts.length === 1 && i > 0) segs.push({ pts: `${gx(i - 1, n)},${gy(data[i - 1].total, maxV)} ${x},${y}`, dashed: data[i].fechado })
        solidPts = [`${x},${y}`]
      }
    }
    if (solidPts.length >= 2) segs.push({ pts: solidPts.join(' '), dashed: false })
    return segs
  }, [data, maxV, n])

  const step = Math.ceil(n / MAX_LABEL_POINTS)
  const hasFilt = !!activeDay

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H + PB}`} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={COLORS.danger} />
          <stop offset="50%" stopColor={COLORS.primary} />
          <stop offset="100%" stopColor={COLORS.secondary} />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map(pct => {
        const y = PT + (1 - pct) * IH
        return (
          <g key={pct}>
            <line x1={PL} y1={y} x2={W - PR} y2={y} stroke="var(--grid)" strokeDasharray="4 3" strokeWidth="1" />
            <text x={PL - 5} y={y + 4} textAnchor="end" fontSize="9" style={{ fill: 'var(--t2)' }}>{Math.round(pct * maxV)}</text>
          </g>
        )
      })}
      {n > 1 && segments.map((seg, si) => (
        <polyline key={si} points={seg.pts} fill="none" stroke="url(#lg)" strokeWidth="2.5"
          strokeLinejoin="round" strokeLinecap="round"
          strokeDasharray={seg.dashed ? '4 3' : undefined} />
      ))}
      {n === 1 && <polyline points={`${gx(0, n)},${gy(data[0].total, maxV)}`} fill="none" stroke="url(#lg)" strokeWidth="2.5" />}
      {data.map((d, i) => {
        const x = gx(i, n), y = gy(d.total, maxV)
        const isFechado = !!d.fechado
        // Support both iso-keyed and label-keyed active day comparisons
        const isAct = activeDay === d.dia || (d.iso && activeDay === d.iso)
        const isDim = hasFilt && !isAct
        const showLbl = n <= MAX_LABEL_POINTS || i % step === 0 || i === n - 1 || isAct
        if (isFechado) {
          return (
            <g key={i} style={{ cursor: 'default' }} aria-label={`${d.dia}: fechado`}>
              <circle cx={x} cy={y} r={5}
                style={{ fill: '#666', stroke: '#666', strokeWidth: 1.5, opacity: isDim ? 0.25 : 1 }} />
              {showLbl && (
                <text x={x} y={H + PB - 4} textAnchor="middle" fontSize={9} fontWeight={400}
                  style={{ fill: 'var(--t2)' }}>
                  {d.dia}
                </text>
              )}
              <text x={x} y={y + 16} textAnchor="middle" fontSize={8}
                style={{ fill: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                FECHADO
              </text>
            </g>
          )
        }
        return (
          <g key={i} style={{ cursor: 'pointer' }}
            role="button" aria-label={`${d.dia}: ${d.total} atendimentos`}
            onClick={() => setActiveDay(isAct ? null : d)}
            onMouseEnter={() => setTip({ x, y, lbl: d.dia, val: d.total })}
            onMouseLeave={() => setTip(null)}>
            <circle cx={x} cy={y} r={isAct ? 8 : isDim ? 3 : 5}
              style={{
                fill: isAct ? COLORS.primary : 'var(--card)',
                stroke: COLORS.primary, strokeWidth: isAct ? 0 : 2,
                opacity: isDim ? 0.25 : 1,
                transition: 'all 0.22s',
                filter: isAct ? `drop-shadow(0 0 6px rgba(232,93,4,0.7))` : 'none',
              }} />
            {showLbl && (
              <text x={x} y={H + PB - 4} textAnchor="middle"
                fontSize={isAct ? 10 : 9} fontWeight={isAct ? 700 : 400}
                style={{ fill: isAct ? COLORS.primary : 'var(--t2)', transition: 'fill 0.2s' }}>
                {d.dia}
              </text>
            )}
          </g>
        )
      })}
      {tip && (
        <g style={{ pointerEvents: 'none' }}>
          <rect x={Math.min(tip.x - 30, W - 62)} y={Math.max(tip.y - 58, 2)} width={62} height={50}
            rx={7} style={{ fill: 'var(--tip)', stroke: 'var(--border)' }} strokeWidth={1} />
          <text x={Math.min(tip.x, W - 31)} y={Math.max(tip.y - 42, 18)} textAnchor="middle"
            fontSize={8} style={{ fill: 'var(--t2)' }}>{tip.lbl}</text>
          <text x={Math.min(tip.x, W - 31)} y={Math.max(tip.y - 23, 36)} textAnchor="middle"
            fontSize={19} fontFamily="Playfair Display,serif" fontWeight={900} fill={COLORS.primary}>
            {tip.val}
          </text>
          <text x={Math.min(tip.x, W - 31)} y={Math.max(tip.y - 10, 49)} textAnchor="middle"
            fontSize={7} style={{ fill: 'var(--t2)' }}>atend.</text>
        </g>
      )}
    </svg>
  )
}

export const SvgLine = memo(SvgLineInner)
