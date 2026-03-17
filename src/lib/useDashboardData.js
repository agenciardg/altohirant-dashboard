import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { normTipo, normFeedback, normTurno, isDiurno } from './utils'
import { DIAS_ABREV, DONUT_COLORS, DONUT_ORDER } from './constants'

/* ── Helpers de data ── */
function isoDate(d) {
  return d.toISOString().split('T')[0]
}

function subDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() - n)
  return d
}

function dateRange(tab) {
  const now = new Date()
  const today = isoDate(now)

  if (tab === 'hoje') {
    return {
      start: today,
      end: today,
      prevStart: isoDate(subDays(now, 1)),
      prevEnd: isoDate(subDays(now, 1)),
    }
  }

  if (tab === 'semana') {
    // Últimos 7 dias corridos (não semana calendário)
    const start = isoDate(subDays(now, 6))
    const prevStart = isoDate(subDays(now, 13))
    const prevEnd = isoDate(subDays(now, 7))
    return { start, end: today, prevStart, prevEnd }
  }

  // mes — mês atual completo
  const mesStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const prevMesStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevMesEnd = new Date(now.getFullYear(), now.getMonth(), 0)
  return {
    start: isoDate(mesStart),
    end: today,
    prevStart: isoDate(prevMesStart),
    prevEnd: isoDate(prevMesEnd),
  }
}

/* ── Linha ── */
function buildLinha(rows, tab) {
  const now = new Date()

  if (tab === 'hoje') {
    const counts = {}
    rows.forEach(r => {
      const h = parseInt((r.hora || '00:00').split(':')[0])
      const lbl = `${h}h`
      counts[lbl] = (counts[lbl] || 0) + 1
    })
    if (Object.keys(counts).length === 0) return []
    return Object.keys(counts)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(h => ({ dia: h, total: counts[h] }))
  }

  if (tab === 'semana') {
    // Últimos 7 dias corridos
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = subDays(now, i)
      days.push({ iso: isoDate(d), label: DIAS_ABREV[d.getDay()] })
    }
    const counts = {}
    days.forEach(({ iso }) => { counts[iso] = 0 })
    rows.forEach(r => { if (r.data in counts) counts[r.data]++ })
    return days.map(({ iso, label }) => ({ dia: label, total: counts[iso] }))
  }

  // mes — por semana
  const counts = { 'Sem 1': 0, 'Sem 2': 0, 'Sem 3': 0, 'Sem 4': 0 }
  rows.forEach(r => {
    const day = new Date(r.data + 'T12:00:00').getDate()
    const sem = day <= 7 ? 'Sem 1' : day <= 14 ? 'Sem 2' : day <= 21 ? 'Sem 3' : 'Sem 4'
    counts[sem]++
  })
  return Object.entries(counts).map(([dia, total]) => ({ dia, total }))
}

/* ── Donut ── (DONUT_COLORS e DONUT_ORDER importados de constants.js) */

function buildDonut(rows) {
  if (rows.length === 0) {
    // Placeholder visível para estado vazio
    return [{ name: 'Sem dados', value: 1, color: '#2A2A2A', pct: '—' }]
  }
  const counts = { Reservas: 0, Cardapio: 0, Localizacao: 0, Geral: 0, Aniversario: 0, Reclamacao: 0, Outros: 0 }
  rows.forEach(r => { counts[normTipo(r.tipo_atendimento)]++ })
  const total = rows.length
  return DONUT_ORDER
    .filter(k => counts[k] > 0)
    .map(k => ({
      name: k,
      value: counts[k],
      color: DONUT_COLORS[k],
      pct: Math.round((counts[k] / total) * 100) + '%',
    }))
}

/* ── Barras (3 turnos: al=Almoço, hh=Happy Hour, j=Jantar) ── */
function classifyTurno(turno) {
  const t = normTurno(turno)
  if (t === 'Almoco') return 'al'
  if (t === 'Happy Hour') return 'hh'
  return 'j'
}

