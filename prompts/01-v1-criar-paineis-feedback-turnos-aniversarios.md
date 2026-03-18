# Prompts para espelhar alteracoes no Dashboard

> Jogue cada prompt no agente do dashboard, um por vez ou todos de uma vez.

---

## PROMPT 1 — KPI "Fora do Horario" + Clientes Unicos

Faca as seguintes alteracoes no dashboard:

1. SUBSTITUIR o 3o KPI card "Satisfacao Geral" (icone estrela) por "Fora do Horario":
   - Icone: relogio
   - Label: "Fora do Horario"
   - Valor: quantidade de atendimentos com fora_horario = true
   - Delta: comparacao percentual com periodo anterior (vermelho quando > 0)
   - Sub: label do periodo (vs. ontem / vs. semana anterior / vs. mes anterior)
   - Ao clicar, abre modal mostrando lista dos atendimentos fora do horario

2. No 1o KPI "Total Atendimentos", o sub-texto agora mostra CLIENTES UNICOS:
   - Formato: "X clientes unicos" (contagem de numero_cliente distintos)
   - Em vez do antigo "vs. ontem" / "vs. semana anterior"
   - O delta percentual continua comparando total de atendimentos normalmente

3. O modal "Fora do Horario" mostra:
   - Stats: quantidade fora do horario, percentual do total, total no horario
   - Lista de todos os atendimentos fora do horario com hora, cliente, badges

---

## PROMPT 2 — Normalizar turno no KPI de Pico

No KPI "Horario de Pico", o turno mostrado no sub-texto e no delta agora deve ser normalizado:
- Em vez de mostrar o valor bruto do banco (ex: "noite"), deve mostrar o label formatado: "Noite", "Tarde", "Manha"
- Usar a funcao normTurno() para converter o turno antes de exibir
- Nos mock data, atualizar os turnos de "Jantar"/"Almoco" para "Noite"/"Tarde" conforme os turnos reais do banco

---

## PROMPT 3 — Labels "Dia/Tarde x Noite" no grafico de barras

Atualizar TODOS os labels do grafico de barras comparativo:

1. Titulo do card: de "Almoco x Jantar" para "Dia/Tarde x Noite"
2. Legenda da barra esquerda (cor barAlt): de "Almoco" para "Dia/Tarde"
3. Legenda da barra direita (cor laranja): de "Jantar" para "Noite"
4. Tooltips e aria-labels: atualizar de "Almoco X, Jantar Y" para "Dia/Tarde X, Noite Y"
5. Label da secao: de "Almoco x Jantar - 7 dias" para "Dia/Tarde x Noite - 7 dias" (e mensal)
6. No modal de turno: titulo "Dia/Tarde x Noite", labels "Dia / Tarde" e "Noite" com icones sol e lua

---

## PROMPT 4 — Simplificar barras para 3 faixas

No grafico de barras da aba "Hoje", simplificar de 5 faixas (Manha, Almoco, Tarde, Jantar, Noite) para 3 faixas reais:
- "Dia" (engloba turno "dia" e "manha")
- "Tarde" (engloba turno "tarde")
- "Noite" (engloba turno "noite" e "jantar")

Os dados do banco so possuem 3 turnos: "dia", "tarde", "noite". As faixas "Almoco" e "Jantar" nunca recebem dados diretos.

Mock data das barras "hoje" tambem deve refletir: 3 itens em vez de 5.

---

## PROMPT 5 — Tipo "Geral" no donut

Adicionar o tipo de atendimento "Geral" como categoria propria no grafico donut:

1. Cor: amarelo #F59E0B (COLORS.warning)
2. Ordem no donut: Reservas > Cardapio > Localizacao > Geral > Outros
3. O tipo "geral" vindo do banco agora mapeia para "Geral" (antes caia em "Outros")
4. Badge no modal: classe .mb-ger com background rgba(245,158,11,.14) e cor #F59E0B
5. "Outros" continua existindo para tipos desconhecidos que nao sejam reserva, cardapio, localizacao nem geral
