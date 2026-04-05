import { normTipo, normFeedback, normTurno } from '../utils'
import { isoDate } from './computeCharts'

/* ── Horário de pico ── */

/**
 * Finds the peak hour and peak turno from a set of rows.
 * @param {object[]} rows
 * @returns {{ hora: string, turno: string }}
 */
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

/* ── Public API ── */

/**
 * Computes all KPI values and supporting metrics from the current and previous rows.
 *
 * @param {object[]} rows      - Rows for the current period.
 * @param {object[]} prevRows  - Rows for the previous period (reserved for future delta calculations).
 * @param {'hoje'|'semana'|'mes'} tab
 * @returns {{
 *   kpis: object,
 *   clientesUnicos: number,
 *   reservasHoje: object[],
 *   aniversariosHoje: number,
 *   feedbackNegativoHoje: number,
 *   foraHorarioCount: number,
 *   satisfacao: number|null,
 *   taxaFeedback: number,
 *   reclamacoes: number,
 *   programacaoCount: number,
 *   progRanking: { dia: string, count: number }[],
 *   diaMaisProcurado: { dia: string, count: number }|null,
 * }}
 */
export function computeKPIs(rows, prevRows, tab) {
  const total = rows.length
  const reservas = rows.filter(r => r.reserva_solicitada).length
  const foraHorario = rows.filter(r => r.fora_horario).length
  const clientesUnicos = new Set(rows.map(r => r.numero_cliente).filter(Boolean)).size
  const aniversariosUnicos = new Set(rows.filter(r => r.eh_aniversario).map(r => r.numero_cliente).filter(Boolean)).size
  const reclamacoes = rows.filter(r => normTipo(r.tipo_atendimento) === 'Reclamacao').length
  const programacaoCount = rows.filter(r => normTipo(r.tipo_atendimento) === 'Programacao').length
  const aguardandoAtendente = rows.filter(r => r.necessita_humano).length
  const totalAtendidoPorHumano = rows.filter(r => r.atendido_por_humano).length

  // Satisfação: apenas registros com feedback_empresa preenchido
  const comFeedback = rows.filter(r => r.feedback_empresa != null && r.feedback_empresa !== '')
  const positivos = comFeedback.filter(r => normFeedback(r.feedback_empresa) === 'Positivo').length
  const negativos = comFeedback.filter(r => normFeedback(r.feedback_empresa) === 'Negativo').length
  const satisfacao = (positivos + negativos) > 0
    ? Math.round((positivos / (positivos + negativos)) * 100)
    : null
  const taxaFeedback = total > 0
    ? Math.round((comFeedback.length / total) * 100)
    : 0

  /* ── Delta: prev period values ── */
  const safe = Array.isArray(prevRows) ? prevRows : []
  const prevTotal = safe.length
  const prevReservas = safe.filter(r => r.reserva_solicitada).length
  const prevFora = safe.filter(r => r.fora_horario).length
  const prevClientesUnicos = new Set(safe.map(r => r.numero_cliente).filter(Boolean)).size
  const prevAniversarios = new Set(safe.filter(r => r.eh_aniversario).map(r => r.numero_cliente).filter(Boolean)).size
  const prevReclamacoes = safe.filter(r => normTipo(r.tipo_atendimento) === 'Reclamacao').length
  const prevProgramacao = safe.filter(r => normTipo(r.tipo_atendimento) === 'Programacao').length
  const prevAguardando = safe.filter(r => r.necessita_humano).length
  const prevAtendidoPorHumano = safe.filter(r => r.atendido_por_humano).length

  const prevComFeedback = safe.filter(r => r.feedback_empresa != null && r.feedback_empresa !== '')
  const prevPositivos = prevComFeedback.filter(r => normFeedback(r.feedback_empresa) === 'Positivo').length
  const prevNegativos = prevComFeedback.filter(r => normFeedback(r.feedback_empresa) === 'Negativo').length
  const prevSatisfacao = (prevPositivos + prevNegativos) > 0
    ? Math.round((prevPositivos / (prevPositivos + prevNegativos)) * 100)
    : null

  /**
   * Percentage change relative to prev. Returns null when prev is 0 or unavailable.
   * @param {number} curr
   * @param {number} prev
   * @returns {number|null}
   */
  function calcDelta(curr, prev) {
    if (prev === null || prev === undefined || prev === 0) return null
    return Math.round(((curr - prev) / prev) * 100)
  }

  const pico = calcPico(rows)
  const subLabel =
    tab === 'hoje' ? 'vs. ontem'
      : tab === 'semana' ? 'vs. 7 dias anteriores'
        : 'vs. mês anterior'

  /* ── KPIs extras para aba HOJE ── */
  const hoje = isoDate(new Date())

  // Reservas de hoje: reserva_solicitada = true E data = hoje
  const reservasHoje = rows
    .filter(r => r.reserva_solicitada && r.data === hoje)
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

  // Interesse por programação — ranking de dia_programacao_interesse
  const progInteresse = {}
  rows.forEach(r => {
    if (r.dia_programacao_interesse) {
      progInteresse[r.dia_programacao_interesse] = (progInteresse[r.dia_programacao_interesse] || 0) + 1
    }
  })
  const progRanking = Object.entries(progInteresse)
    .sort((a, b) => b[1] - a[1])
    .map(([dia, count]) => ({ dia, count }))
  const diaMaisProcurado = progRanking[0] || null

  return {
    kpis: {
      total:    { value: String(total),        sub: `${clientesUnicos} cliente${clientesUnicos !== 1 ? 's' : ''} único${clientesUnicos !== 1 ? 's' : ''}`, delta: calcDelta(total, prevTotal), deltaInvert: false },
      clientes: { value: String(clientesUnicos), sub: `${clientesUnicos} cliente${clientesUnicos !== 1 ? 's' : ''} único${clientesUnicos !== 1 ? 's' : ''}`, delta: calcDelta(clientesUnicos, prevClientesUnicos), deltaInvert: false },
      reservas: { value: String(reservas),      sub: 'link GetIn enviado', delta: calcDelta(reservas, prevReservas), deltaInvert: false },
      fora:     { value: String(foraHorario),   sub: subLabel, sm: true, delta: calcDelta(foraHorario, prevFora), deltaInvert: true },
      pico:     { value: pico.hora,             sub: `Turno: ${pico.turno}`, sm: true, delta: null, deltaInvert: false },
      aniversarios: { value: String(aniversariosUnicos), sub: 'clientes únicos', delta: calcDelta(aniversariosUnicos, prevAniversarios), deltaInvert: false },
      satisfacao: { value: satisfacao != null ? `${satisfacao}%` : '—', sub: `${comFeedback.length} feedbacks (${taxaFeedback}% taxa)`, delta: satisfacao != null && prevSatisfacao != null ? satisfacao - prevSatisfacao : null, deltaInvert: false },
      reclamacoes: { value: String(reclamacoes), sub: subLabel, delta: calcDelta(reclamacoes, prevReclamacoes), deltaInvert: true },
      programacao: { value: String(programacaoCount), sub: diaMaisProcurado ? `Top: ${diaMaisProcurado.dia}` : '—', delta: calcDelta(programacaoCount, prevProgramacao), deltaInvert: false },
      aguardando: { value: String(aguardandoAtendente), sub: aguardandoAtendente > 0 ? `${aguardandoAtendente} conversa${aguardandoAtendente !== 1 ? 's' : ''} aguardando` : 'Nenhuma pendência', delta: calcDelta(aguardandoAtendente, prevAguardando), deltaInvert: true, alert: aguardandoAtendente > 0 },
      concluido: { value: String(totalAtendidoPorHumano), sub: totalAtendidoPorHumano > 0 ? `${totalAtendidoPorHumano} conversa${totalAtendidoPorHumano !== 1 ? 's' : ''} resolvida${totalAtendidoPorHumano !== 1 ? 's' : ''}` : 'Nenhuma resolução', delta: calcDelta(totalAtendidoPorHumano, prevAtendidoPorHumano), deltaInvert: false },
      clientesHelena: { value: String(total), sub: 'atendimentos totais', delta: calcDelta(total, prevTotal), deltaInvert: false },
    },
    clientesUnicos,
    reservasHoje,
    aniversariosHoje,
    feedbackNegativoHoje,
    foraHorarioCount: foraHorario,
    satisfacao,
    taxaFeedback,
    reclamacoes,
    programacaoCount,
    progRanking,
    diaMaisProcurado,
    aguardandoAtendente,
    aguardandoRows: rows.filter(r => r.necessita_humano),
  }
}
