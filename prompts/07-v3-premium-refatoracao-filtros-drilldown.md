# v3 — Dashboard Premium: Refatoracao + Filtros + Drill-Down

> **Data:** 2026-03-19
> **Tipo:** Versao 3 completa — refatoracao arquitetural + features premium
> **Pre-requisito:** Prompts 01-06 implementados
> **Ordem de execucao:** FASE 0 → FASE 1 → FASE 2 → FASE 3 (sequencial, cada fase depende da anterior)

---

## Contexto geral

O dashboard atual (v2) esta funcional com 3 abas (Hoje/Esta Semana/Este Mes), 8 KPIs, graficos, tabela, fidelizacao e historico de mensagens. Agora precisa evoluir para versao premium com:

- Filtros compostos (tipo + dia + turno atuando juntos)
- Sub-filtros por dia dentro da semana
- Drill-down no mes (Mes → Semana → Dia)
- KPIs colapsiveis
- Semana comecando no domingo
- Terca-feira marcada como FECHADO nos graficos
- Aba "Hoje" com donut + KPIs completos
- Deltas de comparacao nos KPIs (vs periodo anterior)

**REGRAS GERAIS:**
- NAO alterar a identidade visual (cores, fontes, gradiente de fogo nos cards)
- NAO remover funcionalidades existentes
- Manter compatibilidade com mock data para modo offline
- Manter polling de 30 segundos
- Testar dark mode E light mode em cada mudanca

---

## FASE 0 — Refatoracao Arquitetural (OBRIGATORIA, fazer primeiro)

> Esta fase NAO adiciona features visiveis. Ela reorganiza o codigo para que as features premium sejam possiveis sem criar spaghetti.

---

### PROMPT 0.1 — Criar FilterContext centralizado

```
REFATORACAO: Estado de filtros centralizado.

PROBLEMA ATUAL:
- App.jsx tem 5 useState separados (tab, filterType, activeDay, selectedItem, modal)
- CardBarras.jsx tem seu proprio useState(activeTurno) LOCAL que nao propaga para nenhum outro componente
- Nao existe como combinar filtros (ex: filtrar por tipo E por dia ao mesmo tempo)

CRIAR `src/context/DashboardFilterContext.jsx`:

1. Usar useReducer com este state shape:
   {
     tab: 'hoje' | 'semana' | 'mes',
     filterType: null | string,       // do donut (ex: 'Reservas')
     activeDay: null | string,        // do grafico de linha/barras (ex: '2026-03-18')
     turnoFilter: null | string,      // do grafico de barras (ex: 'j')
     kpiCollapsed: false,             // toggle de KPIs
     monthDrill: { level: 'month' },  // para drill-down futuro
     selectedItem: null,              // item selecionado no DetailPanel
     modal: { type: null, data: null }
   }

2. Actions do reducer:
   - SET_TAB → muda tab, RESETA filterType, activeDay, turnoFilter, monthDrill
   - SET_FILTER_TYPE → toggle filterType (se igual ao atual, seta null)
   - SET_ACTIVE_DAY → toggle activeDay
   - SET_TURNO_FILTER → toggle turnoFilter
   - SET_KPI_COLLAPSED → toggle kpiCollapsed
   - SET_MONTH_DRILL → define nivel do drill-down
   - SET_SELECTED_ITEM → define item selecionado
   - SET_MODAL → abre/fecha modal
   - CLEAR_FILTERS → reseta filterType + activeDay + turnoFilter (mas NAO muda tab)

3. Criar DashboardFilterProvider que wrapa a App
4. Criar hook useDashboardFilters() que retorna { state, dispatch }
5. Exportar action creators tipados: setTab(tab), setFilterType(type), etc.

DEPOIS de criar o context:
- Remover os useState de App.jsx (filterType, activeDay, selectedItem, modal)
- Manter useState de tab APENAS para o useDashboardData (que depende de tab para fetch)
- Substituir props drilling por useContext em todos os componentes filhos:
  - CardDonut: usar useDashboardFilters() em vez de receber filterType/setFilterType como props
  - CardBarras: REMOVER o useState(activeTurno) local, usar turnoFilter do context
  - CardTabela: usar filterType E activeDay do context para filtrar
  - CardLinha: usar activeDay do context
  - App.jsx: ler state do context para orquestrar layout

NAO alterar o visual. Apenas reorganizar o estado.
```

