import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { isoDate, subDays } from '../lib/dataProcessors/computeCharts'
import { normTipo, normTurno } from '../lib/utils'
import { TipoBadge, TurnoBadge } from './Badges'
import { useRef } from 'react'

function PendingConversa({ row }) {
  const [mensagens, setMensagens] = useState(null)
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (!row?.id) { setLoading(false); return }
    let cancelled = false
    async function fetch() {
      setLoading(true)
      const { data, error } = await supabase
        .from('alto_hirant_mensagens')
        .select('*')
        .eq('dashboard_id', row.id)
        .order('hora', { ascending: true })
      if (!cancelled) {
        setMensagens(error ? [] : (data || []))
        setLoading(false)
      }
    }
    fetch()
    return () => { cancelled = true }
  }, [row?.id])

  useEffect(() => {
    if (mensagens && scrollRef.current) scrollRef.current.scrollTop = 0
  }, [mensagens])

  const fmtH = (h) => {
    if (!h) return '--:--'
    try {
      const d = new Date(h)
      if (isNaN(d)) return h.slice(11, 16) || '--:--'
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    } catch { return '--:--' }
  }

  if (loading) return <div style={{ textAlign: 'center', color: 'var(--t2)', padding: 24 }}>Carregando...</div>
  if (!mensagens || mensagens.length === 0) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '32px 24px', margin: '20px auto', maxWidth: 320,
        borderRadius: 14, border: '1px solid rgba(232,160,32,0.3)', background: 'rgba(232,160,32,0.06)',
      }}>
        <span style={{ fontSize: 28, marginBottom: 10 }}>📋</span>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)', marginBottom: 6 }}>Histórico indisponível</div>
        <div style={{ fontSize: 11, color: 'var(--t2)', maxWidth: 260, lineHeight: 1.5 }}>
          O histórico de conversas é mantido por 10 dias. Este registro é anterior a esse período.
        </div>
      </div>
    )
  }

  return (
    <div ref={scrollRef} style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 0' }}>
      {mensagens.map((m, i) => {
        const isHelena = m.remetente === 'helena'
        return (
          <div key={m.id || i} style={{
            alignSelf: isHelena ? 'flex-end' : 'flex-start',
            maxWidth: '80%', padding: '8px 12px', borderRadius: 12,
            background: isHelena ? 'rgba(251,207,60,0.18)' : 'var(--bg1, #2a2a2a)',
            border: isHelena ? '1px solid rgba(251,207,60,0.35)' : '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 3 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: isHelena ? '#F97316' : '#7dd3fc' }}>
                {isHelena ? 'Helena' : 'Cliente'}
              </span>
              <span style={{ fontSize: 9, color: 'var(--t3)' }}>{fmtH(m.hora)}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--t1)', lineHeight: 1.5 }}>{m.conteudo}</div>
          </div>
        )
      })}
    </div>
  )
}

function fmtData(data) {
  if (!data) return '--'
  const [y, m, d] = data.split('-')
  return `${d}/${m}/${y}`
}

function fmt(hora) {
  return hora ? hora.slice(0, 5) : '--'
}

