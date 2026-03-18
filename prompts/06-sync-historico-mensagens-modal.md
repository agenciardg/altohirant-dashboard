# Prompt de Sincronizacao — Historico de Mensagens no Modal

> **Data:** 2026-03-18
> **Objetivo:** Jogar este prompt no agente do dashboard para que ele adicione: (1) coluna DATA em todas as tabelas/modais, (2) historico de mensagens trocadas ao clicar numa linha do modal.

---

## Nova tabela no Supabase: `alto_hirant_mensagens`

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | UUID | PK |
| created_at | TIMESTAMPTZ | auto |
| dashboard_id | UUID | FK → alto_hirant_dashboard.id (vinculo com o registro do dia) |
| numero_cliente | TEXT | Telefone do cliente |
| data | DATE | Data da mensagem |
| hora | TIMESTAMPTZ | Momento exato da mensagem |
| remetente | TEXT | `cliente` ou `helena` |
| conteudo | TEXT | Texto da mensagem |
| tipo_mensagem | TEXT | `texto`, `audio`, `imagem`, `pdf`, `video`, `localizacao` |
| tools_usadas | TEXT | Tools que a Helena usou nessa resposta (so para remetente=helena) |
| tempo_ms | INTEGER | Tempo de resposta em ms (so para remetente=helena) |

**Relacao:** Cada registro em `alto_hirant_dashboard` pode ter N mensagens em `alto_hirant_mensagens` (1:N via dashboard_id).

---

## COLE ESTE PROMPT NO AGENTE DO DASHBOARD:

```
NOVA FUNCIONALIDADE: Historico de Mensagens no Dashboard.

Existe uma NOVA tabela no Supabase chamada `alto_hirant_mensagens` vinculada a `alto_hirant_dashboard` pelo campo `dashboard_id` (UUID, FK). Cada registro do dashboard pode ter N mensagens (1 pra N). A tabela armazena todas as mensagens trocadas entre o cliente e a Helena (IA do restaurante).

Campos da tabela alto_hirant_mensagens:
- id (UUID, PK)
- dashboard_id (UUID, FK → alto_hirant_dashboard.id)
- numero_cliente (TEXT)
- data (DATE)
- hora (TIMESTAMPTZ — momento exato)
- remetente (TEXT — 'cliente' ou 'helena')
- conteudo (TEXT — texto da mensagem)
- tipo_mensagem (TEXT — 'texto', 'audio', 'imagem', etc)
- tools_usadas (TEXT — tools separadas por virgula, so para helena)
- tempo_ms (INTEGER — tempo de resposta, so para helena)

IMPLEMENTAR AS SEGUINTES MUDANCAS:

1. COLUNA DATA EM TODAS AS TABELAS:
   Adicionar coluna "DATA" entre ID e HORA em TODAS as tabelas e modais do dashboard.
   Formato: DD/MM/YYYY (ex: 18/03/2026).
   Campo do Supabase: `data` (tipo DATE na tabela alto_hirant_dashboard).

2. MODAL DE DETALHES COM HISTORICO DE CONVERSA:
   Quando o usuario clicar em qualquer LINHA da tabela de atendimentos (seja no modal de Total de Interacoes, seja em qualquer outra tabela do dashboard), abrir um MODAL/PAINEL de detalhes que mostra:

   A) Cabecalho com as informacoes do atendimento:
      - Cliente: numero_cliente (e nome_cliente se houver)
      - Data: DD/MM/YYYY
      - Hora: HH:MM
      - Turno: turno
      - Tipo: tipo_atendimento (com badge colorido)
      - Feedback: feedback_empresa (com badge colorido, se houver)

   B) Secao "Conversa" logo abaixo — estilo CHAT/WHATSAPP:
      Query: SELECT * FROM alto_hirant_mensagens WHERE dashboard_id = [id do registro clicado] ORDER BY hora ASC

      Layout da conversa:
      - Mensagens do CLIENTE: alinhadas a ESQUERDA, com fundo escuro (ex: #2a2a2a), prefixo "Cliente" e hora
      - Mensagens da HELENA: alinhadas a DIREITA, com fundo alaranjado escuro (ex: #3d2a1a, tom do dashboard), prefixo "Helena" e hora
      - Cada mensagem mostra: remetente, hora (HH:MM), e o conteudo do texto
      - Se tipo_mensagem nao for 'texto', mostrar um badge indicando (ex: "[Audio]", "[Imagem]")
      - Ordem cronologica (mais antiga no topo, mais recente embaixo)
      - Scroll vertical se houver muitas mensagens
      - Se nao houver mensagens (dashboard_id sem registros na tabela mensagens), mostrar: "Historico de mensagens nao disponivel para este atendimento."

   C) Se a Helena usou tools, mostrar abaixo da mensagem dela em fonte menor e cor cinza:
      "Tools: date_time, envia_loc" (campo tools_usadas)

3. VISUAL:
   - O modal deve seguir o mesmo estilo dark/alaranjado do dashboard existente
   - Bordas arredondadas nos baloes de mensagem
   - Espacamento entre mensagens
   - Icone de fechar (X) no canto superior direito do modal
   - O modal deve ser grande o suficiente para ler as mensagens confortavelmente (min 500px largura, 70% da tela)

4. INTERACAO:
   - Clicar na LINHA da tabela abre o modal
   - Clicar no X ou fora do modal fecha
   - ESC fecha o modal
   - O modal nao deve travar a navegacao

5. TABELA ATUALIZADA no modal de "Total de Interacoes":
   A ordem das colunas deve ser: ID | DATA | HORA | CLIENTE | TIPO | TURNO | FEEDBACK
   (DATA adicionada entre ID e HORA)

Mantenha todas as funcionalidades existentes do dashboard. Apenas ADICIONE a coluna DATA e o modal de historico.
```
