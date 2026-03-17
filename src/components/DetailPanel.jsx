import { memo } from 'react'
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
  const styles = {
    Positivo: { bg: 'rgba(74, 222, 128, 0.15)', color: 'var(--success, #4ade80)' },
    Negativo: { bg: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger, #ef4444)' },
    Neutro: { bg: 'rgba(150, 150, 150, 0.15)', color: 'var(--t3)' },
  }
  const s = styles[n] || styles.Neutro
  return (
    <span style={{
      padding: '0.2rem 0.6rem',
      borderRadius: 4,
      fontSize: '0.8rem',
      fontWeight: 600,
      background: s.bg,
      color: s.color,
    }}>
      {n}
    </span>
  )
}

function DetailPanelInner({ item, onClose }) {
  return (
    <div className="detail-panel" style={{
      width: 380,
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      overflowY: 'auto',
      transition: 'transform 0.2s ease-out, background 0.35s, border-color 0.35s',
      boxShadow: 'var(--card-glow, none)',
    }}>
      {!item ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          minHeight: 300,
          color: 'var(--t3)',
          fontSize: '0.85rem',
          textAlign: 'center',
          padding: '2rem',
        }}>
          Selecione um atendimento para ver detalhes
        </div>
      ) : (
        <div style={{ padding: '1.25rem' }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid var(--border)',
          }}>
            <div style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: 'var(--t1)',
            }}>
              {item.nome_cliente || item.numero_cliente || 'Cliente'}
            </div>
            <button onClick={onClose} style={{
              background: 'none',
              border: 'none',
              color: 'var(--t2)',
              cursor: 'pointer',
              fontSize: '1.1rem',
              padding: '0.25rem',
              lineHeight: 1,
            }}>✕</button>
          </div>

          {/* Grid 2x3 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            marginBottom: '1.25rem',
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
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
            }}>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#e8a020',
                marginBottom: '0.4rem',
              }}>
                🎂 Aniversário
              </div>
              <div style={{
                fontSize: '0.85rem',
                color: 'var(--t1)',
              }}>
                {cortesiaAniversario(item.qtd_pessoas)}
              </div>
              {item.qtd_pessoas != null && (
                <div style={{ fontSize: '0.75rem', color: 'var(--t2)', marginTop: '0.25rem' }}>
                  Grupo de {item.qtd_pessoas} pessoa{item.qtd_pessoas !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          )}

          {/* Feedback */}
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--t3)',
              marginBottom: '0.3rem',
            }}>
              FEEDBACK
            </div>
            <FeedbackBadge fb={item.feedback_empresa} />
          </div>

          {/* Fora do horário */}
          <Field label="FORA DO HORÁRIO" value={item.fora_horario ? 'Sim' : 'Não'} />

          {/* Data reserva pedida */}
          {item.data_reserva_pedida && (
            <div style={{ marginTop: '0.75rem' }}>
              <Field label="RESERVA PARA" value={fmtData(item.data_reserva_pedida)} highlight />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Field({ label, value, children, highlight }) {
  return (
    <div>
      <div style={{
        fontSize: '0.7rem',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'var(--t3)',
        marginBottom: '0.2rem',
      }}>
        {label}
      </div>
      <div style={{
        fontSize: '0.95rem',
        color: highlight ? '#e8a020' : 'var(--t1)',
        fontWeight: highlight ? 600 : 500,
      }}>
        {children || value}
      </div>
    </div>
  )
}

export const DetailPanel = memo(DetailPanelInner)
