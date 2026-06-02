'use client'

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useSocialProof } from '@/hooks/useSocialProof'
import { SocialProofToast } from '@/components/domain/SocialProofToast'

interface SocialProofContextValue {
  socketId: string | null
}

const SocialProofContext = createContext<SocialProofContextValue>({ socketId: null })

export function useSocialProofContext() {
  return useContext(SocialProofContext)
}

export function SocialProofProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')

  const [currentEvent, setCurrentEvent] = useState<any | null>(null)
  const eventQueue = useRef<any[]>([])
  const isShowing = useRef(false)
  const cooldownTimer = useRef<NodeJS.Timeout | null>(null)

  const [socketId, setSocketId] = useState<string | null>(null)

  const processQueue = useCallback(() => {
    if (isShowing.current || eventQueue.current.length === 0) return

    isShowing.current = true
    const nextEvent = eventQueue.current.shift()
    setCurrentEvent(nextEvent)

    setTimeout(() => {
      setCurrentEvent(null)
      
      cooldownTimer.current = setTimeout(() => {
        isShowing.current = false
        processQueue()
      }, 15000)
    }, 5000)
  }, [])

  const handleNewEvent = useCallback((event: any) => {
    eventQueue.current.push(event)
    processQueue()
  }, [processQueue])

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
    <SocialProofContext.Provider value={{ socketId }}>
      {children}
      {currentEvent && <SocialProofToast event={currentEvent} />}
    </SocialProofContext.Provider>
  )
}