---

### PROMPT 0.2 — Separar processData em funcoes puras

```
REFATORACAO: Separar processData monolitica.

PROBLEMA ATUAL:
Em src/lib/useDashboardData.js, a funcao processData() (106 linhas) calcula TUDO junto:
KPIs + graficos + tabela + fidelizacao. Isso impede filtrar graficos sem afetar KPIs.

CRIAR `src/lib/dataProcessors/` com 4 arquivos:

1. `computeKPIs.js` — exporta computeKPIs(rows, tab)
   Retorna: { total, clientesUnicos, reservas, aniversarios, satisfacao, taxaFeedback, reclamacoes, foraHorario, programacao, progRanking, diaMaisProcurado, pico }
   ESTES VALORES NUNCA SAO AFETADOS POR FILTROS DE TIPO/DIA/TURNO.

2. `computeCharts.js` — exporta computeCharts(rows, tab, options)
   Retorna: { linha, linhaLabel, donut, barras, barLabel }
   Internamente chama buildLinha, buildDonut, buildBarras (mover de useDashboardData.js)
   options = { fechadoDay: 2 } para marcar terca como fechado

3. `computeTableRows.js` — exporta computeTableRows(rows)
   Retorna: array de { id, dt, h, cli, tipo, st, turno, _raw }
   (mover buildRows de useDashboardData.js)

4. `computeFidelizacao.js` — exporta computeFidelizacao(rows, tab)
   Retorna: { novos, retornantes, taxa, evolucao, frequentes }
   (mover buildFidelizacao de useDashboardData.js)

DEPOIS:
- processData() em useDashboardData.js passa a chamar as 4 funcoes e montar o objeto final
- Exportar as 4 funcoes para uso direto no App.jsx (para reprocessar com dados filtrados)
- Adicionar `rawRows` no retorno do hook (ja existe, manter)

NAO alterar os retornos. Os componentes devem continuar recebendo os mesmos dados.
```

---

### PROMPT 0.3 — Criar hook useFilteredData

```
REFATORACAO: Hook que aplica filtros cruzados nos dados.

CRIAR `src/hooks/useFilteredData.js`:

import { useMemo } from 'react'
import { useDashboardFilters } from '../context/DashboardFilterContext'
import { computeCharts } from '../lib/dataProcessors/computeCharts'
import { computeTableRows } from '../lib/dataProcessors/computeTableRows'
import { normTipo, normTurno } from '../lib/utils'

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
      result = result.filter(r => {
        const cls = classifyTurno(r.turno)
        return cls === turnoFilter
      })
    }
    return result
  }, [rawRows, filterType, activeDay, turnoFilter])

  const charts = useMemo(() => computeCharts(filteredRows, tab), [filteredRows, tab])
  const tableRows = useMemo(() => computeTableRows(filteredRows), [filteredRows])

  return { filteredRows, charts, tableRows, hasFilters: !!(filterType || activeDay || turnoFilter) }
}

INTEGRAR no App.jsx:
- KPIs usam dados NAO filtrados (do useDashboardData direto)
- Graficos e tabela usam dados FILTRADOS (do useFilteredData)
- Quando hasFilters = true, mostrar barra de filtros ativos acima dos graficos com chips removiveis
```

---

### PROMPT 0.4 — Corrigir bugs existentes

