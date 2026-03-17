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

  // Terça ou dia sem horários definidos
  if (!turnos) {
    // Encontrar próximo dia aberto
    const proximoInfo = encontrarProximaAbertura(dia, horaAtual)
    return {
      nome: 'Fechado',
      icone: '🔒',
      countdown: proximoInfo,
      ativo: false,
    }
  }

  // Verificar se estamos em algum turno
  for (let i = 0; i < turnos.length; i++) {
    const t = turnos[i]
    if (horaAtual >= t.inicio && horaAtual < t.fim) {
      const minutosRestantes = Math.ceil((t.fim - horaAtual) * 60)
      const proximo = turnos[i + 1]
      return {
        nome: t.nome,
        icone: ICONES[t.nome],
        countdown: proximo
          ? `${proximo.nome} em ${fmtCountdown(Math.ceil((proximo.inicio - horaAtual) * 60))}`
          : `Fecha em ${fmtCountdown(minutosRestantes)}`,
        ativo: true,
      }
    }
  }

  // Antes do primeiro turno do dia
  if (horaAtual < turnos[0].inicio) {
    const minutosAte = Math.ceil((turnos[0].inicio - horaAtual) * 60)
    return {
      nome: 'Fechado',
      icone: '🔒',
      countdown: `Abre às ${turnos[0].inicio}h (${turnos[0].nome} em ${fmtCountdown(minutosAte)})`,
      ativo: false,
    }
  }

  // Depois do último turno
  const proximoInfo = encontrarProximaAbertura(dia, horaAtual)
  return {
    nome: 'Fechado',
    icone: '🔒',
    countdown: proximoInfo,
    ativo: false,
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

function TurnoAtualInner() {
  const [turno, setTurno] = useState(calcTurno)

  useEffect(() => {
    const id = setInterval(() => setTurno(calcTurno()), 60000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="turno-atual-card" style={{
      background: 'var(--card)',
      borderRadius: 12,
      padding: '1rem 1.25rem',
      maxWidth: 380,
      border: '1px solid var(--border)',
      boxShadow: 'var(--card-glow, none)',
      transition: 'background 0.35s, border-color 0.35s',
    }}>
      <div style={{
        fontSize: '0.7rem',
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        fontWeight: 600,
        color: 'var(--t3)',
        marginBottom: '0.5rem',
      }}>
        Turno Atual
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '0.35rem',
      }}>
        <span style={{ fontSize: '1.3rem' }}>{turno.icone}</span>
        <span style={{
          fontSize: '1.1rem',
          fontWeight: 700,
          color: turno.ativo ? '#e8a020' : 'var(--t2)',
        }}>
          {turno.nome}
        </span>
      </div>
      <div style={{
        fontFamily: 'monospace',
        fontSize: '0.85rem',
        color: 'var(--t2)',
      }}>
        {turno.countdown}
      </div>
    </div>
  )
}

export const TurnoAtual = memo(TurnoAtualInner)
