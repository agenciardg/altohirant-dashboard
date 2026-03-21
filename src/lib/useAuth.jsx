import { useState, useEffect, useContext, createContext, useCallback } from 'react'
import { supabase } from './supabase.js'

// ---------------------------------------------------------------------------
// Core hook — encapsulates all Supabase auth state and helpers
// ---------------------------------------------------------------------------

export function useAuth() {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Hydrate from the existing browser session on first render
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      if (!mounted) return
      setSession(existingSession)
      setUser(existingSession?.user ?? null)
      setLoading(false)
    })

    // Keep state in sync with any subsequent auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, updatedSession) => {
        if (!mounted) return
        setSession(updatedSession)
        setUser(updatedSession?.user ?? null)
        setLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // --- Helper functions ----------------------------------------------------

  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }, [])

  const updatePassword = useCallback(async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
    return data
  }, [])

  return { user, session, loading, signIn, signOut, updatePassword }
}

// ---------------------------------------------------------------------------
// Context — allows any component tree to share a single auth instance
// ---------------------------------------------------------------------------

const AuthContext = createContext(null)

/**
 * Wrap your application (or a subtree) with <AuthProvider> to make auth state
 * available through `useAuthContext()` without prop drilling.
 *
 * Usage:
 *   <AuthProvider>
 *     <App />
 *   </AuthProvider>
 */
export function AuthProvider({ children }) {
  const auth = useAuth()
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

/**
 * Consume the shared auth context.
 *
 * Must be used inside an <AuthProvider>. Throws a descriptive error if called
 * outside of one so misuse surfaces immediately during development.
 *
 * Returns { user, session, loading, signIn, signOut, updatePassword }
 */
export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error('useAuthContext must be used inside an <AuthProvider>.')
  }
  return context
}
