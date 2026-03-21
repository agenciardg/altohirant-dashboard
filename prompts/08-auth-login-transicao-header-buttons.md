# Prompt 08 — Sistema de Autenticação, Login Premium, Transições e Botões do Header

> **Objetivo:** Reproduzir em qualquer dashboard React + Supabase o sistema completo de autenticação, tela de login premium, transições animadas e botões padronizados do header — tudo validado e funcional.
>
> **Pré-requisitos:** React 18+, Vite, Supabase (`@supabase/supabase-js`), CSS puro (sem Tailwind/framework). O projeto já deve ter um dashboard funcional com header, tema dark/light e variáveis CSS.

---

## PARTE 1 — Hook de Autenticação (`src/lib/useAuth.jsx`)

Crie o arquivo `src/lib/useAuth.jsx` com:

### Estrutura obrigatória:
- **`useAuth()` hook** que retorna `{ user, session, loading, signIn, signOut, updatePassword }`
- **`AuthProvider`** — wrapper Context que instancia `useAuth()` uma vez e compartilha via `AuthContext.Provider`
- **`useAuthContext()`** — consumer hook que lê o contexto; deve lançar erro descritivo se usado fora do `AuthProvider`

### Lógica interna do `useAuth`:
```
Estados: user (null), session (null), loading (true)

useEffect (mounted flag para evitar setState em componente desmontado):
  1. supabase.auth.getSession() → hydrate user/session, setLoading(false)
  2. supabase.auth.onAuthStateChange → manter user/session sincronizados
  3. cleanup: mounted=false, subscription.unsubscribe()

signIn(email, password):
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data

signOut():
  const { error } = await supabase.auth.signOut()
  if (error) throw error

updatePassword(newPassword):
  const { data, error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
  return data
```

### Detalhes técnicos:
- Todas as funções helpers devem ser `useCallback`
- O `useEffect` deve ter flag `mounted` para prevenir setState após unmount
- O arquivo DEVE ter extensão `.jsx` (contém JSX no Provider)

---

## PARTE 2 — Tela de Login Premium (`src/components/LoginPage.jsx`)

### Props:
```
onLogin: async (email: string, password: string) => { error?: string } | void
```

### Design — Ghost Card Premium:
- **Fundo atmosférico** com radial gradients ember (NÃO fundo sólido)
  - Usar 3 elipses radiais com cores da identidade visual do projeto em opacidade ~0.15-0.20
  - Adicionar textura SVG noise inline para organicidade (`<filter><feTurbulence>`)
- **Card transparente** (ghost card) — sem `background` sólido, sem `border` visível
  - Apenas backdrop visual via glows, sem contorno
- **Logo hero** — 160px circular com:
  - Border sutil `rgba(identidade, 0.15)`
  - Glow breathing via `box-shadow` animado (keyframe `loginHalo`, 3s infinite)
  - Ember ring animado ao redor (keyframe `loginEmberRing`, 4s infinite)
  - Fallback: SVG inline (componente `FlameLogo`) caso `/logo.png` falhe (`onError`)

### Campos do formulário:
- **E-mail**: `type="email"`, `autoComplete="email"`, placeholder "seu@email.com"
- **Senha**: `type` toggle entre "password"/"text", `autoComplete="current-password"`, placeholder "••••••••"
- **Toggle de visibilidade** (botão olho):
  - Ícone SVG inline olho-aberto / olho-fechado (NÃO usar biblioteca de ícones)
  - Classe `.login-eye` posicionado absolutamente dentro do input wrapper
  - `tabIndex={-1}` para não interferir na navegação por tab
  - `aria-label` dinâmico: "Mostrar senha" / "Ocultar senha"

### Validação (em português pt-BR):
- Campo e-mail vazio → "Por favor, informe o e-mail."
- Campo senha vazio → "Por favor, informe a senha."
- Erro retornado por `onLogin` → exibir com ícone de alerta SVG inline

### Mensagem de erro:
- Componente `AlertIcon` — SVG triângulo de alerta inline
- Container com `role="alert"`, `aria-live="assertive"`
- Classe `.login-error` com shake animation no CSS

