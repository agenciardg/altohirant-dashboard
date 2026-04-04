import { useState, useEffect, memo } from 'react'

/*
  Horários Alto da Hirant:
  - Segunda(1), Quarta(3), Quinta(4): 18h-23h (HH 18-20, Jantar 20-23)
  - Sexta(5): 17h-00h (HH 17-20, Jantar 20-00)
  - Sábado(6): 12h-00h (Almoço 12-15, HH 15-20, Jantar 20-00)
  - Domingo(0): 12h-23h (Almoço 12-15, HH 15-20, Jantar 20-23)
  - Terça(2): FECHADO
*/

const HORARIOS = {
  1: [{ nome: 'Happy Hour', inicio: 18, fim: 20 }, { nome: 'Jantar', inicio: 20, fim: 23 }],
  3: [{ nome: 'Happy Hour', inicio: 18, fim: 20 }, { nome: 'Jantar', inicio: 20, fim: 23 }],
  4: [{ nome: 'Happy Hour', inicio: 18, fim: 20 }, { nome: 'Jantar', inicio: 20, fim: 23 }],
  5: [{ nome: 'Happy Hour', inicio: 17, fim: 20 }, { nome: 'Jantar', inicio: 20, fim: 24 }],
  6: [{ nome: 'Almoço', inicio: 12, fim: 15 }, { nome: 'Happy Hour', inicio: 15, fim: 20 }, { nome: 'Jantar', inicio: 20, fim: 24 }],
  0: [{ nome: 'Almoço', inicio: 12, fim: 15 }, { nome: 'Happy Hour', inicio: 15, fim: 20 }, { nome: 'Jantar', inicio: 20, fim: 23 }],
}

const ICONES = {
  'Almoço': '🍽️',
  'Happy Hour': '🍺',
  'Jantar': '🔥',
  'Fechado': '🔒',
}

const CORES_TURNO = {
  'Almoço': '#e8a020',
  'Happy Hour': '#F97316',
  'Jantar': '#E85D04',
  'Fechado': '#6B7280',
}

const DIAS_NOME = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

function fmtCountdown(minutos) {
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  if (h > 0) return `${h}h${m > 0 ? String(m).padStart(2, '0') : ''}`
  return `${m}min`
}

function calcTurno() {
  const now = new Date()
  const dia = now.getDay()
  const horaAtual = now.getHours() + now.getMinutes() / 60

  const turnos = HORARIOS[dia]

  if (!turnos) {
    const proximoInfo = encontrarProximaAbertura(dia, horaAtual)
    return {
      nome: 'Fechado',
      icone: '🔒',
      countdown: proximoInfo,
      ativo: false,
      turnoIndex: -1,
      totalTurnos: 0,
      progresso: 0,
      horaInicio: null,
      horaFim: null,
      allTurnos: [],
    }
  }

  for (let i = 0; i < turnos.length; i++) {
    const t = turnos[i]
    if (horaAtual >= t.inicio && horaAtual < t.fim) {
      const minutosRestantes = Math.ceil((t.fim - horaAtual) * 60)
      const duracao = t.fim - t.inicio
      const progresso = ((horaAtual - t.inicio) / duracao) * 100
      const proximo = turnos[i + 1]
      return {
        nome: t.nome,
        icone: ICONES[t.nome],
        countdown: proximo
          ? `${proximo.nome} em ${fmtCountdown(Math.ceil((proximo.inicio - horaAtual) * 60))}`
          : `Fecha em ${fmtCountdown(minutosRestantes)}`,
        ativo: true,
        turnoIndex: i,
        totalTurnos: turnos.length,
        progresso,
        horaInicio: t.inicio,
        horaFim: t.fim,
        allTurnos: turnos,
      }
    }
  }

  if (horaAtual < turnos[0].inicio) {
    const minutosAte = Math.ceil((turnos[0].inicio - horaAtual) * 60)
    return {
      nome: 'Fechado',
      icone: '🔒',
      countdown: `Abre às ${turnos[0].inicio}h (${turnos[0].nome} em ${fmtCountdown(minutosAte)})`,
      ativo: false,
      turnoIndex: -1,
      totalTurnos: turnos.length,
      progresso: 0,
      horaInicio: null,
      horaFim: null,
      allTurnos: turnos,
    }
  }

  const proximoInfo = encontrarProximaAbertura(dia, horaAtual)
  return {
    nome: 'Fechado',
    icone: '🔒',
    countdown: proximoInfo,
    ativo: false,
    turnoIndex: -1,
    totalTurnos: turnos.length,
    progresso: 0,
    horaInicio: null,
    horaFim: null,
    allTurnos: [],
  }
}

