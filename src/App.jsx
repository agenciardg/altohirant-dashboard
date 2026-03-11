import { useState, useEffect, useRef, useCallback } from 'react'
import { useDashboardData } from './lib/useDashboardData'
import { useLogoConfig } from './lib/useConfig'
import { Modal } from './Modal.jsx'

/* ══ MOCK DATA (fallback quando não há dados reais) ════════════════════════ */
const MOCK = {
  hoje: {
    kpis: {
      total:    { value: '74',  sub: 'vs. ontem',          delta: '+8%',    dt: 'bp' },
      reservas: { value: '31',  sub: 'vs. ontem',          delta: '+12%',   dt: 'bp' },
      satisf:   { value: '96%', sub: 'feedbacks positivos', delta: '+2%',   dt: 'bp', sm: true },
      pico:     { value: '19h', sub: 'Turno: Jantar',       delta: 'Jantar', dt: 'bn', sm: true },
    },
    linhaLabel: 'Hoje — Volume por hora',
    linha: [
      { dia: '10h', total: 3 }, { dia: '11h', total: 6 }, { dia: '12h', total: 14 },
      { dia: '13h', total: 19 }, { dia: '14h', total: 11 }, { dia: '15h', total: 7 },
      { dia: '16h', total: 5 }, { dia: '17h', total: 4 }, { dia: '18h', total: 8 },
      { dia: '19h', total: 12 }, { dia: '20h', total: 9 }, { dia: '21h', total: 6 }, { dia: '22h', total: 3 },
    ],
    donut: [
      { name: 'Reservas',    value: 31, color: '#E85D04', pct: '42%' },
      { name: 'Cardapio',    value: 23, color: '#F97316', pct: '31%' },
      { name: 'Localizacao', value: 14, color: '#DC2626', pct: '19%' },
      { name: 'Outros',      value: 6,  color: '#6B4A1A', pct: '8%' },
    ],
    barLabel: 'Distribuição por turno',
    barras: [
      { d: 'Manha', a: 9, j: 0 }, { d: 'Almoco', a: 28, j: 3 }, { d: 'Tarde', a: 7, j: 8 },
      { d: 'Jantar', a: 0, j: 24 }, { d: 'Noite', a: 0, j: 6 },
    ],
    tableRows: [
      { id: '#001', h: '12:43', cli: 'Joao Silva',     tipo: 'Reservas',    st: 'Positivo', det: 'Mesa p/ 6 pessoas' },
      { id: '#002', h: '12:51', cli: 'Maria Santos',   tipo: 'Cardapio',    st: 'Positivo', det: 'Opções vegetarianas' },
      { id: '#003', h: '13:02', cli: 'Pedro Costa',    tipo: 'Localizacao', st: 'Neutro',   det: 'Rota via Google Maps' },
      { id: '#004', h: '13:18', cli: 'Ana Lima',        tipo: 'Reservas',    st: 'Positivo', det: 'Reserva aniversário' },
      { id: '#005', h: '13:31', cli: 'Carlos Mendes',  tipo: 'Cardapio',    st: 'Negativo', det: 'Dúvida sobre alergenos' },
      { id: '#006', h: '13:45', cli: 'Lucia Ferreira', tipo: 'Reservas',    st: 'Positivo', det: 'Confirmação de reserva' },
      { id: '#007', h: '14:02', cli: 'Roberto Alves',  tipo: 'Localizacao', st: 'Positivo', det: 'Estacionamento local' },
      { id: '#008', h: '14:19', cli: 'Fernanda Rocha', tipo: 'Cardapio',    st: 'Neutro',   det: 'Preços do menu' },
    ],
  },
  semana: {
    kpis: {
      total:    { value: '406', sub: 'vs. semana anterior', delta: '+18%',   dt: 'bp' },
      reservas: { value: '182', sub: 'vs. semana anterior', delta: '+24%',   dt: 'bp' },
      satisf:   { value: '94%', sub: 'feedbacks positivos', delta: '+3%',    dt: 'bp', sm: true },
      pico:     { value: '13h', sub: 'Turno: Almoço',       delta: 'Almoço', dt: 'bn', sm: true },
    },
    linhaLabel: 'Semana atual — Volume diário',
    linha: [
      { dia: 'Seg', total: 42 }, { dia: 'Ter', total: 38 }, { dia: 'Qua', total: 51 },
      { dia: 'Qui', total: 45 }, { dia: 'Sex', total: 67 }, { dia: 'Sab', total: 89 }, { dia: 'Dom', total: 74 },
    ],
    donut: [
      { name: 'Reservas',    value: 182, color: '#E85D04', pct: '42%' },
      { name: 'Cardapio',    value: 133, color: '#F97316', pct: '31%' },
      { name: 'Localizacao', value: 91,  color: '#DC2626', pct: '21%' },
      { name: 'Outros',      value: 34,  color: '#6B4A1A', pct: '8%' },
    ],
    barLabel: 'Atendimentos por turno',
    barras: [
      { d: 'Seg', a: 22, j: 20 }, { d: 'Ter', a: 18, j: 20 }, { d: 'Qua', a: 25, j: 26 },
      { d: 'Qui', a: 21, j: 24 }, { d: 'Sex', a: 30, j: 37 }, { d: 'Sab', a: 38, j: 51 }, { d: 'Dom', a: 32, j: 42 },
    ],
    tableRows: [
      { id: '#001', h: '12:43', cli: 'Joao Silva',     tipo: 'Reservas',    st: 'Positivo', det: 'Mesa p/ 6 pessoas' },
      { id: '#002', h: '12:51', cli: 'Maria Santos',   tipo: 'Cardapio',    st: 'Positivo', det: 'Opções vegetarianas' },
      { id: '#003', h: '13:02', cli: 'Pedro Costa',    tipo: 'Localizacao', st: 'Neutro',   det: 'Rota via Google Maps' },
      { id: '#004', h: '13:18', cli: 'Ana Lima',        tipo: 'Reservas',    st: 'Positivo', det: 'Reserva aniversário' },
    ],
  },
  mes: {
    kpis: {
      total:    { value: '1840', sub: 'vs. mês anterior',   delta: '+22%',   dt: 'bp' },
      reservas: { value: '780',  sub: 'vs. mês anterior',   delta: '+31%',   dt: 'bp' },
      satisf:   { value: '93%',  sub: 'feedbacks positivos', delta: '-1%',   dt: 'be', sm: true },
      pico:     { value: '20h',  sub: 'Turno: Jantar',      delta: 'Jantar', dt: 'bn', sm: true },
    },
    linhaLabel: 'Este mês — Volume semanal',
    linha: [
      { dia: 'Sem 1', total: 380 }, { dia: 'Sem 2', total: 420 },
      { dia: 'Sem 3', total: 452 }, { dia: 'Sem 4', total: 588 },
    ],
    donut: [
      { name: 'Reservas',    value: 780, color: '#E85D04', pct: '42%' },
      { name: 'Cardapio',    value: 571, color: '#F97316', pct: '31%' },
      { name: 'Localizacao', value: 386, color: '#DC2626', pct: '21%' },
      { name: 'Outros',      value: 147, color: '#6B4A1A', pct: '8%' },
    ],
    barLabel: 'Atendimentos por turno',
    barras: [
      { d: 'Sem 1', a: 165, j: 215 }, { d: 'Sem 2', a: 180, j: 240 },
      { d: 'Sem 3', a: 198, j: 254 }, { d: 'Sem 4', a: 257, j: 331 },
    ],
    tableRows: [
      { id: '#001', h: '12:43', cli: 'Joao Silva',     tipo: 'Reservas',    st: 'Positivo', det: 'Mesa p/ 6 pessoas' },
      { id: '#002', h: '12:51', cli: 'Maria Santos',   tipo: 'Cardapio',    st: 'Positivo', det: 'Opções vegetarianas' },
    ],
  },
}

