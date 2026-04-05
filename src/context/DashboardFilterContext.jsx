import { createContext, useContext, useReducer } from 'react'

/* ── State shape ── */
const initialState = {
  tab: 'hoje',
  filterType: null,
  activeDay: null,
  turnoFilter: null,
  kpiCollapsed: false,
  monthDrill: { level: 'month' },
  selectedItem: null,
  modal: { type: null, data: null },
  selectedRowId: null,
}

/* ── Reducer ── */
function reducer(state, action) {
  switch (action.type) {
    case 'SET_TAB':
      return {
        ...state,
        tab: action.payload,
        filterType: null,
        activeDay: null,
        turnoFilter: null,
        monthDrill: { level: 'month' },
        selectedItem: null,
      }
    case 'SET_FILTER_TYPE':
      return {
        ...state,
        filterType: state.filterType === action.payload ? null : action.payload,
      }
    case 'SET_ACTIVE_DAY':
      return {
        ...state,
        activeDay: state.activeDay === action.payload ? null : action.payload,
      }
    case 'SET_TURNO_FILTER':
      return {
        ...state,
        turnoFilter: state.turnoFilter === action.payload ? null : action.payload,
      }
    case 'SET_KPI_COLLAPSED':
      return { ...state, kpiCollapsed: !state.kpiCollapsed }
    case 'SET_MONTH_DRILL':
      return { ...state, monthDrill: action.payload }
    case 'SET_SELECTED_ITEM':
      return { ...state, selectedItem: action.payload }
    case 'SET_MODAL':
      return {
        ...state,
        modal: action.payload,
        selectedRowId: action.payload.type === null ? null : state.selectedRowId,
      }
    case 'SET_SELECTED_ROW':
      return { ...state, selectedRowId: action.payload }
    case 'CLEAR_FILTERS':
      return { ...state, filterType: null, activeDay: null, turnoFilter: null }
    default:
      return state
  }
}

/* ── Action creators ── */
export const setTab = (tab) => ({ type: 'SET_TAB', payload: tab })
export const setFilterType = (tipo) => ({ type: 'SET_FILTER_TYPE', payload: tipo })
export const setActiveDay = (day) => ({ type: 'SET_ACTIVE_DAY', payload: day })
export const setTurnoFilter = (turno) => ({ type: 'SET_TURNO_FILTER', payload: turno })
export const toggleKpiCollapsed = () => ({ type: 'SET_KPI_COLLAPSED' })
export const setMonthDrill = (drill) => ({ type: 'SET_MONTH_DRILL', payload: drill })
export const setSelectedItem = (item) => ({ type: 'SET_SELECTED_ITEM', payload: item })
export const setModal = (type, data = null) => ({ type: 'SET_MODAL', payload: { type, data } })
export const closeModal = () => ({ type: 'SET_MODAL', payload: { type: null, data: null } })
export const clearFilters = () => ({ type: 'CLEAR_FILTERS' })
export const setSelectedRow = (id) => ({ type: 'SET_SELECTED_ROW', payload: id })

/* ── Context ── */
const DashboardFilterContext = createContext(null)

export function DashboardFilterProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return (
    <DashboardFilterContext.Provider value={{ state, dispatch }}>
      {children}
    </DashboardFilterContext.Provider>
  )
}

export function useDashboardFilters() {
  const ctx = useContext(DashboardFilterContext)
  if (!ctx) throw new Error('useDashboardFilters must be used inside DashboardFilterProvider')
  return ctx
}
