# Prompt Genérico — Replicar Dashboard de Gestão Food-Service
> Template universal para reproduzir a estrutura, dimensões e funcionamento de um dashboard de atendimentos IA em outro ambiente do mesmo segmento (restaurante, bar, hamburgueria, pizzaria, etc.)

---

## INSTRUÇÕES GERAIS PARA O AGENTE

Você vai implementar (ou adaptar) um **dashboard de gestão de atendimentos** para um estabelecimento do segmento food-service. O dashboard exibe dados em tempo real de um agente de IA no WhatsApp: atendimentos por dia, tipos de solicitação, turnos, feedbacks, horários de pico e fidelização de clientes.

**IMPORTANTE:**
- Todas as medidas de dimensionamento, espaçamento, border-radius, font-size, padding e gap descritas abaixo são OBRIGATÓRIAS e devem ser reproduzidas exatamente.
- As cores NÃO estão definidas neste template — o projeto destino deve ter sua própria paleta. Onde houver referência a "cor accent", "cor semântica" ou "gradiente de marca", substitua pela identidade visual do projeto destino.
- Os nomes de empresa, marca e tagline devem ser substituídos pelos do projeto destino.
- As fontes e ícones SÃO obrigatórios e devem ser mantidos.

---

## 1. STACK TECNOLÓGICO

| Camada | Tecnologia |
|--------|-----------|
| Framework | React 18+ com React DOM |
| Build | Vite 5+ |
| Backend/DB | Supabase (supabase-js) |
| Estilo | CSS vanilla com variáveis (CSS custom properties) |
| Fontes | Google Fonts: **Playfair Display** (serif) + **DM Sans** (sans-serif) |
| Módulos | ES Modules |

---

## 2. TIPOGRAFIA — OBRIGATÓRIO

### Display / KPIs / Números grandes
```
font-family: 'Playfair Display', serif
font-weight: 900
font-size: 32px (dentro de cards KPI) / 44px (referência de design)
letter-spacing: -0.02em
```

### Interface / Labels / Dados tabulares
```
font-family: 'DM Sans', sans-serif
font-weight: 400 | 500 | 600 | 700
```

| Contexto | font-size | weight | letter-spacing | transform |
|----------|-----------|--------|----------------|-----------|
| Labels de KPI | 10-11px | 600 | 0.14em | uppercase |
| Dados em tabela | 12-13px | 500 | normal | none |
| Badges | 10px | 700 | 0.05em | uppercase |
| Botões filtro | 10px | 700 | normal | uppercase |
| Sub-labels | 10px | 500 | normal | none |

### Nome da Marca no Header
```
font-family: 'Playfair Display', serif
font-weight: 900
font-size: 19px
letter-spacing: 0.12em
text-transform: uppercase
```

### Tagline no Header
```
font-family: 'DM Sans', sans-serif
font-weight: 500
font-size: 10px
letter-spacing: 0.22em
text-transform: uppercase
color: [cor accent do projeto]
```

---

## 3. SISTEMA DE ÍCONES — EMOJIS UNICODE

O dashboard usa **emojis Unicode nativos** (sem biblioteca de ícones). Cada KPI e badge deve ter um emoji representativo do contexto. Exemplos de mapeamento:

| Contexto | Emoji sugerido | Alternativas |
|----------|---------------|-------------|
| Total atendimentos | 💬 | 📊 |
| Reservas | 🍽️ | 📅 🍖 |
| Satisfação/Feedback | ⭐ | 😊 👍 |
| Fora do horário | 🕐 | ⏰ 🌙 |
| Clientes únicos | 👤 | 👥 |
| Aniversários | 🎂 | 🎉 |
| Reclamações | ⚠️ | 🚨 |
| Programação/Eventos | 📅 | 🎯 🎪 |
| Happy Hour | 🍺 | 🍹 🥂 |
| Almoço | 🍽️ | ☀️ |
| Jantar | 🔥 | 🌙 |
| Fechado | 🔒 | ❌ |
| Dark mode | 🌙 | — |
| Light mode | ☀️ | — |

