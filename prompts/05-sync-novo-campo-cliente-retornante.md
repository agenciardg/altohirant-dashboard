# Sync — Novo Campo cliente_retornante + Painel Fidelizacao

> **Data:** 2026-03-18
> **Tipo:** Sincronizacao pontual com backend (agente Helena)
> **Commit relacionado:** 06cafc9

---

## Contexto

Novo campo `cliente_retornante` (BOOLEAN) adicionado na tabela `alto_hirant_dashboard` do Supabase. Helena ja preenche automaticamente: `true` = cliente que ja entrou em contato antes, `false` = primeiro contato.

---

## PROMPT 1 — Processar cliente_retornante no hook de dados

```
Novo campo no Supabase: `cliente_retornante` (BOOLEAN), ja preenchido.

Em `src/lib/useDashboardData.js`, criar funcao `buildFidelizacao(rows, tab)` que retorna:
- novos: COUNT onde cliente_retornante = false
- retornantes: COUNT onde cliente_retornante = true
- taxa: ROUND((retornantes / total) * 100)
- evolucao: array com { dia, novos, retornantes } agrupado por data
- frequentes: clientes com COUNT(DISTINCT data) > 1, ordenados por dias_contato DESC, limit 10

Adicionar `fidelizacao: buildFidelizacao(rows, tab)` no retorno de processData().
```

---

## PROMPT 2 — Criar componente FidelizacaoPanel

```
Criar `src/components/FidelizacaoPanel.jsx` com:

1. Tres mini-cards lado a lado:
   - "Clientes Novos" (azul #3B82F6) — valor = novos
   - "Retornantes" (verde #22C55E) — valor = retornantes
   - "Taxa de Retorno" — valor = taxa%, cor por faixa:
     - >= 30%: verde #22C55E (boa retencao)
     - 15-29%: amarelo #F59E0B (retencao moderada)
     - < 15%: vermelho #EF4444 (retencao baixa)

2. Pie chart CSS (conic-gradient) mostrando proporcao novos vs retornantes

3. Line chart SVG com evolucao diaria (2 linhas: novos tracejada azul, retornantes solida verde)

4. Tabela "Clientes Mais Frequentes":
   - Colunas: Cliente, Dias de contato, Total msgs, Tipo (badge Retornante/Novo)
   - Filtro: apenas clientes com dias_contato > 1
   - Ordenado por dias_contato DESC

Props: data (objeto fidelizacao), loading, onOpenModal
Deve ocupar full-width (gridColumn: 1 / -1).
```

---

## PROMPT 3 — Modal de Fidelizacao

```
Em `src/Modal.jsx`, criar ContentFidelizacao:

1. Stats: Clientes Novos, Retornantes, Taxa de Retorno, Total registros
2. Secao "Clientes mais frequentes (multi-dia)" — lista com dias de contato e msgs
3. Secao "Clientes retornantes" — lista com MRow
4. Secao "Clientes novos" — lista com MRow (max 20, truncar)

Registrar no MODAL_REGISTRY:
fidelizacao: { icon: '🔁', title: 'Fidelizacao de Clientes', sub: 'Novos vs. Retornantes', Component: ContentFidelizacao, prop: 'rows' }
```

---

## PROMPT 4 — Integrar no App.jsx

```
Em `src/App.jsx`:
1. Importar FidelizacaoPanel
2. Adicionar abaixo do bloco "Barras + Tabela" nas abas SEMANA e MES:
   <FidelizacaoPanel data={d.fidelizacao} loading={loading} onOpenModal={openModal} />
3. Atualizar mock data das 3 abas com dados de fidelizacao
```
