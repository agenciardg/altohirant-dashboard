import { memo, useCallback } from 'react'

function KPICardInner({ icon, label, value, sub, sm, onClick, active, ak, loading, onOpenModal, delta, deltaInvert }) {
  const cls = `card kc clickable${active ? ' active-card' : ''}`
  const handleClick = useCallback(() => {
    if (onClick) { onClick(); return }
    if (onOpenModal) onOpenModal()
  }, [onClick, onOpenModal])

  // A delta is "good" when: for normal metrics, positive is good; for inverted metrics, negative is good.
  const deltaGood = deltaInvert ? delta < 0 : delta > 0

  return (
    <div className={cls} onClick={handleClick} title="Clique para ver detalhes">
      <div className="cb">
        <div className="klbl"><span className="kico">{icon}</span>{label}</div>
        <div key={ak} className={`kval fi${sm ? ' sm' : ''}`}>
          {loading ? '—' : value}
        </div>
        <div className="kft">
          <span className="ksub">{loading ? '...' : sub}</span>
          {!loading && delta != null && delta !== 0 && (
            <span className={`kdelta ${deltaGood ? 'kdelta--good' : 'kdelta--bad'}`}>
              {delta > 0 ? '▲' : '▼'} {delta > 0 ? '+' : ''}{delta}%
            </span>
          )}
          {!loading && delta === 0 && (
            <span className="kdelta kdelta--neutral">— 0%</span>
          )}
        </div>
      </div>
    </div>
  )
}

export const KPICard = memo(KPICardInner)
