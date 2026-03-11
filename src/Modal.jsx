import { useEffect, useRef, useState } from 'react'
import { normTipo, normFeedback } from './lib/utils'

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
  const n = normFeedback(fb)  // retorna 'Positivo' | 'Negativo' | 'Neutro'
  const cls = n === 'Positivo' ? 'mb-positivo' : n === 'Negativo' ? 'mb-negativo' : 'mb-neutro'
  const ico = n === 'Positivo' ? '↑' : n === 'Negativo' ? '↓' : '→'
  return <span className={`mb-badge ${cls}`}>{ico} {n}</span>
}
function TBadge({ tipo }) {
  const cls = { Reservas: 'mb-res', Cardapio: 'mb-car', Localizacao: 'mb-loc' }
  return <span className={`mb-badge ${cls[tipo] || 'mb-out'}`}>{tipo}</span>
}
function TurnoBadge({ turno }) {
  if (!turno) return null
  const isA = ['manha', 'manhã', 'almoco', 'almoço'].includes(turno.toLowerCase())
  return <span className={`mb-badge ${isA ? 'mb-almoco' : 'mb-jantar'}`}>{turno}</span>
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

/* ── Conteúdo: Satisfação ── */
function ContentSatisf({ rows }) {
  const comFeedback = rows.filter(r => r.feedback_empresa)
  const pos = comFeedback.filter(r => normFeedback(r.feedback_empresa) === 'Positivo').length
  const neu = comFeedback.filter(r => normFeedback(r.feedback_empresa) === 'Neutro').length
  const neg = comFeedback.filter(r => normFeedback(r.feedback_empresa) === 'Negativo').length
  const total = comFeedback.length || 1

  return (
    <>
      <div className="mstats">
        <StatRow value={pos} label="Positivos" sub={Math.round(pos / total * 100) + '%'} />
        <StatRow value={neu} label="Neutros"   sub={Math.round(neu / total * 100) + '%'} />
        <StatRow value={neg} label="Negativos" sub={Math.round(neg / total * 100) + '%'} />
        <StatRow value={comFeedback.length} label="Com feedback" />
      </div>
      {comFeedback.length > 0 && (
        <div className="msent-wrap">
          <div className="msent-bar">
            {pos > 0 && <div className="msent-pos" style={{ width: Math.round(pos / total * 100) + '%' }} />}
            {neu > 0 && <div className="msent-neu" style={{ width: Math.round(neu / total * 100) + '%' }} />}
            {neg > 0 && <div className="msent-neg" style={{ width: Math.round(neg / total * 100) + '%' }} />}
          </div>
          <div className="msent-leg">
            <span className="msent-li msent-pos-li">↑ Positivo</span>
            <span className="msent-li msent-neu-li">→ Neutro</span>
            <span className="msent-li msent-neg-li">↓ Negativo</span>
          </div>
        </div>
      )}
      <div className="msec-title">Feedbacks recebidos</div>
      {comFeedback.length === 0
        ? <div className="mempty">Nenhum feedback neste período</div>
        : comFeedback.map((r, i) => (
          <div className="mrow" key={i}>
            <div className="mrow-hora">
              <span className="mrow-h">{fmt(r.hora)}</span>
              <span className="mrow-d">{fmtData(r.data)}</span>
            </div>
            <div className="mrow-info">
              <div className="mrow-cli">{r.nome_cliente || r.numero_cliente || 'Desconhecido'}</div>
              {r.assunto_feedback && <div className="mrow-det">"{r.assunto_feedback}"</div>}
            </div>
            <div className="mrow-badges">
              <FBadge fb={r.feedback_empresa} />
            </div>
          </div>
        ))
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

/* ── Conteúdo: Turno (Almoço/Jantar por dia) ── */
function ContentTurno({ rows, dia }) {
  const filtered = dia ? rows.filter(r => {
    const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    const diaRow = DIAS[new Date(r.data + 'T12:00:00').getDay()]
    return diaRow === dia
  }) : rows

  const almoco = filtered.filter(r => {
    const t = (r.turno || '').toLowerCase()
    return ['manha', 'manhã', 'almoco', 'almoço'].includes(t)
  })
  const jantar = filtered.filter(r => {
    const t = (r.turno || '').toLowerCase()
    return !['manha', 'manhã', 'almoco', 'almoço'].includes(t)
  })

  return (
    <>
      <div className="mstats">
        <StatRow value={almoco.length} label="Almoço" sub={dia || 'período'} />
        <StatRow value={jantar.length} label="Jantar" sub={dia || 'período'} />
        <StatRow value={filtered.length} label="Total" />
      </div>
      {almoco.length > 0 && (
        <>
          <div className="msec-title">☀️ Almoço</div>
          {almoco.map((r, i) => <MRow key={i} row={r} />)}
        </>
      )}
      {jantar.length > 0 && (
        <>
          <div className="msec-title">🌙 Jantar / Noite</div>
          {jantar.map((r, i) => <MRow key={i} row={r} />)}
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

/* ══ MODAL BASE ═══════════════════════════════════════════════════════════════ */
const MODAL_TITLES = {
  total:    { icon: '💬', title: 'Total de Atendimentos', sub: 'Todos os registros do período' },
  reservas: { icon: '🍖', title: 'Reservas Realizadas',   sub: 'Clientes que solicitaram reserva' },
  satisf:   { icon: '⭐', title: 'Satisfação Geral',       sub: 'Feedbacks recebidos no período' },
  pico:     { icon: '🔥', title: 'Horário de Pico',        sub: 'Distribuição de volume por hora' },
  tipo:     { icon: '🍽', title: 'Tipo de Atendimento',   sub: 'Detalhes por categoria' },
  turno:    { icon: '🕐', title: 'Almoço × Jantar',        sub: 'Distribuição por turno' },
  registro: { icon: '📋', title: 'Detalhes do Atendimento', sub: 'Ficha completa' },
}

export function Modal({ state, onClose, rawRows }) {
  const boxRef = useRef(null)
  const bodyRef = useRef(null)
  const drag = useRef(null)
  const justResized = useRef(false)   // evita fechar o modal ao soltar após resize
  const rows = rawRows || []

  // Tamanho persistente — só muda quando o usuário arrastar deliberadamente
  const [size, setSize] = useState({ w: null, h: null })

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

  // Limpeza de segurança: remove listeners caso o componente desmonte durante drag
  useEffect(() => {
    return () => {
      if (drag.current) {
        drag.current = null
      }
    }
  }, [])

  function onResizeStart(e) {
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

    function onMove(ev) {
      if (!drag.current || !box) return
      const { startX, startY, startW, startH } = drag.current
      const newW = Math.max(320, Math.min(window.innerWidth - 48, startW + (ev.clientX - startX)))
      const newH = Math.max(260, Math.min(window.innerHeight - 48, startH + (ev.clientY - startY)))
      box.style.width = newW + 'px'
      box.style.height = newH + 'px'
      box.style.maxWidth = 'none'
      box.style.maxHeight = 'none'
    }

    function onUp() {
      if (!drag.current || !box) return
      const rect = box.getBoundingClientRect()
      setSize({ w: rect.width, h: rect.height })
      drag.current = null
      // Marca que acabou de redimensionar para bloquear o click no backdrop
      justResized.current = true
      setTimeout(() => { justResized.current = false }, 100)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  if (!state.type) return null

  const meta = MODAL_TITLES[state.type] || { icon: '📊', title: state.type, sub: '' }

  let content
  if (state.type === 'total')    content = <ContentTotal   rows={rows} />
  if (state.type === 'reservas') content = <ContentReservas rows={rows} />
  if (state.type === 'satisf')   content = <ContentSatisf  rows={rows} />
  if (state.type === 'pico')     content = <ContentPico    rows={rows} />
  if (state.type === 'tipo')     content = <ContentTipo    rows={rows} tipo={state.data} />
  if (state.type === 'turno')    content = <ContentTurno   rows={rows} dia={state.data} />
  if (state.type === 'registro') content = <ContentRegistro row={state.data} />

  const subtitle = state.type === 'tipo' ? `Categoria: ${state.data}`
    : state.type === 'turno' ? (state.data ? `Dia: ${state.data}` : 'Período completo')
      : meta.sub

  // Aplica tamanho salvo; se ainda não foi redimensionado usa as classes CSS
  const boxStyle = size.w
    ? { width: size.w + 'px', height: size.h + 'px', maxWidth: 'none', maxHeight: 'none' }
    : {}

  return (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget && !justResized.current) onClose() }}>
      <div className="modal-box" ref={boxRef} style={boxStyle}>

        {/* Flame bar */}
        <div className="modal-flame" />

        {/* Header — não rola junto com o conteúdo */}
        <div className="modal-hdr">
          <div className="modal-hdr-l">
            <span className="modal-ico">{meta.icon}</span>
            <div>
              <div className="modal-title">{meta.title}</div>
              <div className="modal-sub">{subtitle}</div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Fechar">✕</button>
        </div>

        {/* Body scrollável */}
        <div className="modal-body" ref={bodyRef}>
          {content}
        </div>

        {/* Handle de redimensionamento — canto inferior direito */}
        <div
          className="modal-resize-handle"
          onMouseDown={onResizeStart}
          title="Arrastar para redimensionar"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M9 1L1 9M9 5L5 9M9 9H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>

      </div>
    </div>
  )
}
