/* ══ MOCK DATA (fallback quando não há dados reais) ════════════════════════ */
export const MOCK = {
  hoje: {
    kpis: {
      total:    { value: '74',  sub: '12 clientes únicos' },
      reservas: { value: '31',  sub: 'vs. ontem' },
      fora:     { value: '5',   sub: 'vs. ontem', sm: true },
      pico:     { value: '19h', sub: 'Turno: Jantar', sm: true },
    },
    clientesUnicos: 12,
    linhaLabel: 'Hoje — Volume por hora',
    linha: [
      { dia: '10h', total: 3 }, { dia: '11h', total: 6 }, { dia: '12h', total: 14 },
      { dia: '13h', total: 19 }, { dia: '14h', total: 11 }, { dia: '15h', total: 7 },
      { dia: '16h', total: 5 }, { dia: '17h', total: 4 }, { dia: '18h', total: 8 },
      { dia: '19h', total: 12 }, { dia: '20h', total: 9 }, { dia: '21h', total: 6 }, { dia: '22h', total: 3 },
    ],
    donut: [
      { name: 'Reservas',    value: 31, color: '#E85D04', pct: '42%' },
      { name: 'Cardapio',    value: 23, color: '#F97316', pct: '31%' },
      { name: 'Localizacao', value: 14, color: '#DC2626', pct: '19%' },
      { name: 'Outros',      value: 6,  color: '#4A3A1A', pct: '8%' },
    ],
    barLabel: 'Distribuição por turno',
    barras: [
      { d: 'Almoco', al: 28, hh: 0, j: 0 }, { d: 'Happy Hour', al: 0, hh: 16, j: 5 }, { d: 'Jantar', al: 0, hh: 0, j: 25 },
    ],
    tableRows: [
      { id: '#001', h: '12:43', cli: 'Joao Silva',     tipo: 'Reservas',    turno: 'Almoco',      st: 'Positivo' },
      { id: '#002', h: '12:51', cli: 'Maria Santos',   tipo: 'Cardapio',    turno: 'Almoco',      st: 'Positivo' },
      { id: '#003', h: '13:02', cli: 'Pedro Costa',    tipo: 'Localizacao', turno: 'Almoco',      st: 'Neutro' },
      { id: '#004', h: '13:18', cli: 'Ana Lima',        tipo: 'Reservas',    turno: 'Almoco',      st: 'Positivo' },
      { id: '#005', h: '18:31', cli: 'Carlos Mendes',  tipo: 'Cardapio',    turno: 'Happy Hour',  st: 'Negativo' },
      { id: '#006', h: '19:45', cli: 'Lucia Ferreira', tipo: 'Reservas',    turno: 'Happy Hour',  st: 'Positivo' },
      { id: '#007', h: '20:02', cli: 'Roberto Alves',  tipo: 'Localizacao', turno: 'Jantar',      st: 'Positivo' },
      { id: '#008', h: '21:19', cli: 'Fernanda Rocha', tipo: 'Cardapio',    turno: 'Jantar',      st: 'Neutro' },
    ],
  },
  semana: {
    kpis: {
      total:    { value: '406', sub: '89 clientes únicos' },
      reservas: { value: '182', sub: 'vs. semana anterior' },
      fora:     { value: '18',  sub: 'vs. semana anterior', sm: true },
      pico:     { value: '13h', sub: 'Turno: Almoco', sm: true },
    },
    clientesUnicos: 89,
    linhaLabel: 'Semana atual — Volume diário',
    linha: [
      { dia: 'Seg', total: 42 }, { dia: 'Ter', total: 38 }, { dia: 'Qua', total: 51 },
      { dia: 'Qui', total: 45 }, { dia: 'Sex', total: 67 }, { dia: 'Sab', total: 89 }, { dia: 'Dom', total: 74 },
    ],
    donut: [
      { name: 'Reservas',    value: 182, color: '#E85D04', pct: '42%' },
      { name: 'Cardapio',    value: 133, color: '#F97316', pct: '31%' },
      { name: 'Localizacao', value: 91,  color: '#DC2626', pct: '21%' },
      { name: 'Outros',      value: 34,  color: '#4A3A1A', pct: '8%' },
    ],
    barLabel: 'Almoço/HH x Jantar — 7 dias',
    barras: [
      { d: 'Seg', al: 10, hh: 12, j: 20 }, { d: 'Ter', al: 8, hh: 10, j: 20 }, { d: 'Qua', al: 12, hh: 13, j: 26 },
      { d: 'Qui', al: 10, hh: 11, j: 24 }, { d: 'Sex', al: 14, hh: 16, j: 37 }, { d: 'Sab', al: 18, hh: 20, j: 51 }, { d: 'Dom', al: 15, hh: 17, j: 42 },
    ],
    tableRows: [
      { id: '#001', h: '12:43', cli: 'Joao Silva',     tipo: 'Reservas',    turno: 'Almoco',      st: 'Positivo' },
      { id: '#002', h: '12:51', cli: 'Maria Santos',   tipo: 'Cardapio',    turno: 'Almoco',      st: 'Positivo' },
      { id: '#003', h: '13:02', cli: 'Pedro Costa',    tipo: 'Localizacao', turno: 'Almoco',      st: 'Neutro' },
      { id: '#004', h: '19:18', cli: 'Ana Lima',        tipo: 'Reservas',    turno: 'Happy Hour',  st: 'Positivo' },
    ],
  },
  mes: {
    kpis: {
      total:    { value: '1840', sub: '312 clientes únicos' },
      reservas: { value: '780',  sub: 'vs. mês anterior' },
      fora:     { value: '72',   sub: 'vs. mês anterior', sm: true },
      pico:     { value: '20h',  sub: 'Turno: Jantar', sm: true },
    },
    clientesUnicos: 312,
    linhaLabel: 'Este mês — Volume semanal',
    linha: [
      { dia: 'Sem 1', total: 380 }, { dia: 'Sem 2', total: 420 },
      { dia: 'Sem 3', total: 452 }, { dia: 'Sem 4', total: 588 },
    ],
    donut: [
      { name: 'Reservas',    value: 780, color: '#E85D04', pct: '42%' },
      { name: 'Cardapio',    value: 571, color: '#F97316', pct: '31%' },
      { name: 'Localizacao', value: 386, color: '#DC2626', pct: '21%' },
      { name: 'Outros',      value: 147, color: '#4A3A1A', pct: '8%' },
    ],
    barLabel: 'Almoço/HH x Jantar — mensal',
    barras: [
      { d: 'Sem 1', al: 75, hh: 90, j: 215 }, { d: 'Sem 2', al: 80, hh: 100, j: 240 },
      { d: 'Sem 3', al: 88, hh: 110, j: 254 }, { d: 'Sem 4', al: 115, hh: 142, j: 331 },
    ],
    tableRows: [
      { id: '#001', h: '12:43', cli: 'Joao Silva',     tipo: 'Reservas',    turno: 'Almoco',  st: 'Positivo' },
      { id: '#002', h: '20:51', cli: 'Maria Santos',   tipo: 'Cardapio',    turno: 'Jantar',  st: 'Positivo' },
    ],
  },
}