```
CORRECOES DE BUGS (fazer junto com a refatoracao):

1. FIX GRID "HOJE": Em src/styles/cards.css, a classe .metricas-compactas usa
   grid-template-columns: repeat(3, 1fr) mas App.jsx renderiza 4 items.
   CORRIGIR para repeat(4, 1fr).

2. REMOVER DEAD CODE:
   - Deletar src/components/AlertBar.jsx (nao importado em lugar nenhum)
   - Deletar src/components/SupabaseBadge.jsx (nao importado em lugar nenhum)
   - Em src/lib/useDashboardData.js, remover import de isDiurno (importado mas nunca usado)

3. FIX BADGE HARDCODED: Em CardLinha, o badge "+18% vs anterior" e um texto estatico.
   Se nao ha dados de comparacao calculados ainda, REMOVER o badge temporariamente
   (sera reimplementado com dados reais na Fase 1).

4. FIX normTurno FALLBACK: Em src/lib/utils.js, normTurno faz fallback silencioso para 'Jantar'.
   Adicionar console.warn quando um turno desconhecido for encontrado para facilitar debug.

5. FIX CLOCK INTERVAL: Em src/lib/constants.js, CLOCK_INTERVAL = 30000 (30s) mas o relogio
   so mostra HH:MM. Mudar para 60000 (60s) para evitar updates desnecessarios.

NAO alterar funcionalidades. Apenas corrigir o que esta errado.
```

---

## FASE 1 — Quick Wins (apos Fase 0 completa)

---

### PROMPT 1.1 — Semana comeca no domingo + Terca FECHADO

```
ALTERACAO: "Esta Semana" deve usar semana calendario (Domingo a Sabado) em vez de 7 dias corridos.

EM src/lib/useDashboardData.js:

1. ALTERAR dateRange('semana'):
   ANTES: start = subDays(now, 6) — ultimos 7 dias corridos
   DEPOIS: start = domingo da semana atual

   Logica:
   const dayOfWeek = now.getDay() // 0=Dom, 1=Seg, ..., 6=Sab
   const sunday = subDays(now, dayOfWeek)
   start = isoDate(sunday)
   end = today
   prevStart = isoDate(subDays(sunday, 7))
   prevEnd = isoDate(subDays(sunday, 1))

2. ALTERAR buildLinha para tab === 'semana':
   ANTES: loop de subDays(now, 6) ate now
   DEPOIS: loop fixo de Domingo a Sabado da semana atual:

   const days = []
   for (let i = 0; i <= 6; i++) {
     const d = new Date(sunday)
     d.setDate(d.getDate() + i)
     days.push({
       iso: isoDate(d),
       label: DIAS_ABREV[i],  // i=0→Dom, i=1→Seg, ..., i=6→Sab
       fechado: i === 2        // Terca = FECHADO
     })
   }

   Cada ponto do grafico agora carrega a propriedade `fechado: true/false`.

3. ALTERAR buildBarras para tab === 'semana': mesma logica de semana calendario.
   Cada barra carrega `fechado: true/false`.

4. ALTERAR linhaLabel de 'semana': de "Ultimos 7 dias — Volume diario" para "Esta Semana — Volume diario"

5. EM SvgLine.jsx: quando o ponto tem `fechado: true`:
   - Circulo cinza (#666) em vez de laranja
   - Label "FECHADO" abaixo do ponto em fonte 8px, cor var(--t3), uppercase
   - Linha tracejada conectando ao ponto (strokeDasharray: "4 3")
   - Sem hover/click nesse ponto

6. EM CssBar.jsx: quando a barra tem `fechado: true`:
   - Fundo com padrao hachurado (repeating-linear-gradient 45deg)
   - Label "FECHADO" abaixo da barra em fonte 8px
   - Sem hover/click nessa barra

7. ATUALIZAR mockData.js: semana.linha deve comecar com Dom e incluir Ter com total:0 e fechado:true.

8. ATUALIZAR buildLinha para tab === 'mes': a divisao em semanas (Sem 1, Sem 2, Sem 3, Sem 4)
   deve considerar semana comecando no domingo, nao mais dia 1-7=Sem1, 8-14=Sem2.
   Usar: semana do mes = CEIL((dia + dow do 1o do mes) / 7)

Testar em dark mode E light mode.
```

