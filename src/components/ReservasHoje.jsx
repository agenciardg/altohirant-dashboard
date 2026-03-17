import { memo } from 'react'

function fmtHora(h) {
  if (!h) return '--:--'
  return h.slice(0, 5)
}

function ReservasHojeInner({ reservas, onSelectReserva }) {
  // Nenhum dado de reserva em nenhum registro
  const hasAnyReservaField = reservas !== undefined

  if (!hasAnyReservaField) {
    return (
      <div className="reservas-hoje-card">
        <div className="reservas-hoje-header">
          <div className="reservas-hoje-title">📋 Reservas de Hoje</div>
          <div className="reservas-hoje-sub">Reservas aparecerão aqui quando clientes solicitarem pelo WhatsApp</div>
        </div>
      </div>
    )
  }

  const items = reservas || []

  return (
    <div className="reservas-hoje-card">
      <div className="reservas-hoje-header">
        <div className="reservas-hoje-title">📋 Reservas de Hoje</div>
        <div className="reservas-hoje-sub">
          {items.length > 0
            ? `${items.length} reserva${items.length !== 1 ? 's' : ''} confirmada${items.length !== 1 ? 's' : ''}`
            : 'Sem reservas para hoje'}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="reservas-hoje-empty">
          <span style={{ fontSize: '1.5rem' }}>✓</span>
          <span>Sem reservas para hoje</span>
        </div>
      ) : (
        <div className="reservas-hoje-list">
          {items.map((item, i) => (
            <div
              key={i}
              className="reservas-hoje-item"
              onClick={() => onSelectReserva && onSelectReserva(item._raw || item)}
            >
              <div className="reservas-hoje-hora">{fmtHora(item.hora)}</div>
              <div className="reservas-hoje-info">
                <div className="reservas-hoje-nome">
                  {item.nome_cliente || item.numero_cliente || 'Cliente'}
                </div>
                <div className="reservas-hoje-badges">
                  {item.qtd_pessoas && (
                    <span className="reservas-hoje-badge-pessoas">{item.qtd_pessoas}p</span>
                  )}
                  {item.eh_aniversario && (
                    <span className="reservas-hoje-badge-niver">🎂 NIVER</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export const ReservasHoje = memo(ReservasHojeInner)
