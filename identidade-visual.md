# Prompt — Identidade Visual Dashboard · Alto da Hirant
> Otimizado para geração no **Stitch AI** · Princípios de Neurociência Aplicada ao Design

---

## Contexto do Produto

Crie uma identidade visual completa para um **dashboard de gestão de atendimentos** chamado **Alto da Hirant — Churrasco & Cia**. O sistema exibe dados em tempo real de um agente de IA no WhatsApp: atendimentos por dia, tipos de solicitação (reserva, cardápio, localização), turnos (almoço/jantar), feedbacks e horários de pico.

---

## Identidade Extraída da Logo Original

| Elemento | Especificação |
|---|---|
| Forma principal | Círculo branco com borda preta fina |
| Tipografia da marca | Serifada bold, caixa alta, preta |
| Ícone central | Chama laranja/vermelha com gradiente dourado → laranja → vermelho |
| Tagline | "Churrasco & Cia" — sans-serif leve, caixa alta, espaçamento largo |
| Personalidade visual | Premium, robusta, rústica sofisticada |

---

## Paleta de Cores

### Dark Mode (padrão)
| Token | Hex | Uso |
|---|---|---|
| Page background | `#0A0700` → `#130E00` | Gradiente de fundo — carvão/brasa |
| Card background | `#1A1100` → `#221700` | Cards e gráficos |
| Card border | `#3D2800` | Bordas sutis |
| Text primary | `#F5ECD7` | Títulos e dados |
| Text secondary | `#6B4A1A` | Labels e legendas |
| Accent primary | `#E85D04` | Laranja fogo — cor de destaque principal |
| Accent gradient | `#DC2626` → `#E85D04` → `#F97316` | Gradiente de chama |

### Light Mode
| Token | Hex | Uso |
|---|---|---|
| Page background | `#FFF8F0` → `#FFF1E0` | Gradiente pergaminho |
| Card background | `#FFFFFF` → `#FFF8F0` | Cards brancos quentes |
| Card border | `#F0D4B0` | Bordas âmbar claro |
| Text primary | `#1A0F00` | Texto escuro quente |
| Text secondary | `#8A5A1A` | Labels e legendas |
| Accent primary | `#E85D04` | Mesmo laranja — consistência de marca |

### Semântica de Cor (ambos os modos)
| Significado | Hex | Aplicação |
|---|---|---|
| Positivo / Sucesso | `#22C55E` | Feedbacks positivos, status OK |
| Neutro / Atenção | `#F59E0B` | Feedbacks neutros, avisos |
| Negativo / Alerta | `#EF4444` | Feedbacks negativos, erros |

> ⚠️ **Regra neurocientífica:** estas cores são **semânticas**, nunca decorativas. O cérebro processa cor antes da leitura (Teoria Pré-atentiva de Treisman). Usar as mesmas cores fora desse significado destrói a consistência cognitiva.

---

## Tipografia — Base Neurocientífica

### Display / KPIs / Números grandes
- **Fonte:** Playfair Display — serif elegante, peso 900
- **Justificativa:** Fontes serifadas em tamanhos grandes ativam reconhecimento de padrão mais rápido. O contraste entre traços finos e espessos cria âncoras visuais que aceleram a leitura de números.
- **Configuração:** `font-size: 44px`, `font-weight: 900`, `letter-spacing: -0.02em`

### Interface / Labels / Dados tabulares
- **Fonte:** DM Sans — sans-serif de alta legibilidade, peso 400/500/700
- **Justificativa:** Sans-serif com altura de x alta aumenta a precisão de leitura em dados numéricos e textos pequenos em tela. O DM Sans foi projetado especificamente para interfaces digitais.
- **Labels:** `font-size: 10-11px`, `font-weight: 600`, `letter-spacing: 0.14em`, `text-transform: uppercase`
- **Dados:** `font-size: 12-13px`, `font-weight: 500`

### Nome da Marca no Header
- **Fonte:** Playfair Display 900 — caixa alta, `letter-spacing: 0.12em`
- **Tagline:** DM Sans 500 — `letter-spacing: 0.22em`, laranja `#E85D04`

---

## Princípios de Neurociência Aplicados

### 1. Hierarquia Visual Pré-atentiva *(Treisman, 1980)*
O cérebro processa tamanho → cor → forma antes da leitura consciente. Estrutura de hierarquia obrigatória:
- **Nível 1:** Número KPI (44px, Playfair, branco/preto)
- **Nível 2:** Badge delta (+18%, cor semântica)
- **Nível 3:** Label da métrica (10px, uppercase, cor secundária)

