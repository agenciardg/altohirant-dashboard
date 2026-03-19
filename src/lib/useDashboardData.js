import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { computeKPIs } from './dataProcessors/computeKPIs'
import { computeCharts, isoDate, subDays } from './dataProcessors/computeCharts'
import { computeTableRows } from './dataProcessors/computeTableRows'
import { computeFidelizacao } from './dataProcessors/computeFidelizacao'

/* ── Date range helper ── */
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
    // Semana calendário: domingo a sábado
    const dayOfWeek = now.getDay() // 0=Dom ... 6=Sab
    const sunday = subDays(now, dayOfWeek)
    const start = isoDate(sunday)
    const prevSunday = subDays(sunday, 7)
    return { start, end: today, prevStart: isoDate(prevSunday), prevEnd: isoDate(subDays(sunday, 1)) }
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

/* ── Orchestrator ── */

/**
 * Assembles the full dashboard data object from raw Supabase rows.
 * Delegates to four pure-function processors and merges their results.
 *
 * @param {object[]} rows      - Rows for the current period.
 * @param {object[]} prevRows  - Rows for the previous period.
 * @param {'hoje'|'semana'|'mes'} tab
 * @returns {object}
 */
function processData(rows, prevRows, tab) {
  const kpiResult   = computeKPIs(rows, prevRows, tab)
  const chartResult = computeCharts(rows, tab)
  const tableRows   = computeTableRows(rows)
  const fidelizacao = computeFidelizacao(rows, tab)

  return {
    // KPIs
    kpis:                 kpiResult.kpis,
    clientesUnicos:       kpiResult.clientesUnicos,
    reservasHoje:         kpiResult.reservasHoje,
    aniversariosHoje:     kpiResult.aniversariosHoje,
    feedbackNegativoHoje: kpiResult.feedbackNegativoHoje,
    foraHorarioCount:     kpiResult.foraHorarioCount,
    satisfacao:           kpiResult.satisfacao,
    taxaFeedback:         kpiResult.taxaFeedback,
    reclamacoes:          kpiResult.reclamacoes,
    programacaoCount:     kpiResult.programacaoCount,
    progRanking:          kpiResult.progRanking,
    diaMaisProcurado:     kpiResult.diaMaisProcurado,
    // Charts
    linha:      chartResult.linha,
    linhaLabel: chartResult.linhaLabel,
    donut:      chartResult.donut,
    barras:     chartResult.barras,
    barLabel:   chartResult.barLabel,
    // Table
    tableRows,
    rawRows: rows,
    // Fidelization
    fidelizacao,
    // Meta
    hasRealData: rows.length > 0,
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
const POLL_INTERVAL = 30_000 // 30 segundos

export function useDashboardData(tab) {
  const [state, setState] = useState({ loading: true, data: null, error: null })

  useEffect(() => {
    setState(s => ({ ...s, loading: true }))
    let cancelled = false

    async function load(isPolling) {
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
        // Em polling silencioso, mantém dados antigos em vez de limpar tudo
        if (!cancelled && !isPolling) setState({ loading: false, data: null, error: message })
      }
    }

    load(false)

    // Polling automático para manter dados atualizados
    const interval = setInterval(() => load(true), POLL_INTERVAL)

    return () => { cancelled = true; clearInterval(interval) }
  }, [tab])

  return state
}
