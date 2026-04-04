import { memo, useState } from 'react'
import { normTipo, normFeedback, normTurno } from '../lib/utils'
import { TipoBadge } from './Badges'

function fmtData(data) {
  if (!data) return '--'
  const [y, m, d] = data.split('-')
  return `${d}/${m}/${y}`
}

function fmtHora(h) {
  return h ? h.slice(0, 5) : '--'
}

function capitalize(s) {
  if (!s) return '--'
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function cortesiaAniversario(qtd) {
  if (qtd == null) return 'Perguntar qtd de pessoas para definir cortesia'
  if (qtd <= 4) return 'Cortesia: 1 drink'
  if (qtd <= 10) return 'Cortesia: 2 drinks + flyer'
  if (qtd <= 19) return 'Cortesia: rodízio grátis p/ aniversariante + flyer'
  return 'Cortesia: rodízio grátis + 2 drinks + flyer + balão'
}

function FeedbackBadge({ fb }) {
  const n = normFeedback(fb)
  if (n == null) return (
    <span style={{
      padding: '3px 10px', borderRadius: 4, fontSize: 13, fontWeight: 600,
      background: 'rgba(150, 150, 150, 0.08)', color: 'var(--t3)', opacity: 0.6,
    }}>
      Sem feedback
    </span>
  )
  const styles = {
    Positivo: { bg: 'rgba(74, 222, 128, 0.15)', color: 'var(--success, #4ade80)' },
    Negativo: { bg: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger, #ef4444)' },
    Neutro: { bg: 'rgba(150, 150, 150, 0.15)', color: 'var(--t3)' },
  }
  const s = styles[n] || styles.Neutro
  return (
    <span style={{
      padding: '3px 10px',
      borderRadius: 4,
      fontSize: 13,
      fontWeight: 600,
      background: s.bg,
      color: s.color,
    }}>
      {n}
    </span>
  )
}

function EyeToggle({ visible, onClick }) {
  return (
    <button onClick={onClick} title={visible ? 'Ocultar dados' : 'Mostrar dados'} style={{
      background: 'none', border: 'none', cursor: 'pointer', padding: 4,
      color: 'var(--t3)', display: 'flex', alignItems: 'center',
      transition: 'color 0.2s',
    }}>
      {visible ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
      )}
    </button>
  )
}

function DetailPanelInner({ item, onClose, onOpenConversa }) {
  const [infoVisible, setInfoVisible] = useState(true)

  if (!item) {
    return (
      <div className="detail-panel detail-panel--empty" style={{
        width: '100%',
        height: '100%',
        background: 'var(--card)',
        border: '1px dashed var(--border)',
        borderRadius: 16,
        transition: 'background 0.35s, border-color 0.35s',
        opacity: 0.7,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--t3)',
          textAlign: 'center',
          padding: '20px 28px',
          gap: 6,
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5, marginBottom: 4 }}>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="9" y1="9" x2="15" y2="9" />
            <line x1="9" y1="13" x2="13" y2="13" />
          </svg>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Selecione uma reserva para ver os detalhes</div>
          <div style={{ fontSize: 11, opacity: 0.7 }}>Clique em qualquer item da lista de reservas</div>
        </div>
      </div>
    )
  }

  return (
    <div className="detail-panel" style={{
      width: '100%',
      height: '100%',
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      overflowY: 'auto',
      transition: 'transform 0.2s ease-out, background 0.35s, border-color 0.35s',
      boxShadow: 'var(--card-glow, none)',
    }}>
        <div style={{ padding: 16 }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
            paddingBottom: 10,
            borderBottom: '1px solid var(--border)',
          }}>
            <div style={{
              fontSize: 17,
              fontWeight: 700,
              color: 'var(--t1)',
            }}>
              {item.nome_cliente || item.numero_cliente || 'Cliente'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <EyeToggle visible={infoVisible} onClick={() => setInfoVisible(v => !v)} />
              <button onClick={onClose} style={{
                background: 'none',
                border: 'none',
                color: 'var(--t2)',
                cursor: 'pointer',
                fontSize: 18,
                padding: 4,
                lineHeight: 1,
              }}>✕</button>
            </div>
          </div>

          {/* Conteúdo com blur toggle */}
          <div style={{
            filter: infoVisible ? 'none' : 'blur(6px)',
            opacity: infoVisible ? 1 : 0.5,
            transition: 'filter 0.3s, opacity 0.3s',
            userSelect: infoVisible ? 'auto' : 'none',
            pointerEvents: infoVisible ? 'auto' : 'none',
          }}>

          {/* Grid 2x3 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            marginBottom: 16,
          }}>
            <Field label="TELEFONE" value={item.numero_cliente || '--'} />
            <Field label="DATA" value={fmtData(item.data)} />
            <Field label="HORA" value={fmtHora(item.hora)} />
            <Field label="TURNO" value={normTurno(item.turno)} />
            <Field label="TIPO">
              <TipoBadge tipo={normTipo(item.tipo_atendimento)} />
            </Field>
            <Field label="RESERVA" value={item.reserva_solicitada ? 'Sim' : 'Não'} />
          </div>

          {/* Aniversário */}
          {item.eh_aniversario && (
            <div style={{
              background: 'rgba(232, 160, 32, 0.08)',
              border: '1px solid rgba(232, 160, 32, 0.2)',
              borderRadius: 8,
              padding: '10px 14px',
              marginBottom: 12,
            }}>
              <div style={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#e8a020',
                marginBottom: 6,
              }}>
                🎂 Aniversário
              </div>
              <div style={{
                fontSize: 14,
                color: 'var(--t1)',
              }}>
                {cortesiaAniversario(item.qtd_pessoas)}
              </div>
              {item.qtd_pessoas != null && (
                <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 4 }}>
                  Grupo de {item.qtd_pessoas} pessoa{item.qtd_pessoas !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          )}

          {/* Qtd pessoas (quando não é aniversário) */}
          {!item.eh_aniversario && item.qtd_pessoas != null && (
            <div style={{ marginBottom: 10 }}>
              <Field label="PESSOAS NO GRUPO" value={`${item.qtd_pessoas} pessoa${item.qtd_pessoas !== 1 ? 's' : ''}`} />
            </div>
          )}

          {/* Feedback */}
          <div style={{ marginBottom: 10 }}>
            <div style={{
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--t3)',
              marginBottom: 5,
            }}>
              FEEDBACK
            </div>
            <FeedbackBadge fb={item.feedback_empresa} />
          </div>

          {/* Fora do horário */}
          <Field label="FORA DO HORÁRIO" value={item.fora_horario ? 'Sim' : 'Não'} />

          {/* Métricas de sessão */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
            marginTop: 10,
            paddingTop: 10,
            borderTop: '1px solid var(--border)',
          }}>
            {item.tempo_resposta_ms != null && (
              <Field label="TEMPO RESPOSTA" value={item.tempo_resposta_ms < 1000
                ? `${item.tempo_resposta_ms}ms`
                : `${(item.tempo_resposta_ms / 1000).toFixed(1)}s`} />
            )}
            {item.qtd_mensagens_sessao != null && (
              <Field label="MENSAGENS" value={`${item.qtd_mensagens_sessao} msg${item.qtd_mensagens_sessao !== 1 ? 's' : ''}`} />
            )}
          </div>

          {/* Data reserva pedida — só destaca se é reserva real */}
          {item.data_reserva_pedida && (
            <div style={{ marginTop: 10 }}>
              {item.reserva_solicitada
                ? <Field label="RESERVA PARA" value={fmtData(item.data_reserva_pedida)} highlight />
                : <Field label="DATA MENCIONADA" value={fmtData(item.data_reserva_pedida)} />
              }
            </div>
          )}

          {/* Botão Ver Conversa */}
          {onOpenConversa && (
            <button
              onClick={() => onOpenConversa(item)}
              style={{
                marginTop: 14,
                width: '100%',
                padding: '8px 14px',
                background: 'rgba(232,93,4,0.12)',
                border: '1px solid rgba(232,93,4,0.3)',
                borderRadius: 8,
                color: '#F97316',
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: '0.05em',
                cursor: 'pointer',
                transition: 'background .18s, border-color .18s',
              }}
              onMouseEnter={e => { e.target.style.background = 'rgba(232,93,4,0.2)'; e.target.style.borderColor = 'rgba(232,93,4,0.5)' }}
              onMouseLeave={e => { e.target.style.background = 'rgba(232,93,4,0.12)'; e.target.style.borderColor = 'rgba(232,93,4,0.3)' }}
            >
              💬 Ver Conversa
            </button>
          )}
          </div>{/* fecha blur wrapper */}
        </div>
    </div>
  )
}

function Field({ label, value, children, highlight }) {
  return (
    <div>
      <div style={{
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'var(--t3)',
        marginBottom: 3,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 15,
        color: highlight ? '#e8a020' : 'var(--t1)',
        fontWeight: highlight ? 600 : 500,
      }}>
        {children || value}
      </div>
    </div>
  )
}

export const DetailPanel = memo(DetailPanelInner)
