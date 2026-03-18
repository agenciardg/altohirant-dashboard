# Prompts para o Dashboard — v2

> **Ultima atualizacao:** 2026-03-18
> **Alteracoes nesta versao:**
> - Novo campo `dia_programacao_interesse` (qual dia da semana o cliente perguntou)
> - Novo campo `msg_id` (identificador unico por mensagem)
> - Novo tipo_atendimento `programacao` (separado de `reserva`)
> - `reserva` agora = Helena enviou link GetIn na resposta (solicitacao real)
> - `tool_chamada` agora grava TODAS as tools (separadas por virgula)
> - `feedback_empresa` = NULL quando nao ha feedback (antes era `neutro`)
> - 1 registro por mensagem (antes era 1 por cliente/dia — sobrescrevia dados)
> - Removido `qtd_mensagens_sessao` (agora basta COUNT por cliente+dia)
>
> **Historico de versoes:**
> | Data | Versao | Descricao |
> |------|--------|-----------|
> | 2026-03-16 | v1 | Criacao inicial com migrations 001+002 |
> | 2026-03-18 | v2 | Migrations 003-005, novos campos, 1 registro/msg, reserva por link |

---

## Tabela de referencia: `alto_hirant_dashboard`

Esses sao TODOS os campos da tabela apos as migrations 001-005.

| Campo | Tipo | Valores possiveis | Descricao |
|-------|------|-------------------|-----------|
| id | BIGSERIAL | auto | PK |
| msg_id | TEXT | id da msg ou null | ID unico da mensagem WhatsApp (evita duplicatas) |
| data | DATE | qualquer data | Data da interacao |
| hora | TIME | qualquer hora | Hora exata da interacao |
| numero_cliente | TEXT | telefone | Telefone do cliente |
| nome_cliente | TEXT | nome ou null | Nome do contato |
| turno | TEXT | `almoco`, `happy_hour`, `jantar`, `fora_horario` | Periodo do atendimento |
| tipo_atendimento | TEXT | `geral`, `reserva`, `programacao`, `localizacao`, `cardapio`, `aniversario`, `reclamacao` | Classificacao da interacao |
| tool_chamada | TEXT | tools separadas por virgula ou null | Interno — tools acionadas |
| reserva_solicitada | BOOLEAN | true/false | Se a Helena enviou o link do GetIn (solicitacao de reserva real) |
| fora_horario | BOOLEAN | true/false | Se o contato foi fora do horario de funcionamento |
| already_sent | BOOLEAN | true/false | Interno — se a msg foi entregue |
| created_at | TIMESTAMPTZ | auto | Timestamp de criacao |
| feedback_empresa | TEXT | `positivo`, `negativo`, `neutro` ou NULL | Sentimento do cliente. NULL = nao deu feedback |
| assunto_feedback | TEXT | `cardapio`, `atendimento`, `preco`, `ambiente`, `reserva`, `outro` ou null | Sobre o que foi o feedback |
| data_reserva_pedida | DATE | data ou null | Data que o cliente quer reservar |
| qtd_pessoas | INTEGER | numero ou null | Tamanho do grupo |
| eh_aniversario | BOOLEAN | true/false | Se envolve aniversario |
| tempo_resposta_ms | INTEGER | milissegundos ou null | Interno — tempo de resposta da IA |
| dia_programacao_interesse | TEXT | `segunda`, `terca`, `quarta`, `quinta`, `sexta`, `sabado`, `domingo` ou null | Qual dia da semana o cliente perguntou a programacao (independente do dia que perguntou) |

### Regras de classificacao importantes

**tipo_atendimento:**
- `reserva` = Helena enviou o link `getin.app` na resposta ao cliente (solicitacao de reserva real)
- `programacao` = cliente perguntou sobre programacao de um dia (usou tool `date_time` sem link de reserva)
- `cardapio` = Helena enviou imagem do cardapio (tool `envia_cardapio`)
- `localizacao` = Helena enviou localizacao (tool `envia_loc`)
- `aniversario` = cliente mencionou aniversario/niver/comemorar
- `reclamacao` = cliente usou palavras de reclamacao (prioridade maxima)
- `geral` = nenhum dos acima

**feedback_empresa:**
- `NULL` = cliente nao deu nenhum feedback (maioria das interacoes)
- `positivo` = palavras como "adorei", "maravilhoso", "excelente"
- `negativo` = palavras como "horrivel", "pessimo", "nunca mais"
- `neutro` = feedback detectado mas sem sentimento claro