---

### PROMPT 1.2 — Deltas de comparacao nos KPIs (dados reais)

```
FEATURE: Mostrar variacao percentual nos KPIs comparando com periodo anterior.

CONTEXTO: O hook useDashboardData JA busca prevRows (dados do periodo anterior) mas
processData ignora esse parametro (usa _prevRows). Os dados estao la, so nao sao usados.

EM src/lib/dataProcessors/computeKPIs.js:

1. Receber prevRows como segundo parametro: computeKPIs(rows, prevRows, tab)

2. Calcular delta para cada KPI:
   const prevTotal = prevRows.length
   const deltaTotal = prevTotal > 0 ? Math.round(((total - prevTotal) / prevTotal) * 100) : null

   Fazer o mesmo para: reservas, foraHorario, satisfacao, reclamacoes, aniversarios, programacao, clientesUnicos

3. Retornar delta junto com cada KPI:
   total: { value: 42, sub: '34 clientes unicos', delta: +15, deltaType: 'bp' }

   deltaType:
   - 'bp' (bom positivo) = delta > 0 para total, reservas, satisfacao (mais = melhor)
   - 'bn' (bom negativo) = delta < 0 para reclamacoes, foraHorario (menos = melhor)
   - 'be' (bom estavel) = delta proximo de 0
   - null = sem dados anteriores para comparar

EM src/components/KPICard.jsx:

4. Renderizar o delta:
   - Se delta > 0: seta verde ▲ com "+15%"
   - Se delta < 0: seta vermelha ▼ com "-8%"
   - Se delta = 0: traço cinza "—"
   - Se delta = null: nao mostrar nada

   INVERTER cores para metricas onde menos = melhor (reclamacoes, foraHorario):
   - Reclamacoes subiu → seta VERMELHA (ruim)
   - Reclamacoes desceu → seta VERDE (bom)

5. Sub-label dos KPIs:
   - Semana: "vs. 7 dias anteriores"
   - Mes: "vs. mes anterior"
   - Hoje: "vs. ontem"

6. REMOVER o badge hardcoded "+18% vs anterior" de CardLinha (se ainda existir apos Fase 0).

Testar com cenarios: dados novos (sem prevRows), delta positivo, negativo, zero.
```

---

### PROMPT 1.3 — KPIs colapsiveis

```
FEATURE: Toggle para minimizar/expandir os 8 KPIs como grupo.

1. Em App.jsx (ou componente novo KPIGrid):
   Ler kpiCollapsed do DashboardFilterContext.

   Acima da primeira .g4 row, adicionar um botao toggle:
   <button className="kpi-toggle" onClick={() => dispatch(toggleKpiCollapsed())}>
     {kpiCollapsed ? '▼ Expandir KPIs' : '▲ Minimizar KPIs'}
   </button>

2. Quando kpiCollapsed = false (expandido):
   Renderizar os 8 KPICards normalmente nas duas .g4 rows (comportamento atual).

3. Quando kpiCollapsed = true (minimizado):
   Renderizar uma UNICA linha horizontal compacta (className "kpi-strip"):
   - Cada KPI mostra apenas: icone + valor + delta (sem sub-label, sem card completo)
   - Fonte do valor: 18px Playfair (em vez de 32px)
   - Separados por um divisor sutil (border-right 1px var(--border))
   - Background: var(--card), border: 1px solid var(--border), border-radius: 12px
   - Padding: 12px 20px
   - Uma unica linha, scroll horizontal se necessario em mobile

4. Transicao suave entre estados:
   - NAO usar animacao de altura (causa layout shift)
   - Usar opacity 0→1 com transition 0.2s ao trocar entre os dois layouts

5. kpiCollapsed NAO deve resetar quando muda de tab (e preferencia do usuario).

6. Mostrar o toggle APENAS nas abas Semana e Mes (Hoje tem layout proprio com metricas-compactas).

CSS em src/styles/cards.css:
.kpi-toggle { ... botao discreto, alinhado a direita, fonte 10px uppercase }
.kpi-strip { display: flex; align-items: center; gap: 24px; ... }
.kpi-strip__item { display: flex; align-items: baseline; gap: 6px; }
```

