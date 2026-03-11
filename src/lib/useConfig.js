import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

const LS_KEY = 'adh_logo'

/* Lê a logo: Supabase primeiro, localStorage como fallback offline */
async function fetchLogo() {
  try {
    const { data, error } = await supabase
      .from('configuracoes')
      .select('valor')
      .eq('chave', 'logo')
      .maybeSingle()

    if (error) throw error
    if (data?.valor) {
      // Atualiza o cache local
      try { localStorage.setItem(LS_KEY, data.valor) } catch {}
      return data.valor
    }
  } catch {
    // Supabase indisponível — usa cache local
  }
  try { return localStorage.getItem(LS_KEY) || null } catch {}
  return null
}

/* Salva a logo no Supabase e no localStorage */
async function saveLogo(value) {
  try { localStorage.setItem(LS_KEY, value) } catch {}
  await supabase
    .from('configuracoes')
    .upsert({ chave: 'logo', valor: value, atualizado_em: new Date().toISOString() })
}

/* Remove a logo do Supabase e do localStorage */
async function deleteLogo() {
  try { localStorage.removeItem(LS_KEY) } catch {}
  await supabase
    .from('configuracoes')
    .upsert({ chave: 'logo', valor: null, atualizado_em: new Date().toISOString() })
}

/* ── Hook ── */
export function useLogoConfig() {
  const [logoSrc, setLogoSrc] = useState(() => {
    // Inicia com o cache localStorage enquanto busca do Supabase
    try { return localStorage.getItem(LS_KEY) || null } catch { return null }
  })

  useEffect(() => {
    fetchLogo().then(url => setLogoSrc(url))
  }, [])

  const updateLogo = useCallback((url) => {
    setLogoSrc(url)
    saveLogo(url)
  }, [])

  const removeLogo = useCallback(() => {
    setLogoSrc(null)
    deleteLogo()
  }, [])

  return { logoSrc, updateLogo, removeLogo }
}
