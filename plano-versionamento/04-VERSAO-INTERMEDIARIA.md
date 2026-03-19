# Versao Intermediaria — "Painel Analitico"

## Filosofia
O cliente quer **entender padroes** e tomar decisoes baseadas em dados.
Ele ja sabe que o agente funciona (Basica provou), agora quer analisar
tendencias, comparar periodos e ter mais controle sobre o que ve.

---

## O que o cliente ve (tudo da Basica + abaixo)

### Header — Melhorias
- Toggle de tema dark/light (personalizacao)
- Tudo da versao Basica

### Abas: HOJE + ESTA SEMANA
- Desbloqueia a aba **"Esta Semana"** (7 dias)
- Aba "Este Mes" aparece com cadeado/badge "Premium" (incentivo visual)

### KPIs — Expansao completa
Na aba Semana, os 8 KPI cards completos:
1. Total Interacoes
2. Clientes Unicos
3. Solic. Reserva
4. Aniversarios (visivel mas nao clicavel para modal)
5. Satisfacao
6. Reclamacoes
7. Fora do Horario
8. Programacao (visivel mas nao clicavel para modal)

**Comparativo com periodo anterior** ("vs. semana passada: +12%")
KPIs 1, 3, 5, 6 sao clicaveis e abrem modais.

### Graficos — 2 dos 3
1. **Grafico de Linha** — Volume de atendimentos
   - Na aba Hoje: volume por hora
   - Na aba Semana: volume diario
   - Tooltips interativos ao passar o mouse
   - Nao filtra ao clicar (apenas visual)

2. **Grafico Donut** — Tipos de atendimento
   - Distribuicao por categoria
   - Legenda com percentuais
   - Nao filtra ao clicar (apenas visual)

**SEM grafico de barras (turnos)** — Exclusivo Premium

### Tabela — Completa com paginacao
- Todas as colunas: ID, Data, Hora, Cliente, Tipo, Turno, Feedback
- Paginacao de 10 em 10
- Linhas clicaveis para abrir detalhes
- Badges de tipo e feedback

### Modais — 4 modais desbloqueados
1. **Modal Atendimentos Totais** — filtros por total, unicos, fora horario, tipo
2. **Modal Reservas** — reservas, taxa, todos
3. **Modal Satisfacao** — positivo/negativo/neutro (sem grafico de assuntos)
4. **Modal Reclamacoes** — listagem e filtro por tipo

Os outros 8 modais nao estao disponiveis.

### Painel de Detalhes (sidebar) — Limitado
- Campos basicos: Telefone, Data, Hora, Turno, Tipo
- Feedback badge
- **SEM**: secao de aniversario, metricas de sessao, botao "Ver Conversa"

### SEM:
- Aba "Este Mes"
- Grafico de barras (turnos)
- Painel de Fidelizacao
- 8 modais avancados (pico, unicos, programacao, aniversarios, turno, fidelizacao, WhatsApp, fora horario)
- Filtros interativos em graficos (clicar para filtrar)
- Upload de logo personalizado
- Modal Historico WhatsApp

---

## Intervalo de atualizacao
- Polling a cada **30 segundos** (mesmo do Premium)

---

## Valor para o cliente
- Analise semanal: tendencias e comparativos
- Graficos visuais que facilitam apresentacoes/reunioes
- Detalhamento de cada atendimento
- Identificacao de reclamacoes e satisfacao

---

## Gatilho de upgrade para Premium
- "Quero ver o mes inteiro" -> Premium
- "Quero ver a conversa do WhatsApp" -> Premium
- "Quero analisar fidelizacao e retencao" -> Premium
- "Preciso do grafico de turnos para escala" -> Premium
- "Quero filtrar clicando nos graficos" -> Premium
- "Quero ver o pico de horario" -> Premium