> Adaptar os emojis ao nicho do estabelecimento (ex.: pizzaria pode usar 🍕, hamburgueria 🍔, etc.)

---

## 4. DIMENSIONAMENTO GLOBAL — OBRIGATÓRIO

### Container Principal
```css
max-width: 1280px
margin: 0 auto
padding: 0 24px  /* horizontal */
```

### Border-radius Padrão
| Elemento | border-radius |
|----------|--------------|
| Cards | 12px |
| Card headers | 10px |
| Badges/Pills | 20px |
| Botões filtro | 20px |
| Modal | 20px |
| Mini calendar container | 12px |
| Mini calendar day cell | 50% (circle) |

### Sombras e Bordas
```css
/* Cards */
border: 1px solid var(--border)  /* cor de borda sutil do tema */
box-shadow: none (padrão) → hover: translateY(-3px) + box-shadow com accent-color 0.22 opacity

/* Modal */
box-shadow: 0 24px 80px rgba(0,0,0,0.55)

/* Backdrop modal */
background: rgba(0,0,0,0.72)
backdrop-filter: blur(6px)
-webkit-backdrop-filter: blur(6px)
```

---

## 5. LAYOUT DA PÁGINA — OBRIGATÓRIO

### Header (sticky)
```css
position: sticky
top: 0
z-index: 100
padding: 10px 24px
display: flex
align-items: center
```

**Composição do Header:**
1. Logo SVG (marca do estabelecimento)
2. Nome da marca (Playfair 19px uppercase)
3. Tagline (DM Sans 10px uppercase, cor accent)
4. Status do agente IA (indicador pulsante "online")
5. Toggle Dark/Light mode (switch animado)
6. Relógio (HH:MM, atualiza a cada 60s)

### Abas de Navegação
```
3 abas: "Hoje" | "Esta Semana" | "Este Mês"
Default: "Hoje" ativa ao abrir
```

### Grid de KPIs
```css
display: grid
grid-template-columns: repeat(4, 1fr)  /* desktop */
gap: 10px
```

**Cada card KPI contém:**
1. Linha de acento no topo: `height: 3px`, gradiente com cores da marca
2. Emoji + Label (10px uppercase, DM Sans 600)
3. Número grande (Playfair 32px, weight 900)
4. Badge delta: variação vs período anterior (▲ verde / ▼ vermelho ou invertido conforme métrica)
5. Sub-label descritivo (10px)
6. Padding interno: `14px 16px`

### Grid de Gráficos — Linha 1
```css
display: grid
grid-template-columns: 2fr 1fr  /* gráfico de linha ocupa 2/3, donut 1/3 */
gap: 10px
```

### Grid de Gráficos — Linha 2
```css
display: grid
grid-template-columns: 1fr 1fr  /* barras e tabela dividem 50/50 */
gap: 10px
```

---

## 6. COMPONENTES DE GRÁFICO — DIMENSÕES OBRIGATÓRIAS

### Gráfico de Linha (SVG customizado)
```
Largura SVG: 560px
Altura SVG: 150px
Padding esquerdo: 36px
Padding direito: 36px
Padding topo: 10px
Padding base: 22px
Área útil interna: 488 × 118px
Máximo de labels no eixo X: 7
```

### Gráfico Donut (SVG/Conic-gradient)
```
Donut com legenda lateral compacta
Categorias com cores semânticas (até 8 fatias)
Inner radius: ~55px
```

### Gráfico de Barras (CSS puro)
```
Altura das barras: 120px (container)
Implementação: background linear-gradient CSS
Barras com cantos arredondados no topo
Legenda toggle (liga/desliga categorias)
```