### Botão submit:
- Gradient com cores da identidade visual
- Spinner inline CSS (`.login-spinner`) durante loading
- Texto: "Entrar" / "Entrando..." durante loading
- `aria-busy={loading}`, `disabled={loading}`
- Material depth via múltiplos `box-shadow` (inset + outer)

### Animações staggered:
- Cada seção tem um "slot" de stagger (header=0, divider=1, email=2, senha=3, botão=4, footer=5)
- Keyframe `loginFadeUp`: translateY(24px) + opacity 0 → 0 + 1
- Delay incremental: `calc(0.18s + var(--stagger) * 0.10s)`

### Footer:
- Texto: `Acesso restrito a **colaboradores autorizados**. Agência RDG © {ano}`
- Divider decorativo: linha — ponto — linha

### Responsivo:
- Breakpoint 480px: reduzir padding e tamanhos de fonte
- Breakpoint 360px: mais compacto ainda
- `@media (prefers-reduced-motion: reduce)`: desabilitar todas as animações

---

## PARTE 3 — AuthGate com Transições (`src/components/AuthGate.jsx`)

Este é o componente mais crítico. Ele controla qual tela é exibida e gerencia transições animadas.

### Props:
```
children: ReactNode (o dashboard)
```

### Tradução de erros Supabase → Português:
```javascript
const ERROR_MAP = {
  'Invalid login credentials': 'E-mail ou senha incorretos.',
  'Email not confirmed': 'E-mail ainda não confirmado. Verifique sua caixa de entrada.',
  'Invalid email or password': 'E-mail ou senha incorretos.',
  'User not found': 'Nenhuma conta encontrada com este e-mail.',
  'Too many requests': 'Muitas tentativas. Aguarde alguns minutos.',
  'Email rate limit exceeded': 'Limite de tentativas excedido. Tente novamente mais tarde.',
  'Network request failed': 'Erro de conexão. Verifique sua internet.',
}
```
- Busca case-insensitive com `includes`
- Fallback: "Credenciais inválidas. Verifique e tente novamente."

### Keyframes (injetados via `document.head.appendChild` uma única vez):
```
ag-overlay-in     — opacity 0→1
ag-overlay-out    — opacity 1→0
ag-logo-appear    — scale(0.88)→scale(1.04)→scale(1) + opacity
ag-ember-pulse    — box-shadow breathing (cor accent, 1.8s infinite)
ag-glow-ring      — opacity + scale pulsing (1.8s infinite)
ag-welcome-in     — translateY(12px)→0 + opacity
ag-bar-fill       — width 0%→100%
ag-content-in     — opacity 0→1
```
- Todos com versão `prefers-reduced-motion: reduce` (apenas opacity, sem transforms)

### TransitionOverlay — componente interno:
- Props: `phase` ('entering'|'holding'|'exiting'), `direction` ('login'|'logout')
- Fundo: `#0a0a0a` + radial gradients atmosféricos (mesmos da tela de login)
- Logo: 120px circular com:
  - Glow breathing (`ag-ember-pulse`)
  - Ember ring (`ag-glow-ring`)
  - Fallback SVG se logo falhar
- Texto: "Bem-vindo" (login) / "Até logo" (logout)
- Tagline: "Gastronomia & Experiência" (login) / "Sessão encerrada" (logout)
  - **ADAPTAR TAGLINE para a identidade do projeto alvo**
- Barra de progresso ember: gradient animado (`ag-bar-fill`)
- **Velocidade diferenciada:**
  - Login: animações normais (overlay 0.35s in, 0.45s out; logo 0.55s; barra 1.6s)
  - Logout: tudo mais rápido (overlay 0.22s in, 0.30s out; logo 0.35s; barra 0.5s)

### State Machine de Fases:

**Login (total ~2.3s):**
```
'login'              → Tela de login visível
'login-overlay-in'   → Overlay entra POR CIMA do login (350ms)
                       ⚠️ CRÍTICO: overlay entra SOBRE o login, NÃO depois dele sumir
                       Isso evita o "clarão" (flash branco entre telas)
'login-overlay-hold' → Overlay opaco. Dashboard monta INVISÍVEL atrás (pre-load)
                       ⚠️ CRÍTICO: o dashboard deve montar aqui com opacity:0
                       para pré-carregar dados do Supabase (~1450ms de buffer)
'login-overlay-out'  → Overlay sai. Dashboard já carregado faz fade in (500ms)
'dashboard'          → Dashboard limpo, overlay removido
```

