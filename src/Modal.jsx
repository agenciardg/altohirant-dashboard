import { useEffect, useRef, useState, useCallback } from 'react'
import { normTipo, normFeedback, isDiurno } from './lib/utils'
import { DIAS_ABREV } from './lib/constants'

/* ── Helpers ── */
function fmt(hora) { return hora ? hora.slice(0, 5) : '--' }
function fmtData(data) {
  if (!data) return '--'
  const [y, m, d] = data.split('-')
  return `${d}/${m}/${y}`
}

/* ── Sub-badges ── */
function FBadge({ fb }) {
  if (!fb) return <span className="mb-badge mb-neutro">→ Sem feedback</span>
  const n = normFeedback(fb)
  const cls = n === 'Positivo' ? 'mb-positivo' : n === 'Negativo' ? 'mb-negativo' : 'mb-neutro'
  const ico = n === 'Positivo' ? '↑' : n === 'Negativo' ? '↓' : '→'
  return <span className={`mb-badge ${cls}`}>{ico} {n}</span>
}
function TBadge({ tipo }) {
  const cls = { Reservas: 'mb-res', Cardapio: 'mb-car', Localizacao: 'mb-loc', Geral: 'mb-ger', Aniversario: 'mb-aniv', Reclamacao: 'mb-recl' }
  return <span className={`mb-badge ${cls[tipo] || 'mb-out'}`}>{tipo}</span>
}
function TurnoBadge({ turno }) {
  if (!turno) return null
  return <span className={`mb-badge ${isDiurno(turno) ? 'mb-diurno' : 'mb-jantar'}`}>{turno}</span>
}

/* ── Linha de registro ── */
function MRow({ row }) {
  return (
    <div className="mrow">
      <div className="mrow-hora">
        <span className="mrow-h">{fmt(row.hora)}</span>
        {row.data && <span className="mrow-d">{fmtData(row.data)}</span>}
      </div>
      <div className="mrow-info">
        <div className="mrow-cli">{row.nome_cliente || row.numero_cliente || 'Desconhecido'}</div>
        {row.numero_cliente && row.nome_cliente && (
          <div className="mrow-tel">{row.numero_cliente}</div>
        )}
        {(row.assunto_feedback || row.tool_chamada) && (
          <div className="mrow-det">{row.assunto_feedback || row.tool_chamada}</div>
        )}
      </div>
      <div className="mrow-badges">
        <TBadge tipo={normTipo(row.tipo_atendimento)} />
        {row.turno && <TurnoBadge turno={row.turno} />}
        <FBadge fb={row.feedback_empresa} />
        {row.fora_horario && <span className="mb-badge mb-fora">Fora horário</span>}
      </div>
    </div>
  )
}

/* ── Stat summary ── */
function StatRow({ label, value, sub }) {
  return (
    <div className="mstat">
      <div className="mstat-val">{value}</div>
      <div className="mstat-lbl">{label}</div>
      {sub && <div className="mstat-sub">{sub}</div>}
    </div>
  )
}

/* ── Conteúdo: Total Atendimentos ── */
function ContentTotal({ rows }) {
  const total = rows.length
  const porTipo = {}
  rows.forEach(r => {
    const t = normTipo(r.tipo_atendimento)
    porTipo[t] = (porTipo[t] || 0) + 1
  })
  const reservas = rows.filter(r => r.reserva_solicitada).length
  const foraH = rows.filter(r => r.fora_horario).length

  return (
    <>
      <div className="mstats">
        <StatRow value={total} label="Total" />
        <StatRow value={reservas} label="Reservas" sub={total ? Math.round(reservas / total * 100) + '%' : '—'} />
        <StatRow value={foraH} label="Fora horário" />
        {Object.entries(porTipo).map(([t, v]) => (
          <StatRow key={t} value={v} label={t} sub={total ? Math.round(v / total * 100) + '%' : '—'} />
        ))}
      </div>
      <div className="msec-title">Todos os atendimentos</div>
      {rows.length === 0
        ? <div className="mempty">Nenhum atendimento neste período</div>
        : rows.map((r, i) => <MRow key={i} row={r} />)
      }
    </>
  )
}

