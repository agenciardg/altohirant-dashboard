import { useState, useEffect, useRef } from 'react'
import { useAuthContext } from '../lib/useAuth.jsx'
import LoginPage from './LoginPage.jsx'

/* ─────────────────────────────────────────────────────────────────────────────
   ERROR TRANSLATION MAP
   ───────────────────────────────────────────────────────────────────────────── */
const ERROR_MAP = {
  'Invalid login credentials': 'E-mail ou senha incorretos.',
  'Email not confirmed': 'E-mail ainda não confirmado. Verifique sua caixa de entrada.',
  'Invalid email or password': 'E-mail ou senha incorretos.',
  'User not found': 'Nenhuma conta encontrada com este e-mail.',
  'Too many requests': 'Muitas tentativas. Aguarde alguns minutos.',
  'Email rate limit exceeded': 'Limite de tentativas excedido. Tente novamente mais tarde.',
  'Network request failed': 'Erro de conexão. Verifique sua internet.',
}

function translateError(msg) {
  if (!msg) return 'Credenciais inválidas.'
  for (const [key, val] of Object.entries(ERROR_MAP)) {
    if (msg.toLowerCase().includes(key.toLowerCase())) return val
  }
  return 'Credenciais inválidas. Verifique e tente novamente.'
}

/* ─────────────────────────────────────────────────────────────────────────────
   KEYFRAME STYLES — injected once into <head>
   ───────────────────────────────────────────────────────────────────────────── */
const KEYFRAMES = `
  @keyframes ag-overlay-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes ag-overlay-out {
    from { opacity: 1; }
    to   { opacity: 0; }
  }

  @keyframes ag-logo-appear {
    0%   { opacity: 0; transform: scale(0.88); }
    60%  { opacity: 1; transform: scale(1.04); }
    100% { opacity: 1; transform: scale(1);    }
  }

  @keyframes ag-ember-pulse {
    0%, 100% { box-shadow: 0 0 0px 0px rgba(232, 93, 4, 0); }
    50%       { box-shadow: 0 0 60px 24px rgba(232, 93, 4, 0.28); }
  }

  @keyframes ag-glow-ring {
    0%, 100% { opacity: 0.20; transform: scale(1);    }
    50%       { opacity: 0.55; transform: scale(1.12); }
  }

  @keyframes ag-welcome-in {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0);    }
  }

  @keyframes ag-bar-fill {
    from { width: 0%; }
    to   { width: 100%; }
  }

  @keyframes ag-content-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @media (prefers-reduced-motion: reduce) {
    @keyframes ag-overlay-in    { from { opacity: 0; } to { opacity: 1; } }
    @keyframes ag-overlay-out   { from { opacity: 1; } to { opacity: 0; } }
    @keyframes ag-logo-appear   { from { opacity: 0; } to { opacity: 1; } }
    @keyframes ag-welcome-in    { from { opacity: 0; } to { opacity: 1; } }
    @keyframes ag-content-in    { from { opacity: 0; } to { opacity: 1; } }
    @keyframes ag-ember-pulse   { 0%, 100% { opacity: 1; } }
    @keyframes ag-glow-ring     { 0%, 100% { opacity: 0.35; } }
    @keyframes ag-bar-fill      { from { width: 0%; } to { width: 100%; } }
  }
`

let keyframesInjected = false
function ensureKeyframes() {
  if (keyframesInjected) return
  const style = document.createElement('style')
  style.setAttribute('data-ag-transitions', '')
  style.textContent = KEYFRAMES
  document.head.appendChild(style)
  keyframesInjected = true
}

/* ─────────────────────────────────────────────────────────────────────────────
   TRANSITION OVERLAY
   Branded interstitial screen.
   phase: 'entering' | 'holding' | 'exiting'
   direction: 'login' (entering app) | 'logout' (leaving app)
   ───────────────────────────────────────────────────────────────────────────── */