**Logout (total ~1.05s — rápido):**
```
'dashboard'             → Dashboard visível
'logout-overlay-in'     → Overlay entra POR CIMA do dashboard (250ms)
'logout-overlay-hold'   → Overlay opaco, "Até logo" (450ms)
'logout-overlay-out'    → Overlay sai, login fade in (350ms)
'login'                 → Login limpo
```

### Timeline exata (setTimeout):
```javascript
// LOGIN
setPhase('login-overlay-in')
setTimeout → 'login-overlay-hold'  em 350ms
setTimeout → 'login-overlay-out'   em 1800ms
setTimeout → 'dashboard'           em 2300ms

// LOGOUT
setPhase('logout-overlay-in')
setTimeout → 'logout-overlay-hold' em 250ms
setTimeout → 'logout-overlay-out'  em 700ms
setTimeout → 'login'               em 1050ms
```

### ⚠️ REGRA ANTI-OSCILAÇÃO — Render Unificado:

**NUNCA use early returns separados para cada fase.** Isso causa remount do React e oscilação visual.

Use UM ÚNICO return com flags condicionais:
```javascript
const mountDashboard = phase é 'login-overlay-hold' | 'login-overlay-out' | 'dashboard' | 'logout-overlay-in' | 'logout-overlay-hold'
const dashboardVisible = phase é 'login-overlay-out' | 'dashboard' | 'logout-overlay-in'
const mountLogin = phase é 'login' | 'login-overlay-in' | 'logout-overlay-out'
const showOverlay = qualquer phase com 'overlay' no nome

return (
  <>
    {mountLogin && <LoginPage />}
    {mountDashboard && (
      <div style={{
        position: dashboardVisible ? 'relative' : 'fixed',
        opacity: dashboardVisible ? 1 : 0,
        pointerEvents: dashboardVisible ? 'auto' : 'none',
        zIndex: dashboardVisible ? undefined : -1,
        inset: dashboardVisible ? undefined : 0,
        animation: dashboardFadeIn ? 'ag-content-in 0.50s...' : 'none',
      }}>
        {children}
      </div>
    )}
    {showOverlay && <TransitionOverlay ... />}
  </>
)
```

### Detecção de transições:
```javascript
useEffect([user, loading]):
  if (!hadUser && hasUser && phase === 'login')     → runLoginTransition()
  if (hadUser && !hasUser && phase === 'dashboard') → runLogoutTransition()
  prevUserRef.current = user
```

### Cleanup:
- `timersRef` guarda todos os setTimeout IDs
- `clearTimers()` antes de iniciar nova sequência
- useEffect cleanup cancela todos os timers no unmount

---

## PARTE 4 — Botões Padronizados do Header

### Classe unificada `.hdr-pill`:
Todos os botões do header (tema, configurações, sair) usam a MESMA base visual:

```css
.hdr-pill {
  width: 50px; height: 28px; border-radius: 14px;
  border: none; cursor: pointer;
  background: var(--tog);
  color: var(--t2);
  position: relative;
  transition: background .25s, color .25s, box-shadow .25s;
}

.hdr-pill--icon {
  width: 36px;
  display: flex; align-items: center; justify-content: center;
}

.hdr-pill:hover {
  background: rgba(ACCENT, 0.12);
  color: ACCENT;
  box-shadow: 0 0 0 1px rgba(ACCENT, 0.25);
}

.hdr-pill--logout:hover {
  background: rgba(239,68,68,0.12);
  color: #f87171;
  box-shadow: 0 0 0 1px rgba(239,68,68,0.25);
}
```

### 3 botões no header (gap: 10px):

1. **Toggle tema** — `.hdr-pill` (50×28px)
   - Bolinha deslizante `.tog-th` (20×20px, position absolute)
   - Emoji lua/sol: dark='🌙', light='☀️'

2. **Configurações** — `.hdr-pill.hdr-pill--icon` (36×28px)
   - Ícone: SVG engrenagem inline (14×14px, `fill="currentColor"`)
   - Abre dropdown `.settings-dropdown` com:
     - E-mail do usuário (`.settings-user`)
     - Separador (`.settings-divider`)
     - Componente `ChangePassword`