### Tabela de Registros (paginada)
```
Colunas: 7 (ID, Data, Hora, Cliente, Tipo, Turno, Feedback)
Paginação: 10 itens por página
Header: font-size 10px, uppercase, letter-spacing 0.13em, sticky
Cell padding header: 7px 12px
Cell padding body: 6px 12px
Max-height visível: 220px (com scroll interno)
Header sticky com background gradiente
```

---

## 7. SISTEMA DE ABAS — COMPORTAMENTO POR ABA

### Aba "Hoje" — Layout Padrão F (2 colunas)
```
Coluna principal (esquerda):
  1. Strip de KPIs (4 cards, colapsável)
  2. Alerta bar (badges de atenção: feedback negativo, aniversários, fora horário)
  3. Lista de reservas do dia (hora, nº pessoas, badge aniversário)
  4. Indicador de turno atual com countdown
  5. Gráfico donut (tipos de atendimento do dia)

Sidebar (direita):
  width: 380px
  position: sticky, top: 1rem
  Painel de detalhes (master-detail) — mostra detalhes do item selecionado
  Grid de informações do registro selecionado
  Min-height estado vazio: 120px
```

### Aba "Esta Semana"
```
1. Strip de KPIs (colapsável) com deltas vs semana anterior
2. Seletor de dia (pills Dom-Sáb, Terça marcada como FECHADO)
   - Semana começa no Domingo
   - Pill padding: 6px 14px
   - font-size: 10px, weight 700, uppercase
   - border-radius: 20px
   - Ativo: fundo accent, texto branco
3. Barra de filtros ativos (chips com X para remover)
4. Gráfico de linha (atendimentos por dia)
5. Gráfico donut (tipos de atendimento)
6. Gráfico de barras (turnos comparativos — mínimo 3: Dia/Tarde/Noite + Fora Horário)
7. Tabela de registros (paginada)
8. Painel de fidelização (novos vs retornantes, taxa retorno, pie chart, evolução, tabela frequentes)
```

### Aba "Este Mês"
```
1. Strip de KPIs (colapsável) com deltas vs mês anterior
2. Drill-down hierárquico: Mês → Semana → Dia
   - Breadcrumb de navegação: "Mês > Sem N > Dia DD/MM"
   - Mini calendário para seleção visual
     - Min-width: 260px
     - Day cell: 28×28px circle
3. Barra de filtros ativos
4. Todos os gráficos (linha, donut, barras, tabela)
5. Painel de fidelização
```

---

## 8. SISTEMA DE FILTROS — CROSS-FILTERING

### State Management (Context + Reducer)
```javascript
Estado global de filtros:
{
  tab: 'hoje' | 'semana' | 'mes',
  filterType: null | string,         // filtro por tipo de atendimento
  activeDay: null | string,           // dia selecionado (ISO date)
  turnoFilter: null | string,         // turno selecionado
  kpiCollapsed: boolean,              // KPIs colapsados
  monthDrill: {
    level: 'month' | 'week' | 'day',
    week: number | undefined,
    day: string | undefined           // ISO date
  },
  selectedItem: null | object,        // item selecionado no detail panel
  modal: { type: null | string, data: null | object }
}
```

### Comportamento de Cross-Filtering
- Clicar em um KPI filtra todos os gráficos e tabela pelo tipo correspondente
- Clicar em uma fatia do donut filtra por tipo de atendimento
- Clicar em um dia no seletor filtra por aquele dia
- Clicar em uma barra filtra por turno
- Filtros são cumulativos (tipo + dia + turno)
- Barra de filtros ativos mostra todos os filtros com X para remover individualmente
- KPIs reagem aos filtros: recalculam com base nos dados filtrados

### KPIs Colapsáveis
- Botão toggle para colapsar/expandir a strip de KPIs
- Quando colapsado: KPIs viram uma faixa compacta horizontal com valores inline
- Transição suave de abertura/fechamento

---

## 9. SISTEMA DE MODAL — ESTRUTURA

### Container
```css
max-width: 660px
height: 82vh
border-radius: 20px
overflow: hidden
```

