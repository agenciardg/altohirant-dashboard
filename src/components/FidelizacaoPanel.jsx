import { memo } from 'react'

/* ── Cores ── */
const COR_NOVOS = '#3B82F6'
const COR_RETORNANTES = '#22C55E'

/* ── Stat box (estilo metrica-mini, sem .card) ── */
function StatBox({ label, value, color, sub }) {
  return (
    <div style={{
      flex: 1, minWidth: 0, textAlign: 'center',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid var(--border)',
      borderRadius: 8, padding: '10px 8px',
    }}>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--t2)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, color: color || 'var(--t1)', lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--t2)', marginTop: 3 }}>{sub}</div>}
    </div>
  )
}

/* ── Donut (mesmo estilo do CardDonut existente) ── */
function PieDonut({ novos, retornantes }) {
  const total = novos + retornantes
  if (total === 0) return <div style={{ color: 'var(--t3)', fontSize: 11, textAlign: 'center', padding: 20 }}>Sem dados</div>
  const pctR = Math.round((retornantes / total) * 100)
  const pctN = 100 - pctR

  const R = 40, cx = 50, cy = 50, stroke = 14
  const C = 2 * Math.PI * R
  const dashR = (pctR / 100) * C
  const dashN = C - dashR

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <svg viewBox="0 0 100 100" style={{ width: 72, height: 72, flexShrink: 0 }}>
        {/* Retornantes arc */}
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={COR_RETORNANTES} strokeWidth={stroke}
          strokeDasharray={`${dashR} ${dashN}`} strokeDashoffset={C / 4} strokeLinecap="round" />
        {/* Novos arc */}
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={COR_NOVOS} strokeWidth={stroke}
          strokeDasharray={`${dashN} ${dashR}`} strokeDashoffset={C / 4 - dashR} strokeLinecap="round" />
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
          style={{ fontSize: 13, fontWeight: 700, fill: 'var(--t1)', fontFamily: "'Playfair Display',serif" }}>{total}</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: COR_RETORNANTES, flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--t2)' }}>Retornantes</span>
          <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 14, color: 'var(--t1)' }}>{pctR}%</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: COR_NOVOS, flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--t2)' }}>Novos</span>
          <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 14, color: 'var(--t1)' }}>{pctN}%</span>
        </div>
      </div>
    </div>
  )
}

/* ── Evolucao mini-barras (estilo mpico-chart do modal) ── */
function EvolucaoBars({ data }) {
  if (!data || data.length === 0) return <div style={{ color: 'var(--t3)', fontSize: 11, textAlign: 'center', padding: 12 }}>Sem dados</div>
  const maxV = Math.max(...data.map(d => Math.max(d.novos, d.retornantes, 1)))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {data.map((d, i) => {
        const wR = Math.round((d.retornantes / maxV) * 100)
        const wN = Math.round((d.novos / maxV) * 100)
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 38, fontSize: 10, fontWeight: 600, color: 'var(--t2)', textAlign: 'right', flexShrink: 0 }}>{d.dia}</div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ height: 6, borderRadius: 3, background: COR_RETORNANTES, width: `${Math.max(wR, 3)}%`, transition: 'width .4s ease' }} />
                <span style={{ fontSize: 9, fontWeight: 700, color: COR_RETORNANTES }}>{d.retornantes}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ height: 6, borderRadius: 3, background: COR_NOVOS, width: `${Math.max(wN, 3)}%`, opacity: 0.7, transition: 'width .4s ease' }} />
                <span style={{ fontSize: 9, fontWeight: 700, color: COR_NOVOS }}>{d.novos}</span>
              </div>
            </div>
          </div>
        )
      })}
      {/* Legenda */}
      <div style={{ display: 'flex', gap: 12, marginTop: 4, justifyContent: 'flex-end' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 10, height: 6, borderRadius: 3, background: COR_RETORNANTES }} />
          <span style={{ fontSize: 9, color: 'var(--t3)' }}>Retornantes</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 10, height: 6, borderRadius: 3, background: COR_NOVOS, opacity: 0.7 }} />
          <span style={{ fontSize: 9, color: 'var(--t3)' }}>Novos</span>
        </div>
      </div>
    </div>
  )
}

/* ── Tabela frequentes (estilo da tabela do dashboard) ── */
function FrequentesTable({ frequentes }) {
  if (!frequentes || frequentes.length === 0) {
    return <div style={{ color: 'var(--t3)', fontSize: 11, textAlign: 'center', padding: 12 }}>Nenhum cliente com contato em mais de 1 dia</div>
  }
  return (
    <div className="tscr" style={{ maxHeight: 160 }}>
      <table>
        <thead>
          <tr>
            <th>Cliente</th>
            <th style={{ textAlign: 'center' }}>Dias</th>
            <th style={{ textAlign: 'center' }}>Msgs</th>
            <th style={{ textAlign: 'center' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {frequentes.map((c, i) => (
            <tr key={i}>
              <td>{c.nome}</td>
              <td style={{ textAlign: 'center', fontWeight: 700, color: COR_RETORNANTES }}>{c.diasContato}</td>
              <td style={{ textAlign: 'center' }}>{c.count}</td>
              <td style={{ textAlign: 'center' }}>
                <span className={c.retornante ? 'b bp' : 'b bprog'}>
                  {c.retornante ? 'Retornante' : 'Novo'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ══ PANEL — 2 cards lado a lado (g11) ══ */
function FidelizacaoPanelInner({ data, loading, onOpenModal }) {
  if (!data) return null
  const { novos, retornantes, taxa, evolucao, frequentes } = data
  const taxaCor = taxa >= 30 ? COR_RETORNANTES : taxa >= 15 ? '#F59E0B' : '#EF4444'
  const taxaLabel = taxa >= 30 ? 'Boa retencao' : taxa >= 15 ? 'Moderada' : 'Baixa'

  return (
    <div className="g11" style={{ marginTop: 10 }}>
      {/* Card esquerdo: Stats + Donut */}
      <div className="card">
        <div className="ch">
          <div>
            <div className="ct">Fidelizacao de Clientes</div>
            <div className="cs">Novos vs. Retornantes</div>
          </div>
          {onOpenModal && (
            <button className="fclear" onClick={() => onOpenModal('fidelizacao')} title="Ver detalhes">
              Detalhes
            </button>
          )}
        </div>
        <div className="cbdy">
          {loading ? (
            <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t2)', fontSize: 12 }}>Carregando...</div>
          ) : (
            <>
              {/* 3 stat boxes */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <StatBox label="Novos" value={String(novos)} color={COR_NOVOS} />
                <StatBox label="Retornantes" value={String(retornantes)} color={COR_RETORNANTES} />
                <StatBox label="Taxa Retorno" value={`${taxa}%`} color={taxaCor} sub={taxaLabel} />
              </div>
              {/* Donut */}
              <PieDonut novos={novos} retornantes={retornantes} />
            </>
          )}
        </div>
      </div>

      {/* Card direito: Evolucao + Frequentes */}
      <div className="card">
        <div className="ch">
          <div>
            <div className="ct">Evolucao e Frequencia</div>
            <div className="cs">Contatos por dia</div>
          </div>
        </div>
        <div className="cbdy">
          {loading ? (
            <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t2)', fontSize: 12 }}>Carregando...</div>
          ) : (
            <>
              <EvolucaoBars data={evolucao} />
              {frequentes && frequentes.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--t2)', marginBottom: 6 }}>Clientes mais frequentes</div>
                  <FrequentesTable frequentes={frequentes} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export const FidelizacaoPanel = memo(FidelizacaoPanelInner)
