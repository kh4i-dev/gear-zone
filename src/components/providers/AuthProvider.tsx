'use client'

import React, { createContext, useCallback, use, useEffect, useState, useMemo } from 'react'

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const isLoading = user === undefined

  const refreshUser = useCallback(async () => {
    try {
      const res = await window.fetch('/api/auth/me', { credentials: 'include' })
      if (res.ok) {
        const { data } = await res.json()
        setUser(data)
        return data as User
      }

      setUser(null)
      return null
    } catch {
      setUser(null)
      return null
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const authValue = useMemo(() => ({
    user: user ?? null,
    isLoading,
    refreshUser
  }), [user, isLoading, refreshUser])

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return use(AuthContext)
}
