import { memo } from 'react'
import { COLORS } from '../lib/constants'

/* ── Cores ── */
const COR_NOVOS = '#3B82F6'
const COR_RETORNANTES = '#22C55E'

/* ── Mini-card ── */
function MiniCard({ icon, label, value, sub, color }) {
  return (
    <div className="card" style={{ flex: 1, minWidth: 0 }}>
      <div className="cb" style={{ padding: '0.85rem 1rem' }}>
        <div className="klbl"><span className="kico">{icon}</span>{label}</div>
        <div className="kval fi" style={{ color }}>{value}</div>
        {sub && <div className="kft"><span className="ksub">{sub}</span></div>}
      </div>
    </div>
  )
}

/* ── Taxa badge ── */
function TaxaCard({ taxa }) {
  const cor = taxa >= 30 ? COR_RETORNANTES : taxa >= 15 ? '#F59E0B' : '#EF4444'
  const label = taxa >= 30 ? 'Boa retenção' : taxa >= 15 ? 'Retenção moderada' : 'Retenção baixa'
  return (
    <div className="card" style={{ flex: 1, minWidth: 0 }}>
      <div className="cb" style={{ padding: '0.85rem 1rem' }}>
        <div className="klbl"><span className="kico">🔄</span>Taxa de Retorno</div>
        <div className="kval fi" style={{ color: cor }}>{taxa}%</div>
        <div className="kft"><span className="ksub">{label}</span></div>
      </div>
    </div>
  )
}

/* ── Pie chart CSS puro ── */
function PieChart({ novos, retornantes }) {
  const total = novos + retornantes
  if (total === 0) return <div style={{ color: 'var(--t3)', fontSize: 12, textAlign: 'center', padding: 24 }}>Sem dados</div>
  const pctR = Math.round((retornantes / total) * 100)
  const pctN = 100 - pctR
  const deg = Math.round((retornantes / total) * 360)

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '12px 0' }}>
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        background: `conic-gradient(${COR_RETORNANTES} 0deg ${deg}deg, ${COR_NOVOS} ${deg}deg 360deg)`,
        boxShadow: '0 0 12px rgba(34,197,94,0.15)',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', inset: 16, borderRadius: '50%',
          background: 'var(--card)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700, color: 'var(--t1)',
        }}>{total}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: COR_RETORNANTES }} />
          <span style={{ fontSize: 11, color: 'var(--t2)' }}>Retornantes <strong style={{ color: COR_RETORNANTES }}>{pctR}%</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: COR_NOVOS }} />
          <span style={{ fontSize: 11, color: 'var(--t2)' }}>Novos <strong style={{ color: COR_NOVOS }}>{pctN}%</strong></span>
        </div>
      </div>
    </div>
  )
}

