'use client'

import React, { createContext, useCallback, use, useEffect, useMemo, useSyncExternalStore } from 'react'

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  refreshUser: () => Promise<User | null>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  refreshUser: async () => null,
})

const authListeners = new Set<() => void>()
const initialAuthSnapshot = { user: null as User | null, isLoading: true }
let authSnapshot = {
  user: null as User | null,
  isLoading: true,
}

function emitAuthChange() {
  authListeners.forEach((listener) => listener())
}

const authStore = {
  subscribe(listener: () => void) {
    authListeners.add(listener)
    return () => {
      authListeners.delete(listener)
    }
  },
  getSnapshot: () => authSnapshot,
  getServerSnapshot: () => initialAuthSnapshot,
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const authState = useSyncExternalStore(
    authStore.subscribe,
    authStore.getSnapshot,
    authStore.getServerSnapshot
  )

  const refreshUser = useCallback(async () => {
    try {
      const res = await window.fetch('/api/auth/me', { credentials: 'include' })
      if (res.ok) {
        const { data } = await res.json()
        authSnapshot = { user: data, isLoading: false }
        emitAuthChange()
        return data as User
      }

      authSnapshot = { user: null, isLoading: false }
      emitAuthChange()
      return null
    } catch {
      authSnapshot = { user: null, isLoading: false }
      emitAuthChange()
      return null
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const authValue = useMemo(() => ({
    user: authState.user,
    isLoading: authState.isLoading,
    refreshUser
  }), [authState, refreshUser])

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return use(AuthContext)
}
