import { normTipo, normTurno } from '../utils'
import { DIAS_ABREV, DONUT_COLORS, DONUT_ORDER } from '../constants'

/* ── Helpers de data (re-exported so other modules can import from here) ── */

/**
 * Returns a YYYY-MM-DD string for a given Date without timezone drift.
 * @param {Date} d
 * @returns {string}
 */
export function isoDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * Returns a new Date that is n days before date.
 * @param {Date} date
 * @param {number} n
 * @returns {Date}
 */
export function subDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() - n)
  return d
}

/* ── Turno classifier ── */

/**
 * Maps a raw turno string to a 2-letter chart key.
 * @param {string} turno
 * @returns {'al'|'hh'|'j'|'f'}
 */
export function classifyTurno(turno) {
  const t = normTurno(turno)
  if (t === 'Almoco') return 'al'
  if (t === 'Happy Hour') return 'hh'
  if (t === 'Fora Horário') return 'f'
  return 'j'
}

/* ── Linha (time-series) ── */

/**
 * Builds the line chart dataset.
 * @param {object[]} rows
 * @param {'hoje'|'semana'|'mes'} tab
 * @returns {{ dia: string, total: number }[]}
 */
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
    // Semana calendário: domingo (i=0) a sábado (i=6); terça (i=2) está fechada
    const dayOfWeek = now.getDay()
    const sunday = subDays(now, dayOfWeek)
    const days = []
    for (let i = 0; i <= 6; i++) {
      const d = new Date(sunday)
      d.setDate(d.getDate() + i)
      days.push({ iso: isoDate(d), label: DIAS_ABREV[i], fechado: i === 2 })
    }
    const counts = {}
    days.forEach(({ iso }) => { counts[iso] = 0 })
    rows.forEach(r => { if (r.data in counts) counts[r.data]++ })
    return days.map(({ iso, label, fechado }) => ({ dia: label, total: counts[iso], iso, fechado }))
  }

  // mes — por semana (domingo como início de semana)
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const counts = { 'Sem 1': 0, 'Sem 2': 0, 'Sem 3': 0, 'Sem 4': 0 }
  rows.forEach(r => {
    const d = new Date(r.data + 'T12:00:00')
    const dayOfMonth = d.getDate()
    const dowFirst = firstOfMonth.getDay()
    const sem = Math.ceil((dayOfMonth + dowFirst) / 7)
    const key = `Sem ${Math.min(sem, 4)}`
    counts[key]++
  })
  return Object.entries(counts).map(([dia, total]) => ({ dia, total }))
}

/* ── Donut ── */

/**
 * Builds the donut chart dataset.
 * @param {object[]} rows
 * @returns {{ name: string, value: number, color: string, pct: string }[]}
 */