/* ── Line chart CSS/SVG ── */
function EvolucaoChart({ data }) {
  if (!data || data.length === 0) return <div style={{ color: 'var(--t3)', fontSize: 12, textAlign: 'center', padding: 16 }}>Sem dados de evolução</div>

  const W = 400, H = 100, PL = 28, PR = 10, PT = 10, PB = 22
  const IW = W - PL - PR, IH = H - PT - PB
  const maxV = Math.max(...data.map(d => Math.max(d.novos, d.retornantes, 1)))

  function toX(i) { return PL + (data.length > 1 ? (i / (data.length - 1)) * IW : IW / 2) }
  function toY(v) { return PT + IH - (v / maxV) * IH }

  function pathStr(key) {
    return data.map((d, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(d[key]).toFixed(1)}`).join(' ')
  }

  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
        {/* Grid lines */}
        {[0, 0.5, 1].map(f => (
          <line key={f} x1={PL} x2={W - PR} y1={PT + IH * (1 - f)} y2={PT + IH * (1 - f)}
            stroke="var(--border)" strokeWidth={0.5} />
        ))}
        {/* Retornantes line */}
        <path d={pathStr('retornantes')} fill="none" stroke={COR_RETORNANTES} strokeWidth={2} />
        {/* Novos line */}
        <path d={pathStr('novos')} fill="none" stroke={COR_NOVOS} strokeWidth={2} strokeDasharray="4 2" />
        {/* Dots */}
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={toX(i)} cy={toY(d.retornantes)} r={3} fill={COR_RETORNANTES} />
            <circle cx={toX(i)} cy={toY(d.novos)} r={3} fill={COR_NOVOS} />
            <text x={toX(i)} y={H - 4} textAnchor="middle" fontSize={8} fill="var(--t3)">{d.dia}</text>
          </g>
        ))}
        {/* Y axis labels */}
        <text x={PL - 4} y={PT + 4} textAnchor="end" fontSize={8} fill="var(--t3)">{maxV}</text>
        <text x={PL - 4} y={PT + IH + 3} textAnchor="end" fontSize={8} fill="var(--t3)">0</text>
      </svg>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 14, height: 2, background: COR_RETORNANTES }} />
          <span style={{ fontSize: 9, color: 'var(--t3)' }}>Retornantes</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 14, height: 2, background: COR_NOVOS, borderTop: '1px dashed ' + COR_NOVOS }} />
          <span style={{ fontSize: 9, color: 'var(--t3)' }}>Novos</span>
        </div>
      </div>
    </div>
  )
}

/* ── Tabela frequentes ── */
function FrequentesTable({ frequentes }) {
  if (!frequentes || frequentes.length === 0) {
    return <div style={{ color: 'var(--t3)', fontSize: 12, textAlign: 'center', padding: 16 }}>Nenhum cliente com contato em mais de 1 dia</div>
  }
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--t3)', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cliente</th>
            <th style={{ textAlign: 'center', padding: '6px 8px', color: 'var(--t3)', fontWeight: 600, fontSize: 10, textTransform: 'uppercase' }}>Dias</th>
            <th style={{ textAlign: 'center', padding: '6px 8px', color: 'var(--t3)', fontWeight: 600, fontSize: 10, textTransform: 'uppercase' }}>Msgs</th>
            <th style={{ textAlign: 'center', padding: '6px 8px', color: 'var(--t3)', fontWeight: 600, fontSize: 10, textTransform: 'uppercase' }}>Tipo</th>
          </tr>
        </thead>
        <tbody>
          {frequentes.map((c, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '6px 8px', color: 'var(--t1)', fontWeight: 500 }}>
                {c.nome}
                {c.retornante && <span style={{ marginLeft: 6, fontSize: 9, color: COR_RETORNANTES, fontWeight: 700 }}>RETORNANTE</span>}
              </td>
              <td style={{ textAlign: 'center', padding: '6px 8px', color: COR_RETORNANTES, fontWeight: 700 }}>{c.diasContato}</td>
              <td style={{ textAlign: 'center', padding: '6px 8px', color: 'var(--t2)' }}>{c.count}</td>
              <td style={{ textAlign: 'center', padding: '6px 8px' }}>
                <span style={{
                  fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 10,
                  background: c.retornante ? 'rgba(34,197,94,0.12)' : 'rgba(59,130,246,0.12)',
                  color: c.retornante ? COR_RETORNANTES : COR_NOVOS,
                }}>{c.retornante ? 'Retornante' : 'Novo'}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ══ PANEL PRINCIPAL ══ */
function FidelizacaoPanelInner({ data, loading, onOpenModal }) {
  if (!data) return null
  const { novos, retornantes, taxa, evolucao, frequentes } = data

  return (
    <div className="card" style={{ gridColumn: '1 / -1' }}>
      <div className="ch">
        <div>
          <div className="ct">Fidelização de Clientes</div>
          <div className="cs">Novos vs. Retornantes</div>
        </div>
        {onOpenModal && (
          <button className="fclear" onClick={() => onOpenModal('fidelizacao')} style={{ fontSize: 10 }}>
            Ver detalhes →
          </button>
        )}
      </div>
      <div className="cbdy" style={{ padding: '0.5rem 1rem 1rem' }}>
        {loading ? (
          <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t2)', fontSize: 12 }}>Carregando...</div>
        ) : (
          <>
            {/* Linha 1: 3 mini-cards */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              <MiniCard icon="🆕" label="Clientes Novos" value={String(novos)} color={COR_NOVOS} />
              <MiniCard icon="🔁" label="Retornantes" value={String(retornantes)} color={COR_RETORNANTES} />
              <TaxaCard taxa={taxa} />
            </div>

            {/* Linha 2: Pie + Evolução */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <div style={{ flex: '0 0 200px', background: 'var(--bg)', borderRadius: 10, padding: '8px 12px' }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Proporção</div>
                <PieChart novos={novos} retornantes={retornantes} />
              </div>
              <div style={{ flex: 1, background: 'var(--bg)', borderRadius: 10, padding: '8px 12px' }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Evolução diária</div>
                <EvolucaoChart data={evolucao} />
              </div>
            </div>

            {/* Linha 3: Tabela frequentes */}
            <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '8px 12px' }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Clientes Mais Frequentes</div>
              <FrequentesTable frequentes={frequentes} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export const FidelizacaoPanel = memo(FidelizacaoPanelInner)