**Granularidade:** 1 registro por mensagem. Para contar msgs por sessao, usar `COUNT(*) WHERE numero_cliente = X AND data = Y`.

---

## PROMPT 1 — Visao Geral (Home do Dashboard)

```
Atualize a pagina inicial do dashboard com cards resumo. ATENCAO: a tabela agora tem 1 registro por MENSAGEM (nao por cliente/dia). Ajuste as queries:

1. "Total de Interacoes" — COUNT(*) no periodo
2. "Clientes Unicos" — COUNT(DISTINCT numero_cliente)
3. "Solicitacoes de Reserva" — COUNT onde reserva_solicitada = true (Helena enviou link GetIn)
4. "Aniversarios" — COUNT(DISTINCT numero_cliente) onde eh_aniversario = true
5. "Satisfacao" — calcular APENAS com registros onde feedback_empresa IS NOT NULL: (positivo / (positivo + negativo)) * 100
6. "Reclamacoes" — COUNT onde tipo_atendimento = 'reclamacao'
7. "Fora do Horario" — COUNT(DISTINCT numero_cliente) onde fora_horario = true

Abaixo dos cards:
- Grafico de linha: interacoes por dia (ultimos 30 dias)
- Grafico de pizza: distribuicao por tipo_atendimento (incluir 'programacao' como tipo)
- Grafico de barras: interacoes por turno

Dados vem da tabela alto_hirant_dashboard.
Filtro padrao: ultimos 30 dias, com opcao de mudar.
```

---

## PROMPT 2 — Tipos de Atendimento

```
Atualize o painel de "Tipos de Atendimento" com os NOVOS tipos:

1. Um grafico de pizza/donut mostrando a distribuicao de tipo_atendimento com TODOS os tipos:
   - geral (cinza)
   - programacao (azul) ← NOVO
   - reserva (verde)
   - cardapio (laranja)
   - localizacao (roxo)
   - aniversario (rosa)
   - reclamacao (vermelho)

2. Um grafico de linha temporal mostrando a evolucao diaria de cada tipo_atendimento.

3. Cards individuais para:
   - Total de consultas de programacao (tipo_atendimento = 'programacao')
   - Total de solicitacoes de reserva (reserva_solicitada = true) ← so quando link GetIn foi enviado
   - Total de aniversarios (eh_aniversario = true)
   - Total de reclamacoes (tipo_atendimento = 'reclamacao')
   - Total de pedidos de cardapio (tipo_atendimento = 'cardapio')

IMPORTANTE: 'reserva' agora so conta quando a Helena efetivamente enviou o link do GetIn. NAO confundir com consulta de programacao.

Dados vem da tabela alto_hirant_dashboard.
Filtrar por periodo.
```

---

## PROMPT 3 — Interesse por Programacao (NOVO)

```
Crie no dashboard um NOVO painel chamado "Interesse por Programacao" usando o campo dia_programacao_interesse:

1. Um grafico de barras mostrando o RANKING de dias mais perguntados:
   - Eixo X: dias da semana (segunda a domingo)
   - Eixo Y: quantidade de perguntas
   - Ordenar por quantidade (decrescente)
   - Destacar o TOP 1 com cor diferente
   - Cores sugeridas: dia mais perguntado = dourado, demais = azul

2. Um card grande destacando "Dia Mais Procurado" — o dia com mais registros em dia_programacao_interesse, com o percentual em relacao ao total.

3. Um grafico de linha temporal mostrando a evolucao do interesse por dia ao longo das semanas — para identificar se o interesse esta crescendo ou caindo para cada dia.

4. Uma tabela comparativa:
   | Dia | Perguntas | % do Total | Tendencia |
   Ordenada por perguntas (desc).

Query base:
SELECT dia_programacao_interesse, COUNT(*) as total
FROM alto_hirant_dashboard
WHERE dia_programacao_interesse IS NOT NULL
GROUP BY dia_programacao_interesse
ORDER BY total DESC;

Dados vem da tabela alto_hirant_dashboard.
Filtrar por periodo.
Ignorar registros onde dia_programacao_interesse IS NULL.
```

---

## PROMPT 4 — Satisfacao do Cliente