/* ── Conteúdo: Reservas ── */
function ContentReservas({ rows }) {
  const reservas = rows.filter(r => r.reserva_solicitada)
  return (
    <>
      <div className="mstats">
        <StatRow value={reservas.length} label="Reservas" />
        <StatRow value={rows.length ? Math.round(reservas.length / rows.length * 100) + '%' : '—'} label="Taxa" sub="do total" />
      </div>
      <div className="msec-title">Clientes que solicitaram reserva</div>
      {reservas.length === 0
        ? <div className="mempty">Nenhuma reserva neste período</div>
        : reservas.map((r, i) => (
          <div className="mrow" key={i}>
            <div className="mrow-hora">
              <span className="mrow-h">{fmt(r.hora)}</span>
              <span className="mrow-d">{fmtData(r.data)}</span>
            </div>
            <div className="mrow-info">
              <div className="mrow-cli">{r.nome_cliente || r.numero_cliente || 'Desconhecido'}</div>
              {r.numero_cliente && r.nome_cliente && <div className="mrow-tel">{r.numero_cliente}</div>}
              {r.data_reserva_pedida && (
                <div className="mrow-det">📅 Reserva para: <strong>{fmtData(r.data_reserva_pedida)}</strong></div>
              )}
              {r.assunto_feedback && <div className="mrow-det">{r.assunto_feedback}</div>}
            </div>
            <div className="mrow-badges">
              <TurnoBadge turno={r.turno} />
              <FBadge fb={r.feedback_empresa} />
            </div>
          </div>
        ))
      }
    </>
  )
}

/* ── Conteúdo: Fora do Horário ── */
function ContentFora({ rows }) {
  const fora = rows.filter(r => r.fora_horario)
  const total = rows.length || 1
  const pct = Math.round((fora.length / total) * 100)

  return (
    <>
      <div className="mstats">
        <StatRow value={fora.length} label="Fora do horário" sub={`${pct}% do total`} />
        <StatRow value={rows.length - fora.length} label="No horário" />
        <StatRow value={rows.length} label="Total" />
      </div>
      <div className="msec-title">Atendimentos fora do horário</div>
      {fora.length === 0
        ? <div className="mempty">Nenhum atendimento fora do horário</div>
        : fora.map((r, i) => <MRow key={i} row={r} />)
      }
    </>
  )
}

