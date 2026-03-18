# Prompts para Redesign do Dashboard — Alto da Hirant

> Envie estes prompts sequencialmente para o agente do dashboard.
> Cada prompt é uma etapa independente. Aguarde a conclusão de cada um antes de enviar o próximo.

---

## PROMPT 1 — Aba padrão HOJE + dados de reserva e aniversário no hook

```
Preciso de 3 ajustes no dashboard:

1. Em `src/App.jsx`, o estado inicial da aba deve ser "hoje" (não "semana"). Garanta que ao abrir o dashboard, a aba HOJE já esteja selecionada.

2. Em `src/lib/useDashboardData.js`, o hook já busca dados da tabela `alto_hirant_dashboard`. Preciso que ele passe a buscar também estes campos que já existem na tabela mas NÃO estão sendo consultados:
   - `data_reserva_pedida` (DATE) — data que o cliente quer reservar
   - `qtd_pessoas` (INTEGER) — tamanho do grupo
   - `eh_aniversario` (BOOLEAN) — se é evento de aniversário
   - `qtd_mensagens_sessao` (INTEGER) — msgs na sessão do dia
   - `tempo_resposta_ms` (INTEGER) — tempo de resposta

   Adicione esses campos no `.select()` do Supabase e processe-os no `processData()`.

3. No processamento dos KPIs, adicione:
   - `reservasHoje`: array filtrado onde `data_reserva_pedida` = hoje, com campos: nome_cliente, numero_cliente, hora, qtd_pessoas, eh_aniversario
   - `aniversariosHoje`: count de registros onde `eh_aniversario = true` E `data` = hoje
   - `feedbackNegativoHoje`: count de registros onde `feedback_empresa = 'negativo'` E `data` = hoje

Não mude a interface visual ainda, apenas o hook de dados.
```

---

## PROMPT 2 — Barra de alertas no topo

```
Crie um novo componente `src/components/AlertBar.jsx` que exibe uma barra de alertas condicionais no topo do dashboard, logo abaixo do header.

A barra só aparece quando há itens para mostrar. Cada alerta é um badge horizontal.

Dados que recebe via props (vindos do useDashboardData):
- `feedbackNegativo` (number) — qtd de feedbacks negativos hoje
- `aniversarios` (number) — qtd de aniversários hoje
- `foraHorario` (number) — qtd de atendimentos fora do horário hoje

Renderização:
- Se `feedbackNegativo > 0`: badge vermelho "⚠ {n} feedback negativo"
- Se `aniversarios > 0`: badge dourado "🎂 {n} aniversário hoje"
- Se `foraHorario > 0`: badge cinza "🕐 {n} fora do horário"
- Se nenhum item, não renderizar nada (return null)

Estilo:
- Container: `display: flex; gap: 0.75rem; padding: 0.5rem 1.5rem;`
- Background: `rgba(232, 160, 32, 0.08)` com `border-bottom: 1px solid rgba(232, 160, 32, 0.15)`
- Badges: `padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.8rem;`
- Badge vermelho: `background: rgba(239, 68, 68, 0.15); color: #ef4444;`
- Badge dourado: `background: rgba(232, 160, 32, 0.15); color: #e8a020;`
- Badge cinza: `background: rgba(150, 150, 150, 0.15); color: #9a9590;`

Integre no App.jsx, logo abaixo do header e acima dos cards/conteúdo.
```

---

## PROMPT 3 — Componente Reservas de Hoje (bloco principal)

```
Crie o componente `src/components/ReservasHoje.jsx` — o bloco mais importante do dashboard.

Este componente recebe `reservas` (array) e `onSelectReserva` (callback) via props.

Cada item do array tem: `nome_cliente`, `numero_cliente`, `hora`, `qtd_pessoas`, `eh_aniversario`, `data_reserva_pedida`.

Layout:
- Título: "Reservas de Hoje" com ícone 📋 e subtítulo "{n} reservas confirmadas"
- Lista de cards, cada um com:
  - Horário (hora formatada HH:MM) à esquerda, fonte grande mono
  - Nome do cliente (ou número se não tem nome)
  - Badge "{n}p" com qtd_pessoas (se disponível)
  - Badge "🎂 NIVER" em dourado se eh_aniversario = true
  - Ao clicar, chama onSelectReserva(item)

Se não há reservas para hoje:
- Mostra mensagem "Sem reservas para hoje" com ícone ✓ e cor suave

Estado vazio (sem data_reserva_pedida em nenhum registro):
- Mostra "Reservas aparecerão aqui quando clientes solicitarem pelo WhatsApp"

