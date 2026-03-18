import { useState, useEffect, useRef, useCallback } from 'react'
import { useDashboardData } from './lib/useDashboardData'
import { useLogoConfig } from './lib/useConfig'
import { useClock } from './lib/useClock'
import { MOCK } from './lib/mockData'
import { TABS } from './lib/constants'
import { Modal } from './Modal.jsx'

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

/* ══ APP ═════════════════════════════════════════════════════════════════════ */
export default function App() {
  const [theme, setTheme] = useState('dark')
  const [tab, setTab] = useState('hoje')
  const [filterType, setFilterType] = useState(null)
  const [activeDay, setActiveDay] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
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

  const clearAll = useCallback(() => { setFilterType(null); setActiveDay(null) }, [])
  const handleTab = useCallback((id) => { setTab(id); setFilterType(null); setActiveDay(null); setSelectedItem(null) }, [])
  const toggleTheme = useCallback(() => setTheme(t => t === 'dark' ? 'light' : 'dark'), [])

  const allRows = d.tableRows || []
  const hasFilters = !!(filterType || activeDay)
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })

  const isHoje = tab === 'hoje'

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

        {/* ── Tab Panels (grid overlap — zero layout shift) ── */}
        <div className="tab-panels">
          <div className={`tab-panel${isHoje ? '' : ' tab-panel--hidden'}`}>
            {/* Métricas compactas — topo (clicáveis) */}
            <div className="metricas-compactas" style={{ marginTop: 22 }}>
              <div className="metrica-mini metrica-mini--click" onClick={() => openModal('total')} title="Ver todos os atendimentos">
                <div className="metrica-mini__label">Atendimentos</div>
                <div className="metrica-mini__valor">{loading ? '—' : d.kpis.total.value}</div>
              </div>
              <div className="metrica-mini metrica-mini--click" onClick={() => openModal('reservas')} title="Solicitações de reserva (link GetIn)">
                <div className="metrica-mini__label">Solic. Reserva</div>
                <div className="metrica-mini__valor">{loading ? '—' : d.kpis.reservas.value}</div>
              </div>
              <div className="metrica-mini metrica-mini--click" onClick={() => openModal('feedback')} title="Ver satisfação">
                <div className="metrica-mini__label">Satisfação</div>
                <div className="metrica-mini__valor">{loading ? '—' : d.kpis.satisfacao?.value || '—'}</div>
              </div>
              <div className="metrica-mini metrica-mini--click" onClick={() => openModal('fora')} title="Ver fora do horário">
                <div className="metrica-mini__label">Fora horário</div>
                <div className="metrica-mini__valor">{loading ? '—' : d.kpis.fora.value}</div>
              </div>
            </div>

            <div className="dashboard-hoje">
              {/* Coluna principal */}
              <div className="dashboard-hoje__main">
                <ReservasHoje
                  reservas={d.reservasHoje}
                  onSelectReserva={(item) => setSelectedItem(item)}
                />

                <CardTabela
                  rows={allRows.slice(0, 15)}
                  filterType={null}
                  loading={loading}
                  hasRealData={hasRealData}
                  supabaseOk={supabaseOk}
                  onOpenModal={(row) => setSelectedItem(row)}
                />
              </div>

              {/* Sidebar */}
              <div className="dashboard-hoje__sidebar">
                <DetailPanel
                  item={selectedItem}
                  onClose={() => setSelectedItem(null)}
                />
                <TurnoAtual />
              </div>
            </div>
          </div>

        {/* ════════════════════════════════════════════════════════════════
            ABAS SEMANA / MÊS — Layout analítico (original)
            ════════════════════════════════════════════════════════════════ */}
          <div className={`tab-panel${isHoje ? ' tab-panel--hidden' : ''}`}>
            {/* KPIs — linha 1 */}
            <div className="g4">
              <KPICard icon="💬" label="Total Interações" loading={loading}
                value={d.kpis.total.value}
                sub={hasFilters ? 'Ver todos · clique' : d.kpis.total.sub}
                ak={tab + 't'}
                onClick={hasFilters ? clearAll : undefined}
                onOpenModal={() => openModal('total')}
              />
              <KPICard icon="👤" label="Clientes Únicos" loading={loading}
                value={String(d.clientesUnicos || 0)} sub={d.kpis.total.sub}
                ak={tab + 'u'}
                onOpenModal={() => openModal('clientes')}
              />
              <KPICard icon="🍖" label="Solic. Reserva" loading={loading}
                value={d.kpis.reservas.value} sub={d.kpis.reservas.sub}
                ak={tab + 'r'}
                onOpenModal={() => openModal('reservas')}
              />
              <KPICard icon="🎂" label="Aniversários" sm loading={loading}
                value={d.kpis.aniversarios?.value || '0'} sub={d.kpis.aniversarios?.sub || '—'}
                ak={tab + 'a'}
                onOpenModal={() => openModal('aniversarios')}
              />
            </div>
            {/* KPIs — linha 2 */}
            <div className="g4" style={{ marginTop: 0 }}>
              <KPICard icon="⭐" label="Satisfação" loading={loading}
                value={d.kpis.satisfacao?.value || '—'} sub={d.kpis.satisfacao?.sub || '—'}
                ak={tab + 's'}
                onOpenModal={() => openModal('feedback')}
              />
              <KPICard icon="⚠️" label="Reclamações" sm loading={loading}
                value={d.kpis.reclamacoes?.value || '0'} sub={d.kpis.reclamacoes?.sub || '—'}
                ak={tab + 'rc'}
                onOpenModal={() => openModal('reclamacoes')}
              />
              <KPICard icon="🕐" label="Fora do Horário" sm loading={loading}
                value={d.kpis.fora.value} sub={d.kpis.fora.sub}
                ak={tab + 'f'}
                onOpenModal={() => openModal('fora')}
              />
              <KPICard icon="📅" label="Programação" sm loading={loading}
                value={d.kpis.programacao?.value || '0'} sub={d.kpis.programacao?.sub || '—'}
                ak={tab + 'pg'}
                onOpenModal={() => openModal('programacao')}
              />
            </div>

            {/* Linha + Donut */}
            <div className="g21">
              <CardLinha data={d.linha} label={d.linhaLabel} ak={tab} loading={loading}
                hasRealData={hasRealData} activeDay={activeDay} setActiveDay={setActiveDay} />
              <CardDonut data={d.donut} ak={tab} loading={loading}
                filterType={filterType} setFilterType={setFilterType} />
            </div>

            {/* Barras + Tabela */}
            <div className="g11">
              <CardBarras data={d.barras} label={d.barLabel} ak={tab} loading={loading}
                activeDay={activeDay} setActiveDay={setActiveDay}
                onOpenModal={(dia) => openModal('turno', dia)} />
              <CardTabela rows={allRows} filterType={filterType} loading={loading}
                hasRealData={hasRealData} supabaseOk={supabaseOk}
                onOpenModal={(row) => openModal('registro', row)} />
            </div>

            {/* Fidelização de Clientes */}
            <FidelizacaoPanel data={d.fidelizacao} loading={loading} onOpenModal={openModal} />
          </div>
        </div>

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