/* ── Conteúdo: Horário de Pico ── */
function ContentPico({ rows }) {
  const counts = {}
  rows.forEach(r => {
    const h = parseInt((r.hora || '00').split(':')[0])
    counts[h] = (counts[h] || 0) + 1
  })
  const sorted = Object.entries(counts).sort((a, b) => Number(a[0]) - Number(b[0]))
  const maxVal = Math.max(...Object.values(counts), 1)
  const picoH = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]

  const turnoCounts = {}
  rows.forEach(r => { if (r.turno) turnoCounts[r.turno] = (turnoCounts[r.turno] || 0) + 1 })
  const turnoSorted = Object.entries(turnoCounts).sort((a, b) => b[1] - a[1])

  return (
    <>
      <div className="mstats">
        {picoH && <StatRow value={`${parseInt(picoH[0])}h`} label="Pico máximo" sub={`${picoH[1]} atend.`} />}
        {turnoSorted[0] && <StatRow value={turnoSorted[0][0]} label="Turno pico" sub={`${turnoSorted[0][1]} atend.`} />}
        <StatRow value={rows.length} label="Total" />
      </div>

      <div className="msec-title">Volume por hora</div>
      <div className="mpico-chart">
        {sorted.length === 0
          ? <div className="mempty">Sem dados para exibir</div>
          : sorted.map(([h, v]) => {
            const isPico = picoH && Number(h) === Number(picoH[0])
            return (
              <div key={h} className="mpico-row">
                <div className="mpico-lbl">{parseInt(h)}h</div>
                <div className="mpico-bar-wrap">
                  <div
                    className={`mpico-bar ${isPico ? 'mpico-bar-peak' : ''}`}
                    style={{ width: Math.round((v / maxVal) * 100) + '%' }}
                  />
                </div>
                <div className="mpico-val">{v}</div>
              </div>
            )
          })
        }
      </div>

      {turnoSorted.length > 0 && (
        <>
          <div className="msec-title" style={{ marginTop: 24 }}>Por turno</div>
          <div className="mpico-chart">
            {turnoSorted.map(([t, v]) => (
              <div key={t} className="mpico-row">
                <div className="mpico-lbl" style={{ textTransform: 'capitalize' }}>{t}</div>
                <div className="mpico-bar-wrap">
                  <div className="mpico-bar" style={{ width: Math.round((v / rows.length) * 100) + '%', background: '#E85D04' }} />
                </div>
                <div className="mpico-val">{v}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  )
}

/* ── Conteúdo: Tipo de Atendimento ── */
function ContentTipo({ rows, tipo }) {
  const filtered = tipo === 'Sem dados' ? rows : rows.filter(r => normTipo(r.tipo_atendimento) === tipo)

  return (
    <>
      <div className="mstats">
        <StatRow value={filtered.length} label="Atendimentos" />
        <StatRow value={rows.length ? Math.round(filtered.length / rows.length * 100) + '%' : '—'} label="Do total" />
      </div>
      <div className="msec-title">Atendimentos — {tipo}</div>
      {filtered.length === 0
        ? <div className="mempty">Nenhum atendimento deste tipo no período</div>
        : filtered.map((r, i) => <MRow key={i} row={r} />)
      }
    </>
  )
}

/* ── Conteúdo: Turno (Dia/Tarde x Noite por dia) ── */
function ContentTurno({ rows, dia }) {
  const filtered = dia ? rows.filter(r => {
    const diaRow = DIAS_ABREV[new Date(r.data + 'T12:00:00').getDay()]
    return diaRow === dia
  }) : rows

  const diaTarde = filtered.filter(r => isDiurno(r.turno))
  const noite = filtered.filter(r => !isDiurno(r.turno))

  return (
    <>
      <div className="mstats">
        <StatRow value={diaTarde.length} label="Almoço / HH" sub={dia || 'período'} />
        <StatRow value={noite.length} label="Jantar" sub={dia || 'período'} />
        <StatRow value={filtered.length} label="Total" />
      </div>
      {diaTarde.length > 0 && (
        <>
          <div className="msec-title">☀️ Almoço / Happy Hour</div>
          {diaTarde.map((r, i) => <MRow key={i} row={r} />)}
        </>
      )}
      {noite.length > 0 && (
        <>
          <div className="msec-title">🌙 Jantar</div>
          {noite.map((r, i) => <MRow key={i} row={r} />)}
        </>
      )}
      {filtered.length === 0 && <div className="mempty">Nenhum atendimento{dia ? ` em ${dia}` : ''}</div>}
    </>
  )
}

/* ── Conteúdo: Registro individual ── */
function ContentRegistro({ row }) {
  if (!row) return <div className="mempty">Sem dados</div>
  return (
    <div className="mreg">
      <div className="mreg-grid">
        <div className="mreg-field">
          <div className="mreg-lbl">Cliente</div>
          <div className="mreg-val">{row.nome_cliente || '—'}</div>
        </div>
        <div className="mreg-field">
          <div className="mreg-lbl">Telefone</div>
          <div className="mreg-val">{row.numero_cliente || '—'}</div>
        </div>
        <div className="mreg-field">
          <div className="mreg-lbl">Data</div>
          <div className="mreg-val">{fmtData(row.data)}</div>
        </div>
        <div className="mreg-field">
          <div className="mreg-lbl">Hora</div>
          <div className="mreg-val">{fmt(row.hora)}</div>
        </div>
        <div className="mreg-field">
          <div className="mreg-lbl">Turno</div>
          <div className="mreg-val">{row.turno || '—'}</div>
        </div>
        <div className="mreg-field">
          <div className="mreg-lbl">Tipo</div>
          <div className="mreg-val">{normTipo(row.tipo_atendimento)}</div>
        </div>
        <div className="mreg-field">
          <div className="mreg-lbl">Reserva</div>
          <div className="mreg-val">{row.reserva_solicitada ? '✔ Sim' : 'Não'}</div>
        </div>
        {row.data_reserva_pedida && (
          <div className="mreg-field">
            <div className="mreg-lbl">Data reserva</div>
            <div className="mreg-val">{fmtData(row.data_reserva_pedida)}</div>
          </div>
        )}
        <div className="mreg-field">
          <div className="mreg-lbl">Feedback</div>
          <div className="mreg-val"><FBadge fb={row.feedback_empresa} /></div>
        </div>
        {row.assunto_feedback && (
          <div className="mreg-field mreg-full">
            <div className="mreg-lbl">Assunto / Detalhe</div>
            <div className="mreg-val">"{row.assunto_feedback}"</div>
          </div>
        )}
        {row.tool_chamada && (
          <div className="mreg-field mreg-full">
            <div className="mreg-lbl">Ferramenta utilizada</div>
            <div className="mreg-val">{row.tool_chamada}</div>
          </div>
        )}
        <div className="mreg-field">
          <div className="mreg-lbl">Fora do horário</div>
          <div className="mreg-val">{row.fora_horario ? '⚠ Sim' : 'Não'}</div>
        </div>
      </div>
    </div>
  )
}

/* ══ MODAL REGISTRY (factory pattern) ════════════════════════════════════════ */
const MODAL_REGISTRY = {
  total:    { icon: '💬', title: 'Total de Atendimentos',   sub: 'Todos os registros do período',      Component: ContentTotal,    prop: 'rows' },
  reservas: { icon: '🍖', title: 'Reservas Realizadas',     sub: 'Clientes que solicitaram reserva',   Component: ContentReservas, prop: 'rows' },
  fora:     { icon: '🕐', title: 'Fora do Horário',           sub: 'Atendimentos fora do expediente',    Component: ContentFora,     prop: 'rows' },
  pico:     { icon: '🔥', title: 'Horário de Pico',          sub: 'Distribuição de volume por hora',    Component: ContentPico,     prop: 'rows' },
  tipo:     { icon: '🍽', title: 'Tipo de Atendimento',     sub: 'Detalhes por categoria',             Component: ContentTipo,     prop: 'rows' },
  turno:    { icon: '🕐', title: 'Almoço/HH × Jantar',        sub: 'Distribuição por turno',             Component: ContentTurno,    prop: 'rows' },
  registro: { icon: '📋', title: 'Detalhes do Atendimento', sub: 'Ficha completa',                    Component: ContentRegistro, prop: 'row' },
}

function getSubtitle(type, data, meta) {
  if (type === 'tipo') return `Categoria: ${data}`
  if (type === 'turno') return data ? `Dia: ${data}` : 'Período completo'
  return meta.sub
}

function getContentProps(type, data, rows) {
  const entry = MODAL_REGISTRY[type]
  if (!entry) return {}
  if (type === 'tipo') return { rows, tipo: data }
  if (type === 'turno') return { rows, dia: data }
  if (type === 'registro') return { row: data }
  return { rows }
}

/* ══ FOCUS TRAP HOOK ═════════════════════════════════════════════════════════ */
function useFocusTrap(boxRef, isOpen) {
  useEffect(() => {
    if (!isOpen) return
    const box = boxRef.current
    if (!box) return

    const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

    function handleTab(e) {
      if (e.key !== 'Tab') return
      const focusable = box.querySelectorAll(FOCUSABLE)
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    // Foca o botão de fechar ao abrir
    const closeBtn = box.querySelector('.modal-close')
    if (closeBtn) closeBtn.focus()

    box.addEventListener('keydown', handleTab)
    return () => box.removeEventListener('keydown', handleTab)
  }, [boxRef, isOpen])
}

/* ══ MODAL BASE ═══════════════════════════════════════════════════════════════ */
export function Modal({ state, onClose, rawRows }) {
  const boxRef = useRef(null)
  const bodyRef = useRef(null)
  const drag = useRef(null)
  const justResized = useRef(false)
  const rows = rawRows || []
  const [size, setSize] = useState({ w: null, h: null })

  useFocusTrap(boxRef, !!state.type)

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    if (state.type) {
      document.body.style.overflow = 'hidden'
      setTimeout(() => bodyRef.current?.scrollTo(0, 0), 10)
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [state.type])

  useEffect(() => {
    return () => { drag.current = null }
  }, [])

  const onResizeStart = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    const box = boxRef.current
    if (!box) return
    const rect = box.getBoundingClientRect()
    drag.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: rect.width,
      startH: rect.height,
    }
    let rafId = null

    function onMove(ev) {
      if (!drag.current || !box) return
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        if (!drag.current) return
        const { startX, startY, startW, startH } = drag.current
        const newW = Math.max(320, Math.min(window.innerWidth - 48, startW + (ev.clientX - startX)))
        const newH = Math.max(260, Math.min(window.innerHeight - 48, startH + (ev.clientY - startY)))
        box.style.width = newW + 'px'
        box.style.height = newH + 'px'
        box.style.maxWidth = 'none'
        box.style.maxHeight = 'none'
      })
    }

    function onUp() {
      if (rafId) cancelAnimationFrame(rafId)
      if (!drag.current || !box) return
      const rect = box.getBoundingClientRect()
      setSize({ w: rect.width, h: rect.height })
      drag.current = null
      justResized.current = true
      setTimeout(() => { justResized.current = false }, 100)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [])

  if (!state.type) return null

  const entry = MODAL_REGISTRY[state.type] || { icon: '📊', title: state.type, sub: '', Component: () => null }
  const { Component } = entry
  const subtitle = getSubtitle(state.type, state.data, entry)
  const contentProps = getContentProps(state.type, state.data, rows)

  const boxStyle = size.w
    ? { width: size.w + 'px', height: size.h + 'px', maxWidth: 'none', maxHeight: 'none' }
    : {}

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={entry.title}
      onClick={e => { if (e.target === e.currentTarget && !justResized.current) onClose() }}>
      <div className="modal-box" ref={boxRef} style={boxStyle}>

        <div className="modal-flame" />

        <div className="modal-hdr">
          <div className="modal-hdr-l">
            <span className="modal-ico">{entry.icon}</span>
            <div>
              <div className="modal-title">{entry.title}</div>
              <div className="modal-sub">{subtitle}</div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Fechar">✕</button>
        </div>

        <div className="modal-body" ref={bodyRef}>
          <Component {...contentProps} />
        </div>

        <div
          className="modal-resize-handle"
          onMouseDown={onResizeStart}
          title="Arrastar para redimensionar"
          aria-hidden="true"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M9 1L1 9M9 5L5 9M9 9H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>

      </div>
    </div>
  )
}