### Header do Modal
```css
padding: 10px 22px
/* Linha de acento no topo: 3px gradiente da marca */
```

### Body do Modal
```css
padding: 20px 22px
overflow-y: auto
```

### Tipos de Modal
O modal é um dispatcher central com registro de tipos. Cada KPI e cada linha da tabela pode abrir um modal específico:

1. **Modal de listagem** — tabela filtrada pelo tipo (ex: só reservas, só feedbacks negativos)
2. **Modal de registro individual** — detalhes completos de um atendimento
3. **Modal de histórico de conversa** — estilo WhatsApp
   - Balões de mensagem: cliente à esquerda, agente IA à direita
   - Fundo dos balões com cores distintas para cada lado
   - Timestamp em cada mensagem
   - Tools/ações usadas pelo agente exibidas como badges
   - Scroll interno, ESC para voltar

### Stats dentro do Modal
```
Seção de 4 filtros clicáveis no topo do modal
Indicador ativo: inset 0 -3px 0 [accent-color] (borda inferior)
```

---

## 10. COMPONENTES DE BADGE

### Tipos de Badge
| Badge | Conteúdo | Estilo |
|-------|----------|--------|
| TipoBadge | Tipo de atendimento (Reserva, Cardápio, etc.) | Pill colorida, 10px uppercase |
| StatusBadge | Feedback (Positivo/Neutro/Negativo) | Cor semântica (verde/amarelo/vermelho) |
| TurnoBadge | Turno (Dia/Tarde/Noite/Fora) | Pill com emoji + texto |
| FeedbackBadge | Nota de feedback | Cor semântica + texto |
| DeltaBadge | Variação percentual | ▲/▼ + cor (verde=bom, vermelho=ruim, ou invertido) |

### Dimensões dos Badges
```css
border-radius: 20px
font-size: 10px
font-weight: 700
text-transform: uppercase
padding: ~4px 10px
```

---

## 11. TEMA DARK/LIGHT — ESTRUTURA

### Tokens CSS Obrigatórios (nomes, não valores)
```css
:root {
  --bg0: /* fundo da página */
  --bg1: /* fundo de superfície */
  --card: /* fundo dos cards */
  --border: /* borda sutil */
  --t1: /* texto primário */
  --t2: /* texto secundário */
  --t3: /* texto desabilitado/muted */
  --accent-primary: /* cor de destaque principal */
  --accent-secondary: /* cor de destaque secundária */
  --success: /* verde semântico — feedback positivo */
  --danger: /* vermelho semântico — feedback negativo */
  --info: /* azul informativo */
}
```

### Regra de Contraste
- Dark mode: cards ligeiramente mais claros que o fundo (efeito "flutuação")
- Light mode: cards brancos/claros sobre fundo off-white
- A diferença deve ser sutil — sem bordas pesadas, usar espaço negativo

### Toggle
- Switch animado no header
- Transição global: `0.35s ease` em background, color, border-color
- Ícones: 🌙 (dark) / ☀️ (light)

---

## 12. ANIMAÇÕES E MICROINTERAÇÕES — OBRIGATÓRIO

### Transições Globais
```css
transition: background 0.35s ease, color 0.35s ease, border-color 0.35s ease
```

### Hover nos Cards/KPIs
```css
transform: translateY(-3px)
box-shadow: 0 8px 24px rgba([accent-color], 0.22)
transition: 0.2s ease
```

### Hover na Tabela
```css
background: rgba([accent-color], 0.04)  /* tint sutil */
```

### Entrada do Modal
```css
animation: modalIn 0.28s cubic-bezier(0.22, 1, 0.36, 1)

@keyframes modalIn {
  from { opacity: 0; transform: translateY(18px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
```

