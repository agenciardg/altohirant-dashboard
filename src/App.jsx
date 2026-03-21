import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useDashboardData } from './lib/useDashboardData'
import { useLogoConfig } from './lib/useConfig'
import { useClock } from './lib/useClock'
import { MOCK } from './lib/mockData'
import { TABS } from './lib/constants'
import { Modal } from './Modal.jsx'
import { useAuthContext } from './lib/useAuth.jsx'
import ChangePassword from './components/ChangePassword.jsx'
import {
  useDashboardFilters,
  setTab,
  setFilterType,
  setActiveDay,
  setTurnoFilter,
  setSelectedItem,
  setModal,
  closeModal,
  clearFilters,
  toggleKpiCollapsed,
  setMonthDrill,
} from './context/DashboardFilterContext'

/* ── Componentes ── */
import { FlameLogo } from './components/FlameLogo'
import { KPICard } from './components/KPICard'
import { CardLinha } from './components/cards/CardLinha'
import { CardDonut } from './components/cards/CardDonut'
import { CardBarras } from './components/cards/CardBarras'
import { CardTabela } from './components/cards/CardTabela'
import { ReservasHoje } from './components/ReservasHoje'
import { DetailPanel } from './components/DetailPanel'
import { TurnoAtual } from './components/TurnoAtual'
import { FidelizacaoPanel } from './components/FidelizacaoPanel'
import { DaySelector } from './components/filters/DaySelector'
import { ActiveFiltersBar } from './components/filters/ActiveFiltersBar'
import { BreadcrumbDrill } from './components/filters/BreadcrumbDrill'
import { MiniCalendar } from './components/filters/MiniCalendar'
import { computeDrillData, buildDonut, buildBarras } from './lib/dataProcessors/computeCharts'
import { computeKPIs } from './lib/dataProcessors/computeKPIs'
import { computeTableRows } from './lib/dataProcessors/computeTableRows'
import { computeFidelizacao } from './lib/dataProcessors/computeFidelizacao'
import { useFilteredData } from './hooks/useFilteredData'
import { normTipo, normTurno } from './lib/utils'

