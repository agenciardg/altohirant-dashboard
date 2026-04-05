import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { normTipo, normFeedback, normTurno, isDiurno } from './lib/utils'
import { TipoBadge, StBadge, TurnoBadge } from './components/Badges'
import { DIAS_ABREV } from './lib/constants'
import { supabase } from './lib/supabase'

/* ── Helpers ── */
function fmt(hora) { return hora ? hora.slice(0, 5) : '--' }
function fmtData(data) {
  if (!data) return '--'
  const [y, m, d] = data.split('-')
  return `${d}/${m}/${y}`
}

/* ── Botão copiar telefone ── */
function CopyPhone({ numero }) {
  const [copied, setCopied] = useState(false)
  if (!numero) return null
  const handleCopy = (e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(numero)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <span onClick={handleCopy} style={{
      cursor: 'pointer', marginLeft: 4, fontSize: 11,
      opacity: copied ? 1 : 0.5, transition: 'opacity 0.2s',
      position: 'relative', display: 'inline-block',
    }} title={`Copiar: ${numero}`}>
      {copied ? <span style={{ color: '#22C55E' }}>✓</span> : '📋'}
      {copied && (
        <span style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          background: 'rgba(34,197,94,0.95)', color: '#fff',
          fontSize: 14, fontWeight: 700, letterSpacing: '0.04em',
          padding: '12px 24px', borderRadius: 10, whiteSpace: 'nowrap',
          pointerEvents: 'none', zIndex: 99999,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          animation: 'fadeIn 0.15s ease',
        }}>
          Telefone copiado!
        </span>
      )}
    </span>
  )
}

/* ── Wait time helper ── */
function calcEspera(data, hora) {
  if (!data || !hora) return null
  const dt = new Date(`${data}T${hora}`)
  const diffMs = Date.now() - dt.getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 60) return { text: `${mins}min`, danger: false }
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return { text: `${hrs}h`, danger: hrs >= 4 }
  const days = Math.floor(hrs / 24)
  return { text: `${days}d`, danger: true }
}

