# Versao Basica — "Painel Essencial"

## Filosofia
O cliente contratou o servico de agente IA no WhatsApp.
A versao Basica e o **espelho minimo** do que o agente esta fazendo por ele.
Deve responder a pergunta: **"O agente esta funcionando? Quantos atendimentos teve hoje?"**

---

## O que o cliente ve

### Header
- Logo do restaurante (fixo, nao editavel)
- Nome do restaurante
- Relogio e data atual
- Status "Agente IA Online" (indicador de que o servico esta ativo)
- Sem toggle de tema (apenas tema dark padrao)

### Aba unica: HOJE
Nao ha abas "Semana" ou "Mes". O cliente ve apenas o dia atual.

### Barra de KPIs compactos (4 metricas)
1. **Total de Atendimentos** — quantos clientes o agente atendeu hoje
2. **Solic. Reserva** — quantas reservas foram solicitadas
3. **Satisfacao %** — percentual de feedback positivo
4. **Fora do Horario** — atendimentos fora do expediente

Esses 4 KPIs sao os mesmos da barra compacta que ja existe na aba "Hoje".
**Nenhum KPI e clicavel** (nao abre modal).

### Card: Reservas de Hoje
- Lista de reservas confirmadas do dia
- Nome do cliente, horario, qtd pessoas
- Badge de aniversario (se aplicavel)
- Essencial para operacao do restaurante

### Tabela simplificada: Ultimos Atendimentos
- Apenas 5 linhas (sem paginacao)
- Colunas: Hora, Cliente, Tipo
- Sem coluna Data (so mostra hoje), sem Turno, sem Feedback
- Linhas nao sao clicaveis

### Card: Turno Atual
- Mostra em qual turno o restaurante esta
- Countdown para proximo turno
- Informacao operacional util

### SEM:
- Graficos de qualquer tipo
- Modais
- Painel de detalhes (sidebar)
- Fidelizacao
- Filtros
- Toggle de tema
- Upload de logo
- Aba Semana/Mes

---

## Intervalo de atualizacao
- Polling a cada **60 segundos** (vs. 30s nas outras versoes)
- Suficiente para acompanhamento, sem custo excessivo de requests

---

## Valor para o cliente
- Transparencia: ele VE que o agente esta trabalhando
- Operacional: sabe as reservas do dia
- Confianca: metricas basicas provam o servico

---

## Gatilho de upgrade
O cliente vai naturalmente querer:
- "Quero ver a semana inteira, nao so hoje" -> Intermediaria
- "Quero ver os graficos de tipo de atendimento" -> Intermediaria
- "Quero ver detalhes do atendimento, conversa do WhatsApp" -> Premium
- "Quero acompanhar fidelizacao dos meus clientes" -> Premium
