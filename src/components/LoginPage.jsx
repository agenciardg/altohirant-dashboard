import { useState, useCallback } from 'react'
import '../styles/login.css'

/* ── Inline FlameLogo — fallback if /logo.png fails to load ── */
function FlameLogo({ size = 96 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="login-fg" x1="24" y1="40" x2="24" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#DC2626" />
          <stop offset="48%"  stopColor="#E85D04" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="22.5" stroke="#f0ece4" strokeWidth="1.5" fill="none" />
      <path
        d="M24 39 C17 35 13 28 15.5 21 C17 16 20 12.5 24 10 C24 10 21.5 17 25 20.5 C26.2 18.2 27.5 15.5 28.5 13.5 C31 18 32 23.5 29.5 28 C33 24.5 33 20 31.5 17 C35 21.5 36 28 32.5 32 C30 36 27 39 24 39Z"
        fill="url(#login-fg)"
      />
      <path
        d="M24 35 C21 32 20 28 22 23.5 C23.2 26.5 25 28 25 31 C27 28.5 27 25.5 26 23 C28 25.5 29 29 27 32.5 C26 34.5 25 35.5 24 35Z"
        fill="rgba(255,255,255,0.28)"
      />
    </svg>
  )
}

/* ── Alert icon — inline SVG, no external dependency ── */
function AlertIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
        clipRule="evenodd"
      />
    </svg>
  )
}

/* ════════════════════════════════════════════════════════════════
   LoginPage
   Props:
     onLogin: async (email: string, password: string) => { error?: string }
   ════════════════════════════════════════════════════════════════ */
export default function LoginPage({ onLogin }) {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [imgFailed, setImgFailed] = useState(false)
  const [showPass, setShowPass]   = useState(false)

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      setError('')

      if (!email.trim()) {
        setError('Por favor, informe o e-mail.')
        return
      }
      if (!password) {
        setError('Por favor, informe a senha.')
        return
      }

      setLoading(true)
      try {
        const result = await onLogin(email.trim(), password)
        if (result?.error) {
          setError(result.error)
        }
      } catch (err) {
        setError('Ocorreu um erro inesperado. Tente novamente.')
        console.error('[LoginPage] onLogin threw:', err)
      } finally {
        setLoading(false)
      }
    },
    [email, password, onLogin]
  )

  const hasError = Boolean(error)

  return (
    <div className="login-root" role="main">
      <div
        className="login-card"
        role="region"
        aria-label="Acesso ao painel"
      >

        {/* ── Brand header — stagger slot 0 ── */}
        <header className="login-header">
          <div className="login-logo-wrap" aria-hidden="true">
            {imgFailed ? (
              <FlameLogo size={96} />
            ) : (
              <img
                src="/logo.png"
                alt="Alto da Hirant"
                className="login-logo-img"
                onError={() => setImgFailed(true)}
              />
            )}
          </div>

          <div className="login-brand">
            <h1 className="login-brand-name">Alto da Hirant</h1>
            <p className="login-brand-tagline">Gastronomia &amp; Experiência</p>
          </div>
        </header>

        {/* ── Decorative divider — stagger slot 1 ── */}
        <div className="login-divider" aria-hidden="true">
          <span className="login-divider-line" />
          <span className="login-divider-dot" />
          <span className="login-divider-line" />
        </div>

        {/* ── Form ── */}
        <form
          className="login-form"
          onSubmit={handleSubmit}
          noValidate
          aria-label="Formulário de login"
        >
          {/* E-mail field — stagger slot 2 */}
          <div className="login-field">
            <label className="login-label" htmlFor="login-email">
              E-mail
            </label>
            <div className="login-input-wrap">
              <input
                id="login-email"
                className={`login-input${hasError ? ' is-error' : ''}`}
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                disabled={loading}
                aria-required="true"
                aria-invalid={hasError}
                aria-describedby={hasError ? 'login-error-msg' : undefined}
              />
            </div>
          </div>

          {/* Password field — stagger slot 3 */}
          <div className="login-field">
            <label className="login-label" htmlFor="login-password">
              Senha
            </label>
            <div className="login-input-wrap">
              <input
                id="login-password"
                className={`login-input login-input--pass${hasError ? ' is-error' : ''}`}
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                disabled={loading}
                aria-required="true"
                aria-invalid={hasError}
                aria-describedby={hasError ? 'login-error-msg' : undefined}
              />
              <button
                type="button"
                className="login-eye"
                onClick={() => setShowPass(v => !v)}
                aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
                tabIndex={-1}
              >
                {showPass ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error message */}
          {hasError && (
            <div
              id="login-error-msg"
              className="login-error"
              role="alert"
              aria-live="assertive"
            >
              <AlertIcon className="login-error-icon" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit — stagger slot 4 */}
          <button
            type="submit"
            className="login-btn"
            disabled={loading}
            aria-busy={loading}
            aria-label={loading ? 'Entrando...' : 'Entrar no painel'}
          >
            <span className="login-btn-inner">
              {loading && (
                <span className="login-spinner" aria-hidden="true" />
              )}
              <span>{loading ? 'Entrando...' : 'Entrar'}</span>
            </span>
          </button>
        </form>

        {/* ── Footer — stagger slot 5 ── */}
        <div className="login-footer-wrap">
          <div className="login-footer-rule" aria-hidden="true" />
          <p className="login-footer">
            Acesso restrito a <strong>colaboradores autorizados</strong>.
            <br />
            Agência RDG &copy; {new Date().getFullYear()}
          </p>
        </div>

      </div>
    </div>
  )
}
