import { useMemo } from 'react'
import { useDashboardFilters } from '../context/DashboardFilterContext'
import { normTipo, normTurno } from '../lib/utils'

function classifyTurno(turno) {
  const t = normTurno(turno)
  if (t === 'Almoco') return 'al'
  if (t === 'Happy Hour') return 'hh'
  if (t === 'Fora Horário') return 'f'
  return 'j'
}

export function useFilteredData(rawRows, tab) {
  const { state } = useDashboardFilters()
  const { filterType, activeDay, turnoFilter } = state

  const filteredRows = useMemo(() => {
    let result = rawRows || []
    if (filterType) {
      result = result.filter(r => normTipo(r.tipo_atendimento) === filterType)
    }
    if (activeDay) {
      result = result.filter(r => r.data === activeDay)
    }
    if (turnoFilter) {
      result = result.filter(r => classifyTurno(r.turno) === turnoFilter)
    }
    return result
  }, [rawRows, filterType, activeDay, turnoFilter])

  return { filteredRows, hasFilters: !!(filterType || activeDay || turnoFilter) }
}
