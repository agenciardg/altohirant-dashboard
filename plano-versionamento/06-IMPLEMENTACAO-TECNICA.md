# Implementacao Tecnica — Como fazer o versionamento

## Abordagem Recomendada: Feature Flags no Codigo Unico

### Por que NAO criar 3 projetos separados?
- Manutencao triplicada: qualquer bug precisa ser corrigido 3 vezes
- Divergencia inevitavel: as versoes ficam dessincronizadas
- Deploy triplo: 3 builds, 3 hospedagens, 3 URLs

### Solucao: Um unico codebase com controle de plano

O dashboard continua sendo **um unico projeto React**.
Um sistema de **plano/tier** controla o que cada cliente ve.

---

## Arquitetura Proposta

### 1. Tabela de Planos no Supabase

```sql
-- Nova tabela: clientes_planos
CREATE TABLE clientes_planos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id TEXT NOT NULL UNIQUE,       -- identificador do cliente/restaurante
  nome_cliente TEXT NOT NULL,
  plano TEXT NOT NULL DEFAULT 'basico',  -- 'basico' | 'intermediario' | 'premium'
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP DEFAULT now(),
  atualizado_em TIMESTAMP DEFAULT now()
);
```

Cada restaurante/cliente tera um registro nessa tabela.
Quando contrata o servico de agente -> automaticamente ganha plano 'basico'.

### 2. Constante de Permissoes (Feature Map)

No frontend, um arquivo define o que cada plano pode acessar:

```javascript
// src/lib/planos.js
export const PLANOS = {
  basico: {
    tabs: ['hoje'],
    kpiClickable: false,
    charts: [],
    modals: [],
    detailPanel: false,
    fidelizacao: false,
    themeToggle: false,
    logoUpload: false,
    tabelaColunas: ['hora', 'cliente', 'tipo'],
    tabelaLinhas: 5,
    tabelaPaginacao: false,
    tabelaClicavel: false,
    chartFilterable: false,
    pollInterval: 60000,
  },
  intermediario: {
    tabs: ['hoje', 'semana'],
    kpiClickable: true,
    kpiModals: ['atendimentos', 'reservas', 'satisfacao', 'reclamacoes'],
    charts: ['linha', 'donut'],
    modals: ['atendimentos', 'reservas', 'satisfacao', 'reclamacoes'],
    detailPanel: 'limited',
    fidelizacao: false,
    themeToggle: true,
    logoUpload: false,
    tabelaColunas: ['id', 'data', 'hora', 'cliente', 'tipo', 'turno', 'feedback'],
    tabelaLinhas: 10,
    tabelaPaginacao: true,
    tabelaClicavel: true,
    chartFilterable: false,
    pollInterval: 30000,
  },
  premium: {
    tabs: ['hoje', 'semana', 'mes'],
    kpiClickable: true,
    kpiModals: 'all',
    charts: ['linha', 'donut', 'barras'],
    modals: 'all',
    detailPanel: 'full',
    fidelizacao: true,
    themeToggle: true,
    logoUpload: true,
    tabelaColunas: ['id', 'data', 'hora', 'cliente', 'tipo', 'turno', 'feedback'],
    tabelaLinhas: 10,
    tabelaPaginacao: true,
    tabelaClicavel: true,
    chartFilterable: true,
    pollInterval: 30000,
  },
};
```

### 3. Hook de Plano (usePlano)

```javascript
// src/lib/usePlano.js
import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { PLANOS } from './planos';

export function usePlano(clienteId) {
  const [plano, setPlano] = useState('basico');
  const [permissoes, setPermissoes] = useState(PLANOS.basico);

  useEffect(() => {
    async function fetchPlano() {
      const { data } = await supabase
        .from('clientes_planos')
        .select('plano')
        .eq('cliente_id', clienteId)
        .single();

      const tier = data?.plano || 'basico';
      setPlano(tier);
      setPermissoes(PLANOS[tier]);
    }
    fetchPlano();
  }, [clienteId]);

  return { plano, permissoes };
}
```

### 4. Uso nos Componentes (Exemplos)

**Controle de abas:**
```jsx
// App.jsx
const { permissoes } = usePlano(clienteId);

{permissoes.tabs.includes('semana') && <Tab label="Esta Semana" />}
{permissoes.tabs.includes('mes') && <Tab label="Este Mes" />}

// Aba com cadeado (upsell visual)
{!permissoes.tabs.includes('mes') && (
  <Tab label="Este Mes" locked badge="Premium" onClick={showUpgradeModal} />
)}
```

**Controle de graficos:**
```jsx
{permissoes.charts.includes('linha') && <CardLinha ... />}
{permissoes.charts.includes('donut') && <CardDonut ... />}
{permissoes.charts.includes('barras') && <CardBarras ... />}
```

**Controle de modais:**
```jsx
// No KPICard
<div onClick={permissoes.kpiClickable ? () => openModal(tipo) : undefined}
     style={{ cursor: permissoes.kpiClickable ? 'pointer' : 'default' }}>
```

**Controle de tabela:**
```jsx
const colunasVisiveis = COLUNAS.filter(c => permissoes.tabelaColunas.includes(c.key));
const dadosVisiveis = rows.slice(0, permissoes.tabelaLinhas);
```

---

## Fluxo de Identificacao do Cliente

### Opcao A: URL com parametro (mais simples)
```
https://dashboard.altodahirant.com?cliente=alto-da-hirant
```
O parametro `cliente` identifica quem esta acessando.
O hook `usePlano` busca o plano no Supabase.

### Opcao B: Subdominio por cliente
```
https://alto-da-hirant.dashboard.agenciardg.com
```
Cada cliente tem subdominio proprio. O subdominio define o clienteId.

### Opcao C: Login simples
Tela de login com email/senha -> identifica cliente -> carrega plano.
Mais seguro, mas adiciona fricao.

### Recomendacao
Comecar com **Opcao A** (parametro na URL) por simplicidade.
Evoluir para **Opcao C** (login) quando houver mais clientes.

---

## Deploy

### Cenario atual (1 cliente)
- Um unico deploy no Vercel/Netlify
- URL unica com parametro
- Plano definido no Supabase

### Cenario futuro (multiplos clientes)
- Mesmo deploy unico
- Cada cliente acessa com seu parametro/subdominio
- Plano e dados isolados por `cliente_id`
- Cada cliente so ve seus proprios dados (RLS no Supabase)

---

## Upsell Visual — Elementos Importantes

### Abas bloqueadas
Abas que o cliente nao tem acesso aparecem com icone de cadeado
e badge indicando o plano necessario. Ao clicar, abre mini-modal:
"Desbloqueie esta funcionalidade com o Plano [X]. Fale conosco!"

### KPIs nao clicaveis
Na versao Basica, KPIs mostram valor mas nao reagem ao clique.
Nao ha indicacao visual de que "poderia clicar" — e simplesmente estatico.

### Graficos ausentes
Na area onde ficariam graficos, pode opcionalmente mostrar um placeholder
sutil com "Disponivel no Plano Intermediario" — ou simplesmente nao renderizar.

**Recomendacao:** NAO mostrar placeholder. Menos e mais.
O cliente so percebe a carencia quando sente necessidade naturalmente.