/* ── Tabela padrão para listagem de registros nos modais ── */
function MTable({ rows, onClickRow, onMarkAtendido, refetchData, selectedRowId }) {
  const rowRefs = useRef({})

  useEffect(() => {
    if (selectedRowId != null && rowRefs.current[selectedRowId]) {
      rowRefs.current[selectedRowId].scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [selectedRowId])

  if (!rows || rows.length === 0) return null
  const hasAguardando = rows.some(r => r.necessita_humano)
  return (
    <div className="tscr">
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Data</th><th>Hora</th><th>Cliente</th><th>Tipo</th><th>Turno</th><th>Feedback</th>
            {hasAguardando && <th>Espera</th>}
            {hasAguardando && onMarkAtendido && <th>Ação</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const espera = hasAguardando && r.necessita_humano ? calcEspera(r.data, r.hora) : null
            const isSelected = selectedRowId != null && r.id === selectedRowId
            return (
              <tr key={i}
                ref={el => { if (el) rowRefs.current[r.id] = el; else delete rowRefs.current[r.id] }}
                style={{
                  cursor: 'pointer',
                  background: isSelected ? 'rgba(232,160,32,0.18)' : undefined,
                  outline: isSelected ? '1px solid rgba(232,160,32,0.5)' : undefined,
                  transition: 'background 0.2s',
                }}
                onClick={() => onClickRow && onClickRow(r)}
                title="Clique para ver conversa">
                <td style={{ color: 'var(--t3)', fontSize: 11, fontFamily: 'monospace' }}>#{String(i + 1).padStart(3, '0')}</td>
                <td style={{ fontSize: 11, color: 'var(--t2)', whiteSpace: 'nowrap' }}>{fmtData(r.data)}</td>
                <td style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 13 }}>{fmt(r.hora)}</td>
                <td style={{ fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                    <span>{r.nome_cliente || r.numero_cliente || 'Desconhecido'}</span>
                    <CopyPhone numero={r.numero_cliente} />
                  </div>
                </td>
                <td><TipoBadge tipo={normTipo(r.tipo_atendimento)} /></td>
                <td><TurnoBadge turno={normTurno(r.turno)} /></td>
                <td><StBadge st={normFeedback(r.feedback_empresa)} /></td>
                {hasAguardando && (
                  <td>
                    {espera
                      ? <span style={{ fontSize: 11, fontWeight: 700, color: espera.danger ? '#EF4444' : 'var(--t2)' }}>{espera.text}</span>
                      : <span style={{ color: 'var(--t3)', fontSize: 11 }}>—</span>
                    }
                  </td>
                )}
                {hasAguardando && onMarkAtendido && (
                  <td>
                    {r.necessita_humano && (
                      <button onClick={(e) => { e.stopPropagation(); onMarkAtendido(r.id) }} style={{
                        fontSize: 9, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
                        padding: '4px 10px', borderRadius: 8,
                        border: '1px solid rgba(232,93,4,0.4)',
                        background: 'linear-gradient(135deg, rgba(232,93,4,0.08), rgba(232,93,4,0.15))',
                        color: '#F97316', cursor: 'pointer',
                        transition: 'all 0.18s',
                      }}>ATENDIDO</button>
                    )}
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/* ── Stat summary (agora clicável como filtro) ── */
function StatRow({ label, value, sub, onClick, active }) {
  return (
    <div className={`mstat${active ? ' mstat--active' : ''}`} onClick={onClick || undefined}>
      <div className="mstat-val">{value}</div>
      <div className="mstat-lbl">{label}</div>
      {sub && <div className="mstat-sub">{sub}</div>}
    </div>
  )
}

/* ── Conteúdo: Total Atendimentos ── */
function ContentTotal({ rows, onClickRow, selectedRowId }) {
  const [filter, setFilter] = useState(null)
  const total = rows.length
  const porTipo = {}
  rows.forEach(r => {
    const t = normTipo(r.tipo_atendimento)
    porTipo[t] = (porTipo[t] || 0) + 1
  })
  const clientesUnicos = new Set(rows.map(r => r.numero_cliente).filter(Boolean)).size
  const foraH = rows.filter(r => r.fora_horario).length
  const toggle = k => setFilter(f => f === k ? null : k)

  const filtered = filter === 'fora' ? rows.filter(r => r.fora_horario)
    : filter === 'clientes' ? rows
    : filter ? rows.filter(r => normTipo(r.tipo_atendimento) === filter)
    : rows

  return (
    <>
      <div className="mstats">
        <StatRow value={total} label="Total" active={!filter} onClick={() => setFilter(null)} />
        <StatRow value={clientesUnicos} label="Clientes únicos" active={filter === 'clientes'} onClick={() => toggle('clientes')} />
        <StatRow value={foraH} label="Fora horário" sub={total ? Math.round(foraH / total * 100) + '%' : '—'} active={filter === 'fora'} onClick={() => toggle('fora')} />
        {Object.entries(porTipo).map(([t, v]) => (
          <StatRow key={t} value={v} label={t} sub={total ? Math.round(v / total * 100) + '%' : '—'} active={filter === t} onClick={() => toggle(t)} />
        ))}
      </div>
      <div className="modal-scroll">
        <div className="msec-title">{filter && filter !== 'clientes' ? `Filtrado: ${filter === 'fora' ? 'Fora do horário' : filter}` : 'Todos os atendimentos'} ({filtered.length})</div>
        {filtered.length === 0
          ? <div className="mempty">Nenhum atendimento neste período</div>
          : <MTable rows={filtered} onClickRow={onClickRow} selectedRowId={selectedRowId} />
        }
      </div>
    </>
  )
}

/* ── Conteúdo: Reservas ── */
function ContentReservas({ rows, onClickRow, selectedRowId }) {
  const [filter, setFilter] = useState(null)
  const reservas = rows.filter(r => r.reserva_solicitada)
  const semReserva = rows.filter(r => !r.reserva_solicitada)
  const toggle = k => setFilter(f => f === k ? null : k)
  const filtered = filter === 'reservas' ? reservas : filter === 'sem' ? semReserva : rows

  return (
    <>
      <div className="mstats">
        <StatRow value={reservas.length} label="Reservas" active={filter === 'reservas'} onClick={() => toggle('reservas')} />
        <StatRow value={rows.length ? Math.round(reservas.length / rows.length * 100) + '%' : '—'} label="Taxa" sub="do total" active={!filter} onClick={() => setFilter(null)} />
      </div>
      <div className="modal-scroll">
        <div className="msec-title">{filter === 'reservas' ? 'Com reserva' : filter === 'sem' ? 'Sem reserva' : 'Todos'} ({filtered.length})</div>
        {filtered.length === 0
          ? <div className="mempty">Nenhuma reserva neste período</div>
          : <MTable rows={filtered} onClickRow={onClickRow} selectedRowId={selectedRowId} />
        }
      </div>
    </>
  )
}

/* ── Conteúdo: Fora do Horário ── */
function ContentFora({ rows, onClickRow, selectedRowId }) {
  const [filter, setFilter] = useState('fora')
  const fora = rows.filter(r => r.fora_horario)
  const noHorario = rows.filter(r => !r.fora_horario)
  const total = rows.length || 1
  const pct = Math.round((fora.length / total) * 100)
  const toggle = k => setFilter(f => f === k ? null : k)
  const filtered = filter === 'fora' ? fora : filter === 'no' ? noHorario : rows

  return (
    <>
      <div className="mstats">
        <StatRow value={fora.length} label="Fora do horário" sub={`${pct}% do total`} active={filter === 'fora'} onClick={() => toggle('fora')} />
        <StatRow value={noHorario.length} label="No horário" active={filter === 'no'} onClick={() => toggle('no')} />
        <StatRow value={rows.length} label="Total" active={!filter} onClick={() => setFilter(null)} />
      </div>
      <div className="modal-scroll">
        <div className="msec-title">{filter === 'fora' ? 'Fora do horário' : filter === 'no' ? 'No horário' : 'Todos'} ({filtered.length})</div>
        {filtered.length === 0
          ? <div className="mempty">Nenhum atendimento nesta categoria</div>
          : <MTable rows={filtered} onClickRow={onClickRow} selectedRowId={selectedRowId} />
        }
      </div>
    </>
  )
}

/* ── Conteúdo: Horário de Pico ── */
function ContentPico({ rows, onClickRow, selectedRowId }) {
  const [filter, setFilter] = useState(null)
  const counts = {}
  rows.forEach(r => {
    const h = parseInt((r.hora || '00').split(':')[0])
    counts[h] = (counts[h] || 0) + 1
  })
  const sorted = Object.entries(counts).sort((a, b) => Number(a[0]) - Number(b[0]))
  const maxVal = Math.max(...Object.values(counts), 1)
  const picoH = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]

  const turnoCounts = {}
  rows.forEach(r => { if (r.turno) { const t = normTurno(r.turno); turnoCounts[t] = (turnoCounts[t] || 0) + 1 } })
  const turnoSorted = Object.entries(turnoCounts).sort((a, b) => b[1] - a[1])
  const toggle = k => setFilter(f => f === k ? null : k)

  const filtered = filter === 'pico' && picoH ? rows.filter(r => parseInt((r.hora || '00').split(':')[0]) === Number(picoH[0]))
    : filter ? rows.filter(r => normTurno(r.turno) === filter)
    : rows

  return (
    <>
      <div className="mstats">
        {picoH && <StatRow value={`${parseInt(picoH[0])}h`} label="Pico máximo" sub={`${picoH[1]} atend.`} active={filter === 'pico'} onClick={() => toggle('pico')} />}
        {turnoSorted[0] && <StatRow value={turnoSorted[0][0]} label="Turno pico" sub={`${turnoSorted[0][1]} atend.`} active={filter === turnoSorted[0][0]} onClick={() => toggle(turnoSorted[0][0])} />}
        <StatRow value={rows.length} label="Total" active={!filter} onClick={() => setFilter(null)} />
      </div>

      <div className="modal-scroll">
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

        {filter && (
          <>
            <div className="msec-title" style={{ marginTop: 24 }}>Registros filtrados ({filtered.length})</div>
            {filtered.length === 0
              ? <div className="mempty">Nenhum registro</div>
              : <MTable rows={filtered} onClickRow={onClickRow} selectedRowId={selectedRowId} />
            }
          </>
        )}
      </div>
    </>
  )
}

/* ── Conteúdo: Feedbacks / Satisfação ── */
function ContentFeedback({ rows, onClickRow, selectedRowId }) {
  const [filter, setFilter] = useState(null)
  const comFeedback = rows.filter(r => r.feedback_empresa != null && r.feedback_empresa !== '')
  const positivos = comFeedback.filter(r => normFeedback(r.feedback_empresa) === 'Positivo')
  const negativos = comFeedback.filter(r => normFeedback(r.feedback_empresa) === 'Negativo')
  const neutros = comFeedback.filter(r => normFeedback(r.feedback_empresa) === 'Neutro')
  const sem = rows.filter(r => !r.feedback_empresa || r.feedback_empresa === '')
  const total = rows.length || 1

  const satisfacao = (positivos.length + negativos.length) > 0
    ? Math.round((positivos.length / (positivos.length + negativos.length)) * 100)
    : null
  const taxaFeedback = Math.round((comFeedback.length / total) * 100)
  const toggle = k => setFilter(f => f === k ? null : k)

  const filtered = filter === 'pos' ? positivos
    : filter === 'neg' ? negativos
    : filter === 'neutro' ? neutros
    : filter === 'sem' ? sem
    : comFeedback

  const assuntos = {}
  const assuntoSource = filter ? filtered : comFeedback
  assuntoSource.filter(r => r.feedback_empresa != null).forEach(r => {
    const a = r.assunto_feedback || 'outro'
    assuntos[a] = (assuntos[a] || 0) + 1
  })
  const assuntosSorted = Object.entries(assuntos).sort((a, b) => b[1] - a[1])

  return (
    <>
      <div className="mstats">
        {satisfacao != null && <StatRow value={`${satisfacao}%`} label="Satisfação" sub="pos / (pos+neg)" active={!filter} onClick={() => setFilter(null)} />}
        <StatRow value={positivos.length} label="Positivos" sub={comFeedback.length ? Math.round(positivos.length / comFeedback.length * 100) + '%' : '—'} active={filter === 'pos'} onClick={() => toggle('pos')} />
        <StatRow value={negativos.length} label="Negativos" sub={comFeedback.length ? Math.round(negativos.length / comFeedback.length * 100) + '%' : '—'} active={filter === 'neg'} onClick={() => toggle('neg')} />
        <StatRow value={neutros.length} label="Neutros" active={filter === 'neutro'} onClick={() => toggle('neutro')} />
        <StatRow value={sem.length} label="Sem feedback" sub={Math.round(sem.length / total * 100) + '%'} active={filter === 'sem'} onClick={() => toggle('sem')} />
      </div>

      <div className="modal-scroll">
        {assuntosSorted.length > 0 && (
          <>
            <div className="msec-title">Assuntos de feedback</div>
            <div className="mpico-chart" style={{ marginBottom: 20 }}>
              {assuntosSorted.map(([a, v]) => (
                <div key={a} className="mpico-row">
                  <div className="mpico-lbl" style={{ textTransform: 'capitalize' }}>{a}</div>
                  <div className="mpico-bar-wrap">
                    <div className="mpico-bar" style={{ width: Math.round((v / (assuntoSource.length || 1)) * 100) + '%', background: '#F97316' }} />
                  </div>
                  <div className="mpico-val">{v}</div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="msec-title">{filter === 'pos' ? 'Positivos' : filter === 'neg' ? 'Negativos' : filter === 'neutro' ? 'Neutros' : filter === 'sem' ? 'Sem feedback' : 'Todos com feedback'} ({filtered.length})</div>
        {filtered.length === 0
          ? <div className="mempty">Nenhum registro nesta categoria</div>
          : <MTable rows={filtered} onClickRow={onClickRow} selectedRowId={selectedRowId} />
        }
      </div>
    </>
  )
}

/* ── Conteúdo: Clientes Únicos ── */
function ContentClientes({ rows }) {
  const [filter, setFilter] = useState(null)
  const grouped = {}
  rows.forEach(r => {
    const key = r.numero_cliente || 'desconhecido'
    if (!grouped[key]) grouped[key] = { nome: r.nome_cliente || key, numero: key, atendimentos: [] }
    if (r.nome_cliente && grouped[key].nome === key) grouped[key].nome = r.nome_cliente
    grouped[key].atendimentos.push(r)
  })
  const clientes = Object.values(grouped).sort((a, b) => b.atendimentos.length - a.atendimentos.length)
  const total = rows.length
  const recorrentes = clientes.filter(c => c.atendimentos.length > 1)
  const unicos = clientes.filter(c => c.atendimentos.length === 1)
  const toggle = k => setFilter(f => f === k ? null : k)

  const filtered = filter === 'recorrentes' ? recorrentes : filter === 'unicos' ? unicos : clientes

  return (
    <>
      <div className="mstats">
        <StatRow value={clientes.length} label="Clientes únicos" active={!filter} onClick={() => setFilter(null)} />
        <StatRow value={recorrentes.length} label="Recorrentes" sub={`${clientes.length ? Math.round(recorrentes.length / clientes.length * 100) : 0}%`} active={filter === 'recorrentes'} onClick={() => toggle('recorrentes')} />
        <StatRow value={total} label="Atendimentos" />
        <StatRow value={total && clientes.length ? (total / clientes.length).toFixed(1) : '—'} label="Média / cliente" />
      </div>
      <div className="modal-scroll">
        <div className="msec-title">{filter === 'recorrentes' ? 'Clientes recorrentes' : filter === 'unicos' ? 'Clientes com 1 atendimento' : 'Todos os clientes'} ({filtered.length})</div>
        {filtered.length === 0
          ? <div className="mempty">Nenhum cliente neste período</div>
          : <div className="tscr">
              <table>
                <thead>
                  <tr><th>Qtd</th><th>Cliente</th><th>Tipos</th><th>Tags</th></tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => (
                    <tr key={i}>
                      <td style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 14, textAlign: 'center' }}>{c.atendimentos.length}×</td>
                      <td style={{ fontWeight: 600 }}>
                        {c.nome}
                        {c.nome !== c.numero && <div style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 400 }}>{c.numero}</div>}
                      </td>
                      <td style={{ fontSize: 11 }}>{[...new Set(c.atendimentos.map(r => normTipo(r.tipo_atendimento)))].join(', ')}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {c.atendimentos.some(r => r.reserva_solicitada) && <TipoBadge tipo="Reservas" />}
                          {c.atendimentos.some(r => r.eh_aniversario) && <span className="b baniv">Niver</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        }
      </div>
    </>
  )
}

/* ── Conteúdo: Reclamações ── */
function ContentReclamacoes({ rows, onClickRow, selectedRowId }) {
  const [filter, setFilter] = useState('recl')
  const reclamacoes = rows.filter(r => normTipo(r.tipo_atendimento) === 'Reclamacao')
  const outros = rows.filter(r => normTipo(r.tipo_atendimento) !== 'Reclamacao')
  const total = rows.length || 1
  const pct = Math.round((reclamacoes.length / total) * 100)
  const toggle = k => setFilter(f => f === k ? null : k)
  const filtered = filter === 'recl' ? reclamacoes : filter === 'outros' ? outros : rows

  const assuntos = {}
  reclamacoes.forEach(r => {
    const a = r.assunto_feedback || 'outro'
    assuntos[a] = (assuntos[a] || 0) + 1
  })
  const assuntosSorted = Object.entries(assuntos).sort((a, b) => b[1] - a[1])

  return (
    <>
      <div className="mstats">
        <StatRow value={reclamacoes.length} label="Reclamações" sub={`${pct}% do total`} active={filter === 'recl'} onClick={() => toggle('recl')} />
        <StatRow value={rows.length} label="Total interações" active={!filter} onClick={() => setFilter(null)} />
      </div>
      <div className="modal-scroll">
        {assuntosSorted.length > 0 && (
          <>
            <div className="msec-title">Assuntos das reclamações</div>
            <div className="mpico-chart" style={{ marginBottom: 20 }}>
              {assuntosSorted.map(([a, v]) => (
                <div key={a} className="mpico-row">
                  <div className="mpico-lbl" style={{ textTransform: 'capitalize' }}>{a}</div>
                  <div className="mpico-bar-wrap">
                    <div className="mpico-bar" style={{ width: Math.round((v / reclamacoes.length) * 100) + '%', background: '#DC2626' }} />
                  </div>
                  <div className="mpico-val">{v}</div>
                </div>
              ))}
            </div>
          </>
        )}
        <div className="msec-title">{filter === 'recl' ? 'Reclamações' : 'Todos'} ({filtered.length})</div>
        {filtered.length === 0
          ? <div className="mempty">Nenhuma reclamação neste período</div>
          : <MTable rows={filtered} onClickRow={onClickRow} selectedRowId={selectedRowId} />
        }
      </div>
    </>
  )
}

/* ── Conteúdo: Aniversários ── */
function ContentAniversarios({ rows, onClickRow, selectedRowId }) {
  const [filter, setFilter] = useState('aniv')
  const aniversarios = rows.filter(r => r.eh_aniversario)
  const naoAniv = rows.filter(r => !r.eh_aniversario)
  const clientesUnicos = new Set(aniversarios.map(r => r.numero_cliente).filter(Boolean)).size
  const mediaGrupo = aniversarios.filter(r => r.qtd_pessoas).length > 0
    ? (aniversarios.filter(r => r.qtd_pessoas).reduce((s, r) => s + r.qtd_pessoas, 0) / aniversarios.filter(r => r.qtd_pessoas).length).toFixed(1)
    : '—'
  const toggle = k => setFilter(f => f === k ? null : k)
  const filtered = filter === 'aniv' ? aniversarios : rows

  return (
    <>
      <div className="mstats">
        <StatRow value={clientesUnicos} label="Aniversariantes" active={filter === 'aniv'} onClick={() => toggle('aniv')} />
        <StatRow value={aniversarios.length} label="Interações" active={!filter} onClick={() => setFilter(null)} />
        <StatRow value={mediaGrupo} label="Média pessoas/grupo" />
      </div>
      <div className="modal-scroll">
        <div className="msec-title">{filter === 'aniv' ? 'Aniversariantes' : 'Todos'} ({filtered.length})</div>
        {filtered.length === 0
          ? <div className="mempty">Nenhum aniversário neste período</div>
          : <MTable rows={filtered} onClickRow={onClickRow} selectedRowId={selectedRowId} />
        }
      </div>
    </>
  )
}

/* ── Conteúdo: Interesse por Programação ── */
function ContentProgramacao({ rows, onClickRow, selectedRowId }) {
  const [filter, setFilter] = useState('prog')
  const progRows = rows.filter(r => normTipo(r.tipo_atendimento) === 'Programacao')
  const total = rows.length || 1
  const pct = Math.round((progRows.length / total) * 100)
  const toggle = k => setFilter(f => f === k ? null : k)
  const filtered = filter === 'prog' ? progRows : rows

  const counts = {}
  rows.forEach(r => {
    if (r.dia_programacao_interesse) {
      counts[r.dia_programacao_interesse] = (counts[r.dia_programacao_interesse] || 0) + 1
    }
  })
  const ranking = Object.entries(counts).sort((a, b) => b[1] - a[1])
  const maxVal = ranking.length > 0 ? ranking[0][1] : 1
  const diasLabel = { segunda: 'Segunda', terca: 'Terça', quarta: 'Quarta', quinta: 'Quinta', sexta: 'Sexta', sabado: 'Sábado', domingo: 'Domingo' }

  return (
    <>
      <div className="mstats">
        <StatRow value={progRows.length} label="Programação" sub={`${pct}% do total`} active={filter === 'prog'} onClick={() => toggle('prog')} />
        <StatRow value={rows.length} label="Total interações" active={!filter} onClick={() => setFilter(null)} />
      </div>

      <div className="modal-scroll">
        {ranking.length > 0 && (
          <>
            <div className="msec-title">Ranking — Dias mais perguntados</div>
            <div className="mpico-chart" style={{ marginBottom: 20 }}>
              {ranking.map(([dia, v], i) => (
                <div key={dia} className="mpico-row">
                  <div className="mpico-lbl" style={{ textTransform: 'capitalize' }}>{diasLabel[dia] || dia}</div>
                  <div className="mpico-bar-wrap">
                    <div
                      className={`mpico-bar ${i === 0 ? 'mpico-bar-peak' : ''}`}
                      style={{ width: Math.round((v / maxVal) * 100) + '%', background: i === 0 ? '#F59E0B' : '#3B82F6' }}
                    />
                  </div>
                  <div className="mpico-val">{v} <span style={{ fontSize: 9, color: 'var(--t3)' }}>({Math.round(v / (progRows.length || 1) * 100)}%)</span></div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="msec-title">{filter === 'prog' ? 'Programação' : 'Todos'} ({filtered.length})</div>
        {filtered.length === 0
          ? <div className="mempty">Nenhuma consulta de programação neste período</div>
          : <MTable rows={filtered} onClickRow={onClickRow} selectedRowId={selectedRowId} />
        }
      </div>
    </>
  )
}

/* ── Conteúdo: Fidelização de Clientes ── */
function ContentFidelizacao({ rows, onClickRow, selectedRowId }) {
  const [filter, setFilter] = useState(null)
  const novos = rows.filter(r => !r.cliente_retornante)
  const retornantes = rows.filter(r => !!r.cliente_retornante)
  const total = rows.length || 1
  const taxa = Math.round((retornantes.length / total) * 100)
  const toggle = k => setFilter(f => f === k ? null : k)

  const clientMap = {}
  rows.forEach(r => {
    const key = r.numero_cliente || 'desconhecido'
    if (!clientMap[key]) clientMap[key] = { nome: r.nome_cliente || key, numero: key, dias: new Set(), count: 0, retornante: false }
    if (r.nome_cliente && clientMap[key].nome === key) clientMap[key].nome = r.nome_cliente
    if (r.data) clientMap[key].dias.add(r.data)
    clientMap[key].count++
    if (r.cliente_retornante) clientMap[key].retornante = true
  })
  const frequentes = Object.values(clientMap)
    .map(c => ({ ...c, diasContato: c.dias.size }))
    .filter(c => c.diasContato > 1)
    .sort((a, b) => b.diasContato - a.diasContato || b.count - a.count)
    .slice(0, 10)

  const labelTaxa = taxa >= 30 ? 'Boa retencao' : taxa >= 15 ? 'Retencao moderada' : 'Retencao baixa'
  const filtered = filter === 'novos' ? novos : filter === 'retornantes' ? retornantes : rows

  return (
    <>
      <div className="mstats">
        <StatRow value={novos.length} label="Novos" sub={`${Math.round((novos.length / total) * 100)}%`} active={filter === 'novos'} onClick={() => toggle('novos')} />
        <StatRow value={retornantes.length} label="Retornantes" sub={`${Math.round((retornantes.length / total) * 100)}%`} active={filter === 'retornantes'} onClick={() => toggle('retornantes')} />
        <StatRow value={`${taxa}%`} label="Taxa Retorno" sub={labelTaxa} active={!filter} onClick={() => setFilter(null)} />
        <StatRow value={total} label="Total" active={!filter} onClick={() => setFilter(null)} />
      </div>

      <div className="modal-scroll">
        {!filter && frequentes.length > 0 && (
          <>
            <div className="msec-title">Clientes mais frequentes (multi-dia)</div>
            <div className="tscr">
              <table>
                <thead>
                  <tr><th>Dias</th><th>Msgs</th><th>Cliente</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {frequentes.map((c, i) => (
                    <tr key={i}>
                      <td style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 14, textAlign: 'center' }}>{c.diasContato}</td>
                      <td style={{ textAlign: 'center' }}>{c.count}</td>
                      <td style={{ fontWeight: 600 }}>
                        {c.nome}
                        {c.nome !== c.numero && <div style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 400 }}>{c.numero}</div>}
                      </td>
                      <td><span className={`b ${c.retornante ? 'bp' : 'bprog'}`}>{c.retornante ? 'Retornante' : 'Novo'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="msec-title">{filter === 'novos' ? 'Clientes novos' : filter === 'retornantes' ? 'Clientes retornantes' : 'Todos os registros'} ({filtered.length})</div>
        {filtered.length === 0
          ? <div className="mempty">Nenhum registro nesta categoria</div>
          : <MTable rows={filtered} onClickRow={onClickRow} selectedRowId={selectedRowId} />
        }
      </div>
    </>
  )
}

/* ── Conteúdo: Tipo de Atendimento ── */
function ContentTipo({ rows, tipo, onClickRow, selectedRowId }) {
  const [filter, setFilter] = useState('tipo')
  const tipoRows = tipo === 'Sem dados' ? rows : rows.filter(r => normTipo(r.tipo_atendimento) === tipo)
  const outros = rows.filter(r => normTipo(r.tipo_atendimento) !== tipo)
  const toggle = k => setFilter(f => f === k ? null : k)
  const filtered = filter === 'tipo' ? tipoRows : rows

  return (
    <>
      <div className="mstats">
        <StatRow value={tipoRows.length} label={tipo} active={filter === 'tipo'} onClick={() => toggle('tipo')} />
        <StatRow value={rows.length ? Math.round(tipoRows.length / rows.length * 100) + '%' : '—'} label="Do total" active={!filter} onClick={() => setFilter(null)} />
      </div>
      <div className="modal-scroll">
        <div className="msec-title">{filter === 'tipo' ? tipo : 'Todos'} ({filtered.length})</div>
        {filtered.length === 0
          ? <div className="mempty">Nenhum atendimento deste tipo no período</div>
          : <MTable rows={filtered} onClickRow={onClickRow} selectedRowId={selectedRowId} />
        }
      </div>
    </>
  )
}

/* ── Conteúdo: Turno (Dia/Tarde x Noite por dia) ── */
function ContentTurno({ rows, dia, onClickRow, selectedRowId }) {
  const [filter, setFilter] = useState(null)
  const allFiltered = dia ? rows.filter(r => {
    const diaRow = DIAS_ABREV[new Date(r.data + 'T12:00:00').getDay()]
    return diaRow === dia
  }) : rows

  const diaTarde = allFiltered.filter(r => isDiurno(r.turno))
  const noite = allFiltered.filter(r => !isDiurno(r.turno))
  const toggle = k => setFilter(f => f === k ? null : k)
  const filtered = filter === 'almoco' ? diaTarde : filter === 'jantar' ? noite : allFiltered

  return (
    <>
      <div className="mstats">
        <StatRow value={diaTarde.length} label="Almoco / HH" sub={dia || 'periodo'} active={filter === 'almoco'} onClick={() => toggle('almoco')} />
        <StatRow value={noite.length} label="Jantar" sub={dia || 'periodo'} active={filter === 'jantar'} onClick={() => toggle('jantar')} />
        <StatRow value={allFiltered.length} label="Total" active={!filter} onClick={() => setFilter(null)} />
      </div>
      <div className="modal-scroll">
        <div className="msec-title">{filter === 'almoco' ? 'Almoco / Happy Hour' : filter === 'jantar' ? 'Jantar' : 'Todos os turnos'} ({filtered.length})</div>
        {filtered.length === 0
          ? <div className="mempty">Nenhum atendimento{dia ? ` em ${dia}` : ''}</div>
          : <MTable rows={filtered} onClickRow={onClickRow} selectedRowId={selectedRowId} />
        }
      </div>
    </>
  )
}

/* ── Conteúdo: Registro individual ── */
function ContentRegistro({ row }) {
  if (!row) return <div className="mempty">Sem dados</div>
  return (
    <div className="mreg modal-scroll">
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
          <div className="mreg-val">{row.turno ? normTurno(row.turno) : '—'}</div>
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
            <div className="mreg-lbl">{row.reserva_solicitada ? 'Reserva para' : 'Data mencionada'}</div>
            <div className="mreg-val">{fmtData(row.data_reserva_pedida)}</div>
          </div>
        )}
        <div className="mreg-field">
          <div className="mreg-lbl">Feedback</div>
          <div className="mreg-val"><StBadge st={normFeedback(row.feedback_empresa)} /></div>
        </div>
        {row.assunto_feedback && (
          <div className="mreg-field mreg-full">
            <div className="mreg-lbl">Assunto / Detalhe</div>
            <div className="mreg-val">"{row.assunto_feedback}"</div>
          </div>
        )}
        {row.tool_chamada && (
          <div className="mreg-field mreg-full">
            <div className="mreg-lbl">Ferramentas utilizadas</div>
            <div className="mreg-val" style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {row.tool_chamada.split(',').map((t, i) => (
                <span key={i} className="mb-badge mb-out" style={{ fontSize: 10 }}>{t.trim()}</span>
              ))}
            </div>
          </div>
        )}
        <div className="mreg-field">
          <div className="mreg-lbl">Fora do horário</div>
          <div className="mreg-val">{row.fora_horario ? '⚠ Sim' : 'Não'}</div>
        </div>
        {row.qtd_pessoas != null && (
          <div className="mreg-field">
            <div className="mreg-lbl">Pessoas no grupo</div>
            <div className="mreg-val">{row.qtd_pessoas}</div>
          </div>
        )}
        {row.tempo_resposta_ms != null && (
          <div className="mreg-field">
            <div className="mreg-lbl">Tempo resposta</div>
            <div className="mreg-val">{row.tempo_resposta_ms < 1000 ? `${row.tempo_resposta_ms}ms` : `${(row.tempo_resposta_ms / 1000).toFixed(1)}s`}</div>
          </div>
        )}
        {row.qtd_mensagens_sessao != null && (
          <div className="mreg-field">
            <div className="mreg-lbl">Mensagens na sessão</div>
            <div className="mreg-val">{row.qtd_mensagens_sessao}</div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Conteúdo: Conversa / Histórico de Mensagens ── */
function ContentConversa({ row }) {
  const [mensagens, setMensagens] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [matchIdx, setMatchIdx] = useState(0)
  const scrollRef = useRef(null)
  const matchRefs = useRef([])

  useEffect(() => {
    if (!row?.id) { setLoading(false); return }
    let cancelled = false
    async function fetchMensagens() {
      setLoading(true)
      const { data, error } = await supabase
        .from('alto_hirant_mensagens')
        .select('*')
        .eq('dashboard_id', row.id)
        .order('hora', { ascending: true })
      if (!cancelled) {
        setMensagens(error ? [] : (data || []))
        setLoading(false)
      }
    }
    fetchMensagens()
    return () => { cancelled = true }
  }, [row?.id])

  useEffect(() => {
    if (mensagens && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [mensagens])

  // Contar matches e resetar índice quando busca muda
  const matchCount = useMemo(() => {
    if (!busca.trim() || !mensagens) return 0
    const term = busca.toLowerCase()
    return mensagens.filter(m => (m.conteudo || '').toLowerCase().includes(term)).length
  }, [busca, mensagens])

  useEffect(() => { setMatchIdx(0) }, [busca])

  // Scroll até o match atual
  useEffect(() => {
    if (matchCount > 0 && matchRefs.current[matchIdx]) {
      matchRefs.current[matchIdx].scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [matchIdx, matchCount, busca])

  const handleSearchKey = (e) => {
    if (e.key === 'Enter' && matchCount > 0) {
      e.preventDefault()
      setMatchIdx(prev => (prev + 1) % matchCount)
    }
  }

  if (!row) return <div className="mempty">Sem dados</div>

  const fmtH = (h) => {
    if (!h) return '--:--'
    try {
      const d = new Date(h)
      if (isNaN(d)) return h.slice(11, 16) || '--:--'
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    } catch { return '--:--' }
  }

  const tipoBadge = (tipo) => {
    if (!tipo || tipo === 'texto') return null
    const labels = { audio: 'Audio', imagem: 'Imagem', pdf: 'PDF', video: 'Video', localizacao: 'Localização' }
    return <span className="chat-tipo-badge">[{labels[tipo] || tipo}]</span>
  }

  // Highlight helper: destaca termo buscado no texto
  const highlightText = (text, refIndex) => {
    if (!busca.trim() || !text) return text
    const term = busca.toLowerCase()
    const idx = text.toLowerCase().indexOf(term)
    if (idx === -1) return text
    return (
      <span ref={el => { matchRefs.current[refIndex] = el }}>
        {text.slice(0, idx)}
        <mark className="chat-search-highlight">{text.slice(idx, idx + busca.length)}</mark>
        {text.slice(idx + busca.length)}
      </span>
    )
  }

  // Índice de matches para ref tracking
  let refCounter = 0

  return (
    <div className="conversa-container">
      {/* Cabeçalho compacto — tudo em uma linha */}
      <div className="conversa-header conversa-header-compact">
        <div className="conversa-header-row">
          <div className="conversa-field">
            <span className="conversa-label">Cliente</span>
            <span className="conversa-value">{row.nome_cliente || row.numero_cliente || 'Desconhecido'}</span>
          </div>
          <div className="conversa-field">
            <span className="conversa-label">Data</span>
            <span className="conversa-value">{fmtData(row.data)}</span>
          </div>
          <div className="conversa-field">
            <span className="conversa-label">Hora</span>
            <span className="conversa-value">{fmt(row.hora)}</span>
          </div>
          <div className="conversa-field">
            <span className="conversa-label">Turno</span>
            <span className="conversa-value">{row.turno ? normTurno(row.turno) : '—'}</span>
          </div>
          <div className="conversa-field">
            <span className="conversa-label">Tipo</span>
            <span className="conversa-value"><TipoBadge tipo={normTipo(row.tipo_atendimento)} /></span>
          </div>
          <div className="conversa-field">
            <span className="conversa-label">Feedback</span>
            <span className="conversa-value"><StBadge st={normFeedback(row.feedback_empresa)} /></span>
          </div>
          {/* Pesquisa inline */}
          <div className="conversa-search-inline">
            <svg className="conversa-search-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="conversa-search-input"
              type="text"
              placeholder="Pesquisar..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              onKeyDown={handleSearchKey}
            />
            {busca.trim() && (
              <span className="conversa-search-count">
                {matchCount > 0 ? `${matchIdx + 1}/${matchCount}` : '0'}
              </span>
            )}
            {busca.trim() && matchCount > 1 && (
              <div className="conversa-search-nav">
                <button onClick={() => setMatchIdx(p => (p - 1 + matchCount) % matchCount)} className="conversa-search-nav-btn" title="Anterior">▲</button>
                <button onClick={() => setMatchIdx(p => (p + 1) % matchCount)} className="conversa-search-nav-btn" title="Próximo">▼</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Área de chat */}
      <div className="conversa-chat" ref={scrollRef}>
        {loading ? (
          <div className="mempty">Carregando mensagens...</div>
        ) : !mensagens || mensagens.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', padding: '32px 24px', margin: '20px auto', maxWidth: 320,
            borderRadius: 14, border: '1px solid rgba(232,160,32,0.3)',
            background: 'rgba(232,160,32,0.06)',
          }}>
            <span style={{ fontSize: 28, marginBottom: 10 }}>📋</span>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)', marginBottom: 6 }}>
              Histórico indisponível
            </div>
            <div style={{ fontSize: 11, color: 'var(--t2)', maxWidth: 260, lineHeight: 1.5, marginBottom: 8 }}>
              O histórico de conversas é mantido por 10 dias. Este registro é anterior a esse período.
            </div>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#e8a020' }}>
              Caso precise de acesso a mensagens mais antigas, contate a equipe da Agência RDG.
            </div>
          </div>
        ) : (
          mensagens.map((m, i) => {
            const isHelena = m.remetente === 'helena'
            const text = m.conteudo || ''
            const isMatch = busca.trim() && text.toLowerCase().includes(busca.toLowerCase())
            const currentRefIdx = isMatch ? refCounter++ : -1
            return (
              <div key={m.id || i} className={`chat-bubble ${isHelena ? 'chat-helena' : 'chat-cliente'}${isMatch && currentRefIdx === matchIdx ? ' chat-bubble-active' : ''}`}>
                <div className="chat-bubble-header">
                  <span className="chat-sender">{isHelena ? 'Helena' : 'Cliente'}</span>
                  <span className="chat-time">{fmtH(m.hora)}</span>
                </div>
                <div className="chat-content">
                  {tipoBadge(m.tipo_mensagem)}
                  {isMatch ? highlightText(text, currentRefIdx) : text}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

/* ── Conteúdo: Aguardando Atendente ── */
function ContentAguardando({ rows, onClickRow, refetchData, selectedRowId }) {
  const [marking, setMarking] = useState(null)
  const aguardando = rows.filter(r => r.necessita_humano)

  async function handleMarkAtendido(id) {
    setMarking(id)
    try {
      await supabase.from('alto_hirant_dashboard').update({ necessita_humano: false, atendido_por_humano: true, data_atendimento_humano: new Date().toISOString() }).eq('id', id)
      if (refetchData) refetchData()
    } finally { setMarking(null) }
  }

  function mask(tel) {
    if (!tel || tel.length < 4) return '***'
    return '***' + tel.slice(-4)
  }

  return (
    <>
      <div className="mstats">
        <StatRow value={aguardando.length} label="Aguardando" sub="necessitam intervenção" />
        <StatRow value={rows.length} label="Total período" />
      </div>
      <div className="modal-scroll">
        <div className="msec-title">Conversas aguardando atendente ({aguardando.length})</div>
        {aguardando.length === 0
          ? <div className="mempty">Nenhuma conversa aguardando atendente neste período</div>
          : (
            <div className="tscr">
              <table>
                <thead>
                  <tr>
                    <th>Telefone</th>
                    <th>Cliente</th>
                    <th>Tipo</th>
                    <th>Pessoas</th>
                    <th>Aniv.</th>
                    <th>Data</th>
                    <th>Hora</th>
                    <th>Reserva</th>
                  </tr>
                </thead>
                <tbody>
                  {aguardando.map((r, i) => {
                    const isSelected = selectedRowId != null && r.id === selectedRowId
                    return (
                    <tr key={i} style={{
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(232,160,32,0.18)' : undefined,
                      outline: isSelected ? '1px solid rgba(232,160,32,0.5)' : undefined,
                      transition: 'background 0.2s',
                    }}
                      onClick={() => onClickRow && onClickRow(r)}
                      title="Clique para ver conversa">
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>
                        {mask(r.numero_cliente)}
                        <CopyPhone numero={r.numero_cliente} />
                      </td>
                      <td style={{ fontWeight: 600 }}>{r.nome_cliente || 'Não informado'}</td>
                      <td><TipoBadge tipo={normTipo(r.tipo_atendimento)} /></td>
                      <td style={{ textAlign: 'center' }}>{r.qtd_pessoas || '—'}</td>
                      <td style={{ textAlign: 'center' }}>
                        {r.eh_aniversario
                          ? <span className="baniv" style={{ fontSize: 9, padding: '2px 7px' }}>Aniversário</span>
                          : <span style={{ color: 'var(--t3)', fontSize: 11 }}>—</span>
                        }
                      </td>
                      <td style={{ fontSize: 11, color: 'var(--t2)', whiteSpace: 'nowrap' }}>{fmtData(r.data)}</td>
                      <td style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 13 }}>{fmt(r.hora)}</td>
                      <td>
                        {r.reserva_solicitada
                          ? <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: 11 }}>✓ Reserva</span>
                          : <span style={{ color: 'var(--t3)', fontSize: 11 }}>—</span>
                        }
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
          )
        }
      </div>
    </>
  )
}


/* ── Conteúdo: Concluído pelo Atendente ── */
function ContentConcluido({ rows, onClickRow, refetchData }) {
  const [marking, setMarking] = useState(null)
  const concluidos = rows.filter(r => r.atendido_por_humano)

  function mask(tel) {
    if (!tel || tel.length < 4) return '***'
    return '***' + tel.slice(-4)
  }

  async function handleReabrir(id) {
    setMarking(id)
    try {
      await supabase.from('alto_hirant_dashboard').update({ necessita_humano: true, atendido_por_humano: false, data_atendimento_humano: null }).eq('id', id)
      if (refetchData) refetchData()
    } finally { setMarking(null) }
  }

  function fmtAtendimento(ts) {
    if (!ts) return '—'
    const d = new Date(ts)
    return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <>
      <div className="mstats">
        <StatRow value={concluidos.length} label="Resolvidos" sub="pelo atendente humano" />
        <StatRow value={rows.length} label="Total período" />
      </div>
      <div className="modal-scroll">
        <div className="msec-title">Conversas resolvidas pelo atendente ({concluidos.length})</div>
        {concluidos.length === 0
          ? <div className="mempty">Nenhuma conversa resolvida por atendente neste período</div>
          : (
            <div className="tscr">
              <table>
                <thead>
                  <tr><th>Telefone</th><th>Cliente</th><th>Tipo</th><th>Data</th><th>Hora</th><th>Atendido em</th><th>Reserva</th><th>Ação</th></tr>
                </thead>
                <tbody>
                  {concluidos.map((r, i) => (
                    <tr key={i} style={{ cursor: 'pointer' }} onClick={() => onClickRow && onClickRow(r)} title="Clique para ver conversa">
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{mask(r.numero_cliente)}<CopyPhone numero={r.numero_cliente} /></td>
                      <td style={{ fontWeight: 600 }}>{r.nome_cliente || 'Não informado'}</td>
                      <td><TipoBadge tipo={normTipo(r.tipo_atendimento)} /></td>
                      <td style={{ fontSize: 11, color: 'var(--t2)', whiteSpace: 'nowrap' }}>{fmtData(r.data)}</td>
                      <td style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 13 }}>{fmt(r.hora)}</td>
                      <td style={{ fontSize: 11, color: 'var(--t2)', whiteSpace: 'nowrap' }}>{fmtAtendimento(r.data_atendimento_humano)}</td>
                      <td>{r.reserva_solicitada ? <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: 11 }}>✓ Reserva</span> : <span style={{ color: 'var(--t3)', fontSize: 11 }}>—</span>}</td>
                      <td><button disabled={marking === r.id} onClick={(e) => { e.stopPropagation(); handleReabrir(r.id) }} style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 8, border: '1px solid rgba(245,158,11,0.4)', background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.15))', color: '#F59E0B', cursor: 'pointer', transition: 'all 0.18s', opacity: marking === r.id ? 0.5 : 1 }}>{marking === r.id ? '...' : 'REABRIR'}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </div>
    </>
  )
}

/* ══ MODAL REGISTRY (factory pattern) ════════════════════════════════════════ */
const MODAL_REGISTRY = {
  aguardando:   { icon: '🔔', title: 'Aguardando Atendente',     sub: 'Conversas que necessitam intervenção humana', Component: ContentAguardando, prop: 'rows' },
  concluido:    { icon: '✅', title: 'Concluído pelo Atendente',  sub: 'Conversas resolvidas por atendente humano',   Component: ContentConcluido,  prop: 'rows' },
  total:        { icon: '💬', title: 'Total de Interações',      sub: 'Todos os registros do período',       Component: ContentTotal,        prop: 'rows' },
  feedback:     { icon: '⭐', title: 'Satisfação do Cliente',    sub: 'Índice e feedbacks reais',            Component: ContentFeedback,     prop: 'rows' },
  clientes:     { icon: '👤', title: 'Clientes Únicos',          sub: 'Agrupados por número de telefone',    Component: ContentClientes,     prop: 'rows' },
  reservas:     { icon: '🍖', title: 'Solicitações de Reserva',  sub: 'Helena enviou link GetIn',            Component: ContentReservas,     prop: 'rows' },
  fora:         { icon: '🕐', title: 'Fora do Horário',          sub: 'Atendimentos fora do expediente',     Component: ContentFora,         prop: 'rows' },
  pico:         { icon: '🔥', title: 'Horário de Pico',          sub: 'Distribuição de volume por hora',     Component: ContentPico,         prop: 'rows' },
  reclamacoes:  { icon: '⚠️', title: 'Reclamações',              sub: 'Detalhes das reclamações',            Component: ContentReclamacoes,  prop: 'rows' },
  aniversarios: { icon: '🎂', title: 'Aniversários',             sub: 'Clientes aniversariantes',            Component: ContentAniversarios, prop: 'rows' },
  programacao:  { icon: '📅', title: 'Interesse por Programação', sub: 'Dias mais procurados',                Component: ContentProgramacao,  prop: 'rows' },
  fidelizacao:  { icon: '🔁', title: 'Fidelização de Clientes',  sub: 'Novos vs. Retornantes',               Component: ContentFidelizacao,  prop: 'rows' },
  tipo:         { icon: '🍽', title: 'Tipo de Atendimento',      sub: 'Detalhes por categoria',              Component: ContentTipo,         prop: 'rows' },
  turno:        { icon: '🕐', title: 'Almoço/HH × Jantar',      sub: 'Distribuição por turno',              Component: ContentTurno,        prop: 'rows' },
  registro:     { icon: '📋', title: 'Detalhes do Atendimento',  sub: 'Ficha completa',                     Component: ContentRegistro,     prop: 'row' },
  conversa:     { icon: '💬', title: 'Histórico da Conversa',    sub: 'Mensagens trocadas',                 Component: ContentConversa,     prop: 'row' },
}

function getSubtitle(type, data, meta) {
  if (type === 'tipo') return `Categoria: ${data}`
  if (type === 'turno') return data ? `Dia: ${data}` : 'Período completo'
  if (type === 'conversa' && data) return `${data.nome_cliente || data.numero_cliente || 'Cliente'} · ${fmtData(data.data)}`
  return meta.sub
}

function getContentProps(type, data, rows, selectedRowId) {
  const entry = MODAL_REGISTRY[type]
  if (!entry) return {}
  if (type === 'tipo') return { rows, tipo: data, selectedRowId }
  if (type === 'turno') return { rows, dia: data, selectedRowId }
  if (type === 'registro') return { row: data }
  if (type === 'conversa') return { row: data }
  return { rows, selectedRowId }
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
export function Modal({ state, onClose, rawRows, refetch, selectedRowId }) {
  const boxRef = useRef(null)
  const bodyRef = useRef(null)
  const drag = useRef(null)
  const justResized = useRef(false)
  const rows = rawRows || []
  const [size, setSize] = useState({ w: null, h: null })
  const [conversaRow, setConversaRow] = useState(null)

  useFocusTrap(boxRef, !!state.type)

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') {
        if (conversaRow) setConversaRow(null)
        else onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, conversaRow])

  useEffect(() => {
    if (state.type) {
      document.body.style.overflow = 'hidden'
      setTimeout(() => {
        const scroll = bodyRef.current?.querySelector('.modal-scroll')
        if (scroll) scroll.scrollTo(0, 0)
      }, 10)
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

  // Reset conversa when modal closes
  useEffect(() => {
    if (!state.type) setConversaRow(null)
  }, [state.type])

  if (!state.type) return null

  // If conversaRow is set, show the conversation modal instead
  const showConversa = !!conversaRow
  const activeType = showConversa ? 'conversa' : state.type

  const entry = MODAL_REGISTRY[activeType] || { icon: '📊', title: activeType, sub: '', Component: () => null }
  const { Component } = entry
  const subtitle = showConversa
    ? `${conversaRow.nome_cliente || conversaRow.numero_cliente || 'Cliente'} · ${fmtData(conversaRow.data)}`
    : getSubtitle(state.type, state.data, entry)
  const contentProps = showConversa
    ? { row: conversaRow }
    : { ...getContentProps(state.type, state.data, rows, selectedRowId), refetchData: refetch }

  const isConversaView = activeType === 'conversa'
  const boxStyle = size.w
    ? { width: size.w + 'px', height: size.h + 'px', maxWidth: 'none', maxHeight: 'none' }
    : isConversaView ? { maxWidth: 700, width: '70%', minWidth: 500 } : {}

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={entry.title}
      onClick={e => { if (e.target === e.currentTarget && !justResized.current) onClose() }}>
      <div className={`modal-box${showConversa ? ' modal-swap' : ''}`} ref={boxRef} style={boxStyle}>

        <div className="modal-flame" />

        <div className="modal-hdr">
          <div className="modal-hdr-l">
            {showConversa && (
              <button className="conversa-back" onClick={() => setConversaRow(null)} title="Voltar">←</button>
            )}
            <span className="modal-ico">{entry.icon}</span>
            <div>
              <div className="modal-title">{entry.title}</div>
              {!showConversa && <div className="modal-sub">{subtitle}</div>}
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Fechar">✕</button>
        </div>

        <div className="modal-body" ref={bodyRef}>
          <Component {...contentProps} onClickRow={showConversa ? undefined : setConversaRow} />
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
