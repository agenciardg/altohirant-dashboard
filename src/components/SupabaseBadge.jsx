import { memo } from 'react'

function SupabaseBadgeInner({ hasRealData, supabaseOk, loading, error }) {
  if (loading) return (
    <span className="b bo" style={{ fontSize: 9 }}>⏳ Supabase...</span>
  )
  if (error) return (
    <span className="b be" style={{ fontSize: 9 }} title={error}>⚠ erro Supabase</span>
  )
  if (hasRealData) return (
    <span className="b bp" style={{ fontSize: 9 }}>● dados reais · Supabase</span>
  )
  if (supabaseOk) return (
    <span className="b bn" style={{ fontSize: 9 }}>○ sem registros neste período</span>
  )
  return (
    <span className="b bo" style={{ fontSize: 9 }}>○ demo</span>
  )
}

export const SupabaseBadge = memo(SupabaseBadgeInner)