---

## FASE 2 — Features Premium (apos Fase 1 completa)

---

### PROMPT 2.1 — Seletor de dia na aba "Esta Semana"

```
FEATURE: Sub-filtro de dia dentro da aba "Esta Semana".

Quando o usuario esta na aba "Esta Semana", exibir uma faixa de 7 botoes-pill
ABAIXO das tabs principais (entre as tabs e os KPIs):

Dom | Seg | ~~Ter~~ | Qua | Qui | Sex | Sab

1. CRIAR src/components/filters/DaySelector.jsx:

   Props: days (array de { iso, label, dayIndex, fechado }), activeDay, onDayClick

   Renderizar:
   - Botao "TODOS" (quando activeDay = null, este fica ativo)
   - 7 botoes com os dias da semana atual
   - Terca com visual de FECHADO: strikethrough, opacity 0.35, mas CLICAVEL
     (porque pode ter contatos fora do horario na terca)
   - Botao ativo: background #E85D04, cor branca
   - Botao inativo: background transparente, cor var(--t2), border var(--border)

   Estilo: pill buttons, border-radius: 20px, font-size: 10px, font-weight: 700,
   letter-spacing: 0.08em, padding: 6px 14px

   Container: flex, gap: 4px, padding: 3px, background var(--bg1),
   border-radius: 8px, width: fit-content, border: 1px solid var(--border)

2. EM App.jsx:
   - Renderizar DaySelector APENAS quando tab === 'semana'
   - Position: entre as tabs e os KPIs
   - O array `days` deve ser computado das mesmas datas que buildLinha usa
     (domingo a sabado da semana atual, com ISO date de cada dia)
   - Ao clicar um dia: dispatch(setActiveDay(iso)) → useFilteredData filtra tudo
   - Ao clicar "TODOS": dispatch(setActiveDay(null))

3. QUANDO UM DIA ESTA SELECIONADO:
   - KPIs mostram dados daquele dia especifico
     (EXCECAO da regra geral: aqui os KPIs DEVEM refletir o filtro de dia)
   - Graficos (linha, donut, barras) mostram dados daquele dia
   - Tabela filtra por aquele dia
   - Fidelizacao filtra por aquele dia
   - O ponto correspondente no grafico de linha fica destacado (maior, cor solida)

4. QUANDO "TODOS" ESTA SELECIONADO:
   - Comportamento atual (semana inteira)

5. ATUALIZAR o titulo do grafico de linha:
   - Sem filtro: "Esta Semana — Volume diario"
   - Com filtro: "Quarta-feira, 19/03 — Detalhes"

Testar: clicar dia → ver dados filtrarem → clicar TODOS → voltar ao normal.
```

---

### PROMPT 2.2 — Cross-filtering universal

