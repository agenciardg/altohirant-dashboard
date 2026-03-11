import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { normTipo, normFeedback, isAlmoco } from './utils'

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

/* ── Mapeamentos ── (importados de utils.js) ── */

function deltaPct(curr, prev) {
  if (!prev) return curr > 0 ? '+100%' : '0%'
  const d = Math.round(((curr - prev) / prev) * 100)
  return d >= 0 ? `+${d}%` : `${d}%`
}
function deltaClass(pct) {
  if (pct.startsWith('+')) return 'bp'
  if (pct.startsWith('-')) return 'be'
  return 'bn'
}

const DIAS_ABREV = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

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

/* ── Donut ── */
const DONUT_COLORS = {
  Reservas: '#E85D04', Cardapio: '#F97316', Localizacao: '#DC2626', Outros: '#6B4A1A',
}
const DONUT_ORDER = ['Reservas', 'Cardapio', 'Localizacao', 'Outros']

function buildDonut(rows) {
  if (rows.length === 0) {
    // Placeholder visível para estado vazio
    return [{ name: 'Sem dados', value: 1, color: '#2A2A2A', pct: '—' }]
  }
  const counts = { Reservas: 0, Cardapio: 0, Localizacao: 0, Outros: 0 }
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

/* ── Barras ── */
function buildBarras(rows, tab) {
  const now = new Date()

  if (tab === 'hoje') {
    const turnos = ['Manha', 'Almoco', 'Tarde', 'Jantar', 'Noite']
    const counts = {}
    turnos.forEach(t => { counts[t] = { a: 0, j: 0 } })
    rows.forEach(r => {
      const t = (r.turno || 'geral').toLowerCase()
      const lbl =
        t === 'manha' || t === 'manhã' ? 'Manha'
          : t === 'almoco' || t === 'almoço' ? 'Almoco'
            : t === 'tarde' ? 'Tarde'
              : t === 'jantar' ? 'Jantar'
                : 'Noite'
      if (isAlmoco(r.turno)) counts[lbl].a++
      else counts[lbl].j++
    })
    const result = turnos
      .filter(t => counts[t].a + counts[t].j > 0)
      .map(d => ({ d, ...counts[d] }))
    // Retorna estrutura mínima se vazio
    return result.length > 0
      ? result
      : [{ d: 'Manha', a: 0, j: 0 }, { d: 'Almoco', a: 0, j: 0 }, { d: 'Jantar', a: 0, j: 0 }]
  }

  if (tab === 'semana') {
    // Últimos 7 dias corridos
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = subDays(now, i)
      days.push({ iso: isoDate(d), label: DIAS_ABREV[d.getDay()] })
    }
    const counts = {}
    days.forEach(({ iso }) => { counts[iso] = { a: 0, j: 0 } })
    rows.forEach(r => {
      if (counts[r.data]) {
        if (isAlmoco(r.turno)) counts[r.data].a++
        else counts[r.data].j++
      }
    })
    return days.map(({ iso, label }) => ({ d: label, ...counts[iso] }))
  }

  // mes — por semana
  const sems = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4']
  const counts = {}
  sems.forEach(s => { counts[s] = { a: 0, j: 0 } })
  rows.forEach(r => {
    const day = new Date(r.data + 'T12:00:00').getDate()
    const sem = day <= 7 ? 'Sem 1' : day <= 14 ? 'Sem 2' : day <= 21 ? 'Sem 3' : 'Sem 4'
    if (isAlmoco(r.turno)) counts[sem].a++
    else counts[sem].j++
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
    det: r.assunto_feedback || r.tool_chamada || r.tipo_atendimento || '—',
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
    if (r.turno) turnoCounts[r.turno] = (turnoCounts[r.turno] || 0) + 1
  })
  const turno = Object.entries(turnoCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '--'
  return { hora: `${parseInt(picoH)}h`, turno }
}

/* ── Hook principal ── */
export function useDashboardData(tab) {
  const [state, setState] = useState({ loading: true, data: null, error: null })

  useEffect(() => {
    setState(s => ({ ...s, loading: true }))
    let cancelled = false

    async function fetch() {
      try {
        const { start, end, prevStart, prevEnd } = dateRange(tab)

        const [currRes, prevRes] = await Promise.all([
          supabase
            .from('alto_hirant_dashboard')
            .select('*')
            .gte('data', start)
            .lte('data', end)
            .order('criado_em', { ascending: false }),
          supabase
            .from('alto_hirant_dashboard')
            .select('*')
            .gte('data', prevStart)
            .lte('data', prevEnd),
        ])

        if (cancelled) return
        if (currRes.error) throw currRes.error

        const rows = currRes.data || []
        const prevRows = prevRes.data || []

        const total = rows.length
        const prevTotal = prevRows.length
        const reservas = rows.filter(r => r.reserva_solicitada).length
        const prevReservas = prevRows.filter(r => r.reserva_solicitada).length

        const comFeedback = rows.filter(r => r.feedback_empresa)
        const positivos = comFeedback.filter(r => normFeedback(r.feedback_empresa) === 'Positivo').length
        const prevComFeedback = prevRows.filter(r => r.feedback_empresa)
        const prevPositivos = prevComFeedback.filter(r => normFeedback(r.feedback_empresa) === 'Positivo').length
        const satisfPct = comFeedback.length ? Math.round((positivos / comFeedback.length) * 100) : 0
        const prevSatisfPct = prevComFeedback.length ? Math.round((prevPositivos / prevComFeedback.length) * 100) : 0

        const pico = calcPico(rows)
        const totalDelta = deltaPct(total, prevTotal)
        const reservasDelta = deltaPct(reservas, prevReservas)
        const satisfDelta = deltaPct(satisfPct, prevSatisfPct)

        const subLabel =
          tab === 'hoje' ? 'vs. ontem'
            : tab === 'semana' ? 'vs. 7 dias anteriores'
              : 'vs. mês anterior'

        const data = {
          kpis: {
            total:    { value: String(total),    sub: subLabel,               delta: totalDelta,    dt: deltaClass(totalDelta) },
            reservas: { value: String(reservas),  sub: subLabel,               delta: reservasDelta, dt: deltaClass(reservasDelta) },
            satisf:   { value: satisfPct + '%',   sub: 'feedbacks positivos',  delta: satisfDelta,   dt: deltaClass(satisfDelta), sm: true },
            pico:     { value: pico.hora,          sub: `Turno: ${pico.turno}`, delta: pico.turno,    dt: 'bn', sm: true },
          },
          linhaLabel:
            tab === 'hoje' ? 'Hoje — Volume por hora'
              : tab === 'semana' ? 'Últimos 7 dias — Volume diário'
                : 'Este mês — Volume semanal',
          linha: buildLinha(rows, tab),
          donut: buildDonut(rows),
          barLabel:
            tab === 'hoje' ? 'Distribuição por turno'
              : tab === 'semana' ? 'Almoço x Jantar — 7 dias'
                : 'Almoço x Jantar — mensal',
          barras: buildBarras(rows, tab),
          tableRows: buildRows(rows),
          rawRows: rows,           // dados brutos para os modais
          hasRealData: total > 0,
          supabaseOk: true,
        }

        setState({ loading: false, data, error: null })
      } catch (err) {
        if (!cancelled) setState({ loading: false, data: null, error: err.message })
      }
    }

    fetch()
    return () => { cancelled = true }
  }, [tab])

  return state
}