### Staggered Animations (entrada dos cards)
```css
animation: fadeSlideIn 0.25s ease-out

@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Delays escalonados por nth-child */
:nth-child(1) { animation-delay: 0ms }
:nth-child(2) { animation-delay: 50ms }
:nth-child(3) { animation-delay: 80ms }
:nth-child(4) { animation-delay: 120ms }
:nth-child(5) { animation-delay: 160ms }
:nth-child(6) { animation-delay: 200ms }
:nth-child(7) { animation-delay: 240ms }
```

### Indicador Online (pulse)
```css
animation: pulse 2.2s infinite
@keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.5 } }
```

---

## 13. RESPONSIVIDADE — BREAKPOINTS OBRIGATÓRIOS

### Breakpoint 1: ≤ 1000px (tablet)
```css
/* KPIs */
grid-template-columns: repeat(4, 1fr) → repeat(2, 1fr)

/* Gráficos linha+donut */
grid-template-columns: 2fr 1fr → 1fr

/* Gráficos barras+tabela */
grid-template-columns: 1fr 1fr → 1fr

/* Aba Hoje */
Layout 2 colunas → 1 coluna
Sidebar: position static, flex-direction row, flex-wrap: wrap
```

### Breakpoint 2: ≤ 600px (mobile)
```css
/* KPIs */
grid-template-columns: repeat(2, 1fr)  /* mantém 2 colunas */

/* Header */
flex-wrap: wrap
gap: 10px

/* KPI valor */
font-size: 34px

/* Nome da marca */
font-size: 16px

/* Modal */
max-width: 100%
max-height: 90vh

/* Modal rows */
flex-direction: column

/* Stats dentro do modal */
flex-wrap: wrap
width: calc(50% - 1px) por stat
```

---

## 14. SCROLLBAR PERSONALIZADA

```css
/* Webkit (Chrome, Safari, Edge) */
::-webkit-scrollbar { width: 5px }
::-webkit-scrollbar-track { background: transparent }
::-webkit-scrollbar-thumb { background: var(--t3); border-radius: 4px }

/* Firefox */
scrollbar-width: thin
scrollbar-color: var(--t3) transparent
```

---

## 15. DATA FLOW — ARQUITETURA DE DADOS

### Hook Principal: useDashboardData(tab)
```
- Busca dados da tabela Supabase a cada 30 segundos (polling)
- Retorna: { loading, data, supabaseOk, hasRealData, rawRows }
- Data contém: kpis, linha, donut, barras, tableRows, fidelizacao
- Fallback para mockData se Supabase indisponível
```

### Hook de Filtros: useFilteredData(rawRows, filters)
```
- Aplica cross-filters (filterType, activeDay, turnoFilter)
- Retorna: { filteredRows, charts, tableRows, hasFilters }
- Usa useMemo para otimização
```

### Processadores de Dados (módulos separados)
```
computeKPIs.js     — calcula valores de cada KPI + deltas
computeCharts.js   — gera dados de linha, donut e barras
computeTableRows.js — formata linhas da tabela com badges
computeFidelizacao.js — calcula métricas de fidelização
```

### Hook de Relógio
```
useClock() — retorna HH:MM, atualiza a cada 60s
```

---

## 16. PRINCÍPIOS DE NEUROCIÊNCIA APLICADOS AO LAYOUT

Estes princípios devem ser mantidos em qualquer adaptação:

1. **Hierarquia Pré-atentiva (Treisman):** tamanho → cor → forma antes da leitura. Nível 1 = número KPI (grande), Nível 2 = badge delta, Nível 3 = label da métrica (pequena, muted)

2. **Carga Cognitiva (Sweller):** máximo 5 elementos por zona visual. Separação por whitespace, não por bordas

3. **Lei de Miller — Chunking:** máximo 7 métricas simultâneas sem agrupamento. Blocos: KPIs → Tendências → Comparativos

4. **Figura-Fundo (Mach Bands):** cards levemente mais claros que background = "flutuação" sem decoração

5. **Expectativa Neural (Predictive Coding):** grid consistente, raios consistentes, padrões previsíveis