/* ══ APP ═════════════════════════════════════════════════════════════════════ */
export default function App() {
  const [theme, setTheme] = useState('dark')
  const { state, dispatch } = useDashboardFilters()
  const { tab, filterType, activeDay, turnoFilter, selectedItem, modal, kpiCollapsed, monthDrill } = state

  const { user, signOut, updatePassword } = useAuthContext()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const settingsRef = useRef(null)

  // Close settings dropdown on outside click
  useEffect(() => {
    if (!settingsOpen) return
    const handleClick = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setSettingsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [settingsOpen])

  const { logoSrc, updateLogo, removeLogo: removeLogoConfig } = useLogoConfig()
  const fileRef = useRef(null)
  const clock = useClock()

  const { loading, data: realData } = useDashboardData(tab)

  const openModal = useCallback((type, data = null) => dispatch(setModal(type, data)), [dispatch])
  const handleCloseModal = useCallback(() => dispatch(closeModal()), [dispatch])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const handleLogoFile = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => updateLogo(ev.target.result)
    reader.readAsDataURL(file)
    e.target.value = ''
  }, [updateLogo])

  const removeLogo = useCallback((ev) => {
    ev.stopPropagation()
    removeLogoConfig()
  }, [removeLogoConfig])

  const supabaseOk = !!(realData?.supabaseOk)
  const d = supabaseOk ? realData : MOCK[tab]
  const hasRealData = !!(realData?.hasRealData)
  const rawRows = realData?.rawRows || []

  const clearAll = useCallback(() => dispatch(clearFilters()), [dispatch])
  const handleTab = useCallback((id) => dispatch(setTab(id)), [dispatch])

  const handleClearFilterType = useCallback(() => {
    if (filterType) dispatch(setFilterType(filterType))
  }, [dispatch, filterType])
  const handleClearActiveDay = useCallback(() => {
    if (activeDay) dispatch(setActiveDay(activeDay))
  }, [dispatch, activeDay])
  const handleClearTurno = useCallback(() => {
    if (turnoFilter) dispatch(setTurnoFilter(turnoFilter))
  }, [dispatch, turnoFilter])
  const toggleTheme = useCallback(() => setTheme(t => t === 'dark' ? 'light' : 'dark'), [])

  const allRows = d.tableRows || []
  const hasFilters = !!(filterType || activeDay || turnoFilter || (tab === 'mes' && monthDrill.level !== 'month'))
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })

  const isHoje = tab === 'hoje'
  const [calOpen, setCalOpen] = useState(false)

  // Close calendar when tab changes
  useEffect(() => { setCalOpen(false) }, [tab])

  // Filtered data for cross-filtering (Fase C)
  const { filteredRows } = useFilteredData(rawRows, tab)

  // Compute week days for DaySelector (only used when tab === 'semana')
  const weekDays = useMemo(() => {
    if (tab !== 'semana') return []
    const now = new Date()
    const dayOfWeek = now.getDay()
    const sunday = new Date(now)
    sunday.setDate(sunday.getDate() - dayOfWeek)
    const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    const days = []
    for (let i = 0; i <= 6; i++) {
      const d = new Date(sunday)
      d.setDate(d.getDate() + i)
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      days.push({ iso: `${y}-${m}-${dd}`, label: DIAS[i], fechado: i === 2 })
    }
    return days
  }, [tab])

  // Compute days for DaySelector in mes drill-down (week level)
  const mesWeekDays = useMemo(() => {
    if (tab !== 'mes' || monthDrill.level !== 'week') return []
    const now = new Date()
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const dowFirst = firstOfMonth.getDay()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']
    const days = []
    for (let dd = 1; dd <= daysInMonth; dd++) {
      const date = new Date(now.getFullYear(), now.getMonth(), dd)
      const wn = Math.min(Math.ceil((dd + dowFirst) / 7), 4)
      if (wn === monthDrill.week) {
        const y = date.getFullYear()
        const m = String(date.getMonth() + 1).padStart(2, '0')
        const dStr = String(date.getDate()).padStart(2, '0')
        days.push({ iso: `${y}-${m}-${dStr}`, label: DIAS[date.getDay()], fechado: date.getDay() === 2 })
      }
    }
    return days
  }, [tab, monthDrill.level, monthDrill.week])

  // Drill-down data for "Este Mês" tab (null when at top level or not on mes tab)
  const drillData = useMemo(() => {
    if (tab !== 'mes' || monthDrill.level === 'month') return null
    return computeDrillData(rawRows, monthDrill)
  }, [tab, monthDrill, rawRows])

  // Derived chart sources: use drill data when drilling, otherwise use processed data (d)
  const mesLinha = drillData ? drillData.linha : d.linha
  const mesLinhaLabel = drillData ? drillData.linhaLabel : d.linhaLabel
  const mesBarras = drillData ? drillData.barras : d.barras
  const mesBarLabel = drillData ? drillData.barLabel : d.barLabel
  const mesDonut = drillData ? drillData.donut : d.donut

  // ── Cross-filtering: reprocess charts when filterType/turnoFilter active (Fase C) ──
  const classifyTurno = (turno) => {
    const t = normTurno(turno)
    if (t === 'Almoco') return 'al'
    if (t === 'Happy Hour') return 'hh'
    if (t === 'Fora Horário') return 'f'
    return 'j'
  }

  const chartSourceRows = useMemo(() => {
    if (isHoje) return []
    let base = drillData ? drillData.rows : rawRows
    if (activeDay) base = base.filter(r => r.data === activeDay)
    if (filterType) base = base.filter(r => normTipo(r.tipo_atendimento) === filterType)
    if (turnoFilter) base = base.filter(r => classifyTurno(r.turno) === turnoFilter)
    return base
  }, [isHoje, drillData, rawRows, activeDay, filterType, turnoFilter])

  const hasActiveChartFilters = !!(filterType || turnoFilter || activeDay)

  const activeDonut = useMemo(() => {
    if (isHoje || !hasActiveChartFilters) return tab === 'mes' ? mesDonut : d.donut
    return buildDonut(chartSourceRows)
  }, [isHoje, hasActiveChartFilters, tab, mesDonut, d.donut, chartSourceRows])

  const activeBarras = useMemo(() => {
    if (isHoje || !hasActiveChartFilters) return tab === 'mes' ? mesBarras : d.barras
    return buildBarras(chartSourceRows, tab)
  }, [isHoje, hasActiveChartFilters, tab, mesBarras, d.barras, chartSourceRows])

  const activeBarLabel = useMemo(() => {
    if (tab === 'mes') return drillData ? drillData.barLabel : d.barLabel
    return d.barLabel
  }, [tab, drillData, d.barLabel])

  // ── Dynamic fidelizacao (Fase D) ──
  const fidelizacaoData = useMemo(() => {
    if (isHoje) return null
    if (tab === 'mes' && drillData) return computeFidelizacao(drillData.rows, tab)
    if (filterType || activeDay || turnoFilter) return computeFidelizacao(filteredRows, tab)
    return d.fidelizacao
  }, [isHoje, tab, drillData, filterType, activeDay, turnoFilter, filteredRows, d.fidelizacao])

  // ── Reactive KPIs: recompute when drill or filters are active ──
  const activeRows = useMemo(() => {
    if (isHoje) return null // Hoje uses d.kpis directly
    // Drill ativo no mês tem prioridade
    if (tab === 'mes' && drillData) return drillData.rows
    // Filtros ativos
    if (filterType || activeDay || turnoFilter) return filteredRows
    return null // null = use d.kpis (no recomputation needed)
  }, [isHoje, tab, drillData, filterType, activeDay, turnoFilter, filteredRows])

  const activeKpiResult = useMemo(() => {
    if (!activeRows) return null
    return computeKPIs(activeRows, [], tab)
  }, [activeRows, tab])

  // The values to actually render — either recomputed or original
  const kpis = activeKpiResult ? activeKpiResult.kpis : d.kpis
  const clientesUnicos = activeKpiResult ? activeKpiResult.clientesUnicos : d.clientesUnicos

  // Active raw rows (always raw Supabase objects) — single source of truth
  const activeRawRows = useMemo(() => {
    if (tab === 'mes' && drillData) return drillData.rows
    if (filterType || activeDay || turnoFilter) return filteredRows
    return rawRows
  }, [tab, drillData, filterType, activeDay, turnoFilter, filteredRows, rawRows])

  // Active table rows (processed for CardTabela) — always derived from activeRawRows
  const activeTableRows = useMemo(() => {
    return computeTableRows(activeRawRows)
  }, [activeRawRows])

  // Navigate breadcrumb levels
  const handleDrillNavigate = useCallback(
    (drill) => dispatch(setMonthDrill(drill)),
    [dispatch]
  )

  /**
   * Line chart click handler.
   * - On mes/month level: clicking a "Sem N" point drills into that week.
   * - On mes/week level: clicking a day point (which has an iso property) drills into that day.
   * - All other cases: toggle activeDay as before.
   */
  const handleLineDayClick = useCallback((pointOrDay) => {
    if (tab === 'mes') {
      if (monthDrill.level === 'month' && typeof pointOrDay === 'object' && pointOrDay !== null) {
        const weekNum = parseInt(String(pointOrDay.dia).replace('Sem ', ''))
        if (!isNaN(weekNum)) {
          dispatch(setMonthDrill({ level: 'week', week: weekNum }))
          return
        }
      }
      if (monthDrill.level === 'week' && typeof pointOrDay === 'object' && pointOrDay !== null && pointOrDay.iso) {
        dispatch(setMonthDrill({ level: 'day', week: monthDrill.week, day: pointOrDay.iso }))
        return
      }
      // At day level or unrecognised — no further drill; do nothing
      return
    }
    // Non-mes tabs: toggle activeDay
    const dayValue = typeof pointOrDay === 'object' && pointOrDay !== null
      ? (pointOrDay.iso || pointOrDay.dia)
      : pointOrDay
    dispatch({ type: 'SET_ACTIVE_DAY', payload: state.activeDay === dayValue ? null : dayValue })
  }, [tab, monthDrill, dispatch, state.activeDay])

  return (
    <>
      {/* ── Header ── */}
      <header className="hdr">
        <div className="hdr-i">
          <div className="brand">
            <div className="logo-wrap" onClick={() => fileRef.current?.click()}>
              {logoSrc ? <img src={logoSrc} className="logo-img" alt="Logo" /> : <FlameLogo size={46} />}
              <div className="logo-ov">
                <span className="logo-ov-icon">📷</span>
                <span className="logo-ov-txt">Alterar</span>
              </div>
              {logoSrc && <button className="logo-reset" onClick={removeLogo} title="Remover foto">×</button>}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoFile} />
            <div>
              <div className="b-name">Alto da Hirant</div>
              <div className="b-tag">Churrasco &amp; Cia</div>
            </div>
            {clock && <div className="clk-brand">{clock}</div>}
          </div>
          <div className="hdr-r">
            <div className="agt"><div className="dot" />Agente IA Online</div>
            <div className="date">{today}</div>
            <button className="hdr-pill" aria-label="Alternar tema"
              onClick={toggleTheme} title="Alternar tema">
              <div className="tog-th">{theme === 'dark' ? '🌙' : '☀️'}</div>
            </button>
            {/* Settings menu */}
            <div className="settings-wrap" ref={settingsRef}>
              <button
                className="hdr-pill hdr-pill--icon"
                onClick={() => setSettingsOpen(o => !o)}
                aria-label="Configurações"
                title="Configurações"
              >
                <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.062 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </button>
              {settingsOpen && (
                <div className="settings-dropdown">
                  <div className="settings-user">
                    {user?.email}
                  </div>
                  <div className="settings-divider" />
                  <ChangePassword updatePassword={updatePassword} />
                </div>
              )}
            </div>
            <button
              className="hdr-pill hdr-pill--icon hdr-pill--logout"
              onClick={signOut}
              aria-label="Sair"
              title="Sair"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </header>


      {/* ── Dashboard ── */}
      <div className="dash">

        {/* Tabs + KPI toggle on same row */}
        <div className="tabs-bar">
          <div className="tabs">
            {TABS.map(([id, lbl]) => (
              <button key={id} className={`tab${tab === id ? ' act' : ''}`} onClick={() => handleTab(id)}>
                {lbl}
                {id === 'mes' && <span className={`tab-indicator${calOpen ? ' tab-indicator--open' : ''}`}>&#9662;</span>}
              </button>
            ))}
          </div>
          {!isHoje && (
            <button className="kpi-toggle" onClick={() => dispatch(toggleKpiCollapsed())}>
              {kpiCollapsed ? '▼ Expandir KPIs' : '▲ Minimizar KPIs'}
            </button>
          )}
        </div>

        {/* ── Tab Panels (grid overlap — zero layout shift) ── */}
        <div className="tab-panels">
          <div className={`tab-panel${isHoje ? '' : ' tab-panel--hidden'}`}>
            {/* KPIs completos — 4 cards */}
            <div className="g4" style={{ marginTop: 12 }}>
              <KPICard icon="💬" label="Atendimentos" loading={loading}
                value={d.kpis.total.value} sub={d.kpis.total.sub}
                ak={tab + 't'} delta={d.kpis.total.delta} deltaInvert={false}
                onOpenModal={() => openModal('total')}
              />
              <KPICard icon="🍖" label="Solic. Reserva" loading={loading}
                value={d.kpis.reservas.value} sub={d.kpis.reservas.sub}
                ak={tab + 'r'} delta={d.kpis.reservas?.delta} deltaInvert={false}
                onOpenModal={() => openModal('reservas')}
              />
              <KPICard icon="⭐" label="Satisfação" loading={loading}
                value={d.kpis.satisfacao?.value || '—'} sub={d.kpis.satisfacao?.sub || '—'}
                ak={tab + 's'} delta={d.kpis.satisfacao?.delta} deltaInvert={false}
                onOpenModal={() => openModal('feedback')}
              />
              <KPICard icon="🕐" label="Fora do Horário" sm loading={loading}
                value={d.kpis.fora.value} sub={d.kpis.fora.sub}
                ak={tab + 'f'} delta={d.kpis.fora?.delta} deltaInvert={true}
                onOpenModal={() => openModal('fora')}
              />
            </div>

            {/* KPIs — linha 2 */}
            <div className="g4" style={{ marginTop: 0 }}>
              <KPICard icon="👤" label="Clientes Únicos" loading={loading}
                value={String(d.clientesUnicos || 0)} sub={d.kpis.total.sub}
                ak={tab + 'u'} delta={d.kpis.clientes?.delta} deltaInvert={d.kpis.clientes?.deltaInvert ?? false}
                onOpenModal={() => openModal('clientes')}
              />
              <KPICard icon="🎂" label="Aniversários" sm loading={loading}
                value={d.kpis.aniversarios?.value || '0'} sub={d.kpis.aniversarios?.sub || '—'}
                ak={tab + 'a'} delta={d.kpis.aniversarios?.delta} deltaInvert={d.kpis.aniversarios?.deltaInvert ?? false}
                onOpenModal={() => openModal('aniversarios')}
              />
              <KPICard icon="⚠️" label="Reclamações" sm loading={loading}
                value={d.kpis.reclamacoes?.value || '0'} sub={d.kpis.reclamacoes?.sub || '—'}
                ak={tab + 'rc'} delta={d.kpis.reclamacoes?.delta} deltaInvert={d.kpis.reclamacoes?.deltaInvert ?? true}
                onOpenModal={() => openModal('reclamacoes')}
              />
              <KPICard icon="📅" label="Programação" sm loading={loading}
                value={d.kpis.programacao?.value || '0'} sub={d.kpis.programacao?.sub || '—'}
                ak={tab + 'pg'} delta={d.kpis.programacao?.delta} deltaInvert={d.kpis.programacao?.deltaInvert ?? false}
                onOpenModal={() => openModal('programacao')}
              />
            </div>

            <div className="dashboard-hoje">
              {/* Coluna principal */}
              <div className="dashboard-hoje__main">
                <ReservasHoje
                  reservas={d.reservasHoje}
                  onSelectReserva={(item) => dispatch(setSelectedItem(item))}
                />
                <CardDonut data={d.donut} ak={tab} loading={loading}
                  filterType={null} setFilterType={() => {}} />
              </div>

              {/* Sidebar */}
              <div className="dashboard-hoje__sidebar">
                <DetailPanel
                  item={selectedItem}
                  onClose={() => dispatch(setSelectedItem(null))}
                  onOpenConversa={(row) => openModal('conversa', row)}
                />
                <TurnoAtual />
              </div>
            </div>

          </div>

        {/* ════════════════════════════════════════════════════════════════
            ABAS SEMANA / MÊS — Layout analítico (original)
            ════════════════════════════════════════════════════════════════ */}
          <div className={`tab-panel${isHoje ? ' tab-panel--hidden' : ''}`}>
            {tab === 'semana' && (
              <DaySelector days={weekDays} activeDay={activeDay} onDayClick={(day) => dispatch(setActiveDay(day))} />
            )}
            {tab === 'mes' && (
              <>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BreadcrumbDrill monthDrill={monthDrill} onNavigate={handleDrillNavigate} />
                  <button className="cal-trigger" onClick={() => setCalOpen(o => !o)} aria-label="Abrir calendario">
                    {calOpen ? '✕ Fechar' : 'Ver calendario'}
                  </button>
                  {calOpen && (
                    <MiniCalendar
                      monthDrill={monthDrill}
                      onSelectWeek={(w) => { dispatch(setMonthDrill({ level: 'week', week: w })); setCalOpen(false) }}
                      onSelectDay={(iso, w) => { dispatch(setMonthDrill({ level: 'day', week: w, day: iso })); setCalOpen(false) }}
                      onClose={() => setCalOpen(false)}
                      rawRows={rawRows}
                    />
                  )}
                </div>
                {monthDrill.level === 'week' && (
                  <DaySelector
                    days={mesWeekDays}
                    activeDay={monthDrill.level === 'day' ? monthDrill.day : null}
                    onDayClick={(iso) => {
                      if (!iso) dispatch(setMonthDrill({ level: 'week', week: monthDrill.week }))
                      else dispatch(setMonthDrill({ level: 'day', week: monthDrill.week, day: iso }))
                    }}
                  />
                )}
              </>
            )}

            {kpiCollapsed ? (
              <div className="kpi-strip">
                {[
                  { icon: '💬', label: 'Total', value: kpis.total.value, delta: kpis.total.delta, deltaInvert: false },
                  { icon: '👤', label: 'Únicos', value: String(clientesUnicos || 0) },
                  { icon: '🍖', label: 'Reservas', value: kpis.reservas.value, delta: kpis.reservas.delta, deltaInvert: false },
                  { icon: '🎂', label: 'Niver', value: kpis.aniversarios?.value || '0' },
                  { icon: '⭐', label: 'Satisf.', value: kpis.satisfacao?.value || '—', delta: kpis.satisfacao?.delta, deltaInvert: false },
                  { icon: '⚠️', label: 'Reclam.', value: kpis.reclamacoes?.value || '0', delta: kpis.reclamacoes?.delta, deltaInvert: true },
                  { icon: '🕐', label: 'Fora H.', value: kpis.fora.value, delta: kpis.fora.delta, deltaInvert: true },
                  { icon: '📅', label: 'Progr.', value: kpis.programacao?.value || '0' },
                ].map((k, i) => (
                  <div key={i} className="kpi-strip__item">
                    <span className="kpi-strip__icon">{k.icon}</span>
                    <span className="kpi-strip__val">{loading ? '—' : k.value}</span>
                    {k.delta != null && k.delta !== 0 && (
                      <span className={`kdelta ${(k.deltaInvert ? k.delta < 0 : k.delta > 0) ? 'kdelta--good' : 'kdelta--bad'}`}>
                        {k.delta > 0 ? '▲+' : '▼'}{k.delta}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* KPIs — linha 1 */}
                <div className="g4">
                  <KPICard icon="💬" label="Total Interações" loading={loading}
                    value={kpis.total.value}
                    sub={kpis.total.sub}
                    ak={tab + 't'}
                    onOpenModal={() => openModal('total')}
                    delta={kpis.total.delta} deltaInvert={kpis.total.deltaInvert}
                  />
                  <KPICard icon="👤" label="Clientes Únicos" loading={loading}
                    value={String(clientesUnicos || 0)} sub={kpis.total.sub}
                    ak={tab + 'u'}
                    onOpenModal={() => openModal('clientes')}
                    delta={kpis.clientes?.delta} deltaInvert={kpis.clientes?.deltaInvert ?? false}
                  />
                  <KPICard icon="🍖" label="Solic. Reserva" loading={loading}
                    value={kpis.reservas.value} sub={kpis.reservas.sub}
                    ak={tab + 'r'}
                    onOpenModal={() => openModal('reservas')}
                    delta={kpis.reservas.delta} deltaInvert={kpis.reservas.deltaInvert}
                  />
                  <KPICard icon="🎂" label="Aniversários" sm loading={loading}
                    value={kpis.aniversarios?.value || '0'} sub={kpis.aniversarios?.sub || '—'}
                    ak={tab + 'a'}
                    onOpenModal={() => openModal('aniversarios')}
                    delta={kpis.aniversarios?.delta} deltaInvert={kpis.aniversarios?.deltaInvert ?? false}
                  />
                </div>
                {/* KPIs — linha 2 */}
                <div className="g4" style={{ marginTop: 0 }}>
                  <KPICard icon="⭐" label="Satisfação" loading={loading}
                    value={kpis.satisfacao?.value || '—'} sub={kpis.satisfacao?.sub || '—'}
                    ak={tab + 's'}
                    onOpenModal={() => openModal('feedback')}
                    delta={kpis.satisfacao?.delta} deltaInvert={kpis.satisfacao?.deltaInvert ?? false}
                  />
                  <KPICard icon="⚠️" label="Reclamações" sm loading={loading}
                    value={kpis.reclamacoes?.value || '0'} sub={kpis.reclamacoes?.sub || '—'}
                    ak={tab + 'rc'}
                    onOpenModal={() => openModal('reclamacoes')}
                    delta={kpis.reclamacoes?.delta} deltaInvert={kpis.reclamacoes?.deltaInvert ?? true}
                  />
                  <KPICard icon="🕐" label="Fora do Horário" sm loading={loading}
                    value={kpis.fora.value} sub={kpis.fora.sub}
                    ak={tab + 'f'}
                    onOpenModal={() => openModal('fora')}
                    delta={kpis.fora.delta} deltaInvert={kpis.fora.deltaInvert}
                  />
                  <KPICard icon="📅" label="Programação" sm loading={loading}
                    value={kpis.programacao?.value || '0'} sub={kpis.programacao?.sub || '—'}
                    ak={tab + 'pg'}
                    onOpenModal={() => openModal('programacao')}
                    delta={kpis.programacao?.delta} deltaInvert={kpis.programacao?.deltaInvert ?? false}
                  />
                </div>
              </>
            )}

            {/* Active Filters Bar */}
            <ActiveFiltersBar
              filterType={filterType} activeDay={activeDay} turnoFilter={turnoFilter}
              onClearType={handleClearFilterType} onClearDay={handleClearActiveDay}
              onClearTurno={handleClearTurno} onClearAll={clearAll}
            />

            {/* Linha + Donut */}
            <div className="g21">
              <CardLinha
                data={tab === 'mes' ? mesLinha : d.linha}
                label={tab === 'mes' ? mesLinhaLabel : d.linhaLabel}
                ak={tab + (monthDrill.level !== 'month' ? monthDrill.level : '')}
                loading={loading}
                hasRealData={hasRealData}
                activeDay={activeDay}
                setActiveDay={tab === 'mes' ? handleLineDayClick : (day) => dispatch(setActiveDay(day))}
              />
              <CardDonut
                data={activeDonut}
                ak={tab}
                loading={loading}
                filterType={filterType}
                setFilterType={(tipo) => dispatch(setFilterType(tipo))}
              />
            </div>

            {/* Barras + Tabela */}
            <div className="g11">
              <CardBarras
                data={activeBarras}
                label={activeBarLabel}
                ak={tab}
                loading={loading}
                activeDay={activeDay}
                setActiveDay={(day) => dispatch(setActiveDay(day))}
                turnoFilter={turnoFilter}
                onOpenModal={(dia) => openModal('turno', dia)}
              />
              <CardTabela
                rows={activeTableRows}
                filterType={filterType}
                loading={loading}
                hasRealData={hasRealData}
                supabaseOk={supabaseOk}
                onOpenModal={(row) => openModal('registro', row)}
              />
            </div>

            {/* Fidelização de Clientes */}
            <FidelizacaoPanel data={fidelizacaoData} loading={loading} onOpenModal={openModal} />
          </div>
        </div>

        {/* Footer */}
        <footer className="ftr">
          <div>
            <div className="fb">Alto da Hirant · Churrasco &amp; Cia</div>
            <div className="fm">Dashboard IA WhatsApp · Agência RDG</div>
          </div>
          <div className="fr">
            <div>Sistema de Gestão IA · v3.0</div>
            <div style={{ marginTop: 3 }}>2026 · Todos os direitos reservados</div>
          </div>
        </footer>
      </div>

      {/* ── Modal ── */}
      <Modal state={modal} onClose={handleCloseModal} rawRows={activeRawRows} />
    </>
  )
}