```
FEATURE: Todos os filtros (tipo, dia, turno) atuam em TODOS os componentes simultaneamente.

CONTEXTO: Com o FilterContext (Fase 0) e useFilteredData (Fase 0), os filtros ja estao
centralizados. Agora precisamos garantir que cada componente REAJA a todos os filtros.

1. CardDonut:
   - Ler filterType do context (ja faz)
   - NOVO: quando activeDay esta ativo, o donut deve reprocessar mostrando apenas
     os tipos daquele dia. Usar filteredRows do useFilteredData, nao d.donut.
   - NOVO: quando turnoFilter esta ativo, donut mostra apenas tipos daquele turno.
   - Segmento clicado: dispatch(setFilterType(tipo))

2. CardLinha / SvgLine:
   - NOVO: quando filterType esta ativo, cada ponto do grafico mostra apenas o total
     filtrado por aquele tipo. Isso requer que buildLinha retorne byType por ponto:
     { dia, total, byType: { Reservas: 3, Geral: 10, ... } }
   - Ponto clicado: dispatch(setActiveDay(iso))
   - Pontos nao-selecionados: opacity 0.3

3. CardBarras / CssBar:
   - REMOVER o useState(activeTurno) local
   - Ler turnoFilter do context
   - Clique na legenda de turno: dispatch(setTurnoFilter(turno))
   - NOVO: quando filterType esta ativo, barras mostram apenas dados daquele tipo
   - Barra clicada: dispatch(setActiveDay(iso))

4. CardTabela:
   - NOVO: filtrar por filterType E activeDay E turnoFilter (interseccao)
   - Usar tableRows do useFilteredData diretamente

5. FidelizacaoPanel:
   - NOVO: quando qualquer filtro esta ativo, reprocessar fidelizacao com filteredRows

6. BARRA DE FILTROS ATIVOS:
   Quando hasFilters = true, renderizar entre KPIs e graficos:

   <div className="active-filters-bar">
     {filterType && <span className="filter-chip" onClick={() => dispatch(setFilterType(null))}>
       Tipo: {filterType} ✕
     </span>}
     {activeDay && <span className="filter-chip" onClick={() => dispatch(setActiveDay(null))}>
       Dia: {formatDate(activeDay)} ✕
     </span>}
     {turnoFilter && <span className="filter-chip" onClick={() => dispatch(setTurnoFilter(null))}>
       Turno: {turnoFilter} ✕
     </span>}
     <button className="filter-clear" onClick={() => dispatch(clearFilters())}>
       Limpar tudo
     </button>
   </div>

   Estilo: flex, gap: 8px, padding: 8px 0, font-size: 11px
   Chips: background var(--card), border var(--border), border-radius: 20px, padding: 4px 12px

Testar combinacoes: tipo + dia, tipo + turno, dia + turno, todos juntos, limpar um por um.
```

---

### PROMPT 2.3 — Aba "Hoje" com donut e KPIs completos

```
FEATURE: Melhorar a aba "Hoje" mantendo identidade visual mas agregando mais dados.

ALTERACOES EM App.jsx (painel isHoje):

1. METRICAS COMPACTAS → KPIs COMPLETOS:
   Substituir os 4 .metrica-mini por 4 KPICards completos (Atendimentos, Solic. Reserva, Satisfacao, Fora Horario).
   Usar a mesma .g4 grid das outras abas, mas APENAS 4 cards (1 row).
   NAO adicionar os outros 4 KPIs (Clientes Unicos, Aniversarios, Reclamacoes, Programacao) — Hoje deve ser mais limpo.

2. ADICIONAR DONUT na area principal:
   Layout da area main do dashboard-hoje:
   ANTES: ReservasHoje + CardTabela
   DEPOIS: ReservasHoje + CardDonut (tipo de atendimento do dia)

   O donut no Hoje mostra a distribuicao de tipos APENAS do dia atual.
   Se houver 0 atendimentos, mostrar empty state: "Sem dados para exibir"

3. MANTER CardTabela no Hoje, mas MOVER para abaixo do grid principal
   (fora do dashboard-hoje grid, como elemento full-width):
   Mostrar apenas os ultimos 10 atendimentos do dia.

4. MANTER sidebar: DetailPanel + TurnoAtual (sem alteracao)

5. PROMOVER TurnoAtual:
   No mobile (< 1000px), TurnoAtual deve aparecer ANTES da tabela (ele e o dado
   mais importante durante o servico — saber se esta aberto, qual turno, quanto falta).

6. NAO adicionar: grafico de linha (nao faz sentido para 1 dia), FidelizacaoPanel,
   Evolucao e Frequencia.

Manter a identidade visual da aba Hoje (mais limpa, operacional, focada no agora).
```

---

## FASE 3 — Drill-Down Mensal (apos Fase 2 completa)

---

### PROMPT 3.1 — Drill-down Este Mes: Mes → Semana → Dia (breadcrumb)