function encontrarProximaAbertura(diaAtual, horaAtual) {
  for (let offset = 1; offset <= 7; offset++) {
    const dia = (diaAtual + offset) % 7
    const turnos = HORARIOS[dia]
    if (turnos && turnos.length > 0) {
      return `Abre ${DIAS_NOME[dia]} às ${turnos[0].inicio}h`
    }
  }
  return 'Horário indisponível'
}

function fmtHora(h) {
  const hh = Math.floor(h)
  const mm = Math.round((h - hh) * 60)
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

function ProgressArc({ progresso, cor, size = 80, stroke = 5 }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (progresso / 100) * circ

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke="var(--border)" strokeWidth={stroke} opacity={0.4} />
      <circle cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={cor} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s ease' }} />
    </svg>
  )
}

function TurnoAtualInner() {
  const [turno, setTurno] = useState(calcTurno)

  useEffect(() => {
    const id = setInterval(() => setTurno(calcTurno()), 30000)
    return () => clearInterval(id)
  }, [])

  const cor = CORES_TURNO[turno.nome] || '#6B7280'
  const aberto = turno.ativo

  return (
    <div className="turno-atual-card" style={{
      background: 'var(--card)',
      borderRadius: 12,
      border: '1px solid var(--border)',
      boxShadow: 'var(--card-glow, none)',
      transition: 'background 0.35s, border-color 0.35s',
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Top gradient bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: aberto
          ? `linear-gradient(90deg, ${cor}, #e8a020, ${cor})`
          : 'linear-gradient(90deg, #4B5563, #6B7280, #4B5563)',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.14em',
          fontWeight: 600, color: 'var(--t2)',
        }}>
          Turno Atual
        </div>
        <div style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
          padding: '2px 8px', borderRadius: 20,
          background: aberto ? 'rgba(34,197,94,0.13)' : 'rgba(107,114,128,0.14)',
          color: aberto ? '#22C55E' : '#6B7280',
        }}>
          {aberto ? 'ABERTO' : 'FECHADO'}
        </div>
      </div>

      {/* Main content */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Progress ring or status icon */}
        <div style={{ position: 'relative', flexShrink: 0, width: 80, height: 80 }}>
          {aberto ? (
            <>
              <ProgressArc progresso={turno.progresso} cor={cor} />
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 20 }}>{turno.icone}</span>
                <span style={{
                  fontSize: 9, fontWeight: 700, color: cor,
                  letterSpacing: '0.04em', marginTop: 1,
                }}>
                  {Math.round(turno.progresso)}%
                </span>
              </div>
            </>
          ) : (
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              border: '2px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: 0.6,
            }}>
              <span style={{ fontSize: 28 }}>🔒</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 22, fontWeight: 900, lineHeight: 1.1,
            color: aberto ? cor : 'var(--t2)',
            letterSpacing: '-0.02em',
          }}>
            {turno.nome}
          </div>
          <div style={{
            fontFamily: 'monospace',
            fontSize: 13, color: 'var(--t2)', marginTop: 4,
          }}>
            {turno.countdown}
          </div>
          {aberto && turno.horaInicio != null && (
            <div style={{
              fontSize: 10, color: 'var(--t3)', marginTop: 4,
              letterSpacing: '0.04em',
            }}>
              {fmtHora(turno.horaInicio)} — {fmtHora(turno.horaFim)}
            </div>
          )}
        </div>
      </div>

      {/* Timeline dos turnos do dia */}
      {turno.allTurnos.length > 0 && (
        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: 10, marginTop: 2,
        }}>
          <div style={{
            fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em',
            fontWeight: 600, color: 'var(--t3)', marginBottom: 8,
          }}>
            Turnos de hoje
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {turno.allTurnos.map((t, i) => {
              const isAtivo = turno.turnoIndex === i
              const corT = CORES_TURNO[t.nome] || '#6B7280'
              const jaPassed = !isAtivo && turno.turnoIndex > i
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  opacity: jaPassed ? 0.4 : 1,
                  transition: 'opacity 0.3s',
                }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: isAtivo ? corT : 'var(--border)',
                    boxShadow: isAtivo ? `0 0 8px ${corT}` : 'none',
                    flexShrink: 0,
                  }} />
                  <div style={{
                    fontSize: 11, fontWeight: isAtivo ? 700 : 500,
                    color: isAtivo ? corT : 'var(--t2)',
                    flex: 1,
                  }}>
                    {t.nome}
                  </div>
                  <div style={{
                    fontSize: 10, fontFamily: 'monospace',
                    color: isAtivo ? 'var(--t1)' : 'var(--t3)',
                  }}>
                    {Math.floor(t.inicio)}h–{t.fim === 24 ? '00' : t.fim}h
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export const TurnoAtual = memo(TurnoAtualInner)
