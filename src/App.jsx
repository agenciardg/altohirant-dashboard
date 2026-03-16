import { useState, useEffect, useRef, useCallback } from 'react'
import { useDashboardData } from './lib/useDashboardData'
import { useLogoConfig } from './lib/useConfig'
import { useClock } from './lib/useClock'
import { MOCK } from './lib/mockData'
import { COLORS, TABS } from './lib/constants'
import { Modal } from './Modal.jsx'

/* ── Componentes ── */
import { FlameLogo } from './components/FlameLogo'
import { KPICard } from './components/KPICard'
import { CardLinha } from './components/cards/CardLinha'
import { CardDonut } from './components/cards/CardDonut'
import { CardBarras } from './components/cards/CardBarras'
import { CardTabela } from './components/cards/CardTabela'

/* ══ APP ═════════════════════════════════════════════════════════════════════ */
export default function App() {
  const [theme, setTheme] = useState('dark')
  const [tab, setTab] = useState('semana')
  const [filterType, setFilterType] = useState(null)
  const [activeDay, setActiveDay] = useState(null)
  const { logoSrc, updateLogo, removeLogo: removeLogoConfig } = useLogoConfig()
  const fileRef = useRef(null)
  const clock = useClock()

  const { loading, data: realData } = useDashboardData(tab)
  const [modal, setModal] = useState({ type: null, data: null })
  const openModal = useCallback((type, data = null) => setModal({ type, data }), [])
  const closeModal = useCallback(() => setModal({ type: null, data: null }), [])

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
  const barAlt = theme === 'dark' ? COLORS.barAltDark : COLORS.barAltLight

  const clearAll = useCallback(() => { setFilterType(null); setActiveDay(null) }, [])
  const handleTab = useCallback((id) => { setTab(id); setFilterType(null); setActiveDay(null) }, [])
  const toggleTheme = useCallback(() => setTheme(t => t === 'dark' ? 'light' : 'dark'), [])

  const allRows = d.tableRows || []
  const hasFilters = !!(filterType || activeDay)
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })

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
            <button className="tog-btn" aria-label="Alternar tema"
              onClick={toggleTheme}>
              <div className="tog-th">{theme === 'dark' ? '🌙' : '☀️'}</div>
            </button>
          </div>
        </div>
      </header>

      {/* ── Dashboard ── */}
      <div className="dash">

        {/* Tabs */}
        <div className="tabs-w">
          <div className="tabs">
            {TABS.map(([id, lbl]) => (
              <button key={id} className={`tab${tab === id ? ' act' : ''}`} onClick={() => handleTab(id)}>
                {lbl}
              </button>
            ))}
          </div>
        </div>

        {/* Filter chips */}
        {hasFilters && (
          <div className="fchips">
            <span className="fchip-lbl">Filtros ativos:</span>
            {filterType && (
              <span className="b ba" style={{ cursor: 'pointer' }} onClick={() => setFilterType(null)}>
                {filterType} &times;
              </span>
            )}
            {activeDay && (
              <span className="b bn" style={{ cursor: 'pointer' }} onClick={() => setActiveDay(null)}>
                {activeDay} &times;
              </span>
            )}
            <button className="fclear" onClick={clearAll}>Limpar tudo</button>
          </div>
        )}

        {/* Conteúdo da aba — anima ao trocar */}
        <div key={tab} className="tab-content">

        {/* KPIs */}
        <div className="g4">
          <KPICard icon="💬" label="Total Atendimentos" loading={loading}
            value={d.kpis.total.value}
            sub={hasFilters ? 'Ver todos · clique' : d.kpis.total.sub}
            delta={hasFilters ? '× limpar filtros' : d.kpis.total.delta}
            dt={hasFilters ? 'be' : d.kpis.total.dt} ak={tab + 't'}
            onClick={hasFilters ? clearAll : undefined}
            onOpenModal={() => openModal('total')}
          />
          <KPICard icon="🍖" label="Reservas Realizadas" loading={loading}
            value={d.kpis.reservas.value} sub={d.kpis.reservas.sub}
            delta={d.kpis.reservas.delta} dt={d.kpis.reservas.dt} ak={tab + 'r'}
            active={filterType === 'Reservas'}
            onClick={() => setFilterType(filterType === 'Reservas' ? null : 'Reservas')}
            onOpenModal={() => openModal('reservas')}
          />
          <KPICard icon="🕐" label="Fora do Horário" sm loading={loading}
            value={d.kpis.fora.value} sub={d.kpis.fora.sub}
            delta={d.kpis.fora.delta} dt={d.kpis.fora.dt} ak={tab + 'f'}
            onOpenModal={() => openModal('fora')}
          />
          <KPICard icon="🔥" label="Horário de Pico" sm loading={loading}
            value={d.kpis.pico.value} sub={d.kpis.pico.sub}
            delta={d.kpis.pico.delta} dt={d.kpis.pico.dt} ak={tab + 'p'}
            onOpenModal={() => openModal('pico')}
          />
        </div>

        {/* Linha + Donut */}
        <div className="g21">
          <CardLinha data={d.linha} label={d.linhaLabel} ak={tab} loading={loading}
            activeDay={activeDay} setActiveDay={setActiveDay} />
          <CardDonut data={d.donut} ak={tab} loading={loading}
            filterType={filterType} setFilterType={setFilterType}
            onOpenModal={(tipo) => openModal('tipo', tipo)} />
        </div>

        {/* Barras + Tabela */}
        <div className="g11">
          <CardBarras data={d.barras} label={d.barLabel} ak={tab} barAlt={barAlt} loading={loading}
            activeDay={activeDay} setActiveDay={setActiveDay}
            onOpenModal={(dia) => openModal('turno', dia)} />
          <CardTabela rows={allRows} filterType={filterType} loading={loading}
            hasRealData={hasRealData} supabaseOk={supabaseOk}
            onOpenModal={(row) => openModal('registro', row)} />
        </div>

        </div>{/* /tab-content */}

        {/* Footer */}
        <footer className="ftr">
          <div>
            <div className="fb">Alto da Hirant · Churrasco &amp; Cia</div>
            <div className="fm">Dashboard IA WhatsApp · Agência RDG</div>
          </div>
          <div className="fr">
            <div>Sistema de Gestão IA · v2.0</div>
            <div style={{ marginTop: 3 }}>2026 · Todos os direitos reservados</div>
          </div>
        </footer>
      </div>

      {/* ── Modal ── */}
      <Modal state={modal} onClose={closeModal} rawRows={rawRows} />
    </>
  )
}