```
FEATURE: No "Este Mes", clicar em uma semana no grafico faz drill-down para os dias
daquela semana. Clicar em um dia faz drill-down para detalhes horarios daquele dia.
Breadcrumb permite navegar de volta.

1. STATE (ja existe no FilterContext):
   monthDrill: { level: 'month' }                          // padrao
   monthDrill: { level: 'week', week: 3 }                  // drill na semana 3
   monthDrill: { level: 'day', week: 3, day: '2026-03-19' } // drill no dia

2. CRIAR src/components/filters/BreadcrumbDrill.jsx:

   Renderiza abaixo das tabs quando tab === 'mes':

   level=month: "Este Mes" (sem breadcrumb, texto normal)
   level=week:  "Este Mes > Semana 3" (Este Mes clicavel, Semana 3 ativo)
   level=day:   "Este Mes > Semana 3 > Qui 19/03" (ambos clicaveis, dia ativo)

   Estilo: font-size: 11px, separador " > " em cor var(--t3)
   Item ativo: cor #E85D04, font-weight: 700
   Item clicavel: cor var(--t2), text-decoration underline, cursor pointer

3. INTERACAO NO GRAFICO DE LINHA (tab=mes):
   - level=month: X-axis mostra "Sem 1, Sem 2, Sem 3, Sem 4"
     Clicar em um ponto → dispatch(setMonthDrill({ level: 'week', week: N }))

   - level=week: X-axis mostra os 7 dias daquela semana (Dom, Seg, Ter, Qua, Qui, Sex, Sab)
     Dados: filtrar rawRows pela semana selecionada, agrupar por dia
     Terca marcada como FECHADO (mesma logica da Feature 1.1)
     Clicar em um ponto → dispatch(setMonthDrill({ level: 'day', week: N, day: isoDate }))

   - level=day: X-axis mostra horas do dia (12h, 13h, ..., 23h ou conforme dados)
     Dados: filtrar rawRows pelo dia selecionado
     Usar hora de alto_hirant_mensagens para distribuicao horaria (query separada se necessario)
     NAO permitir mais drill (nivel maximo)

4. INTERACAO NO GRAFICO DE BARRAS (tab=mes):
   Mesma logica: barras mudam conforme o nivel do drill.
   - level=month: barras por semana
   - level=week: barras por dia da semana
   - level=day: barras por turno do dia

5. KPIS ACOMPANHAM O DRILL:
   - level=month: KPIs do mes inteiro
   - level=week: KPIs apenas da semana selecionada
   - level=day: KPIs apenas do dia selecionado

6. TABELA ACOMPANHA O DRILL:
   Filtrar por periodo do nivel atual.

7. DONUT ACOMPANHA O DRILL:
   Reprocessar com dados do nivel atual.

8. FIDELIZACAO ACOMPANHA O DRILL:
   Reprocessar com dados do nivel atual.

9. BREADCRUMB NAVEGACAO:
   - Clicar "Este Mes" → volta para level=month
   - Clicar "Semana 3" → volta para level=week
   - Transicao SEM re-fetch (filtrar rawRows client-side)

10. TITULO DO GRAFICO DE LINHA muda:
    - level=month: "Este Mes — Volume semanal"
    - level=week: "Semana 3 — Volume diario"
    - level=day: "Quinta 19/03 — Distribuicao horaria"

11. ATUALIZAR mockData.js para suportar drill (dados suficientes em diferentes semanas/dias).

Testar: drill month→week→day, navegar de volta pelo breadcrumb, filtros cruzados
funcionam em cada nivel, terca FECHADO aparece no nivel week.
```

---

## Queries SQL de validacao

