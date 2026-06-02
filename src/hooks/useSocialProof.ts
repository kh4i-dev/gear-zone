import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

export function useSocialProof(onEvent: (event: any) => void, options: { disabled?: boolean } = {}) {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (options.disabled) return

    const socket = io({ path: '/api/socket' })
    socketRef.current = socket

    socket.on('social_proof', onEvent)

    return () => {
      socket.off('social_proof', onEvent)
      socket.disconnect()
      socketRef.current = null
    }
  }, [onEvent, options.disabled])

  return socketRef
}
