/* ── Cores do tema ── */
export const COLORS = {
  primary: '#E85D04',
  secondary: '#F97316',
  danger: '#DC2626',
  muted: '#6B4A1A',
  barAltDark: '#8A6A3A',
  barAltLight: '#C4854A',
  success: '#22C55E',
  warning: '#F59E0B',
  purple: '#8B5CF6',
  pink: '#EC4899',
}

/* ── Cores do gráfico donut ── */
export const DONUT_COLORS = {
  Reservas: COLORS.primary,
  Cardapio: COLORS.secondary,
  Localizacao: COLORS.danger,
  Geral: COLORS.muted,
  Aniversario: COLORS.purple,
  Reclamacao: COLORS.pink,
  Outros: '#4A3A1A',
}

export const DONUT_ORDER = ['Reservas', 'Cardapio', 'Localizacao', 'Geral', 'Aniversario', 'Reclamacao', 'Outros']

/* ── Dimensões do gráfico de linha SVG ── */
export const LINE_CHART = {
  W: 560,
  H: 195,
  PL: 36,
  PR: 36,
  PT: 14,
  PB: 26,
}
LINE_CHART.IW = LINE_CHART.W - LINE_CHART.PL - LINE_CHART.PR
LINE_CHART.IH = LINE_CHART.H - LINE_CHART.PT - LINE_CHART.PB

/* ── Dimensões do gráfico de barras ── */
export const BAR_CHART = {
  BAR_H: 172,
}

/* ── UI ── */
export const PAGE_SIZE = 10
export const CLOCK_INTERVAL = 30000
export const MAX_LABEL_POINTS = 7

/* ── Dias da semana abreviados ── */
export const DIAS_ABREV = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

/* ── Mapa de turnos ── */
export const TURNO_MAP = {
  almoco: 'Almoco',
  happy_hour: 'Happy Hour',
  jantar: 'Jantar',
  fora_horario: 'Fora Horário',
}

/* ── Tabs ── */
export const TABS = [
  ['hoje', 'Hoje'],
  ['semana', 'Esta Semana'],
  ['mes', 'Este Mês'],
]