```sql
-- Verificar se semana domingo-sabado funciona com os dados
SELECT
  data,
  EXTRACT(dow FROM data) as dia_semana,
  CASE EXTRACT(dow FROM data)
    WHEN 0 THEN 'Dom' WHEN 1 THEN 'Seg' WHEN 2 THEN 'Ter'
    WHEN 3 THEN 'Qua' WHEN 4 THEN 'Qui' WHEN 5 THEN 'Sex' WHEN 6 THEN 'Sab'
  END as dia_label,
  COUNT(*) as atendimentos
FROM alto_hirant_dashboard
WHERE data >= date_trunc('week', CURRENT_DATE + INTERVAL '1 day') - INTERVAL '1 day'
GROUP BY data
ORDER BY data;

-- Verificar distribuicao por semana do mes (domingo como inicio)
SELECT
  CEIL((EXTRACT(DAY FROM data) + EXTRACT(dow FROM date_trunc('month', data))) / 7.0) as semana,
  COUNT(*) as total
FROM alto_hirant_dashboard
WHERE data >= date_trunc('month', CURRENT_DATE)
GROUP BY semana
ORDER BY semana;

-- Dados para delta KPI (periodo anterior)
SELECT
  'atual' as periodo, COUNT(*) as total
FROM alto_hirant_dashboard
WHERE data >= CURRENT_DATE - 6
UNION ALL
SELECT
  'anterior' as periodo, COUNT(*) as total
FROM alto_hirant_dashboard
WHERE data >= CURRENT_DATE - 13 AND data <= CURRENT_DATE - 7;
```

---

## Arquivos que serao criados

| Arquivo | Fase | Descricao |
|---------|------|-----------|
| `src/context/DashboardFilterContext.jsx` | 0.1 | Estado centralizado de filtros |
| `src/lib/dataProcessors/computeKPIs.js` | 0.2 | KPIs isolados |
| `src/lib/dataProcessors/computeCharts.js` | 0.2 | Graficos isolados |
| `src/lib/dataProcessors/computeTableRows.js` | 0.2 | Tabela isolada |
| `src/lib/dataProcessors/computeFidelizacao.js` | 0.2 | Fidelizacao isolada |
| `src/hooks/useFilteredData.js` | 0.3 | Hook de dados filtrados |
| `src/components/filters/DaySelector.jsx` | 2.1 | Seletor de dia da semana |
| `src/components/filters/BreadcrumbDrill.jsx` | 3.1 | Navegacao drill-down |

## Arquivos que serao modificados

| Arquivo | Fases | Tipo de mudanca |
|---------|-------|-----------------|
| `src/App.jsx` | 0.1, 0.4, 1.3, 2.1, 2.2, 2.3 | Estado → context, layout Hoje, sub-filtros |
| `src/lib/useDashboardData.js` | 0.2, 1.1, 1.2 | Split processData, semana domingo, deltas |
| `src/lib/constants.js` | 0.4 | Fix clock interval |
| `src/lib/mockData.js` | 1.1 | Semana Dom-Sab, fechado Ter |
| `src/lib/utils.js` | 0.4 | Warn em normTurno |
| `src/components/KPICard.jsx` | 1.2 | Renderizar deltas |
| `src/components/cards/CardDonut.jsx` | 0.1, 2.2 | Context em vez de props |
| `src/components/cards/CardBarras.jsx` | 0.1, 2.2 | Remover estado local, context |
| `src/components/cards/CardTabela.jsx` | 0.1, 2.2 | Cross-filter com context |
| `src/components/cards/CardLinha.jsx` | 1.1 | Badge removido, props fechado |
| `src/components/charts/SvgLine.jsx` | 1.1 | Renderizar FECHADO |
| `src/components/charts/CssBar.jsx` | 1.1 | Renderizar FECHADO |
| `src/styles/cards.css` | 0.4, 1.3, 2.1, 2.2 | Fix grid, KPI strip, filtros, chips |

## Arquivos que serao deletados

| Arquivo | Fase | Motivo |
|---------|------|--------|
| `src/components/AlertBar.jsx` | 0.4 | Dead code — nunca importado |
| `src/components/SupabaseBadge.jsx` | 0.4 | Dead code — nunca importado |