function buildBarras(rows, tab) {
  const now = new Date()
  const empty = { al: 0, hh: 0, j: 0 }

  if (tab === 'hoje') {
    const turnos = ['Almoco', 'Happy Hour', 'Jantar']
    const counts = {}
    turnos.forEach(t => { counts[t] = { al: 0, hh: 0, j: 0 } })
    rows.forEach(r => {
      const lbl = normTurno(r.turno)
      const mapped = lbl === 'Fora Horário' ? 'Jantar' : (lbl === 'Almoco' || lbl === 'Happy Hour' || lbl === 'Jantar' ? lbl : 'Jantar')
      const cls = classifyTurno(r.turno)
      if (counts[mapped]) counts[mapped][cls]++
    })
    const result = turnos
      .filter(t => counts[t].al + counts[t].hh + counts[t].j > 0)
      .map(d => ({ d, ...counts[d] }))
    return result.length > 0
      ? result
      : [{ d: 'Almoco', ...empty }, { d: 'Happy Hour', ...empty }, { d: 'Jantar', ...empty }]
  }

  if (tab === 'semana') {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = subDays(now, i)
      days.push({ iso: isoDate(d), label: DIAS_ABREV[d.getDay()] })
    }
    const counts = {}
    days.forEach(({ iso }) => { counts[iso] = { al: 0, hh: 0, j: 0 } })
    rows.forEach(r => {
      if (counts[r.data]) {
        counts[r.data][classifyTurno(r.turno)]++
      }
    })
    return days.map(({ iso, label }) => ({ d: label, ...counts[iso] }))
  }

  // mes — por semana
  const sems = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4']
  const counts = {}
  sems.forEach(s => { counts[s] = { al: 0, hh: 0, j: 0 } })
  rows.forEach(r => {
    const day = new Date(r.data + 'T12:00:00').getDate()
    const sem = day <= 7 ? 'Sem 1' : day <= 14 ? 'Sem 2' : day <= 21 ? 'Sem 3' : 'Sem 4'
    counts[sem][classifyTurno(r.turno)]++
  })
  return sems.map(d => ({ d, ...counts[d] }))
}

/* ── Tabela ── */
function buildRows(rows) {
  return rows.map((r, i) => ({
    id: `#${String(i + 1).padStart(3, '0')}`,
    h: (r.hora || '00:00').slice(0, 5),
    cli: r.nome_cliente || r.numero_cliente || 'Desconhecido',
    tipo: normTipo(r.tipo_atendimento),
    st: normFeedback(r.feedback_empresa),
    turno: normTurno(r.turno),
    _raw: r,
  }))
}

