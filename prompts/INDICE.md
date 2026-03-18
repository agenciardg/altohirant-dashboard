# Indice de Prompts — Dashboard Alto da Hirant

> Ultima atualizacao: 2026-03-18

---

## Legenda de prefixos

| Prefixo | Significado |
|---------|-------------|
| `v1-` | Versao 1 dos prompts (historico, migrations 001-002) |
| `v2-` | Versao 2 dos prompts (atual, migrations 003-005) |
| `sync-` | Sincronizacao pontual — mudanca no backend refletida no dashboard |

---

## Lista de prompts

### 01-v1-criar-paineis-feedback-turnos-aniversarios.md
- **Status:** Historico (substituido pelo v2)
- **O que faz:** Criou os paineis iniciais do dashboard — KPI "Fora do Horario", Clientes Unicos, normalização de turno, simplificacao de barras, tipo "Geral" no donut
- **Prompts:** 5 (KPI Fora Horario, Normalizar Turno, Labels Barras, Simplificar Barras, Tipo Geral)
- **Origem:** Agente backend (Helena) v1

### 02-v1-redesign-layout-abas-graficos.md
- **Status:** Historico (implementado)
- **O que faz:** Redesenhou o layout completo do dashboard — aba HOJE com padrao F (ReservasHoje + DetailPanel + TurnoAtual), AlertBar, metricas compactas, eliminacao de redundancias
- **Prompts:** 7 (Hook dados, AlertBar, ReservasHoje, DetailPanel, TurnoAtual, Layout F, Refinar)
- **Origem:** Design do dashboard

### 03-v2-prompts-completos-todos-paineis.md
- **Status:** ATUAL — Versao completa de referencia
- **O que faz:** Documentacao completa da tabela `alto_hirant_dashboard` com todos os campos apos migrations 001-005. Prompts para todos os 8 paineis: Visao Geral, Tipos de Atendimento, Interesse por Programacao, Satisfacao, Turnos/Horarios, Aniversarios, Demanda Futura + queries de validacao
- **Prompts:** 7 + queries SQL
- **Origem:** Agente backend (Helena) v2

### 04-sync-logica-classificacao-reserva-feedback.md
- **Status:** Implementado (2026-03-18)
- **O que faz:** Corrigiu logicas desincronizadas apos atualizacao da Helena — reserva por link GetIn, feedback NULL != Neutro, fora horario como 4o turno, label condicional de data_reserva_pedida, modal Programacao
- **Prompts:** 5 (Reservas, Feedback, Barras 4 turnos, Label reserva, Modal Programacao)
- **Commits:** b45937f, 35c2f1f, 3148bea, 03884f4

### 05-sync-novo-campo-cliente-retornante.md
- **Status:** Implementado (2026-03-18)
- **O que faz:** Integrou campo `cliente_retornante` (boolean) — painel completo de Fidelizacao com cards novos/retornantes, taxa de retorno, pie chart, evolucao diaria, tabela de frequentes
- **Prompts:** 4 (Hook dados, FidelizacaoPanel, Modal, Integrar App)
- **Commit:** 06cafc9

### 06-sync-historico-mensagens-modal.md
- **Status:** Implementado (2026-03-18)
- **O que faz:** Coluna DATA (DD/MM/YYYY) em todas as tabelas/modais + modal de historico de conversa estilo WhatsApp. Busca mensagens reais da tabela `alto_hirant_mensagens` (1:N via dashboard_id). Baloes cliente/Helena, tools usadas, scroll, ESC para voltar
- **Prompts:** 1 (Coluna DATA + Modal Historico de Conversa)
- **Commit:** 592d593

---

## Como adicionar novos prompts

1. Numerar sequencialmente: `06-...`, `07-...`
2. Usar prefixo da categoria: `sync-` para mudancas pontuais do backend, `v3-` para proxima versao completa
3. Nome deve descrever a utilidade em poucas palavras
4. Exemplo: `06-sync-novo-campo-xyz.md`
