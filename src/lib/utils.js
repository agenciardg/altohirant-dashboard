/* ── Remove acentos de uma string ────────────────────────────────────────── */
function stripAccents(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

/* ── Normalização de tipo de atendimento ─────────────────────────────────── */
const TIPO_NORM = {
  reserva: 'Reservas', reservas: 'Reservas',
  cardapio: 'Cardapio', menu: 'Cardapio',
  localizacao: 'Localizacao', endereco: 'Localizacao',
  geral: 'Geral',
  aniversario: 'Aniversario',
  reclamacao: 'Reclamacao',
}

export function normTipo(t) {
  if (!t) return 'Outros'
  const key = stripAccents(t.trim().toLowerCase())
  return TIPO_NORM[key] || 'Outros'
}

/* ── Normalização de feedback ────────────────────────────────────────────── */
export function normFeedback(f) {
  if (!f) return 'Neutro'
  const l = stripAccents(f.trim().toLowerCase())
  if (l.includes('positiv')) return 'Positivo'
  if (l.includes('negativ')) return 'Negativo'
  return 'Neutro'
}

/* ── Turnos "diurnos" (almoco + happy_hour) ──────────────────────────────── */
const TURNO_DIURNO = new Set(['almoco', 'happy_hour'])

export function isDiurno(turno) {
  if (!turno) return false
  return TURNO_DIURNO.has(stripAccents(turno.trim().toLowerCase()))
}

/* ── Normaliza nome de turno para label ──────────────────────────────────── */
const TURNO_LABEL = {
  almoco: 'Almoco',
  happy_hour: 'Happy Hour',
  jantar: 'Jantar',
  fora_horario: 'Fora Horário',
}

export function normTurno(t) {
  if (!t) return 'Jantar'
  const key = stripAccents(t.trim().toLowerCase())
  return TURNO_LABEL[key] || 'Jantar'
}
