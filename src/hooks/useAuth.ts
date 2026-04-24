import { useEffect, useRef, createElement, Fragment, type ReactNode } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { signInWithGoogle, signOut, onAuthChanged } from '@/lib/auth'
import { router } from '@/router'
import { ROUTES } from '@/router/routePaths'

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
  const wasAuthenticated = useRef(false)

  useEffect(() => {
    const unsubscribe = onAuthChanged((user) => {
      if (wasAuthenticated.current && user === null) {
        // El usuario acaba de cerrar sesión — redirigir a home desde cualquier pantalla
        void router.navigate(ROUTES.HOME)
      }
      wasAuthenticated.current = !!user
      setUser(user)
    })
    return unsubscribe
  }, [setUser])

  return createElement(Fragment, null, children)
}
