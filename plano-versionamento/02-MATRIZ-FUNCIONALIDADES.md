# Matriz de Funcionalidades por Versao

## Legenda
- OK = Incluso
- -- = Nao disponivel
- LIMIT = Disponivel com restricoes

---

## HEADER E NAVEGACAO

| Funcionalidade                        | Basica | Intermediaria | Premium |
|---------------------------------------|--------|---------------|---------|
| Logo personalizado do restaurante     | OK     | OK            | OK      |
| Nome do restaurante no header         | OK     | OK            | OK      |
| Relogio em tempo real                 | OK     | OK            | OK      |
| Status "Agente IA Online"            | OK     | OK            | OK      |
| Data atual formatada                  | OK     | OK            | OK      |
| Tema dark/light                       | --     | OK            | OK      |
| Aba "Hoje"                           | OK     | OK            | OK      |
| Aba "Esta Semana"                    | --     | OK            | OK      |
| Aba "Este Mes"                       | --     | --            | OK      |

---

## KPIs (INDICADORES)

| Funcionalidade                        | Basica | Intermediaria | Premium |
|---------------------------------------|--------|---------------|---------|
| Total de Atendimentos (hoje)          | OK     | OK            | OK      |
| Solicitacoes de Reserva (hoje)        | OK     | OK            | OK      |
| Satisfacao % (hoje)                   | OK     | OK            | OK      |
| Fora do Horario (hoje)               | OK     | OK            | OK      |
| KPIs completos (8 cards semana/mes)   | --     | OK            | OK      |
| Comparativo vs. periodo anterior      | --     | OK            | OK      |
| Clientes Unicos                       | --     | OK            | OK      |
| Aniversarios                          | --     | --            | OK      |
| Reclamacoes                           | --     | OK            | OK      |
| Programacao/Agenda                    | --     | --            | OK      |

---

## GRAFICOS E VISUALIZACOES

| Funcionalidade                        | Basica | Intermediaria | Premium |
|---------------------------------------|--------|---------------|---------|
| Grafico de linha (volume por hora)    | --     | OK            | OK      |
| Grafico de linha (volume semanal)     | --     | OK            | OK      |
| Grafico de linha (volume mensal)      | --     | --            | OK      |
| Grafico donut (tipos de atendimento)  | --     | OK            | OK      |
| Grafico barras (distribuicao turnos)  | --     | --            | OK      |
| Clique em graficos para filtrar       | --     | --            | OK      |
| Tooltips interativos                  | --     | OK            | OK      |

---

## TABELAS DE DADOS

| Funcionalidade                        | Basica | Intermediaria | Premium |
|---------------------------------------|--------|---------------|---------|
| Tabela ultimos atendimentos (hoje)    | OK     | OK            | OK      |
| Paginacao da tabela                   | LIMIT  | OK            | OK      |
| Colunas: ID, Hora, Cliente, Tipo      | OK     | OK            | OK      |
| Coluna: Data                          | --     | OK            | OK      |
| Coluna: Turno                         | --     | OK            | OK      |
| Coluna: Feedback                      | --     | OK            | OK      |
| Clique na linha para ver detalhes     | --     | OK            | OK      |

Obs: Na versao Basica, tabela mostra apenas ultimos 5 registros do dia, sem paginacao.

---

## MODAIS (JANELAS DE DETALHES)

| Funcionalidade                        | Basica | Intermediaria | Premium |
|---------------------------------------|--------|---------------|---------|
| Modal de Atendimentos Totais          | --     | OK            | OK      |
| Modal de Reservas                     | --     | OK            | OK      |
| Modal de Fora do Horario              | --     | --            | OK      |
| Modal de Satisfacao/Feedback          | --     | LIMIT         | OK      |
| Modal de Pico de Horario              | --     | --            | OK      |
| Modal de Clientes Unicos              | --     | --            | OK      |
| Modal de Reclamacoes                  | --     | OK            | OK      |
| Modal de Programacao                  | --     | --            | OK      |
| Modal de Aniversarios                 | --     | --            | OK      |
| Modal de Distribuicao por Turno       | --     | --            | OK      |
| Modal de Fidelizacao                  | --     | --            | OK      |
| Modal Historico WhatsApp              | --     | --            | OK      |
| Filtros dentro dos modais             | --     | LIMIT         | OK      |

---

## PAINEIS ESPECIALIZADOS

| Funcionalidade                        | Basica | Intermediaria | Premium |
|---------------------------------------|--------|---------------|---------|
| Card "Reservas de Hoje"              | OK     | OK            | OK      |
| Painel de Detalhes (sidebar direita)  | --     | LIMIT         | OK      |
| Card "Turno Atual" com countdown      | OK     | OK            | OK      |
| Painel Fidelizacao de Clientes        | --     | --            | OK      |
| Grafico retencao (donut fidelizacao)  | --     | --            | OK      |
| Ranking clientes frequentes           | --     | --            | OK      |
| Evolucao diaria novos vs retornantes  | --     | --            | OK      |

---

## SISTEMA E INFRAESTRUTURA

| Funcionalidade                        | Basica | Intermediaria | Premium |
|---------------------------------------|--------|---------------|---------|
| Polling automatico (30s)              | 60s    | 30s           | 30s     |
| Dados em tempo real do Supabase       | OK     | OK            | OK      |
| Mock data como fallback               | OK     | OK            | OK      |
| Badges de tipo/status/turno           | LIMIT  | OK            | OK      |
| Indicador fonte de dados (live/demo)  | --     | OK            | OK      |
| Upload de logo personalizado          | --     | --            | OK      |
| Responsividade mobile                 | OK     | OK            | OK      |

---

## RESUMO QUANTITATIVO

| Metrica                    | Basica | Intermediaria | Premium |
|----------------------------|--------|---------------|---------|
| Abas disponiveis           | 1      | 2             | 3       |
| KPIs visiveis              | 4      | 8             | 8+      |
| Graficos                   | 0      | 2             | 3       |
| Modais                     | 0      | 4             | 12      |
| Paineis especializados     | 2      | 3             | 5       |
| Filtros interativos        | 0      | Parcial       | Todos   |
