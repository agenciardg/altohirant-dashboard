/* ── Public API ── */

/**
 * Computes client fidelization metrics from the given rows.
 *
 * @param {object[]} rows
 * @param {'hoje'|'semana'|'mes'} tab
 * @returns {{
 *   novos: number,
 *   retornantes: number,
 *   taxa: number,
 *   evolucao: { dia: string, novos: number, retornantes: number }[],
 *   frequentes: { nome: string, numero: string, diasContato: number, count: number, retornante: boolean }[],
 * }}
 */
export function computeFidelizacao(rows, tab) {
  const novos = rows.filter(r => !r.cliente_retornante).length
  const retornantes = rows.filter(r => !!r.cliente_retornante).length
  const total = novos + retornantes
  const taxa = total > 0 ? Math.round((retornantes / total) * 100) : 0

  // Evolução diária novos vs retornantes
  const dailyMap = {}
  rows.forEach(r => {
    if (!r.data) return
    if (!dailyMap[r.data]) dailyMap[r.data] = { novos: 0, retornantes: 0 }
    if (r.cliente_retornante) dailyMap[r.data].retornantes++
    else dailyMap[r.data].novos++
  })
  const evolucao = Object.keys(dailyMap)
    .sort()
    .map(d => {
      const parts = d.split('-')
      const label = tab === 'hoje' ? d : `${parts[2]}/${parts[1]}`
      return { dia: label, novos: dailyMap[d].novos, retornantes: dailyMap[d].retornantes }
    })

  // Clientes mais frequentes (multi-dia)
  const clientMap = {}
  rows.forEach(r => {
    const key = r.numero_cliente || 'desconhecido'
    if (!clientMap[key]) clientMap[key] = { nome: r.nome_cliente || key, numero: key, dias: new Set(), count: 0, retornante: false }
    if (r.nome_cliente && clientMap[key].nome === key) clientMap[key].nome = r.nome_cliente
    if (r.data) clientMap[key].dias.add(r.data)
    clientMap[key].count++
    if (r.cliente_retornante) clientMap[key].retornante = true
  })
  const frequentes = Object.values(clientMap)
    .map(c => ({ ...c, diasContato: c.dias.size }))
    .filter(c => c.diasContato > 1)
    .sort((a, b) => b.diasContato - a.diasContato || b.count - a.count)
    .slice(0, 10)

  return { novos, retornantes, taxa, evolucao, frequentes }
}