Estilo:
- Container: card com borda esquerda dourada (3px solid #e8a020)
- Background: var(--bg-card, #1e1e1e)
- Item hover: background rgba(232, 160, 32, 0.08)
- Horário: font-family monospace, color #e8a020, font-size 1.1rem
- Badge NIVER: background rgba(232, 160, 32, 0.2), color #e8a020, border-radius 4px
- Badge pessoas: background rgba(150,150,150,0.15), color #9a9590

Este componente deve ser o PRIMEIRO elemento visual na aba HOJE, ocupando a coluna esquerda do layout.
```

---

## PROMPT 4 — Painel lateral de detalhes (master-detail)

```
Crie o componente `src/components/DetailPanel.jsx` para substituir os modais como forma principal de ver detalhes.

O painel fica fixo à direita da tela (sticky), visível quando um item é selecionado.

Props:
- `item` (object | null) — o registro selecionado (da tabela ou da lista de reservas)
- `onClose` (callback) — fecha o painel

Quando `item` é null, o painel mostra estado vazio: "Selecione um atendimento para ver detalhes"

Quando `item` tem dados, renderiza:
- Header: nome_cliente (ou numero_cliente) + botão X para fechar
- Grid 2x3 com:
  - TELEFONE: numero_cliente
  - DATA: data formatada DD/MM/YYYY
  - HORA: hora formatada HH:MM
  - TURNO: turno (capitalizado)
  - TIPO: tipo_atendimento com badge colorido (usar TipoBadge existente)
  - RESERVA: "Sim" ou "Não" baseado em reserva_solicitada
- Se eh_aniversario = true:
  - Seção "🎂 Aniversário" com protocolo de cortesia:
    - Se qtd_pessoas <= 4: "Cortesia: 1 drink"
    - Se qtd_pessoas 5-10: "Cortesia: 2 drinks + flyer"
    - Se qtd_pessoas 11-19: "Cortesia: rodízio grátis p/ aniversariante + flyer"
    - Se qtd_pessoas >= 20: "Cortesia: rodízio grátis + 2 drinks + flyer + balão"
    - Se qtd_pessoas é null: "Perguntar qtd de pessoas para definir cortesia"
- FEEDBACK: feedback_empresa com badge (Positivo=verde, Negativo=vermelho, Neutro=cinza)
- FORA DO HORÁRIO: "Sim" ou "Não"
- Se data_reserva_pedida: "RESERVA PARA: {data formatada}"

Estilo:
- Container: width 380px, height 100%, position sticky, top 0
- Border-left: 1px solid rgba(232,160,32,0.2)
- Background: var(--bg-elevated, #242424)
- Overflow-y: auto
- Transição de entrada: transform translateX com 0.2s ease-out
- Labels: font-size 0.7rem, text-transform uppercase, color var(--text-muted, #5a5550)
- Values: font-size 0.95rem, color var(--text-primary, #f0ece4)
```

---

## PROMPT 5 — Turno atual com countdown

```
Crie o componente `src/components/TurnoAtual.jsx` que mostra o turno atual do restaurante e countdown para o próximo.

A lógica de turnos do Alto da Hirant é:
- Segunda, Quarta, Quinta: 18h-23h (happy_hour 18h-20h, jantar 20h-23h)
- Sexta: 17h-00h (happy_hour 17h-20h, jantar 20h-00h)
- Sábado: 12h-00h (almoço 12h-15h, happy_hour 15h-20h, jantar 20h-00h)
- Domingo: 12h-23h (almoço 12h-15h, happy_hour 15h-20h, jantar 20h-23h)
- Terça: FECHADO

O componente deve:
1. Calcular o turno atual baseado em new Date() (usar hora local, fuso SP)
2. Mostrar:
   - Nome do turno atual em destaque (ex: "Happy Hour" ou "Fechado")
   - Ícone por turno: 🍽️ Almoço, 🍺 Happy Hour, 🔥 Jantar, 🔒 Fechado
   - Countdown: "Jantar em 1h20" ou "Fecha em 2h45"
   - Se fechado: "Abre às {horário}" com o próximo dia de funcionamento
3. Atualizar a cada 60 segundos (setInterval)

Estilo:
- Container compacto, max-width 280px
- Background: var(--bg-card)
- Turno ativo: cor #e8a020
- Countdown: font-family monospace, font-size 0.85rem, color var(--text-secondary)

Integre este componente no App.jsx, na coluna direita abaixo do DetailPanel (quando na aba HOJE).
```

---

## PROMPT 6 — Reorganizar layout da aba HOJE (padrão F)

```
Reorganize o layout do App.jsx para a aba HOJE seguindo o padrão F de leitura. O layout atual mostra os mesmos KPIs + gráficos em todas as abas. A aba HOJE deve ter conteúdo completamente diferente.

Novo layout da aba HOJE:

```
+------------------------------------------------------------------+
| HEADER (manter como está)                                         |
+------------------------------------------------------------------+
| ALERT BAR (componente AlertBar - já criado)                       |
+------------------------------------------------------------------+
|                                    |                              |
| RESERVAS DE HOJE (ReservasHoje)    | DETAIL PANEL (DetailPanel)   |
| — Bloco principal, col esquerda    | — Sticky à direita           |
|                                    | — Mostra detalhes ao clicar  |
| ATIVIDADE RECENTE (CardTabela)     |                              |
| — Tabela filtrada para hoje        | TURNO ATUAL (TurnoAtual)     |
| — Sem paginação (max 15 itens)     | — Turno + countdown          |
|                                    |                              |
+------------------------------------------------------------------+
| MÉTRICAS COMPACTAS (1 linha):                                     |
| [Atendimentos: N] [Reservas: N] [Feedback+: N] [Fora horário: N] |
+------------------------------------------------------------------+
```

Para as abas ESTA SEMANA e ESTE MÊS, manter o layout atual (KPIs + gráficos + tabela).

Implementação:
1. No App.jsx, renderize conteúdo condicional baseado na aba ativa
2. Use CSS Grid para o layout 2 colunas: `grid-template-columns: 1fr 380px`
3. A coluna direita (DetailPanel + TurnoAtual) deve ser sticky
4. Na parte inferior da aba HOJE, mostre 4 mini-métricas em linha horizontal (sem cards grandes, sem gráficos)
5. Os modais continuam funcionando para as abas SEMANA e MÊS

O KPICard existente pode ser simplificado: na aba HOJE, mostra apenas o número sem o badge de comparação (delta %). O delta % só faz sentido em SEMANA e MÊS.

CSS da grid principal:
```css
.dashboard-hoje {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 1rem;
  min-height: calc(100vh - 200px);
}

.dashboard-hoje__main {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
}

.dashboard-hoje__sidebar {
  position: sticky;
  top: 1rem;
  align-self: start;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.metricas-compactas {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  padding: 1rem 0;
}

.metrica-mini {
  background: var(--bg-card, #1e1e1e);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  text-align: center;
}

.metrica-mini__label {
  font-size: 0.7rem;
  text-transform: uppercase;
  color: var(--text-muted, #5a5550);
  margin-bottom: 0.25rem;
}

.metrica-mini__valor {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-primary, #f0ece4);
}
```
```

---

## PROMPT 7 — Eliminar redundância e refinar

```
Revise o dashboard para eliminar redundâncias e polir a experiência:

1. REDUNDÂNCIA NOS DADOS:
   - Na aba SEMANA: o donut "Tipos de Atendimento" e os KPI cards de "Reservas" e "Total" mostram a mesma informação. Solução: remova o KPI card "Reservas Realizadas" da aba SEMANA (já está no donut). Substitua por um KPI de "Clientes Únicos" (count distinct numero_cliente).
   - O gráfico de barras "Almoço/HH x Jantar" e o donut de tipos mostram dimensões diferentes (turno vs tipo) — isso está OK, manter.

2. CONTEÚDO POR ABA:
   - ABA HOJE: Layout novo (Prompt 6) — sem gráficos, foco operacional
   - ABA SEMANA: 3 KPIs (Total Atendimentos, Clientes Únicos, Horário de Pico) + gráfico de linha + donut + barras + tabela paginada
   - ABA MÊS: Mesma estrutura da semana, dados do mês

3. CORES REFINADAS:
   Atualize as CSS variables no :root:
   ```css
   :root {
     --bg-base: #0f0f0f;
     --bg-surface: #1a1a1a;
     --bg-elevated: #242424;
     --bg-card: #1e1e1e;
     --accent-primary: #e8a020;
     --accent-secondary: #c47a15;
     --accent-subtle: rgba(232, 160, 32, 0.12);
     --text-primary: #f0ece4;
     --text-secondary: #9a9590;
     --text-muted: #5a5550;
     --success: #4ade80;
     --danger: #ef4444;
     --info: #60a5fa;
   }
   ```

4. FEEDBACK VISUAL:
   - Na tabela de atendimentos (CardTabela), a coluna STATUS deve mostrar badges coloridos:
     - Positivo: fundo verde sutil, texto verde
     - Negativo: fundo vermelho sutil, texto vermelho
     - Neutro: fundo cinza sutil, texto cinza
   - Atualmente todos mostram "→ Neutro" igual

5. ANIMAÇÃO DE ENTRADA:
   - Ao trocar de aba, os cards devem ter animação staggered (cada um aparece com 50ms de delay):
   ```css
   @keyframes fadeSlideIn {
     from { opacity: 0; transform: translateY(8px); }
     to { opacity: 1; transform: translateY(0); }
   }
   .card-animated {
     animation: fadeSlideIn 0.3s ease-out both;
   }
   .card-animated:nth-child(1) { animation-delay: 0ms; }
   .card-animated:nth-child(2) { animation-delay: 50ms; }
   .card-animated:nth-child(3) { animation-delay: 100ms; }
   .card-animated:nth-child(4) { animation-delay: 150ms; }
   ```
```

---

## Resumo de execução

| Prompt | O que faz | Dependência |
|--------|-----------|-------------|
| 1 | Aba padrão HOJE + busca novos campos no hook | Nenhuma |
| 2 | Barra de alertas no topo | Prompt 1 |
| 3 | Componente Reservas de Hoje | Prompt 1 |
| 4 | Painel lateral de detalhes | Nenhuma |
| 5 | Turno atual com countdown | Nenhuma |
| 6 | Reorganizar layout aba HOJE | Prompts 2, 3, 4, 5 |
| 7 | Eliminar redundância + refinamentos | Prompt 6 |
