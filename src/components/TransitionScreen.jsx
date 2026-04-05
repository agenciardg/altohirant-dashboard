import { useEffect, useState } from 'react'

export function TransitionScreen({ type = 'login', onComplete }) {
  const [phase, setPhase] = useState('enter') // enter -> exit

  useEffect(() => {
    const duration = type === 'login' ? 2200 : 1200
    const timer = setTimeout(() => {
      setPhase('exit')
      setTimeout(onComplete, 400)
    }, duration)
    return () => clearTimeout(timer)
  }, [type, onComplete])

  const isLogin = type === 'login'

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0a0a0a',
      background: [
        'radial-gradient(ellipse 70% 50% at 50% -8%, rgba(232,93,4,0.18) 0%, transparent 62%)',
        'radial-gradient(ellipse 45% 35% at 82% 92%, rgba(220,38,38,0.10) 0%, transparent 58%)',
        'radial-gradient(ellipse 35% 25% at 18% 88%, rgba(232,93,4,0.10) 0%, transparent 52%)',
        'radial-gradient(ellipse 25% 20% at 92% 10%, rgba(180,50,0,0.07) 0%, transparent 50%)',
        '#0a0a0a',
      ].join(', '),
      opacity: phase === 'exit' ? 0 : 1,
      transition: 'opacity 0.4s ease',
    }}>

      {/* Logo */}
      <div style={{
        animation: 'ts-fadeSlideUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.1s both',
        marginBottom: 20,
      }}>
        <img
          src="/logo.png"
          alt="Alto da Hirant"
          style={{
            height: 80,
            width: 80,
            borderRadius: '50%',
            objectFit: 'cover',
            filter: 'drop-shadow(0 0 32px rgba(232,93,4,0.35))',
          }}
          onError={(e) => {
            e.target.style.display = 'none'
          }}
        />
      </div>

      {/* Decorative divider */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16,
        animation: 'ts-fadeIn 0.4s ease 0.4s both',
      }}>
        <div style={{
          width: 40,
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(232,93,4,0.35))',
        }} />
        <div style={{
          width: 5,
          height: 5,
          transform: 'rotate(45deg)',
          background: '#E85D04',
          opacity: 0.6,
          boxShadow: '0 0 6px rgba(232,93,4,0.5)',
        }} />
        <div style={{
          width: 40,
          height: 1,
          background: 'linear-gradient(90deg, rgba(232,93,4,0.35), transparent)',
        }} />
      </div>

      {/* Main text */}
      <div style={{
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 600,
        fontSize: 17,
        textTransform: 'uppercase',
        letterSpacing: '0.14em',
        color: '#f0ece4',
        textShadow: '0 0 40px rgba(232,93,4,0.25)',
        animation: 'ts-fadeIn 0.5s ease 0.3s both',
      }}>
        {isLogin ? 'Bem-vindo' : 'Até logo'}
      </div>

      {/* Subtitle */}
      <div style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 11,
        color: '#9a9590',
        marginTop: 6,
        letterSpacing: '0.08em',
        animation: 'ts-fadeIn 0.4s ease 0.5s both',
      }}>
        {isLogin ? 'Preparando sua mesa...' : 'Sessão encerrada'}
      </div>

      {/* Progress bar */}
      <div style={{
        width: 180,
        height: 3,
        borderRadius: 3,
        background: 'rgba(255,255,255,0.06)',
        marginTop: 24,
        overflow: 'hidden',
        animation: 'ts-fadeIn 0.3s ease 0.2s both',
      }}>
        <div style={{
          height: '100%',
          borderRadius: 3,
          background: 'linear-gradient(90deg, #DC2626, #E85D04, #F97316)',
          animation: `ts-progressFill ${isLogin ? '1.6s' : '0.55s'} cubic-bezier(0.22,1,0.36,1) 0.2s both`,
        }} />
      </div>

      <style>{`
        @keyframes ts-fadeSlideUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ts-fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes ts-progressFill {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="ts-fadeSlideUp"],
          [style*="ts-fadeIn"],
          [style*="ts-progressFill"] {
            animation: none !important;
            opacity: 1 !important;
          }
        }
      `}</style>
    </div>
  )
}