/* ══ CLOCK ══════════════════════════════════════════════════════════════════ */
function useClock() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const fmt = () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    setTime(fmt())
    const id = setInterval(() => setTime(fmt()), 30000)
    return () => clearInterval(id)
  }, [])
  return time
}

/* ══ FLAME LOGO ═════════════════════════════════════════════════════════════ */
function FlameLogo({ size = 46 }) {
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

/* ══ SVG LINE CHART ══════════════════════════════════════════════════════════ */
function SvgLine({ data, activeDay, setActiveDay }) {
  const [tip, setTip] = useState(null)
  const W = 560, H = 195, PL = 36, PR = 36, PT = 14, PB = 26, IW = W - PL - PR, IH = H - PT - PB
  const n = data.length
  const maxV = Math.max(...data.map(d => d.total), 1)
  const gx = i => n < 2 ? PL + IW / 2 : PL + (i / (n - 1)) * IW
  const gy = v => PT + (1 - v / maxV) * IH
  const pts = data.map((d, i) => `${gx(i)},${gy(d.total)}`).join(' ')
  const step = Math.ceil(n / 7)
  const hasFilt = !!activeDay

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H + PB}`} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#DC2626" />
          <stop offset="50%" stopColor="#E85D04" />
          <stop offset="100%" stopColor="#F97316" />
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
      {n > 1 && <polyline points={pts} fill="none" stroke="url(#lg)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />}
      {data.map((d, i) => {
        const x = gx(i), y = gy(d.total)
        const isAct = activeDay === d.dia
        const isDim = hasFilt && !isAct
        const showLbl = n <= 7 || i % step === 0 || i === n - 1 || isAct
        return (
          <g key={i} style={{ cursor: 'pointer' }}
            onClick={() => setActiveDay(isAct ? null : d.dia)}
            onMouseEnter={() => setTip({ x, y, lbl: d.dia, val: d.total })}
            onMouseLeave={() => setTip(null)}>
            <circle cx={x} cy={y} r={isAct ? 8 : isDim ? 3 : 5}
              style={{
                fill: isAct ? '#E85D04' : 'var(--card)',
                stroke: '#E85D04', strokeWidth: isAct ? 0 : 2,
                opacity: isDim ? 0.25 : 1,
                transition: 'all 0.22s',
                filter: isAct ? 'drop-shadow(0 0 6px rgba(232,93,4,0.7))' : 'none',
              }} />
            {showLbl && (
              <text x={x} y={H + PB - 4} textAnchor="middle"
                fontSize={isAct ? 10 : 9} fontWeight={isAct ? 700 : 400}
                style={{ fill: isAct ? '#E85D04' : 'var(--t2)', transition: 'fill 0.2s' }}>
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
            fontSize={19} fontFamily="Playfair Display,serif" fontWeight={900} fill="#E85D04">
            {tip.val}
          </text>
          <text x={Math.min(tip.x, W - 31)} y={Math.max(tip.y - 10, 49)} textAnchor="middle"
            fontSize={7} style={{ fill: 'var(--t2)' }}>atend.</text>
        </g>
      )}
    </svg>
  )
}

/* ══ SVG DONUT ═══════════════════════════════════════════════════════════════ */
function SvgDonut({ data, filterType, setFilterType, onOpenModal }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  const cx = 100, cy = 82, OUTER = 68, INNER = 55, GAP = (3 * Math.PI) / 180
  let angle = -Math.PI / 2
  const segs = data.map(d => {
    const pct = d.value / total
    let arc = pct * 2 * Math.PI - GAP
    if (arc < 0.01) arc = 0.01
    const sa = angle + GAP / 2, ea = sa + arc
    const large = arc > Math.PI ? 1 : 0
    const px = (a, r) => cx + r * Math.cos(a)
    const py = (a, r) => cy + r * Math.sin(a)
    const path = `M ${px(sa, OUTER)} ${py(sa, OUTER)} A ${OUTER} ${OUTER} 0 ${large} 1 ${px(ea, OUTER)} ${py(ea, OUTER)} L ${px(ea, INNER)} ${py(ea, INNER)} A ${INNER} ${INNER} 0 ${large} 0 ${px(sa, INNER)} ${py(sa, INNER)} Z`
    angle += pct * 2 * Math.PI
    return { path, color: d.color, name: d.name }
  })
  const hasFilt = !!filterType
  return (
    <svg width="100%" height="160" viewBox="0 0 200 160" style={{ display: 'block' }}>
      {segs.map((s, i) => {
        const isAct = filterType === s.name
        const isDim = hasFilt && !isAct
        return (
          <path key={i} d={s.path} fill={s.color}
            stroke={isAct ? 'white' : 'none'} strokeWidth={isAct ? 2.5 : 0}
            style={{ opacity: isDim ? 0.25 : 1, cursor: 'pointer', transition: 'opacity 0.22s', filter: isAct ? 'drop-shadow(0 0 5px rgba(0,0,0,0.4))' : 'none' }}
            onClick={() => { setFilterType(isAct ? null : s.name); if (onOpenModal) onOpenModal(s.name) }}
          />
        )
      })}
      <text x={cx} y={cy - 8} textAnchor="middle" fontSize="20"
        fontFamily="Playfair Display,serif" fontWeight="900" style={{ fill: 'var(--t1)', pointerEvents: 'none' }}>
        {filterType ? (data.find(d => d.name === filterType) || { value: 0 }).value : total}
      </text>
      <text x={cx} y={cy + 9} textAnchor="middle" fontSize="8"
        fontWeight="600" letterSpacing="2" style={{ fill: 'var(--t2)', pointerEvents: 'none', textTransform: 'uppercase' }}>
        {filterType || 'TOTAL'}
      </text>
    </svg>
  )
}

/* ══ CSS BAR CHART ═══════════════════════════════════════════════════════════ */
function CssBar({ data, barAlt = '#8A6A3A', activeDay, setActiveDay, activeTurno, onOpenModal }) {
  const [hov, setHov] = useState(null)
  const maxV = Math.max(...data.map(d => Math.max(d.a, d.j, 1)))
  const BAR_H = 172
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
            onClick={() => setActiveDay(isAct ? null : d.d)}
            onDoubleClick={() => onOpenModal && onOpenModal(d.d)}
            onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}>
            <div style={{ height: 36, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', flexDirection: 'column', gap: 1, marginBottom: 4, opacity: (isHov || isAct) ? 1 : 0, transition: 'opacity 0.15s' }}>
              {d.a > 0 && !dimA && <div style={{ fontSize: 9, fontWeight: 700, color: barAlt, textAlign: 'center' }}>{d.a}</div>}
              {d.j > 0 && !dimJ && <div style={{ fontSize: 9, fontWeight: 700, color: '#E85D04', textAlign: 'center' }}>{d.j}</div>}
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: BAR_H }}>
              <div style={{ width: 10, height: Math.max(aH, 2), background: barAlt, borderRadius: '4px 4px 0 0', transition: 'height .4s ease, opacity .3s', opacity: dimA ? 0.12 : 1, boxShadow: isAct && !dimA ? `0 0 10px ${barAlt}` : 'none' }} />
              <div style={{ width: 10, height: Math.max(jH, 2), background: '#E85D04', borderRadius: '4px 4px 0 0', transition: 'height .4s ease, opacity .3s', opacity: dimJ ? 0.12 : 1, boxShadow: isAct && !dimJ ? '0 0 10px rgba(232,93,4,0.6)' : 'none' }} />
            </div>
            <div style={{ fontSize: 9, fontWeight: isAct ? 700 : 600, color: isAct ? '#E85D04' : 'var(--t2)', marginTop: 6, letterSpacing: '0.06em', textTransform: 'uppercase', textAlign: 'center', transition: 'color 0.2s' }}>
              {d.d}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ══ BADGES ══════════════════════════════════════════════════════════════════ */
function TipoBadge({ tipo }) {
  const map = { Reservas: 'br', Cardapio: 'bc', Localizacao: 'bl' }
  return <span className={`b ${map[tipo] || 'bo'}`}>{tipo}</span>
}
function StBadge({ st }) {
  const map = { Positivo: ['bp', '↑'], Neutro: ['bn', '→'], Negativo: ['be', '↓'] }
  const info = map[st] || ['bo', '·']
  return <span className={`b ${info[0]}`}>{info[1]} {st}</span>
}

/* ══ KPI CARD ════════════════════════════════════════════════════════════════ */
function KPICard({ icon, label, value, sub, delta, dt, sm, onClick, active, ak, loading, onOpenModal }) {
  const cls = `card kc clickable${active ? ' active-card' : ''}`
  function handleClick() {
    if (onClick) onClick()
    if (onOpenModal) onOpenModal()
  }
  return (
    <div className={cls} onClick={handleClick} title="Clique para ver detalhes">
      <div className="cb">
        <div className="klbl"><span className="kico">{icon}</span>{label}</div>
        <div key={ak} className={`kval fi${sm ? ' sm' : ''}`}>
          {loading ? '—' : value}
        </div>
        <div className="kft">
          <span className="ksub">{loading ? '...' : sub}</span>
          {delta && !loading && <span className={`b ${dt}`}>{delta}</span>}
        </div>
      </div>
    </div>
  )
}

/* ══ BADGE SUPABASE ══════════════════════════════════════════════════════════ */
function SupabaseBadge({ hasRealData, supabaseOk, loading, error }) {
  if (loading) return (
    <span className="b bo" style={{ fontSize: 9 }}>⏳ Supabase...</span>
  )
  if (error) return (
    <span className="b be" style={{ fontSize: 9 }} title={error}>⚠ erro Supabase</span>
  )
  if (hasRealData) return (
    <span className="b bp" style={{ fontSize: 9 }}>● dados reais · Supabase</span>
  )
  if (supabaseOk) return (
    <span className="b bn" style={{ fontSize: 9 }}>○ sem registros neste período</span>
  )
  return (
    <span className="b bo" style={{ fontSize: 9 }}>○ demo</span>
  )
}

/* ══ CARD: LINE ══════════════════════════════════════════════════════════════ */
function CardLinha({ data, label, activeDay, setActiveDay, ak, loading }) {
  return (
    <div className="card">
      <div className="ch" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center' }}>
        <div />
        <div style={{ textAlign: 'center' }}>
          <div className="ct">Atendimentos por Período</div>
          <div key={ak} className="cs fi">{label}</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {!loading && <span className="b ba">dados reais</span>}
        </div>
      </div>
      <div className="cbdy">
        {loading
          ? <div style={{ height: 195, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t2)', fontSize: 12 }}>Carregando...</div>
          : <>
            <SvgLine data={data} activeDay={activeDay} setActiveDay={setActiveDay} />
            {activeDay && (
              <div style={{ marginTop: 8, fontSize: 10, color: 'var(--t2)', textAlign: 'center' }}>
                Clique no ponto novamente para desselecionar
              </div>
            )}
          </>
        }
      </div>
    </div>
  )
}

/* ══ CARD: DONUT ═════════════════════════════════════════════════════════════ */
function CardDonut({ data, filterType, setFilterType, ak, loading, onOpenModal }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  return (
    <div className="card">
      <div className="ch">
        <div>
          <div className="ct">Tipos de Atendimento</div>
          <div key={ak} className="cs fi">
            {loading ? '...' : filterType ? `Filtrando: ${filterType}` : `${total} total`}
          </div>
        </div>
      </div>
      <div className="cbdy">
        {loading
          ? <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t2)', fontSize: 12 }}>Carregando...</div>
          : <>
            <SvgDonut data={data} filterType={filterType} setFilterType={setFilterType} onOpenModal={onOpenModal} />
            <div className="ll">
              {data.map((d, i) => {
                const isAct = filterType === d.name
                return (
                  <div key={i} className={`lr${isAct ? ' lr-act' : ''}`}
                    onClick={() => setFilterType(isAct ? null : d.name)}>
                    <div className="lft">
                      <div className="ld" style={{ background: d.color, opacity: filterType && !isAct ? 0.3 : 1, transition: 'opacity 0.2s' }} />
                      <span className="ll2" style={{ opacity: filterType && !isAct ? 0.4 : 1, transition: 'opacity 0.2s' }}>{d.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="lp">{d.pct}</span>
                      <span className="lv" style={{ opacity: filterType && !isAct ? 0.4 : 1, transition: 'opacity 0.2s' }}>{d.value}</span>
                      <button
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--t3)', padding: '0 2px', lineHeight: 1, transition: 'color .15s' }}
                        onClick={e => { e.stopPropagation(); onOpenModal && onOpenModal(d.name) }}
                        onMouseEnter={e => e.currentTarget.style.color = '#E85D04'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--t3)'}
                        title="Ver detalhes">↗</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        }
      </div>
    </div>
  )
}

/* ══ CARD: BARRAS ════════════════════════════════════════════════════════════ */
function CardBarras({ data, label, barAlt, activeDay, setActiveDay, ak, loading, onOpenModal }) {
  const [activeTurno, setActiveTurno] = useState(null) // null | 'a' | 'j'
  const toggleTurno = t => setActiveTurno(prev => prev === t ? null : t)
  return (
    <div className="card">
      <div className="ch">
        <div>
          <div className="ct">Almoço x Jantar</div>
          <div key={ak} className="cs fi">{label}</div>
        </div>
        <div className="bleg">
          <div
            className={`bli clickable${activeTurno === 'a' ? ' bli-act' : ''}${activeTurno === 'j' ? ' bli-dim' : ''}`}
            onClick={() => toggleTurno('a')}
            title="Filtrar Almoço">
            <div className="bls" style={{ background: barAlt }} />Almoço
          </div>
          <div
            className={`bli clickable${activeTurno === 'j' ? ' bli-act' : ''}${activeTurno === 'a' ? ' bli-dim' : ''}`}
            onClick={() => toggleTurno('j')}
            title="Filtrar Jantar">
            <div className="bls" style={{ background: '#E85D04' }} />Jantar
          </div>
        </div>
      </div>
      <div className="cbdy">
        {loading
          ? <div style={{ height: 172, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t2)', fontSize: 12 }}>Carregando...</div>
          : <CssBar data={data} barAlt={barAlt} activeDay={activeDay} setActiveDay={setActiveDay} activeTurno={activeTurno} onOpenModal={onOpenModal} />
        }
      </div>
    </div>
  )
}

/* ══ CARD: TABELA ════════════════════════════════════════════════════════════ */
const PAGE_SIZE = 10

function CardTabela({ rows, filterType, loading, hasRealData, supabaseOk, onOpenModal }) {
  const [page, setPage] = useState(0)

  const filtered = filterType ? rows.filter(r => r.tipo === filterType) : rows
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const pageRows = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)

  // Volta para página 0 ao mudar filtro ou dados
  useEffect(() => { setPage(0) }, [filterType, rows])

  return (
    <div className="card">
      <div className="ch">
        <div>
          <div className="ct">Últimos Atendimentos</div>
          <div className="cs">
            {loading ? 'Carregando...' : filterType
              ? `${filtered.length} de ${rows.length} registros · ${filterType}`
              : hasRealData
                ? `${rows.length} registros · banco de dados`
                : supabaseOk
                  ? 'Sem atendimentos neste período'
                  : 'Dados de demonstração'}
          </div>
        </div>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: hasRealData ? '#22C55E' : '#F59E0B', boxShadow: `0 0 7px ${hasRealData ? 'rgba(34,197,94,.55)' : 'rgba(245,158,11,.55)'}`, marginTop: 4 }} />
      </div>
      <div style={{ padding: '10px 0 0' }}>
        <div className="tscr">
          <table>
            <thead>
              <tr><th>ID</th><th>Hora</th><th>Cliente</th><th>Tipo</th><th>Status</th><th>Detalhe</th></tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 28, color: 'var(--t2)' }}>
                  Carregando dados do banco de dados...
                </td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 28, color: 'var(--t3)', fontStyle: 'italic' }}>
                  {supabaseOk ? 'Nenhum atendimento neste período' : 'Nenhum registro encontrado'}
                </td></tr>
              )}
              {!loading && pageRows.map(r => (
                <tr key={r.id} style={{ cursor: 'pointer' }}
                  onClick={() => onOpenModal && onOpenModal(r._raw || r)}
                  title="Clique para ver detalhes">
                  <td style={{ color: 'var(--t3)', fontSize: 11, fontFamily: 'monospace' }}>{r.id}</td>
                  <td style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 13 }}>{r.h}</td>
                  <td style={{ fontWeight: 600 }}>{r.cli}</td>
                  <td><TipoBadge tipo={r.tipo} /></td>
                  <td><StBadge st={r.st} /></td>
                  <td style={{ color: 'var(--t2)', fontSize: 11 }}>{r.det}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {!loading && filtered.length > PAGE_SIZE && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 0 4px', borderTop: '1px solid var(--border)', marginTop: 6 }}>
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={safePage === 0}
              style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 10px', cursor: safePage === 0 ? 'not-allowed' : 'pointer', color: safePage === 0 ? 'var(--t3)' : 'var(--t1)', fontSize: 12 }}>
              ‹ Anterior
            </button>
            <span style={{ fontSize: 11, color: 'var(--t2)' }}>
              {safePage + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={safePage === totalPages - 1}
              style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 10px', cursor: safePage === totalPages - 1 ? 'not-allowed' : 'pointer', color: safePage === totalPages - 1 ? 'var(--t3)' : 'var(--t1)', fontSize: 12 }}>
              Próximo ›
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ══ APP ═════════════════════════════════════════════════════════════════════ */
export default function App() {
  const [theme, setTheme] = useState('dark')
  const [tab, setTab] = useState('semana')
  const [filterType, setFilterType] = useState(null)
  const [activeDay, setActiveDay] = useState(null)
  const { logoSrc, updateLogo, removeLogo: removeLogoConfig } = useLogoConfig()
  const fileRef = useRef(null)
  const clock = useClock()

  const { loading, data: realData, error } = useDashboardData(tab)
  const [modal, setModal] = useState({ type: null, data: null })
  const openModal = useCallback((type, data = null) => setModal({ type, data }), [])
  const closeModal = useCallback(() => setModal({ type: null, data: null }), [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  function handleLogoFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => updateLogo(ev.target.result)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function removeLogo(ev) {
    ev.stopPropagation()
    removeLogoConfig()
  }

  // Usa dados reais sempre que Supabase respondeu (supabaseOk = true),
  // mesmo que o período não tenha registros (hasRealData = false).
  // Mock só aparece quando Supabase não respondeu (loading inicial ou erro).
  const supabaseOk = !!(realData?.supabaseOk)
  const d = supabaseOk ? realData : MOCK[tab]
  const hasRealData = !!(realData?.hasRealData)
  const rawRows = realData?.rawRows || []
  const barAlt = theme === 'dark' ? '#8A6A3A' : '#C4854A'

  function clearAll() { setFilterType(null); setActiveDay(null) }
  function handleTab(id) { setTab(id); clearAll() }

  const allRows = d.tableRows || []
  const hasFilters = !!(filterType || activeDay)
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <>
      {/* ── Header ── */}
      <header className="hdr">
        <div className="hdr-i">
          <div className="brand">
            <div className="logo-wrap" onClick={() => fileRef.current?.click()}>
              {logoSrc ? <img src={logoSrc} className="logo-img" alt="Logo" /> : <FlameLogo size={46} />}
              <div className="logo-ov">
                <span className="logo-ov-icon">📷</span>
                <span className="logo-ov-txt">Alterar</span>
              </div>
              {logoSrc && <button className="logo-reset" onClick={removeLogo} title="Remover foto">×</button>}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoFile} />
            <div>
              <div className="b-name">Alto da Hirant</div>
              <div className="b-tag">Churrasco &amp; Cia</div>
            </div>
            {clock && <div className="clk-brand">{clock}</div>}
          </div>
          <div className="hdr-r">
            <div className="agt"><div className="dot" />Agente IA Online</div>
            <div className="date">{today}</div>
            <button className="tog-btn" aria-label="Tema"
              onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>
              <div className="tog-th">{theme === 'dark' ? '🌙' : '☀️'}</div>
            </button>
          </div>
        </div>
      </header>

      {/* ── Dashboard ── */}
      <div className="dash">

        {/* Tabs */}
        <div className="tabs-w">
          <div className="tabs">
            {[['hoje', 'Hoje'], ['semana', 'Esta Semana'], ['mes', 'Este Mês']].map(([id, lbl]) => (
              <button key={id} className={`tab${tab === id ? ' act' : ''}`} onClick={() => handleTab(id)}>
                {lbl}
              </button>
            ))}
          </div>
        </div>

        {/* Filter chips */}
        {hasFilters && (
          <div className="fchips">
            <span className="fchip-lbl">Filtros ativos:</span>
            {filterType && (
              <span className="b ba" style={{ cursor: 'pointer' }} onClick={() => setFilterType(null)}>
                {filterType} &times;
              </span>
            )}
            {activeDay && (
              <span className="b bn" style={{ cursor: 'pointer' }} onClick={() => setActiveDay(null)}>
                {activeDay} &times;
              </span>
            )}
            <button className="fclear" onClick={clearAll}>Limpar tudo</button>
          </div>
        )}

        {/* Conteúdo da aba — anima ao trocar */}
        <div key={tab} className="tab-content">

        {/* KPIs */}
        <div className="g4">
          <KPICard icon="💬" label="Total Atendimentos" loading={loading}
            value={d.kpis.total.value}
            sub={hasFilters ? 'Ver todos · clique' : d.kpis.total.sub}
            delta={hasFilters ? '× limpar filtros' : d.kpis.total.delta}
            dt={hasFilters ? 'be' : d.kpis.total.dt} ak={tab + 't'}
            onClick={hasFilters ? clearAll : undefined}
            onOpenModal={() => openModal('total')}
          />
          <KPICard icon="🍖" label="Reservas Realizadas" loading={loading}
            value={d.kpis.reservas.value} sub={d.kpis.reservas.sub}
            delta={d.kpis.reservas.delta} dt={d.kpis.reservas.dt} ak={tab + 'r'}
            active={filterType === 'Reservas'}
            onClick={() => setFilterType(filterType === 'Reservas' ? null : 'Reservas')}
            onOpenModal={() => openModal('reservas')}
          />
          <KPICard icon="⭐" label="Satisfação Geral" sm loading={loading}
            value={d.kpis.satisf.value} sub={d.kpis.satisf.sub}
            delta={d.kpis.satisf.delta} dt={d.kpis.satisf.dt} ak={tab + 's'}
            onOpenModal={() => openModal('satisf')}
          />
          <KPICard icon="🔥" label="Horário de Pico" sm loading={loading}
            value={d.kpis.pico.value} sub={d.kpis.pico.sub}
            delta={d.kpis.pico.delta} dt={d.kpis.pico.dt} ak={tab + 'p'}
            onOpenModal={() => openModal('pico')}
          />
        </div>

        {/* Linha + Donut */}
        <div className="g21">
          <CardLinha data={d.linha} label={d.linhaLabel} ak={tab} loading={loading}
            activeDay={activeDay} setActiveDay={setActiveDay} />
          <CardDonut data={d.donut} ak={tab} loading={loading}
            filterType={filterType} setFilterType={setFilterType}
            onOpenModal={(tipo) => openModal('tipo', tipo)} />
        </div>

        {/* Barras + Tabela */}
        <div className="g11">
          <CardBarras data={d.barras} label={d.barLabel} ak={tab} barAlt={barAlt} loading={loading}
            activeDay={activeDay} setActiveDay={setActiveDay}
            onOpenModal={(dia) => openModal('turno', dia)} />
          <CardTabela rows={allRows} filterType={filterType} loading={loading}
            hasRealData={hasRealData} supabaseOk={supabaseOk}
            onOpenModal={(row) => openModal('registro', row)} />
        </div>

        </div>{/* /tab-content */}

        {/* Footer */}
        <footer className="ftr">
          <div>
            <div className="fb">Alto da Hirant · Churrasco &amp; Cia</div>
            <div className="fm">Dashboard IA WhatsApp · Agência RDG</div>
          </div>
          <div className="fr">
            <div>Sistema de Gestão IA · v2.0</div>
            <div style={{ marginTop: 3 }}>2026 · Todos os direitos reservados</div>
          </div>
        </footer>
      </div>

      {/* ── Modal ── */}
      <Modal state={modal} onClose={closeModal} rawRows={rawRows} />
    </>
  )
}
