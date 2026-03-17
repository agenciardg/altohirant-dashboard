import { useState, useEffect, memo } from 'react'
import { TipoBadge, StBadge, TurnoBadge } from '../Badges'
import { PAGE_SIZE, COLORS } from '../../lib/constants'

function CardTabelaInner({ rows, filterType, loading, hasRealData, supabaseOk, onOpenModal }) {
  const [page, setPage] = useState(0)

  const filtered = filterType ? rows.filter(r => r.tipo === filterType) : rows
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const pageRows = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)

  useEffect(() => { setPage(0) }, [filterType, rows])

  return (
    <div className="card">
      <div className="ch">
        <div>
          <div className="ct">Últimos Atendimentos</div>
          <div className="cs">
            {loading ? 'Carregando...' : filterType
              ? `${filtered.length} de ${rows.length} registros · ${filterType}`
              : hasRealData
                ? `${rows.length} registros · banco de dados`
                : supabaseOk
                  ? 'Sem atendimentos neste período'
                  : 'Dados de demonstração'}
          </div>
        </div>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: hasRealData ? COLORS.success : COLORS.warning, boxShadow: `0 0 7px ${hasRealData ? 'rgba(34,197,94,.55)' : 'rgba(245,158,11,.55)'}`, marginTop: 4 }} />
      </div>
      <div style={{ padding: '10px 0 0' }}>
        <div className="tscr">
          <table>
            <thead>
              <tr><th>ID</th><th>Hora</th><th>Cliente</th><th>Tipo</th><th>Turno</th><th>Feedback</th></tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 28, color: 'var(--t2)' }}>
                  Carregando dados do banco de dados...
                </td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 28, color: 'var(--t3)', fontStyle: 'italic' }}>
                  {supabaseOk ? 'Nenhum atendimento neste período' : 'Nenhum registro encontrado'}
                </td></tr>
              )}
              {!loading && pageRows.map(r => (
                <tr key={r.id} style={{ cursor: 'pointer' }}
                  onClick={() => onOpenModal && onOpenModal(r._raw || r)}
                  title="Clique para ver detalhes">
                  <td style={{ color: 'var(--t3)', fontSize: 11, fontFamily: 'monospace' }}>{r.id}</td>
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

        {!loading && filtered.length > PAGE_SIZE && (
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
      </div>
    </div>
  )
}

export const CardTabela = memo(CardTabelaInner)
