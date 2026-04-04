import { memo } from 'react'
import { SvgLine } from '../charts/SvgLine'

function CardLinhaInner({ data, label, activeDay, setActiveDay, ak, loading, hasRealData }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div className="ch" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', flexShrink: 0 }}>
        <div />
        <div style={{ textAlign: 'center' }}>
          <div className="ct">Atendimentos por Período</div>
          <div key={ak} className="cs fi">{label}</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {!loading && hasRealData && <span className="b ba">dados reais</span>}
        </div>
      </div>
      <div className="cbdy" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {loading
          ? <div style={{ height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t2)', fontSize: 12 }}>Carregando...</div>
          : <>
            <SvgLine data={data} activeDay={activeDay} setActiveDay={setActiveDay} />
            {activeDay && (
              <div style={{ marginTop: 8, fontSize: 10, color: 'var(--t2)', textAlign: 'center' }}>
                Clique no ponto novamente para desselecionar
              </div>
            )}
          </>
        }
      </div>
    </div>
  )
}

export const CardLinha = memo(CardLinhaInner)
