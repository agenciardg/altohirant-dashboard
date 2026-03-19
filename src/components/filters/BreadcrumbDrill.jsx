import { memo } from 'react'

/**
 * Breadcrumb navigation for monthly drill-down.
 * Renders nothing at the top level (month); shows navigation path at week/day levels.
 *
 * @param {{ monthDrill: { level: string, week?: number, day?: string }, onNavigate: Function }} props
 */
function BreadcrumbDrillInner({ monthDrill, onNavigate }) {
  const { level, week, day } = monthDrill

  if (level === 'month') return null

  const fmtDay = (iso) => {
    if (!iso) return ''
    const d = new Date(iso + 'T12:00:00')
    const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    const [, m, dd] = iso.split('-')
    return `${DIAS[d.getDay()]} ${dd}/${m}`
  }

  return (
    <div className="breadcrumb-drill">
      <span className="bc-link" onClick={() => onNavigate({ level: 'month' })}>
        Este Mês
      </span>
      <span className="bc-sep">&gt;</span>
      {level === 'week' && (
        <span className="bc-active">Semana {week}</span>
      )}
      {level === 'day' && (
        <>
          <span
            className="bc-link"
            onClick={() => onNavigate({ level: 'week', week })}
          >
            Semana {week}
          </span>
          <span className="bc-sep">&gt;</span>
          <span className="bc-active">{fmtDay(day)}</span>
        </>
      )}
    </div>
  )
}

export const BreadcrumbDrill = memo(BreadcrumbDrillInner)
