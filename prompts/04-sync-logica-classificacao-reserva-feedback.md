# Sync — Logica de Classificacao, Reserva e Feedback

> **Data:** 2026-03-18
> **Tipo:** Sincronizacao pontual com backend (agente Helena)
> **Commits relacionados:** b45937f, 35c2f1f, 3148bea, 03884f4

---

## Contexto

Apos atualizacao do agente Python (Helena), as regras de classificacao mudaram. O dashboard precisou ser sincronizado para refletir a nova logica.

---

## PROMPT 1 — Corrigir logica de Reservas de Hoje

```
No dashboard, a logica de "Reservas de Hoje" esta errada. Atualmente filtra por `data_reserva_pedida === hoje`, mas isso pega qualquer registro que mencionou a data de hoje, mesmo sem reserva real.

Corrigir para: filtrar por `reserva_solicitada === true && data === hoje`.

Explicacao: `reserva_solicitada` = Helena enviou link GetIn (reserva real). `data_reserva_pedida` = data que o cliente mencionou (pode existir sem reserva real).

Arquivo: src/lib/useDashboardData.js
```

---

## PROMPT 2 — Corrigir feedback NULL (nao e Neutro)

```
No dashboard, `normFeedback(null)` retorna 'Neutro'. Isso esta errado.

Quando `feedback_empresa` e NULL no banco, significa que o cliente NAO deu feedback. Nao e neutro.

Corrigir:
1. Em `src/lib/utils.js`, `normFeedback()` deve retornar `null` para valores null/empty
2. Em `src/components/Badges.jsx`, StBadge deve mostrar "— Sem feedback" com opacity 0.6 quando st e null
3. Em `src/Modal.jsx`, FBadge deve mostrar "— Sem feedback" quando feedback e null
4. Em `src/components/DetailPanel.jsx`, FeedbackBadge deve tratar null

Indice de satisfacao: `(positivo / (positivo + negativo)) * 100` — ignorar NULL completamente.
```

---

## PROMPT 3 — Fora do Horario como 4o turno no grafico de barras

```
O grafico de barras "Distribuicao por Turno" esta inflando o Jantar com dados de Fora Horario.

O campo `fora_horario` (boolean) indica atendimentos fora do expediente. Atualmente classifyTurno() coloca tudo que nao e Almoco/HH como Jantar.

Corrigir:
1. Adicionar 4o turno 'f' (Fora Horario) em classifyTurno()
2. Barras: `{ al: 0, hh: 0, j: 0, f: 0 }`
3. Legenda: adicionar "Fora" com cor COLORS.fora (#EF4444)
4. CssBar.jsx: renderizar 4a barra quando d.f > 0

Arquivo: src/lib/useDashboardData.js, src/components/cards/CardBarras.jsx, src/components/charts/CssBar.jsx
```

---

## PROMPT 4 — Label condicional de data_reserva_pedida

```
No DetailPanel e no Modal de registro, o campo `data_reserva_pedida` mostra "RESERVA PARA" mesmo quando nao ha reserva real.

Corrigir:
- Se `reserva_solicitada === true`: label "RESERVA PARA" com highlight dourado
- Se `reserva_solicitada === false`: label "DATA MENCIONADA" sem highlight

O cliente pode mencionar uma data sem ter feito reserva real.

Arquivos: src/components/DetailPanel.jsx, src/Modal.jsx (ContentRegistro)
```

---

## PROMPT 5 — Modal Programacao listar registros corretamente

```
O KPI "Programacao" mostra valor 5 (correto — 5 registros com tipo_atendimento='programacao').
Mas ao clicar, o modal abre vazio.

Causa: o modal filtrava por `dia_programacao_interesse` (sempre NULL porque Helena nao preenche esse campo ainda).

Corrigir: ContentProgramacao deve filtrar por `normTipo(r.tipo_atendimento) === 'Programacao'`.
O ranking de `dia_programacao_interesse` fica como bonus quando existir.

Arquivo: src/Modal.jsx
```
