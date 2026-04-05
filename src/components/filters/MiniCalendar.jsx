import { useMemo, useEffect, useRef, memo, useState } from 'react'
import { DIAS_ABREV } from '../../lib/constants'
import { isoDate } from '../../lib/dataProcessors/computeCharts'

function MiniCalendarInner({ monthDrill, onSelectWeek, onSelectDay, onClose, rawRows }) {
  const ref = useRef(null)
  const [viewYear, setViewYear] = useState(new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(new Date().getMonth())

  const goPrev = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  const goNext = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  const { weeks, monthLabel, today, daysWithData } = useMemo(() => {
    const year = viewYear
    const month = viewMonth
    const now = new Date()
    const firstOfMonth = new Date(year, month, 1)
    const dowFirst = firstOfMonth.getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const todayIso = isoDate(now)

    // Determine which days have data
    const dataSet = new Set()
    if (rawRows) rawRows.forEach(r => { if (r.data) dataSet.add(r.data) })

    // Build weeks
    const weeksArr = []
    let currentWeek = []
    // Fill leading empty cells
    for (let i = 0; i < dowFirst; i++) currentWeek.push(null)

    for (let dd = 1; dd <= daysInMonth; dd++) {
      const date = new Date(year, month, dd)
      const dow = date.getDay()
      const iso = isoDate(date)
      const wn = Math.min(Math.ceil((dd + dowFirst) / 7), 4)
      currentWeek.push({ dd, iso, dow, wn, fechado: dow === 2 })
      if (dow === 6 || dd === daysInMonth) {
        // Fill trailing empty cells
        while (currentWeek.length < 7) currentWeek.push(null)
        weeksArr.push({ weekNum: currentWeek.find(d => d)?.wn || 1, days: currentWeek })
        currentWeek = []
      }
    }

    const MESES = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

    return {
      weeks: weeksArr,
      monthLabel: `${MESES[month]} ${year}`,
      today: todayIso,
      daysWithData: dataSet,
    }
  }, [rawRows, viewYear, viewMonth])

  const selWeek = monthDrill.level === 'week' ? monthDrill.week
    : monthDrill.level === 'day' ? monthDrill.week : null
  const selDay = monthDrill.level === 'day' ? monthDrill.day : null

  return (
    <div ref={ref} className="mini-cal">
      {/* Header */}
      <div className="mini-cal__header">
        <button onClick={goPrev}
          disabled={viewYear === 2026 && viewMonth === 0}
          style={{ background: 'none', border: 'none', color: viewYear === 2026 && viewMonth === 0 ? 'var(--t3)' : '#E85D04', cursor: viewYear === 2026 && viewMonth === 0 ? 'default' : 'pointer', fontSize: 14, padding: '2px 6px', opacity: viewYear === 2026 && viewMonth === 0 ? 0.3 : 1 }}>
          ◀
        </button>
        <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 13, color: 'var(--t1)', minWidth: 130, textAlign: 'center' }}>
          {monthLabel}
        </span>
        <button onClick={goNext}
          disabled={viewYear === 2026 && viewMonth === 11}
          style={{ background: 'none', border: 'none', color: viewYear === 2026 && viewMonth === 11 ? 'var(--t3)' : '#E85D04', cursor: viewYear === 2026 && viewMonth === 11 ? 'default' : 'pointer', fontSize: 14, padding: '2px 6px', opacity: viewYear === 2026 && viewMonth === 11 ? 0.3 : 1 }}>
          ▶
        </button>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', color: 'var(--t2)', cursor: 'pointer',
          fontSize: 14, padding: '2px 4px', lineHeight: 1,
        }}>
          ✕
        </button>
      </div>

      {/* Day-of-week header */}
      <div className="mini-cal__grid">
        {DIAS_ABREV.map(d => (
          <div key={d} className="mini-cal__dow">{d}</div>
        ))}
      </div>

      {/* Weeks */}
      {weeks.map((w, wi) => {
        const isWeekSel = selWeek === w.weekNum
        return (
          <div
            key={wi}
            className={`mini-cal__week${isWeekSel ? ' mini-cal__week--sel' : ''}`}
            onClick={() => onSelectWeek(w.weekNum)}
          >
            {w.days.map((d, di) => {
              if (!d) return <div key={di} className="mini-cal__day mini-cal__day--empty" />
              const isToday = d.iso === today
              const isDaySel = selDay === d.iso
              const hasData = daysWithData.has(d.iso)
              const isFechado = d.fechado
              const isFuture = d.iso > today

              let cls = 'mini-cal__day'
              if (isToday) cls += ' mini-cal__day--today'
              if (isDaySel) cls += ' mini-cal__day--sel'
              if (isFechado) cls += ' mini-cal__day--fechado'
              if (hasData) cls += ' mini-cal__day--has-data'
              if (isFuture && !hasData) cls += ' mini-cal__day--empty'

              return (
                <div
                  key={di}
                  className={cls}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (!isFechado) onSelectDay(d.iso, d.wn)
                  }}
                >
                  {d.dd}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

export const MiniCalendar = memo(MiniCalendarInner)
