import { useState, useCallback, memo } from 'react'
import { CssBar } from '../charts/CssBar'
import { COLORS } from '../../lib/constants'

function CardBarrasInner({ data, label, activeDay, setActiveDay, ak, loading, onOpenModal }) {
  const [activeTurno, setActiveTurno] = useState(null)
  const toggleTurno = useCallback(t => setActiveTurno(prev => prev === t ? null : t), [])

  return (
    <div className="card">
      <div className="ch">
        <div>
          <div className="ct">Distribuição por Turno</div>
          <div key={ak} className="cs fi">{label}</div>
        </div>
        <div className="bleg">
          <div
            className={`bli clickable${activeTurno === 'al' ? ' bli-act' : ''}${activeTurno && activeTurno !== 'al' ? ' bli-dim' : ''}`}
            onClick={() => toggleTurno('al')}
            title="Filtrar Almoço">
            <div className="bls" style={{ background: COLORS.almoco }} />Almoço
          </div>
          <div
            className={`bli clickable${activeTurno === 'hh' ? ' bli-act' : ''}${activeTurno && activeTurno !== 'hh' ? ' bli-dim' : ''}`}
            onClick={() => toggleTurno('hh')}
            title="Filtrar Happy Hour">
            <div className="bls" style={{ background: COLORS.happyHour }} />HH
          </div>
          <div
            className={`bli clickable${activeTurno === 'j' ? ' bli-act' : ''}${activeTurno && activeTurno !== 'j' ? ' bli-dim' : ''}`}
            onClick={() => toggleTurno('j')}
            title="Filtrar Jantar">
            <div className="bls" style={{ background: COLORS.jantar }} />Jantar
          </div>
          <div
            className={`bli clickable${activeTurno === 'f' ? ' bli-act' : ''}${activeTurno && activeTurno !== 'f' ? ' bli-dim' : ''}`}
            onClick={() => toggleTurno('f')}
            title="Filtrar Fora do Horário">
            <div className="bls" style={{ background: COLORS.fora }} />Fora
          </div>
        </div>
      </div>
      <div className="cbdy">
        {loading
          ? <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t2)', fontSize: 12 }}>Carregando...</div>
          : <CssBar data={data} activeDay={activeDay} setActiveDay={setActiveDay} activeTurno={activeTurno} onOpenModal={onOpenModal} />
        }
      </div>
    </div>
  )
}

export const CardBarras = memo(CardBarrasInner)
