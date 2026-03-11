/* ── Normalização de tipo de atendimento ─────────────────────────────────── */
export const TIPO_NORM = {
  reserva: 'Reservas', reservas: 'Reservas',
  cardapio: 'Cardapio', cardápio: 'Cardapio', menu: 'Cardapio',
  localizacao: 'Localizacao', localização: 'Localizacao',
  localizaçao: 'Localizacao', endereco: 'Localizacao',
}

export function normTipo(t) {
  if (!t) return 'Outros'
  return TIPO_NORM[t.toLowerCase()] || 'Outros'
}

/* ── Normalização de feedback ────────────────────────────────────────────── */
export function normFeedback(f) {
  if (!f) return 'Neutro'
  const l = f.toLowerCase()
  if (l.includes('positiv')) return 'Positivo'
  if (l.includes('negativ')) return 'Negativo'
  return 'Neutro'
}

/* ── Turnos de almoço ────────────────────────────────────────────────────── */
export const TURNO_ALMOCO = ['manha', 'manhã', 'almoco', 'almoço']

export function isAlmoco(turno) {
  return turno && TURNO_ALMOCO.includes(turno.toLowerCase())
}