function TransitionOverlay({ phase, direction = 'login' }) {
  const [imgFailed, setImgFailed] = useState(false)

  const fast = direction === 'logout'
  const overlayAnimation =
    phase === 'entering'
      ? `ag-overlay-in ${fast ? '0.22s' : '0.35s'} cubic-bezier(0.16, 1, 0.3, 1) both`
      : phase === 'exiting'
      ? `ag-overlay-out ${fast ? '0.30s' : '0.45s'} cubic-bezier(0.4, 0, 0.2, 1) both`
      : 'none'

  const title = direction === 'login' ? 'Bem-vindo' : 'Até logo'
  const tagline = direction === 'login'
    ? 'Gastronomia & Experiência'
    : 'Sessão encerrada'

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
        animation: overlayAnimation,
        backgroundImage: [
          'radial-gradient(ellipse 70% 50% at 50% -8%, rgba(232,93,4,0.16) 0%, transparent 62%)',
          'radial-gradient(ellipse 45% 35% at 82% 92%, rgba(220,38,38,0.09) 0%, transparent 58%)',
          'radial-gradient(ellipse 35% 25% at 18% 88%, rgba(232,93,4,0.09) 0%, transparent 52%)',
        ].join(', '),
      }}
    >
      {/* ── Logo container with pulsing glow ring ── */}
      <div
        style={{
          position: 'relative',
          width: 120,
          height: 120,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: `ag-logo-appear ${fast ? '0.35s' : '0.55s'} cubic-bezier(0.16, 1, 0.3, 1) ${fast ? '0.05s' : '0.1s'} both`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: -20,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(232,93,4,0.28) 0%, transparent 68%)',
            animation: 'ag-ember-pulse 1.8s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: -18,
            borderRadius: '50%',
            border: '1px solid rgba(232,93,4,0.22)',
            animation: 'ag-glow-ring 1.8s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
        {imgFailed ? (
          <svg width={120} height={120} viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ position: 'relative', zIndex: 1 }}>
            <defs>
              <linearGradient id="ag-fg" x1="24" y1="40" x2="24" y2="8" gradientUnits="userSpaceOnUse">
                <stop offset="0%"   stopColor="#DC2626" />
                <stop offset="48%"  stopColor="#E85D04" />
                <stop offset="100%" stopColor="#F97316" />
              </linearGradient>
            </defs>
            <circle cx="24" cy="24" r="22.5" stroke="#f0ece4" strokeWidth="1.5" fill="none" />
            <path d="M24 39 C17 35 13 28 15.5 21 C17 16 20 12.5 24 10 C24 10 21.5 17 25 20.5 C26.2 18.2 27.5 15.5 28.5 13.5 C31 18 32 23.5 29.5 28 C33 24.5 33 20 31.5 17 C35 21.5 36 28 32.5 32 C30 36 27 39 24 39Z" fill="url(#ag-fg)" />
            <path d="M24 35 C21 32 20 28 22 23.5 C23.2 26.5 25 28 25 31 C27 28.5 27 25.5 26 23 C28 25.5 29 29 27 32.5 C26 34.5 25 35.5 24 35Z" fill="rgba(255,255,255,0.28)" />
          </svg>
        ) : (
          <img
            src="/logo.png"
            alt="Alto da Hirant"
            onError={() => setImgFailed(true)}
            style={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              objectFit: 'cover',
              border: 'none',
              position: 'relative',
              zIndex: 1,
              filter: 'drop-shadow(0 0 36px rgba(232,93,4,0.30))',
            }}
          />
        )}
      </div>

      {/* ── Title text ── */}
      <p
        style={{
          marginTop: 28,
          fontFamily: "'Playfair Display', serif",
          fontSize: '1.35rem',
          fontWeight: 600,
          letterSpacing: '0.20em',
          textTransform: 'uppercase',
          color: '#f0ece4',
          textShadow: '0 0 48px rgba(232,93,4,0.28), 0 2px 8px rgba(0,0,0,0.6)',
          animation: `ag-welcome-in ${fast ? '0.30s' : '0.55s'} cubic-bezier(0.16, 1, 0.3, 1) ${fast ? '0.12s' : '0.32s'} both`,
        }}
      >
        {title}
      </p>

      {/* ── Tagline ── */}
      <p
        style={{
          marginTop: 8,
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '0.65rem',
          fontWeight: 500,
          letterSpacing: '0.34em',
          textTransform: 'uppercase',
          color: '#E85D04',
          opacity: 0.72,
          animation: `ag-welcome-in ${fast ? '0.30s' : '0.55s'} cubic-bezier(0.16, 1, 0.3, 1) ${fast ? '0.18s' : '0.44s'} both`,
        }}
      >
        {tagline}
      </p>

      {/* ── Ember progress bar ── */}
      <div
        style={{
          marginTop: 40,
          width: 160,
          height: 2,
          borderRadius: 99,
          background: 'rgba(255,255,255,0.06)',
          overflow: 'hidden',
          animation: `ag-welcome-in ${fast ? '0.25s' : '0.4s'} cubic-bezier(0.16, 1, 0.3, 1) ${fast ? '0.2s' : '0.5s'} both`,
        }}
      >
        <div
          style={{
            height: '100%',
            width: '0%',
            borderRadius: 99,
            background: 'linear-gradient(90deg, #c94e02, #E85D04, #f97316)',
            boxShadow: '0 0 8px rgba(232,93,4,0.6)',
            animation: `ag-bar-fill ${fast ? '0.5s' : '1.6s'} cubic-bezier(0.4, 0, 0.6, 1) ${fast ? '0.2s' : '0.5s'} both`,
          }}
        />
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   AUTH GATE — main export

   Login phases (overlay entra POR CIMA do login — sem clarão):
     'login'           — LoginPage visível
     'login-overlay-in'— Overlay entra por cima do login (350ms)
     'login-overlay-hold'— Overlay opaco, "Bem-vindo" (1000ms)
     'login-overlay-out'— Overlay sai, dashboard aparece por baixo (450ms)
     'dashboard'       — Dashboard limpo

   Logout phases (espelha o login):
     'dashboard'       — Dashboard visível
     'logout-overlay-in'  — Overlay entra por cima do dashboard (350ms)
     'logout-overlay-hold'— Overlay opaco, "Até logo" (800ms)
     'logout-overlay-out' — Overlay sai, login aparece por baixo (450ms)
     'login'              — Login limpo
   ───────────────────────────────────────────────────────────────────────────── */