3. **Sair** — `.hdr-pill.hdr-pill--icon.hdr-pill--logout` (36×28px)
   - Ícone: SVG porta com seta inline (14×14px, `stroke="currentColor"`)
   - `onClick={signOut}` direto

### Dark mode override:
```css
html[data-theme="dark"] .hdr-pill { background: #1C1C1C; }
```

---

## PARTE 5 — Alterar Senha (`src/components/ChangePassword.jsx`)

### Props:
```
updatePassword: async (newPassword: string) => void (throws on error)
```

### Campos:
- "Nova senha" — input password, min 6 caracteres
- "Confirmar senha" — input password, deve coincidir

### Validação (português):
- Menos de 6 caracteres → "A senha deve ter pelo menos 6 caracteres."
- Senhas diferentes → "As senhas não coincidem."
- Sucesso → "Senha alterada com sucesso!" (verde)
- Erro → mensagem do erro (vermelho)

### Estilo:
- Estilos inline (self-contained, sem arquivo CSS separado)
- Largura: 100% do dropdown (com padding)
- Botão: fundo accent do projeto

---

## PARTE 6 — Integração no `main.jsx`

```jsx
<React.StrictMode>
  <AuthProvider>
    <AuthGate>
      <SeuProviderDeFiltros>   {/* se houver */}
        <App />
      </SeuProviderDeFiltros>
    </AuthGate>
  </AuthProvider>
</React.StrictMode>
```

### No `App.jsx`:
- Importar `useAuthContext` para obter `user`, `signOut`, `updatePassword`
- Adicionar state: `settingsOpen`, `settingsRef`
- Adicionar `useEffect` para fechar dropdown em click fora
- Renderizar os 3 botões `.hdr-pill` no header

---

## PARTE 7 — Criar Usuário no Supabase

### Via Supabase MCP (SQL):
```sql
-- 1. Inserir usuário
INSERT INTO auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at,
  created_at, updated_at, confirmation_token,
  raw_app_meta_data, raw_user_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(), 'authenticated', 'authenticated',
  'EMAIL_AQUI',
  crypt('SENHA_AQUI', gen_salt('bf')),
  NOW(), NOW(), NOW(), '',
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb
);

-- 2. Criar identity
INSERT INTO auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
SELECT id, id, email, 'email',
  jsonb_build_object('sub', id::text, 'email', email),
  NOW(), NOW(), NOW()
FROM auth.users WHERE email = 'EMAIL_AQUI';

-- 3. ⚠️ FIX OBRIGATÓRIO — corrigir colunas NULL que quebram o login
UPDATE auth.users SET
  email_change = '', phone = '', phone_change = '',
  email_change_confirm_status = 0, is_sso_user = false
WHERE email = 'EMAIL_AQUI';
```

> **⚠️ SEM O PASSO 3, o login vai falhar** com erro:
> `sql: Scan error on column index 8, name "email_change": converting NULL to string is unsupported`

---

## CHECKLIST DE ADAPTAÇÃO

Ao aplicar este prompt em outro projeto, adapte:

- [ ] **Cores accent** — substituir `#E85D04` / `rgba(232,93,4,...)` pela cor principal do projeto
- [ ] **Cor hover logout** — manter vermelho (#ef4444) ou ajustar
- [ ] **Fontes** — substituir `'Playfair Display'` e `'DM Sans'` pelas fontes do projeto
- [ ] **Textos da tagline** — "Gastronomia & Experiência" → tagline do projeto
- [ ] **Textos do overlay** — "Bem-vindo" / "Até logo" → adaptar se necessário
- [ ] **Footer do login** — "Agência RDG © {ano}" → adaptar responsável
- [ ] **Logo path** — verificar se `/logo.png` existe no `public/`
- [ ] **Variáveis CSS** — garantir que existem: `--tog`, `--card`, `--border`, `--t1`, `--t2`
- [ ] **Credenciais** — definir e-mail e senha do primeiro usuário
- [ ] **Nome da tabela Supabase** — verificar se o projeto usa o mesmo client `supabase.js`
- [ ] **Extensão `.jsx`** — useAuth DEVE ser `.jsx`, não `.js` (contém JSX)
