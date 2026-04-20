import { useEffect, createElement, Fragment, type ReactNode } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { signInWithGoogle, signOut, onAuthChanged } from '@/lib/auth'

export function useAuth() {
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return {
    user,
    isLoading,
    isAuthenticated,
    signIn: signInWithGoogle,
    signOut,
  }
}

// Monta una sola vez en el root. Escucha onAuthStateChanged y actualiza Zustand.
// No es un Context — Zustand es el single source of truth.
export function AuthProvider({ children }: { children: ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser)

  useEffect(() => {
    const unsubscribe = onAuthChanged(setUser)
    return unsubscribe
  }, [setUser])

  return createElement(Fragment, null, children)
}