export function AuthGate({ children }) {
  const { user, loading, signIn } = useAuthContext()

  const [phase, setPhase] = useState(null)
  const prevUserRef = useRef(null)
  const timersRef = useRef([])

  useEffect(() => { ensureKeyframes() }, [])
  useEffect(() => {
    return () => { timersRef.current.forEach(clearTimeout) }
  }, [])

  /* Resolve initial phase */
  useEffect(() => {
    if (loading) return
    if (phase === null) {
      setPhase(user ? 'dashboard' : 'login')
      prevUserRef.current = user
    }
  }, [loading]) // eslint-disable-line react-hooks/exhaustive-deps

  /* Detect auth transitions */
  useEffect(() => {
    if (loading || phase === null) return
    const hadUser = prevUserRef.current !== null
    const hasUser = Boolean(user)

    if (!hadUser && hasUser && phase === 'login') {
      runLoginTransition()
    } else if (hadUser && !hasUser && phase === 'dashboard') {
      runLogoutTransition()
    }

    prevUserRef.current = user
  }, [user, loading]) // eslint-disable-line react-hooks/exhaustive-deps

  function clearTimers() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  function runLoginTransition() {
    /*
      0ms    — overlay entra POR CIMA do login (sem clarão)
      350ms  — overlay opaco + dashboard monta INVISÍVEL atrás (pre-load)
      1800ms — overlay sai, dashboard já carregado aparece
      2300ms — dashboard limpo
    */
    clearTimers()
    setPhase('login-overlay-in')

    timersRef.current = [
      setTimeout(() => setPhase('login-overlay-hold'),  350),
      setTimeout(() => setPhase('login-overlay-out'),   1800),
      setTimeout(() => setPhase('dashboard'),           2300),
    ]
  }

  function runLogoutTransition() {
    /*
      0ms    — overlay entra POR CIMA do dashboard
      250ms  — overlay totalmente opaco, hold
      700ms  — overlay sai, login fade in por baixo
      1050ms — login limpo
    */
    clearTimers()
    setPhase('logout-overlay-in')

    timersRef.current = [
      setTimeout(() => setPhase('logout-overlay-hold'),  250),
      setTimeout(() => setPhase('logout-overlay-out'),   700),
      setTimeout(() => setPhase('login'),                1050),
    ]
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0a',
        color: '#9a9590',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '14px',
        letterSpacing: '.05em',
      }}>
        Carregando...
      </div>
    )
  }

  if (phase === null) {
    return <div style={{ minHeight: '100vh', background: '#0a0a0a' }} />
  }

  /* ── Login handler ── */
  const handleLogin = async (email, password) => {
    try {
      await signIn(email, password)
    } catch (err) {
      return { error: translateError(err.message) }
    }
  }

  /* ─────────────────────────────────────────────────────────────────
     RENDER — unified single return
     O dashboard NUNCA é desmontado depois que monta (evita oscilação).
     Tudo é controlado por visibilidade e z-index.
     ────────────────────────────────────────────────────────────────── */

  /* Quando o dashboard deve estar montado (inclui pre-load invisível) */
  const mountDashboard =
    phase === 'login-overlay-hold' ||
    phase === 'login-overlay-out' ||
    phase === 'dashboard' ||
    phase === 'logout-overlay-in' ||
    phase === 'logout-overlay-hold'

  /* Quando o dashboard deve estar visível */
  const dashboardVisible =
    phase === 'login-overlay-out' ||
    phase === 'dashboard' ||
    phase === 'logout-overlay-in'

  /* Quando o login deve estar montado */
  const mountLogin =
    phase === 'login' ||
    phase === 'login-overlay-in' ||
    phase === 'logout-overlay-out'

  /* Overlay state */
  const showOverlay =
    phase === 'login-overlay-in' ||
    phase === 'login-overlay-hold' ||
    phase === 'login-overlay-out' ||
    phase === 'logout-overlay-in' ||
    phase === 'logout-overlay-hold' ||
    phase === 'logout-overlay-out'

  const overlayPhase =
    (phase === 'login-overlay-in' || phase === 'logout-overlay-in')     ? 'entering' :
    (phase === 'login-overlay-hold' || phase === 'logout-overlay-hold') ? 'holding'  :
    (phase === 'login-overlay-out' || phase === 'logout-overlay-out')   ? 'exiting'  : 'holding'

  const overlayDirection = phase.startsWith('logout') ? 'logout' : 'login'

  /* Dashboard está em fade-in (primeira vez visível após pre-load) */
  const dashboardFadeIn = phase === 'login-overlay-out'

  return (
    <>
      {/* ── Login page ── */}
      {mountLogin && (
        <LoginPage onLogin={handleLogin} />
      )}

      {/* ── Dashboard — monta uma vez e NUNCA desmonta durante transição ── */}
      {mountDashboard && (
        <div style={{
          position: dashboardVisible ? 'relative' : 'fixed',
          inset: dashboardVisible ? undefined : 0,
          zIndex: dashboardVisible ? undefined : -1,
          opacity: dashboardVisible ? 1 : 0,
          pointerEvents: dashboardVisible ? 'auto' : 'none',
          animation: dashboardFadeIn
            ? 'ag-content-in 0.50s cubic-bezier(0.16, 1, 0.3, 1) both'
            : 'none',
        }}>
          {children}
        </div>
      )}

      {/* ── Transition overlay ── */}
      {showOverlay && (
        <TransitionOverlay phase={overlayPhase} direction={overlayDirection} />
      )}
    </>
  )
}
