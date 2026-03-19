# Plano de Trabalho — Implementacao do Versionamento

## Fase 1: Infraestrutura de Planos
> Objetivo: Criar a base que permite controlar funcionalidades por plano

### Tarefa 1.1 — Criar tabela `clientes_planos` no Supabase
- SQL de criacao com campos: id, cliente_id, nome_cliente, plano, ativo, timestamps
- Inserir registro do Alto da Hirant como plano 'premium'
- Configurar RLS (Row Level Security)

### Tarefa 1.2 — Criar arquivo `src/lib/planos.js`
- Feature map completo com os 3 planos
- Todas as permissoes documentadas
- Constantes exportaveis

### Tarefa 1.3 — Criar hook `src/lib/usePlano.js`
- Fetch do plano no Supabase
- Estado reativo com permissoes
- Fallback para 'basico' se erro

### Tarefa 1.4 — Definir identificacao do cliente
- Implementar leitura de parametro URL (?cliente=xxx)
- Passar clienteId para o hook usePlano
- Contexto React para disponibilizar permissoes globalmente

---

## Fase 2: Controles de Visibilidade
> Objetivo: Aplicar as permissoes nos componentes existentes

### Tarefa 2.1 — Controle de Abas (App.jsx)
- Renderizar abas condicionalmente baseado em `permissoes.tabs`
- Adicionar aba com cadeado para planos superiores (upsell visual)
- Garantir que tab default seja 'hoje' para todos

### Tarefa 2.2 — Controle de KPIs
- Na aba Hoje: KPIs compactos sempre visiveis (todos os planos)
- Na aba Semana/Mes: KPIs clicaveis apenas se `permissoes.kpiClickable`
- Remover cursor pointer quando nao clicavel

### Tarefa 2.3 — Controle de Graficos
- Renderizar CardLinha, CardDonut, CardBarras condicionalmente
- Desabilitar onClick nos graficos se `!permissoes.chartFilterable`
- Ajustar layout grid quando graficos estao ausentes

### Tarefa 2.4 — Controle de Tabela
- Filtrar colunas por `permissoes.tabelaColunas`
- Limitar linhas por `permissoes.tabelaLinhas`
- Esconder paginacao se `!permissoes.tabelaPaginacao`
- Desabilitar clique nas linhas se `!permissoes.tabelaClicavel`

### Tarefa 2.5 — Controle de Modais
- Verificar permissao antes de abrir modal
- Lista de modais permitidos em `permissoes.modals`
- Silenciosamente ignorar clique se modal nao permitido

### Tarefa 2.6 — Controle de Paineis
- DetailPanel: renderizar baseado em `permissoes.detailPanel`
- FidelizacaoPanel: renderizar baseado em `permissoes.fidelizacao`
- Ajustar grid layout quando paineis ausentes

### Tarefa 2.7 — Controle de Funcionalidades Gerais
- Theme toggle: baseado em `permissoes.themeToggle`
- Logo upload: baseado em `permissoes.logoUpload`
- Poll interval: usar `permissoes.pollInterval`

---

## Fase 3: Layout Adaptativo
> Objetivo: Garantir que cada versao tenha layout bonito e funcional

### Tarefa 3.1 — Layout da Versao Basica
- Aba Hoje sem graficos: reorganizar em 1-2 colunas
- KPIs compactos + Reservas de Hoje + Tabela simplificada + Turno Atual
- Garantir que nao haja "buracos" visuais
- Testar responsividade

### Tarefa 3.2 — Layout da Versao Intermediaria
- 2 abas com grid 2 colunas para graficos (linha + donut)
- Sem grafico de barras: ajustar grid
- Sidebar limitada no Hoje
- Testar responsividade

### Tarefa 3.3 — Layout da Versao Premium
- Manter layout exatamente como esta hoje
- Nenhuma alteracao visual necessaria
- Apenas garantir que tudo funciona com sistema de permissoes

---

## Fase 4: Upsell e Polimento
> Objetivo: Incentivar upgrade de forma sutil e profissional

### Tarefa 4.1 — Modal de Upgrade
- Criar componente UpgradeModal
- "Essa funcionalidade esta disponivel no Plano [X]"
- Botao "Fale conosco" (link WhatsApp da agencia)
- Design alinhado com tema do dashboard

### Tarefa 4.2 — Indicadores visuais de plano
- Badge discreto no header mostrando plano atual
- Abas bloqueadas com icone de cadeado
- Opcional: tooltip "Disponivel no Plano Premium"

### Tarefa 4.3 — Testes de cada versao
- Testar plano basico completo (funcionalidades e layout)
- Testar plano intermediario completo
- Testar plano premium (regressao — nada deve quebrar)
- Testar troca de plano em tempo real

---

## Fase 5: Multi-tenant (Futuro)
> Objetivo: Preparar para multiplos clientes

### Tarefa 5.1 — Isolamento de dados por cliente
- Adicionar coluna `cliente_id` na tabela principal se nao existir
- Configurar RLS no Supabase para filtrar por cliente
- Cada cliente so ve seus dados

### Tarefa 5.2 — Onboarding automatico
- Ao contratar servico de agente: criar registro em `clientes_planos`
- Plano default: 'basico'
- Gerar URL unica para o cliente

### Tarefa 5.3 — Painel administrativo (agencia)
- Dashboard interno para a agencia gerenciar clientes
- Alterar planos, ativar/desativar
- Visao geral de todos os clientes

---

## Ordem de Execucao Recomendada

```
Fase 1 (base)          -> ~1 sessao de trabalho
Fase 2 (controles)     -> ~2 sessoes de trabalho
Fase 3 (layouts)       -> ~1 sessao de trabalho
Fase 4 (upsell)        -> ~1 sessao de trabalho
Fase 5 (multi-tenant)  -> futuro, quando houver mais clientes
```

---

## Notas Importantes

1. **O Alto da Hirant permanece Premium** — nada muda para o cliente atual
2. **Comece pelo planos.js** — e o coracao do sistema
3. **Teste com ?plano=basico na URL** — para simular cada versao durante dev
4. **Nao crie 3 projetos** — um codebase unico com feature flags
5. **Fase 5 so quando necessario** — nao over-engineer antes da hora