### 2. Redução de Carga Cognitiva *(Sweller, 1988)*
Máximo de **5 elementos por zona visual**. Separação por espaço negativo, não por bordas ou linhas. O cérebro interpreta whitespace como separação de forma mais eficiente que divisores visuais.

### 3. Lei de Miller — Chunking *(Miller, 1956)*
Nunca exibir mais de **7 métricas simultâneas** sem agrupamento. Organizar em blocos cognitivos:
- Bloco 1: KPIs (4 cards)
- Bloco 2: Tendências temporais (linha + donut)
- Bloco 3: Comparativos e detalhes (barras + tabela)

### 4. Efeito de Profundidade Figura-Fundo *(Mach Bands)*
Cards levemente mais claros que o background criam percepção de "flutuação" sem elementos decorativos. No dark mode: `#1A1100` sobre `#0A0700`. No light mode: `#FFFFFF` sobre `#FFF8F0`. Isso reduz fadiga visual em uso prolongado.

### 5. Princípio da Expectativa Neural *(Predictive Coding)*
Grade de **12 colunas com proporções consistentes**. O cérebro antecipa padrões e lê mais rápido quando a estrutura é previsível. Raios consistentes: `16px` em cards, `8px` em badges. Desvios do padrão criam atrito cognitivo.

### 6. Memória de Trabalho e Cor *(Baddeley, 1986)*
A linha de topo de cada card usa o **gradiente de chama da marca** (`#DC2626 → #E85D04 → #F97316`), criando uma âncora visual consistente que conecta cada elemento à identidade da marca sem repetir o logo.

---

## Estrutura do Dashboard

```
┌─────────────────────────────────────────────────────────┐
│  HEADER — Logo + Nome + Status Agente + Toggle + Data   │
├─────────────────────────────────────────────────────────┤
│  TABS — Hoje | Esta Semana | Este Mês                   │
├──────────┬──────────┬──────────┬──────────┤
│  KPI 1   │  KPI 2   │  KPI 3   │  KPI 4   │  (4 cols)
│  Atend.  │  Reservas│  Feedback│  Horário │
├──────────────────────────┬──────────────────┤
│  Gráfico de Linha        │  Donut Chart     │  (2/3 + 1/3)
│  Atendimentos por Dia    │  Tipos Atend.    │
├──────────────────┬───────────────────────────┤
│  Bar Chart       │  Tabela de Registros      │  (1/2 + 1/2)
│  Almoço x Jantar │  Últimos Atendimentos     │
├─────────────────────────────────────────────────────────┤
│  FOOTER — Marca · Sistema · Agência · Ano               │
└─────────────────────────────────────────────────────────┘
```

---

## Componentes a Gerar

| Componente | Especificação |
|---|---|
| Card KPI | Linha de chama no topo, número grande Playfair, badge delta, label uppercase |
| Gráfico de Linha | Linha laranja `#E85D04`, grid sutil, dots com borda de card |
| Donut Chart | 4 cores da paleta, innerRadius 55px, legenda compacta |
| Bar Chart comparativo | 2 barras por grupo, cores `barAlt` e `#E85D04`, cantos arredondados |
| Tabela de registros | Badges de tipo e status, hover com tint laranja, colunas compactas |
| Toggle Dark/Light | Switch animado no header, transição `0.35s` em todos os tokens |
| Header sticky | Logo SVG com chama, nome Playfair, tagline DM Sans, status online |

---

## Microinterações

- **Hover nos KPIs:** `translateY(-3px)` + `box-shadow rgba(232,93,4,0.22)` — feedback háptico visual
- **Toggle de tema:** Thumb desliza com `cubic-bezier(0.4,0,0.2,1)`, todos os tokens fazem transição simultânea `0.35s`
- **Hover na tabela:** Tint laranja `rgba(232,93,4,0.04)` na linha — identificação sem distração
- **Dots do gráfico:** Borda com cor de card — cria ilusão de profundidade

---

## Referência Técnica

```
Stack recomendado: React + Recharts + DM Sans + Playfair Display (Google Fonts)
Breakpoint principal: 1280px max-width, padding 24px lateral
Grid: repeat(4, 1fr) KPIs | 2fr 1fr linha+donut | 1fr 1fr barras+tabela
Border-radius: 16px cards | 8px botões/tags | 20px badges
Transição global de tema: 0.35s ease em background, color, border-color
```

---

*Prompt gerado por Agência RDG · Sistema Alto da Hirant · Dashboard IA WhatsApp*
