import { memo } from 'react'
import { SvgLine } from '../charts/SvgLine'

function CardLinhaInner({ data, label, activeDay, setActiveDay, ak, loading }) {
  return (
    <div className="card">
      <div className="ch" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center' }}>
        <div />
        <div style={{ textAlign: 'center' }}>
          <div className="ct">Atendimentos por Período</div>
          <div key={ak} className="cs fi">{label}</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {!loading && <span className="b ba">dados reais</span>}
        </div>
      </div>
      <div className="cbdy">
        {loading
          ? <div style={{ height: 195, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t2)', fontSize: 12 }}>Carregando...</div>
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