6. **Memória de Trabalho (Baddeley):** linha de acento no topo dos cards como âncora visual de marca

---

## 17. CONSTANTES IMPORTANTES

```javascript
// Gráfico de Linha
LINE_CHART: { W: 560, H: 150, PL: 36, PR: 36, PT: 10, PB: 22 }

// Gráfico de Barras
BAR_CHART: { BAR_H: 120 }

// Paginação
PAGE_SIZE: 10

// Polling
CLOCK_INTERVAL: 60000    // 60 segundos
DATA_POLL_INTERVAL: 30000 // 30 segundos

// Labels
MAX_LABEL_POINTS: 7

// Dias da semana (pt-BR, começa Domingo)
DIAS_ABREV: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

// Abas
TABS: [['hoje', 'Hoje'], ['semana', 'Esta Semana'], ['mes', 'Este Mês']]
```

---

## 18. PAINEL DE FIDELIZAÇÃO

Componente dedicado com:
1. **Cards de métricas:** Clientes novos vs retornantes, taxa de retorno (%)
2. **Pie chart:** Proporção novos/retornantes
3. **Gráfico de evolução:** Linha temporal de fidelização
4. **Tabela de frequentes:** Clientes mais frequentes com contagem de visitas
5. Presente nas abas Semana e Mês

---

## 19. ANTI-TREMOR DE HEADER (REGRA CRÍTICA)

Para evitar tremor/layout-shift ao trocar de abas:

```css
/* Cada tab-panel ocupa EXATAMENTE o mesmo espaço no grid */
.tab-panel {
  grid-column: 1 / -1;
  grid-row: 1 / -1;  /* TODOS na mesma célula */
}

/* Tab inativa: invisível mas no fluxo */
.tab-panel[hidden] {
  visibility: hidden;
  pointer-events: none;
  position: absolute;  /* ou display:none se não causar reflow */
}
```

> O header NUNCA deve se mover quando o usuário troca de aba. Todas as abas devem ocupar o mesmo espaço no grid.

---

## 20. CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Instalar fontes: Playfair Display + DM Sans (Google Fonts)
- [ ] Definir paleta de cores do projeto nas CSS variables (--bg0, --bg1, --card, etc.)
- [ ] Implementar header sticky com logo, nome, tagline, status online, toggle tema, relógio
- [ ] Implementar 3 abas (Hoje, Semana, Mês) com tab default "Hoje"
- [ ] Implementar 4 KPIs com números Playfair, badges delta, emojis, linha de acento
- [ ] Implementar gráfico de linha SVG (560×150px)
- [ ] Implementar gráfico donut (conic-gradient ou SVG)
- [ ] Implementar gráfico de barras CSS (120px altura)
- [ ] Implementar tabela paginada (10 itens, 7 colunas, scroll 220px)
- [ ] Implementar aba Hoje com layout F (2 colunas + sidebar 380px)
- [ ] Implementar seletor de dia na aba Semana (pills, Terça=fechado)
- [ ] Implementar drill-down na aba Mês (breadcrumb + mini calendário)
- [ ] Implementar cross-filtering com FilterContext + Reducer
- [ ] Implementar KPIs colapsáveis
- [ ] Implementar sistema de modal (660px, 82vh, 20px radius)
- [ ] Implementar modal de histórico (balões WhatsApp)
- [ ] Implementar painel de fidelização
- [ ] Implementar dark/light mode com transição 0.35s
- [ ] Implementar todas as animações (fadeSlideIn, modalIn, pulse, hover)
- [ ] Implementar responsividade (breakpoints 1000px e 600px)
- [ ] Implementar scrollbar customizada
- [ ] Implementar anti-tremor de header nas trocas de aba
- [ ] Adaptar emojis ao nicho do estabelecimento
- [ ] Conectar Supabase com polling de 30s

---

*Template gerado a partir de dashboard de referência no segmento food-service — estrutura, dimensões e funcionamento universais.*
