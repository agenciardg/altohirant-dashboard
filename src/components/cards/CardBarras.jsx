import { useState, useCallback, memo } from 'react'
import { CssBar } from '../charts/CssBar'
import { COLORS } from '../../lib/constants'

function CardBarrasInner({ data, label, barAlt, activeDay, setActiveDay, ak, loading, onOpenModal }) {
  const [activeTurno, setActiveTurno] = useState(null)
  const toggleTurno = useCallback(t => setActiveTurno(prev => prev === t ? null : t), [])

  return (
    <div className="card">
      <div className="ch">
        <div>
          <div className="ct">Almoço/HH x Jantar</div>
          <div key={ak} className="cs fi">{label}</div>
        </div>
        <div className="bleg">
          <div
            className={`bli clickable${activeTurno === 'a' ? ' bli-act' : ''}${activeTurno === 'j' ? ' bli-dim' : ''}`}
            onClick={() => toggleTurno('a')}
            title="Filtrar Almoço/HH">
            <div className="bls" style={{ background: barAlt }} />Almoço/HH
          </div>
          <div
            className={`bli clickable${activeTurno === 'j' ? ' bli-act' : ''}${activeTurno === 'a' ? ' bli-dim' : ''}`}
            onClick={() => toggleTurno('j')}
            title="Filtrar Jantar">
            <div className="bls" style={{ background: COLORS.primary }} />Jantar
          </div>
        </div>
      </div>
      <div className="cbdy">
        {loading
          ? <div style={{ height: 172, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t2)', fontSize: 12 }}>Carregando...</div>
          : <CssBar data={data} barAlt={barAlt} activeDay={activeDay} setActiveDay={setActiveDay} activeTurno={activeTurno} onOpenModal={onOpenModal} />
        }
      </div>
    </div>
  )
}

export const CardBarras = memo(CardBarrasInner)