```
Atualize o painel de "Satisfacao do Cliente":

1. Grafico de pizza: distribuicao de feedback_empresa (positivo, negativo) — cores: verde/vermelho.
   IMPORTANTE: ignorar registros onde feedback_empresa IS NULL (nao e mais 'neutro' por padrao).

2. Grafico de barras horizontais: assuntos de feedback (assunto_feedback) ordenados por quantidade.

3. Card "Indice de Satisfacao": (positivo / (positivo + negativo)) * 100
   IMPORTANTE: so contar registros com feedback real (feedback_empresa IS NOT NULL).

4. Lista das ultimas 10 reclamacoes (feedback_empresa = 'negativo'): data, hora, nome_cliente, assunto_feedback.

5. Novo card: "Taxa de Feedback" — percentual de interacoes que geraram feedback:
   COUNT(WHERE feedback_empresa IS NOT NULL) / COUNT(*) * 100

Dados vem da tabela alto_hirant_dashboard.
Filtrar por periodo.
```

---

## PROMPT 5 — Turnos e Horarios de Pico

```
Atualize o painel de "Turnos e Horarios":

1. Grafico de barras: interacoes por turno (almoco, happy_hour, jantar, fora_horario).
   NOTA: agora cada mensagem e 1 registro, entao os numeros refletem volume real de interacoes.

2. Grafico de linha: interacoes por hora do dia (campo hora, extrair HH) — eixo X 0-23, eixo Y quantidade.

3. Card "Horario de Pico" — a hora com mais interacoes.

4. Card "% Fora do Horario" — percentual de interacoes onde fora_horario = true.

5. NOVO: Cruzamento turno x tipo_atendimento — tabela mostrando qual tipo de solicitacao predomina em cada turno.

Dados vem da tabela alto_hirant_dashboard.
Filtrar por periodo.
```

---

## PROMPT 6 — Aniversarios e Grupos

```
Atualize o painel de "Aniversarios e Grupos":

1. Card: total de interacoes com aniversario (eh_aniversario = true).

2. Grafico de barras: aniversarios por dia da semana.

3. Card "Media de Pessoas por Grupo" — AVG(qtd_pessoas) WHERE qtd_pessoas IS NOT NULL.

4. Histograma de tamanho de grupo: faixas 1-5, 6-10, 11-19, 20-29, 30+.

5. Tabela de reservas futuras: data_reserva_pedida >= hoje, com nome_cliente, data_reserva_pedida, qtd_pessoas.

Dados vem da tabela alto_hirant_dashboard.
```

---

## PROMPT 7 — Demanda Futura

```
Atualize o painel de "Demanda Futura":

1. Calendario com datas de reservas futuras (data_reserva_pedida >= hoje). Colorir por intensidade.

2. Tabela com proximas reservas: data_reserva_pedida, nome_cliente, qtd_pessoas — ordenadas por data ASC.

3. Card "Total de Pessoas Esperadas" — SUM(qtd_pessoas) WHERE data_reserva_pedida >= hoje.

4. Grafico de barras: reservas por dia da semana.

5. NOVO: Cruzar com dia_programacao_interesse — mostrar se os dias mais perguntados coincidem com os dias mais reservados. Isso indica se o interesse esta se convertendo em reserva.

Dados vem da tabela alto_hirant_dashboard.
Filtrar data_reserva_pedida IS NOT NULL.
```

---

## Queries uteis para validacao

```sql
-- Ranking de tipo de solicitacao (mais pedido ao menos pedido)
SELECT tipo_atendimento, COUNT(*) as total,
       ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) as pct
FROM alto_hirant_dashboard
GROUP BY tipo_atendimento
ORDER BY total DESC;

-- Dia da programacao mais perguntado
SELECT dia_programacao_interesse, COUNT(*) as total,
       ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) as pct
FROM alto_hirant_dashboard
WHERE dia_programacao_interesse IS NOT NULL
GROUP BY dia_programacao_interesse
ORDER BY total DESC;

-- Mensagens por sessao (cliente+dia)
SELECT numero_cliente, data, COUNT(*) as msgs_sessao
FROM alto_hirant_dashboard
GROUP BY numero_cliente, data
ORDER BY data DESC, msgs_sessao DESC;

-- Solicitacoes de reserva reais (link GetIn enviado)
SELECT data, hora, nome_cliente, numero_cliente
FROM alto_hirant_dashboard
WHERE reserva_solicitada = true
ORDER BY data DESC, hora DESC;

-- Feedback real (excluindo NULL)
SELECT feedback_empresa, COUNT(*) as total
FROM alto_hirant_dashboard
WHERE feedback_empresa IS NOT NULL
GROUP BY feedback_empresa;
```