export function buildDonut(rows) {
  if (rows.length === 0) {
    return [{ name: 'Sem dados', value: 1, color: '#2A2A2A', pct: '—' }]
  }
  const counts = { Reservas: 0, Programacao: 0, Cardapio: 0, Localizacao: 0, Geral: 0, Aniversario: 0, Reclamacao: 0, Outros: 0 }
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

/* ── Barras (4 turnos: al=Almoço, hh=Happy Hour, j=Jantar, f=Fora Horário) ── */

/**
 * Builds the bar chart dataset.
 * @param {object[]} rows
 * @param {'hoje'|'semana'|'mes'} tab
 * @returns {{ d: string, al: number, hh: number, j: number, f: number }[]}
 */
export function buildBarras(rows, tab) {
  const now = new Date()
  const empty = { al: 0, hh: 0, j: 0, f: 0 }

  if (tab === 'hoje') {
    const turnos = ['Almoco', 'Happy Hour', 'Jantar', 'Fora Horário']
    const counts = {}
    turnos.forEach(t => { counts[t] = { ...empty } })
    rows.forEach(r => {
      const lbl = normTurno(r.turno)
      const mapped = counts[lbl] ? lbl : 'Jantar'
      const cls = classifyTurno(r.turno)
      if (counts[mapped]) counts[mapped][cls]++
    })
    const result = turnos
      .filter(t => counts[t].al + counts[t].hh + counts[t].j + counts[t].f > 0)
      .map(d => ({ d, ...counts[d] }))
    return result.length > 0
      ? result
      : [{ d: 'Almoco', ...empty }, { d: 'Happy Hour', ...empty }, { d: 'Jantar', ...empty }]
  }

  if (tab === 'semana') {
    // Semana calendário: domingo (i=0) a sábado (i=6); terça (i=2) está fechada
    const dayOfWeek = now.getDay()
    const sunday = subDays(now, dayOfWeek)
    const days = []
    for (let i = 0; i <= 6; i++) {
      const d = new Date(sunday)
      d.setDate(d.getDate() + i)
      days.push({ iso: isoDate(d), label: DIAS_ABREV[i], fechado: i === 2 })
    }
    const counts = {}
    days.forEach(({ iso }) => { counts[iso] = { ...empty } })
    rows.forEach(r => {
      if (counts[r.data]) {
        counts[r.data][classifyTurno(r.turno)]++
      }
    })
    return days.map(({ iso, label, fechado }) => ({ d: label, ...counts[iso], fechado }))
  }

  // mes — por semana (domingo como início de semana)
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const sems = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4']
  const counts = {}
  sems.forEach(s => { counts[s] = { ...empty } })
  rows.forEach(r => {
    const d = new Date(r.data + 'T12:00:00')
    const dayOfMonth = d.getDate()
    const dowFirst = firstOfMonth.getDay()
    const sem = Math.ceil((dayOfMonth + dowFirst) / 7)
    const key = `Sem ${Math.min(sem, 4)}`
    counts[key][classifyTurno(r.turno)]++
  })
  return sems.map(d => ({ d, ...counts[d] }))
}

/* ── Drill-down data (month → week → day) ── */

/**
 * Computes chart data for a drill-down level inside the "Este Mês" tab.
 * Returns null when level === 'month' (caller uses the default computeCharts output).
 *
 * @param {object[]} rawRows - All raw rows for the current month
 * @param {{ level: 'month'|'week'|'day', week?: number, day?: string }} monthDrill
 * @returns {{ linha: object[], linhaLabel: string, donut: object[], barras: object[], barLabel: string, rows: object[] } | null}
 */
export function computeDrillData(rawRows, monthDrill) {
  const { level, week, day } = monthDrill
  if (level === 'month') return null

  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const dowFirst = firstOfMonth.getDay()

  /** Returns the capped week number (1–4) for a YYYY-MM-DD string */
  function getWeekNum(dateStr) {
    const d = new Date(dateStr + 'T12:00:00')
    const dayOfMonth = d.getDate()
    return Math.min(Math.ceil((dayOfMonth + dowFirst) / 7), 4)
  }

  /** Returns all calendar days that belong to weekNum in the current month */
  function getWeekDays(weekNum) {
    const days = []
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    for (let dd = 1; dd <= daysInMonth; dd++) {
      const date = new Date(now.getFullYear(), now.getMonth(), dd)
      const wn = Math.min(Math.ceil((dd + dowFirst) / 7), 4)
      if (wn === weekNum) {
        days.push({
          iso: isoDate(date),
          label: DIAS_ABREV[date.getDay()],
          fechado: date.getDay() === 2, // Tuesday closed
        })
      }
    }
    return days
  }

  /* ── Week level: daily breakdown for the selected week ── */
  if (level === 'week') {
    const weekDays = getWeekDays(week)
    const weekRows = rawRows.filter(r => getWeekNum(r.data) === week)

    // Line: daily volume, preserving iso on each point for click-drill
    const counts = {}
    weekDays.forEach(d => { counts[d.iso] = 0 })
    weekRows.forEach(r => { if (r.data in counts) counts[r.data]++ })
    const linha = weekDays.map(d => ({
      dia: d.label,
      total: counts[d.iso],
      iso: d.iso,
      fechado: d.fechado,
    }))

    // Barras: per-day shift breakdown
    const empty = { al: 0, hh: 0, j: 0, f: 0 }
    const barCounts = {}
    weekDays.forEach(d => { barCounts[d.iso] = { ...empty } })
    weekRows.forEach(r => {
      if (barCounts[r.data]) barCounts[r.data][classifyTurno(r.turno)]++
    })
    const barras = weekDays.map(d => ({ d: d.label, ...barCounts[d.iso], fechado: d.fechado }))

    return {
      linha,
      barras,
      donut: buildDonut(weekRows),
      linhaLabel: `Semana ${week} — Volume diário`,
      barLabel: `Semana ${week} — Turnos por dia`,
      rows: weekRows,
    }
  }

  /* ── Day level: hourly breakdown for the selected day ── */
  if (level === 'day') {
    const dayRows = rawRows.filter(r => r.data === day)

    // Line: hourly volume
    const hourCounts = {}
    dayRows.forEach(r => {
      const h = parseInt((r.hora || '00:00').split(':')[0])
      const lbl = `${h}h`
      hourCounts[lbl] = (hourCounts[lbl] || 0) + 1
    })
    const linha = Object.keys(hourCounts).length > 0
      ? Object.keys(hourCounts)
          .sort((a, b) => parseInt(a) - parseInt(b))
          .map(h => ({ dia: h, total: hourCounts[h] }))
      : []

    // Barras: shift totals for the day (only non-empty shifts)
    const TURNOS = ['Almoco', 'Happy Hour', 'Jantar', 'Fora Horário']
    const empty = { al: 0, hh: 0, j: 0, f: 0 }
    const tCounts = {}
    TURNOS.forEach(t => { tCounts[t] = { ...empty } })
    dayRows.forEach(r => {
      const t = normTurno(r.turno)
      const cls = classifyTurno(r.turno)
      if (tCounts[t]) tCounts[t][cls]++
    })
    const barras = TURNOS
      .filter(t => tCounts[t].al + tCounts[t].hh + tCounts[t].j + tCounts[t].f > 0)
      .map(t => ({ d: t, ...tCounts[t] }))

    // Label
    const [, m, dd] = day.split('-')
    const dayDate = new Date(day + 'T12:00:00')
    const DIAS_FULL = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

    return {
      linha,
      barras,
      donut: buildDonut(dayRows),
      linhaLabel: `${DIAS_FULL[dayDate.getDay()]} ${dd}/${m} — Distribuição horária`,
      barLabel: `${dd}/${m} — Turnos do dia`,
      rows: dayRows,
    }
  }

  return null
}

/* ── Public API ── */

/**
 * Computes all chart datasets for the given rows and tab.
 * @param {object[]} rows
 * @param {'hoje'|'semana'|'mes'} tab
 * @returns {{ linha: object[], linhaLabel: string, donut: object[], barras: object[], barLabel: string }}
 */
export function computeCharts(rows, tab) {
  const linhaLabel =
    tab === 'hoje' ? 'Hoje — Volume por hora'
      : tab === 'semana' ? 'Esta Semana — Volume diário'
        : 'Este mês — Volume semanal'

  const barLabel =
    tab === 'hoje' ? 'Distribuição por turno'
      : tab === 'semana' ? 'Almoço/HH x Jantar — semana'
        : 'Almoço/HH x Jantar — mensal'

  return {
    linha: buildLinha(rows, tab),
    linhaLabel,
    donut: buildDonut(rows),
    barras: buildBarras(rows, tab),
    barLabel,
  }
}
