import { normTipo, normFeedback, normTurno } from '../utils'

/* ── Formatters ── */

/**
 * Formats a YYYY-MM-DD string to DD/MM/YYYY for display.
 * @param {string|null|undefined} data
 * @returns {string}
 */
function fmtDataBR(data) {
  if (!data) return '--'
  const [y, m, d] = data.split('-')
  return `${d}/${m}/${y}`
}

/* ── Public API ── */

/**
 * Transforms raw Supabase rows into the shape expected by the dashboard table component.
 * @param {object[]} rows
 * @returns {{
 *   id: string,
 *   dt: string,
 *   h: string,
 *   cli: string,
 *   tipo: string,
 *   st: string,
 *   turno: string,
 *   _raw: object,
 * }[]}
 */
export function computeTableRows(rows) {
  return rows.map((r, i) => ({
    id: `#${String(i + 1).padStart(3, '0')}`,
    dt: fmtDataBR(r.data),
    h: (r.hora || '00:00').slice(0, 5),
    cli: r.nome_cliente || r.numero_cliente || 'Desconhecido',
    tipo: normTipo(r.tipo_atendimento),
    st: normFeedback(r.feedback_empresa),
    turno: normTurno(r.turno),
    _raw: r,
  }))
}