/* ── Horário de pico ── */
function calcPico(rows) {
  if (!rows.length) return { hora: '--', turno: '--' }
  const horaCounts = {}
  rows.forEach(r => {
    const h = (r.hora || '00:00').split(':')[0]
    horaCounts[h] = (horaCounts[h] || 0) + 1
  })
  const picoH = Object.entries(horaCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '00'
  const turnoCounts = {}
  rows.forEach(r => {
    const t = normTurno(r.turno)
    turnoCounts[t] = (turnoCounts[t] || 0) + 1
  })
  const turno = Object.entries(turnoCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '--'
  return { hora: `${parseInt(picoH)}h`, turno }
}

/* ── Processamento dos dados ── */
function processData(rows, _prevRows, tab) {
  const total = rows.length
  const reservas = rows.filter(r => r.reserva_solicitada).length
  const foraHorario = rows.filter(r => r.fora_horario).length
  const clientesUnicos = new Set(rows.map(r => r.numero_cliente).filter(Boolean)).size

  const pico = calcPico(rows)
  const subLabel =
    tab === 'hoje' ? 'vs. ontem'
      : tab === 'semana' ? 'vs. 7 dias anteriores'
        : 'vs. mês anterior'

  /* ── KPIs extras para aba HOJE ── */
  const hoje = isoDate(new Date())

  // Reservas de hoje: registros com data_reserva_pedida = hoje
  const reservasHoje = rows
    .filter(r => r.data_reserva_pedida === hoje)
    .map(r => ({
      nome_cliente: r.nome_cliente,
      numero_cliente: r.numero_cliente,
      hora: r.hora,
      qtd_pessoas: r.qtd_pessoas,
      eh_aniversario: r.eh_aniversario,
      data_reserva_pedida: r.data_reserva_pedida,
      _raw: r,
    }))

  // Aniversários hoje: eh_aniversario = true E data = hoje
  const aniversariosHoje = rows.filter(r => r.eh_aniversario && r.data === hoje).length

  // Feedback negativo hoje: feedback_empresa = 'negativo' E data = hoje
  const feedbackNegativoHoje = rows.filter(r => {
    if (!r.feedback_empresa) return false
    return r.feedback_empresa.trim().toLowerCase().includes('negativ') && r.data === hoje
  }).length

  return {
    kpis: {
      total:    { value: String(total),        sub: `${clientesUnicos} cliente${clientesUnicos !== 1 ? 's' : ''} único${clientesUnicos !== 1 ? 's' : ''}` },
      reservas: { value: String(reservas),      sub: subLabel },
      fora:     { value: String(foraHorario),   sub: subLabel, sm: true },
      pico:     { value: pico.hora,              sub: `Turno: ${pico.turno}`, sm: true },
    },
    // KPIs extras
    clientesUnicos,
    reservasHoje,
    aniversariosHoje,
    feedbackNegativoHoje,
    foraHorarioCount: foraHorario,
    linhaLabel:
      tab === 'hoje' ? 'Hoje — Volume por hora'
        : tab === 'semana' ? 'Últimos 7 dias — Volume diário'
          : 'Este mês — Volume semanal',
    linha: buildLinha(rows, tab),
    donut: buildDonut(rows),
    barLabel:
      tab === 'hoje' ? 'Distribuição por turno'
        : tab === 'semana' ? 'Almoço/HH x Jantar — 7 dias'
          : 'Almoço/HH x Jantar — mensal',
    barras: buildBarras(rows, tab),
    tableRows: buildRows(rows),
    rawRows: rows,
    hasRealData: total > 0,
    supabaseOk: true,
  }
}

/* ── Fetch com retry ── */
const MAX_RETRIES = 2
const RETRY_DELAY = 1500

async function fetchWithRetry(queryFn, retries = MAX_RETRIES) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await queryFn()
    if (!res.error) return res
    if (attempt < retries) {
      console.warn(`[Supabase] Tentativa ${attempt + 1} falhou, retentando em ${RETRY_DELAY}ms...`, res.error.message)
      await new Promise(r => setTimeout(r, RETRY_DELAY))
    } else {
      return res
    }
  }
}

/* ── Hook principal ── */
export function useDashboardData(tab) {
  const [state, setState] = useState({ loading: true, data: null, error: null })

  useEffect(() => {
    setState(s => ({ ...s, loading: true }))
    let cancelled = false

    async function load() {
      try {
        const { start, end, prevStart, prevEnd } = dateRange(tab)

        const [currRes, prevRes] = await Promise.all([
          fetchWithRetry(() =>
            supabase
              .from('alto_hirant_dashboard')
              .select('*')
              .gte('data', start)
              .lte('data', end)
              .order('created_at', { ascending: false })
          ),
          fetchWithRetry(() =>
            supabase
              .from('alto_hirant_dashboard')
              .select('*')
              .gte('data', prevStart)
              .lte('data', prevEnd)
          ),
        ])

        if (cancelled) return

        if (currRes.error) {
          console.error('[Supabase] Erro ao buscar dados atuais:', currRes.error)
          throw currRes.error
        }

        if (prevRes.error) {
          console.warn('[Supabase] Erro ao buscar dados anteriores (continuando sem comparação):', prevRes.error.message)
        }

        const rows = currRes.data || []
        const prevRows = prevRes.error ? [] : (prevRes.data || [])

        const data = processData(rows, prevRows, tab)
        setState({ loading: false, data, error: null })
      } catch (err) {
        const message = err?.message || 'Erro desconhecido ao carregar dados'
        console.error('[useDashboardData]', { tab, error: err })
        if (!cancelled) setState({ loading: false, data: null, error: message })
      }
    }

    load()
    return () => { cancelled = true }
  }, [tab])

  return state
}
