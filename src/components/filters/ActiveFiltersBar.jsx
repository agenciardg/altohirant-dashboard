import { memo } from 'react'

function fmtDay(iso) {
  if (!iso) return ''
  const [, m, d] = iso.split('-')
  return `${d}/${m}`
}

const TURNO_LABEL = { al: 'Almoço', hh: 'Happy Hour', j: 'Jantar', f: 'Fora Horário' }

function ActiveFiltersBarInner({ filterType, activeDay, turnoFilter, onClearType, onClearDay, onClearTurno, onClearAll }) {
  const hasAny = !!(filterType || activeDay || turnoFilter)
  if (!hasAny) return null

  return (
    <div className="active-filters-bar">
      {filterType && (
        <span className="filter-chip" onClick={onClearType}>
          Tipo: {filterType} ✕
        </span>
      )}
      {activeDay && (
        <span className="filter-chip" onClick={onClearDay}>
          Dia: {fmtDay(activeDay)} ✕
        </span>
      )}
      {turnoFilter && (
        <span className="filter-chip" onClick={onClearTurno}>
          Turno: {TURNO_LABEL[turnoFilter] || turnoFilter} ✕
        </span>
      )}
      <button className="fclear" onClick={onClearAll}>Limpar tudo</button>
    </div>
  )
}

export const ActiveFiltersBar = memo(ActiveFiltersBarInner)
