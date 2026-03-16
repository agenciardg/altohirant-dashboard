/* ══ MOCK DATA (fallback quando não há dados reais) ════════════════════════ */
export const MOCK = {
  hoje: {
    kpis: {
      total:    { value: '74',  sub: '12 clientes únicos',   delta: '+8%',    dt: 'bp' },
      reservas: { value: '31',  sub: 'vs. ontem',            delta: '+12%',   dt: 'bp' },
      fora:     { value: '5',   sub: 'vs. ontem',            delta: '+25%',   dt: 'be', sm: true },
      pico:     { value: '19h', sub: 'Turno: Jantar',        delta: 'Jantar', dt: 'bn', sm: true },
    },
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
      { d: 'Almoco', a: 28, j: 0 }, { d: 'Happy Hour', a: 16, j: 5 }, { d: 'Jantar', a: 0, j: 25 },
    ],
    tableRows: [
      { id: '#001', h: '12:43', cli: 'Joao Silva',     tipo: 'Reservas',    st: 'Positivo', det: 'Mesa p/ 6 pessoas' },
      { id: '#002', h: '12:51', cli: 'Maria Santos',   tipo: 'Cardapio',    st: 'Positivo', det: 'Opções vegetarianas' },
      { id: '#003', h: '13:02', cli: 'Pedro Costa',    tipo: 'Localizacao', st: 'Neutro',   det: 'Rota via Google Maps' },
      { id: '#004', h: '13:18', cli: 'Ana Lima',        tipo: 'Reservas',    st: 'Positivo', det: 'Reserva aniversário' },
      { id: '#005', h: '13:31', cli: 'Carlos Mendes',  tipo: 'Cardapio',    st: 'Negativo', det: 'Dúvida sobre alergenos' },
      { id: '#006', h: '13:45', cli: 'Lucia Ferreira', tipo: 'Reservas',    st: 'Positivo', det: 'Confirmação de reserva' },
      { id: '#007', h: '14:02', cli: 'Roberto Alves',  tipo: 'Localizacao', st: 'Positivo', det: 'Estacionamento local' },
      { id: '#008', h: '14:19', cli: 'Fernanda Rocha', tipo: 'Cardapio',    st: 'Neutro',   det: 'Preços do menu' },
    ],
  },
  semana: {
    kpis: {
      total:    { value: '406', sub: '89 clientes únicos',    delta: '+18%',   dt: 'bp' },
      reservas: { value: '182', sub: 'vs. semana anterior',   delta: '+24%',   dt: 'bp' },
      fora:     { value: '18',  sub: 'vs. semana anterior',   delta: '+12%',   dt: 'be', sm: true },
      pico:     { value: '13h', sub: 'Turno: Almoco',         delta: 'Almoco', dt: 'bn', sm: true },
    },
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
      { d: 'Seg', a: 22, j: 20 }, { d: 'Ter', a: 18, j: 20 }, { d: 'Qua', a: 25, j: 26 },
      { d: 'Qui', a: 21, j: 24 }, { d: 'Sex', a: 30, j: 37 }, { d: 'Sab', a: 38, j: 51 }, { d: 'Dom', a: 32, j: 42 },
    ],
    tableRows: [
      { id: '#001', h: '12:43', cli: 'Joao Silva',     tipo: 'Reservas',    st: 'Positivo', det: 'Mesa p/ 6 pessoas' },
      { id: '#002', h: '12:51', cli: 'Maria Santos',   tipo: 'Cardapio',    st: 'Positivo', det: 'Opções vegetarianas' },
      { id: '#003', h: '13:02', cli: 'Pedro Costa',    tipo: 'Localizacao', st: 'Neutro',   det: 'Rota via Google Maps' },
      { id: '#004', h: '13:18', cli: 'Ana Lima',        tipo: 'Reservas',    st: 'Positivo', det: 'Reserva aniversário' },
    ],
  },
  mes: {
    kpis: {
      total:    { value: '1840', sub: '312 clientes únicos',  delta: '+22%',   dt: 'bp' },
      reservas: { value: '780',  sub: 'vs. mês anterior',     delta: '+31%',   dt: 'bp' },
      fora:     { value: '72',   sub: 'vs. mês anterior',     delta: '+8%',    dt: 'be', sm: true },
      pico:     { value: '20h',  sub: 'Turno: Jantar',        delta: 'Jantar', dt: 'bn', sm: true },
    },
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
      { d: 'Sem 1', a: 165, j: 215 }, { d: 'Sem 2', a: 180, j: 240 },
      { d: 'Sem 3', a: 198, j: 254 }, { d: 'Sem 4', a: 257, j: 331 },
    ],
    tableRows: [
      { id: '#001', h: '12:43', cli: 'Joao Silva',     tipo: 'Reservas',    st: 'Positivo', det: 'Mesa p/ 6 pessoas' },
      { id: '#002', h: '12:51', cli: 'Maria Santos',   tipo: 'Cardapio',    st: 'Positivo', det: 'Opções vegetarianas' },
    ],
  },
}
