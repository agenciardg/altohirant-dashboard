import { memo, useCallback } from 'react'

function KPICardInner({ icon, label, value, sub, delta, dt, sm, onClick, active, ak, loading, onOpenModal }) {
  const cls = `card kc clickable${active ? ' active-card' : ''}`
  const handleClick = useCallback(() => {
    if (onClick) onClick()
    if (onOpenModal) onOpenModal()
  }, [onClick, onOpenModal])

  return (
    <div className={cls} onClick={handleClick} title="Clique para ver detalhes">
      <div className="cb">
        <div className="klbl"><span className="kico">{icon}</span>{label}</div>
        <div key={ak} className={`kval fi${sm ? ' sm' : ''}`}>
          {loading ? '—' : value}
        </div>
        <div className="kft">
          <span className="ksub">{loading ? '...' : sub}</span>
          {delta && !loading && <span className={`b ${dt}`}>{delta}</span>}
        </div>
      </div>
    </div>
  )
}

export const KPICard = memo(KPICardInner)