function PendingModal({ rows, title, onClose, onAtendido }) {
  const [conversaRow, setConversaRow] = useState(null)

  if (conversaRow) {
    return (
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
      >
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: '24px 28px',
            maxWidth: 700, width: '70vw', maxHeight: '80vh',
            display: 'flex', flexDirection: 'column', gap: 16,
          }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={() => setConversaRow(null)} style={{
                background: 'none', border: 'none', color: '#E85D04',
                cursor: 'pointer', fontSize: 16, padding: '2px 6px',
              }}>←</button>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>
                {conversaRow.nome_cliente || conversaRow.numero_cliente || 'Cliente'}
              </span>
            </div>
            <button onClick={onClose} style={{
              background: 'none', border: 'none', color: 'var(--t3)',
              cursor: 'pointer', fontSize: 18, padding: '2px 6px', lineHeight: 1,
            }}>✕</button>
          </div>
          <PendingConversa row={conversaRow} />
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '24px 28px',
          maxWidth: 800,
          width: '90vw',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18, filter: 'drop-shadow(0 0 4px rgba(232,160,32,0.6))' }}>⚠️</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#e8a020' }}>{title}</span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: 'var(--t3)',
              cursor: 'pointer', fontSize: 18, padding: '2px 6px', lineHeight: 1,
            }}
          >✕</button>
        </div>

        {rows.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--t3)', fontSize: 13, padding: '24px 0' }}>
            Nenhuma pendencia encontrada.
          </div>
        ) : (
          <div style={{ overflowY: 'auto', flex: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Data', 'Hora', 'Cliente', 'Tipo', 'Turno', 'Acao'].map(h => (
                    <th key={h} style={{
                      textAlign: 'left', padding: '8px 10px',
                      color: 'var(--t3)', fontWeight: 600, fontSize: 11,
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} style={{
                    borderBottom: '1px solid var(--border)',
                    transition: 'background 0.15s',
                    cursor: 'pointer',
                  }}
                  onClick={() => setConversaRow(r)}
                  title="Clique para ver conversa">
                    <td style={{ padding: '8px 10px', color: 'var(--t2)', whiteSpace: 'nowrap' }}>{fmtData(r.data)}</td>
                    <td style={{ padding: '8px 10px', fontWeight: 700, fontSize: 13, fontFamily: "'Playfair Display',serif", color: 'var(--t1)' }}>{fmt(r.hora)}</td>
                    <td style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--t1)' }}>
                      {r.nome_cliente || r.numero_cliente || 'Desconhecido'}
                    </td>
                    <td style={{ padding: '8px 10px' }}><TipoBadge tipo={normTipo(r.tipo_atendimento)} /></td>
                    <td style={{ padding: '8px 10px' }}><TurnoBadge turno={normTurno(r.turno)} /></td>
                    <td style={{ padding: '8px 10px' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); onAtendido(r.id) }}
                        style={{
                          background: 'linear-gradient(135deg, rgba(232,93,4,0.08), rgba(232,93,4,0.15))',
                          color: '#F97316', border: '1px solid rgba(232,93,4,0.4)',
                          borderRadius: 6, padding: '4px 10px', fontSize: 10,
                          fontWeight: 700, letterSpacing: '0.06em',
                          textTransform: 'uppercase', cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >ATENDIDO</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              background: 'var(--card)', color: 'var(--t2)',
              border: '1px solid var(--border)', borderRadius: 8,
              padding: '8px 18px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
          >Fechar</button>
        </div>
      </div>
    </div>
  )
}

export function PendingBanners({ refetch }) {
  const [alerts, setAlerts] = useState([])
  const [dismissed, setDismissed] = useState(new Set())
  const [modalRows, setModalRows] = useState(null)
  const [modalTitle, setModalTitle] = useState('')

  const checkAlerts = useCallback(async () => {
    const now = new Date()
    const hoje = isoDate(now)
    const { data: rows } = await supabase
      .from('alto_hirant_dashboard')
      .select('data_conversa:data, id')
      .eq('necessita_humano', true)
      .lt('data', hoje)
      .order('data', { ascending: false })

    if (!rows || rows.length === 0) { setAlerts([]); return }

    const ontem = isoDate(subDays(now, 1))
    const primeiroDiaMes = isoDate(new Date(now.getFullYear(), now.getMonth(), 1))

    const alertList = []

    const ontemRows = rows.filter(r => r.data_conversa === ontem)
    if (ontemRows.length > 0) {
      alertList.push({
        id: 'ontem',
        text: `${ontemRows.length} conversa${ontemRows.length > 1 ? 's' : ''} pendente${ontemRows.length > 1 ? 's' : ''} de ontem`,
        dateStart: ontem, dateEnd: ontem,
      })
    }

    const diasAntes = rows.filter(r => r.data_conversa < ontem && r.data_conversa >= primeiroDiaMes)
    if (diasAntes.length > 0) {
      alertList.push({
        id: 'mes-atual',
        text: `${diasAntes.length} conversa${diasAntes.length > 1 ? 's' : ''} pendente${diasAntes.length > 1 ? 's' : ''} de dias anteriores deste mes`,
        dateStart: primeiroDiaMes, dateEnd: isoDate(subDays(new Date(ontem), 1)),
      })
    }

    const mesesAnteriores = rows.filter(r => r.data_conversa < primeiroDiaMes)
    if (mesesAnteriores.length > 0) {
      const byMonth = {}
      mesesAnteriores.forEach(r => {
        const monthKey = r.data_conversa.slice(0, 7)
        byMonth[monthKey] = (byMonth[monthKey] || 0) + 1
      })
      Object.entries(byMonth).sort((a, b) => b[0].localeCompare(a[0])).forEach(([monthKey, count]) => {
        const [y, m] = monthKey.split('-')
        const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
        const lastDay = new Date(Number(y), Number(m), 0).getDate()
        alertList.push({
          id: `mes-${monthKey}`,
          text: `${count} conversa${count > 1 ? 's' : ''} pendente${count > 1 ? 's' : ''} de ${MESES[Number(m) - 1]}/${y}`,
          dateStart: `${y}-${m}-01`,
          dateEnd: `${y}-${m}-${String(lastDay).padStart(2, '0')}`,
        })
      })
    }

    setAlerts(alertList)
  }, [])

  useEffect(() => {
    checkAlerts()
    const id = setInterval(checkAlerts, 60000)
    return () => clearInterval(id)
  }, [checkAlerts])

  const handleVerificar = useCallback(async (alert) => {
    const { data: rows } = await supabase
      .from('alto_hirant_dashboard')
      .select('*')
      .eq('necessita_humano', true)
      .gte('data', alert.dateStart)
      .lte('data', alert.dateEnd)
      .order('data', { ascending: false })

    if (rows) {
      setModalRows(rows)
      setModalTitle(`Pendencias: ${alert.text}`)
    }
  }, [])

  const handleAtendido = useCallback(async (id) => {
    await supabase.from('alto_hirant_dashboard').update({
      necessita_humano: false,
      atendido_por_humano: true,
      data_atendimento_humano: new Date().toISOString(),
    }).eq('id', id)
    setModalRows(prev => {
      const updated = prev ? prev.filter(r => r.id !== id) : null
      if (updated && updated.length === 0) setTimeout(() => setModalRows(null), 300)
      return updated
    })
    checkAlerts()
    if (refetch) refetch()
  }, [refetch, checkAlerts])

  const visible = alerts.filter(a => !dismissed.has(a.id))
  if (visible.length === 0 && !modalRows) return null

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
        {visible.map(alert => (
          <div key={alert.id} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 18px', borderRadius: 12,
            border: '1px solid rgba(232,160,32,0.3)',
            background: 'linear-gradient(135deg, rgba(232,160,32,0.06), rgba(232,160,32,0.12))',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16, filter: 'drop-shadow(0 0 4px rgba(232,160,32,0.6))' }}>⚠️</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#e8a020' }}>{alert.text}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button onClick={() => handleVerificar(alert)} style={{
                background: '#e8a020', color: '#fff', border: 'none', borderRadius: 6,
                padding: '5px 12px', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
                textTransform: 'uppercase', cursor: 'pointer',
              }}>VERIFICAR</button>
              <button onClick={() => setDismissed(s => new Set([...s, alert.id]))} style={{
                background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer',
                fontSize: 14, padding: '2px 4px',
              }}>✕</button>
            </div>
          </div>
        ))}
      </div>

      {modalRows && (
        <PendingModal
          rows={modalRows}
          title={modalTitle}
          onClose={() => setModalRows(null)}
          onAtendido={handleAtendido}
        />
      )}
    </>
  )
}
