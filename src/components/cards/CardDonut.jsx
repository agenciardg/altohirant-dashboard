import { memo, useMemo } from 'react'
import { SvgDonut } from '../charts/SvgDonut'
import { COLORS } from '../../lib/constants'

function CardDonutInner({ data, filterType, setFilterType, ak, loading, onOpenModal }) {
  const total = useMemo(() => data.reduce((s, d) => s + d.value, 0), [data])

  return (
    <div className="card">
      <div className="ch">
        <div>
          <div className="ct">Tipos de Atendimento</div>
          <div key={ak} className="cs fi">
            {loading ? '...' : filterType ? `Filtrando: ${filterType}` : `${total} total`}
          </div>
        </div>
      </div>
      <div className="cbdy">
        {loading
          ? <div style={{ height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t2)', fontSize: 12 }}>Carregando...</div>
          : <>
            <SvgDonut data={data} filterType={filterType} setFilterType={setFilterType} onOpenModal={onOpenModal} />
            <div className="ll">
              {data.map((d, i) => {
                const isAct = filterType === d.name
                return (
                  <div key={i} className={`lr${isAct ? ' lr-act' : ''}`}
                    onClick={() => setFilterType(isAct ? null : d.name)}>
                    <div className="lft">
                      <div className="ld" style={{ background: d.color, opacity: filterType && !isAct ? 0.3 : 1, transition: 'opacity 0.2s' }} />
                      <span className="ll2" style={{ opacity: filterType && !isAct ? 0.4 : 1, transition: 'opacity 0.2s' }}>{d.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="lp">{d.pct}</span>
                      <span className="lv" style={{ opacity: filterType && !isAct ? 0.4 : 1, transition: 'opacity 0.2s' }}>{d.value}</span>
                      <button
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--t3)', padding: '0 2px', lineHeight: 1, transition: 'color .15s' }}
                        onClick={e => { e.stopPropagation(); onOpenModal && onOpenModal(d.name) }}
                        onMouseEnter={e => e.currentTarget.style.color = COLORS.primary}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--t3)'}
                        title="Ver detalhes"
                        aria-label={`Ver detalhes de ${d.name}`}>↗</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        }
      </div>
    </div>
  )
}

export const CardDonut = memo(CardDonutInner)
