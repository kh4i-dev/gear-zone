'use client'

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useSocialProof } from '@/hooks/useSocialProof'
export type ActivityEvent = {
  id: string
  type: 'ADD_TO_CART' | 'ORDER_CREATED'
  productName: string
  productSlug?: string | null
  city?: string | null
  createdAt: string
}

interface SocialProofContextValue {
  socketId: string | null
  recentEvents: ActivityEvent[]
}

const SocialProofContext = createContext<SocialProofContextValue>({ socketId: null, recentEvents: [] })

export function useSocialProofContext() {
  return useContext(SocialProofContext)
}

export function SocialProofProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')

  const [socketId, setSocketId] = useState<string | null>(null)
  const [recentEvents, setRecentEvents] = useState<ActivityEvent[]>([])

  const handleNewEvent = useCallback((event: ActivityEvent) => {
    setRecentEvents((prev) => {
      // Prevent duplicates
      if (prev.some(e => e.id === event.id)) return prev
      return [event, ...prev].slice(0, 10) // Keep the 10 most recent events
    })
  }, [])

  const socketRef = useSocialProof(handleNewEvent, { disabled: isAdmin })

  useEffect(() => {
    if (isAdmin) return

    const socket = socketRef.current
    if (!socket) return

    const onConnect = () => setSocketId(socket.id || null)
    socket.on('connect', onConnect)
    
    if (socket.connected) {
      setSocketId(socket.id || null)
    }

    return () => {
      socket.off('connect', onConnect)
    }
  }, [socketRef, isAdmin])

  if (isAdmin) {
    return <>{children}</>
  }

  return (
    <SocialProofContext.Provider value={{ socketId, recentEvents }}>
      {children}
    </SocialProofContext.Provider>
  )
}
