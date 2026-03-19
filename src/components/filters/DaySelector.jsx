import { memo } from 'react'

function DaySelectorInner({ days, activeDay, onDayClick }) {
  return (
    <div className="day-selector-wrap">
      <div className="day-selector">
        <button
          className={`day-pill${activeDay === null ? ' day-pill--active' : ''}`}
          onClick={() => onDayClick(null)}
        >
          Todos
        </button>
        {days.map((d, i) => (
          <button
            key={i}
            className={`day-pill${activeDay === d.iso ? ' day-pill--active' : ''}${d.fechado ? ' day-pill--fechado' : ''}`}
            onClick={() => onDayClick(d.iso)}
          >
            {d.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export const DaySelector = memo(DaySelectorInner)
