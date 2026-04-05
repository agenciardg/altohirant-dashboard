import { useState, useEffect, memo } from 'react'
import { TipoBadge, StBadge, TurnoBadge } from '../Badges'
import { PAGE_SIZE, COLORS } from '../../lib/constants'

const kpiBox = { background: 'var(--card-grad, var(--card))', border: '1px solid var(--border)', padding: '10px 14px', borderRadius: 10, textAlign: 'center' }
const kpiLabel = { fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, color: 'var(--t2)', marginBottom: 4 }

function CardTabelaInner({ rows, filterType, loading, hasRealData, supabaseOk, onOpenModal, fidelizacao, data }) {
  const [page, setPage] = useState(0)
  const [activeTab, setActiveTab] = useState('atendimentos')

  // rows is the prop name used externally; data is an alias used internally in the feature spec
  const tableData = rows || data || []

  const totalPages = Math.max(1, Math.ceil(tableData.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const pageRows = tableData.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)

  useEffect(() => { setPage(0) }, [filterType, rows])

  // Find most recent conversa row for a client by phone number
  const findLatestRowForClient = (numero) => {
    if (!tableData.length) return null
    return tableData.find(r => r.cli === numero || (r._raw && r._raw.numero_cliente === numero)) || null
  }

  // Format last visit date from frequentes entry
  const formatLastVisit = (c) => {
    if (!c.dias || c.dias.size === 0) return '—'
    const dates = [...c.dias].sort()
    const last = dates[dates.length - 1]
    if (!last) return '—'
    const parts = last.split('-')
    if (parts.length === 3) return `${parts[2]}/${parts[1]}`
    return last
  }

  return (
    <div className="card">
      <div className="ch">
        <div>
          <div className="ct">Atendimentos &amp; Clientes Frequentes</div>
          <div className="cs">
            {loading ? 'Carregando...' : filterType
              ? `${tableData.length} de ${tableData.length} registros · ${filterType}`
              : hasRealData
                ? `${tableData.length} registros · banco de dados`
                : supabaseOk
                  ? 'Sem atendimentos neste período'
                  : 'Dados de demonstração'}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Tab switcher */}
          <div style={{ display: 'flex', gap: 2, background: 'var(--bg1, var(--card))', borderRadius: 10, padding: 2, width: 'fit-content' }}>
            <button onClick={() => setActiveTab('atendimentos')} style={{
              padding: '5px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: activeTab === 'atendimentos' ? 700 : 500,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              background: activeTab === 'atendimentos' ? '#E85D04' : 'transparent',
              color: activeTab === 'atendimentos' ? '#fff' : 'var(--t2)',
              transition: 'all 0.2s',
            }}>Atendimentos ({tableData.length})</button>
            <button onClick={() => setActiveTab('frequentes')} style={{
              padding: '5px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: activeTab === 'frequentes' ? 700 : 500,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              background: activeTab === 'frequentes' ? '#E85D04' : 'transparent',
              color: activeTab === 'frequentes' ? '#fff' : 'var(--t2)',
              transition: 'all 0.2s',
            }}>Clientes Frequentes ({fidelizacao?.frequentes?.length || 0})</button>
          </div>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: hasRealData ? COLORS.success : COLORS.warning, boxShadow: `0 0 7px ${hasRealData ? 'rgba(34,197,94,.55)' : 'rgba(245,158,11,.55)'}` }} />
        </div>
      </div>

      <div style={{ padding: '10px 0 0' }}>
        {/* ── Atendimentos tab ── */}
        {activeTab === 'atendimentos' && (
          <>
            <div className="tscr">
              <table>
                <thead>
                  <tr><th>ID</th><th>Data</th><th>Hora</th><th>Cliente</th><th>Tipo</th><th>Turno</th><th>Feedback</th></tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: 28, color: 'var(--t2)' }}>
                      Carregando dados do banco de dados...
                    </td></tr>
                  )}
                  {!loading && tableData.length === 0 && (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: 28, color: 'var(--t3)', fontStyle: 'italic' }}>
                      {supabaseOk ? 'Nenhum atendimento neste período' : 'Nenhum registro encontrado'}
                    </td></tr>
                  )}
                  {!loading && pageRows.map(r => (
                    <tr key={r.id} style={{ cursor: 'pointer' }}
                      onClick={() => onOpenModal && onOpenModal(r._raw || r)}
                      title="Clique para ver detalhes">
                      <td style={{ color: 'var(--t3)', fontSize: 11, fontFamily: 'monospace' }}>{r.id}</td>
                      <td style={{ fontSize: 11, color: 'var(--t2)', whiteSpace: 'nowrap' }}>{r.dt}</td>
                      <td style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 13 }}>{r.h}</td>
                      <td style={{ fontWeight: 600 }}>{r.cli}</td>
                      <td><TipoBadge tipo={r.tipo} /></td>
                      <td><TurnoBadge turno={r.turno} /></td>
                      <td><StBadge st={r.st} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!loading && tableData.length > PAGE_SIZE && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 0 4px', borderTop: '1px solid var(--border)', marginTop: 6 }}>
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={safePage === 0}
                  aria-label="Página anterior"
                  style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 10px', cursor: safePage === 0 ? 'not-allowed' : 'pointer', color: safePage === 0 ? 'var(--t3)' : 'var(--t1)', fontSize: 12 }}>
                  ‹ Anterior
                </button>
                <span style={{ fontSize: 11, color: 'var(--t2)' }} aria-live="polite">
                  {safePage + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={safePage === totalPages - 1}
                  aria-label="Próxima página"
                  style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 10px', cursor: safePage === totalPages - 1 ? 'not-allowed' : 'pointer', color: safePage === totalPages - 1 ? 'var(--t3)' : 'var(--t1)', fontSize: 12 }}>
                  Próximo ›
                </button>
              </div>
            )}
          </>
        )}

        {/* ── Clientes Frequentes tab ── */}
        {activeTab === 'frequentes' && (
          <>
            {/* Mini KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, padding: '8px 0 12px' }}>
              <div style={kpiBox}>
                <div style={kpiLabel}>Novos</div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 900, color: '#EC4899' }}>{fidelizacao?.novos || 0}</div>
              </div>
              <div style={kpiBox}>
                <div style={kpiLabel}>Retornantes</div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 900, color: '#e8a020' }}>{fidelizacao?.retornantes || 0}</div>
              </div>
              <div style={kpiBox}>
                <div style={kpiLabel}>Taxa Retorno</div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 900, color: '#e8a020' }}>{fidelizacao?.taxa || 0}%</div>
              </div>
            </div>

            {/* Frequentes table */}
            <div className="tscr">
              <table>
                <thead>
                  <tr><th>#</th><th>Cliente</th><th>Visitas</th><th>Última Visita</th></tr>
                </thead>
                <tbody>
                  {(!fidelizacao?.frequentes || fidelizacao.frequentes.length === 0) && (
                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: 28, color: 'var(--t3)', fontStyle: 'italic' }}>
                      Nenhum cliente frequente neste período
                    </td></tr>
                  )}
                  {(fidelizacao?.frequentes || []).map((c, i) => (
                    <tr key={i} style={{ cursor: 'pointer' }} onClick={() => {
                      const row = findLatestRowForClient(c.numero)
                      if (row && onOpenModal) onOpenModal(row._raw || row)
                    }}>
                      <td style={{ textAlign: 'center' }}>
                        {i < 3 ? (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: 22, height: 22, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #E85D04, #e8a020)',
                            color: '#fff', fontSize: 10, fontWeight: 700,
                          }}>{i + 1}</span>
                        ) : <span style={{ color: 'var(--t3)' }}>{i + 1}</span>}
                      </td>
                      <td style={{ fontWeight: 600 }}>{c.nome || c.numero}</td>
                      <td style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: i < 3 ? '#e8a020' : 'var(--t1)' }}>{c.diasContato}</td>
                      <td style={{ fontSize: 11, color: 'var(--t2)' }}>{formatLastVisit(c)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export const CardTabela = memo(CardTabelaInner)
