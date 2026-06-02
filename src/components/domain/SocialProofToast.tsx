'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { ShoppingCart, Package } from 'lucide-react'

type ActivityEvent = {
  id: string
  type: 'ADD_TO_CART' | 'ORDER_CREATED'
  productName: string
  productSlug?: string | null
  city?: string | null
  createdAt: string
}

const POLL_INTERVAL = 20000
const DISPLAY_INTERVAL = 25000
const AUTO_DISMISS_MS = 5000
const MAX_EVENTS_CACHE = 20

export function SocialProofToast() {
  const [current, setCurrent] = useState<ActivityEvent | null>(null)
  const queueRef = useRef<ActivityEvent[]>([])
  const shownIdsRef = useRef(new Set<string>())
  const lastShowRef = useRef(0)
  const dismissRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const reduce = useReducedMotion()

  useEffect(() => {
    let mounted = true
    const poll = async () => {
      try {
        const res = await fetch('/api/activity/live')
        if (!res.ok) return
        const json = await res.json()
        if (!mounted || !Array.isArray(json.data)) return
        const fresh = json.data.filter((e: ActivityEvent) => !shownIdsRef.current.has(e.id))
        if (fresh.length === 0) return
        if (queueRef.current.length + fresh.length > MAX_EVENTS_CACHE) {
          queueRef.current = queueRef.current.slice(-MAX_EVENTS_CACHE)
        }
        queueRef.current.push(...fresh)
      } catch {}
    }
    poll()
    const interval = setInterval(poll, POLL_INTERVAL)
    return () => { mounted = false; clearInterval(interval) }
  }, [])

  const showNext = useCallback(() => {
    if (queueRef.current.length === 0) return
    const now = Date.now()
    if (now - lastShowRef.current < DISPLAY_INTERVAL) return
    const event = queueRef.current.shift()
    if (!event) return
    shownIdsRef.current.add(event.id)
    lastShowRef.current = now
    setCurrent(event)
    clearTimeout(dismissRef.current)
    dismissRef.current = setTimeout(() => {
      setCurrent(null)
    }, AUTO_DISMISS_MS)
  }, [])

  useEffect(() => {
    if (!current) showNext()
  }, [current, showNext])

  const isCart = current?.type === 'ADD_TO_CART'

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          key={current.id}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.95 }}
          transition={reduce ? { duration: 0.3 } : { type: 'spring', stiffness: 200, damping: 20 }}
          className="fixed bottom-20 left-4 right-4 md:left-4 md:right-auto md:bottom-28 z-30 max-w-sm pointer-events-none"
        >
          <div className="bg-slate-900/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 shadow-2xl flex items-start gap-3 pointer-events-auto">
            <div className={`p-2 rounded-full shrink-0 ${isCart ? 'bg-emerald-500/10' : 'bg-indigo-500/10'}`}>
              {isCart ? (
                <ShoppingCart className="size-4 text-emerald-400" />
              ) : (
                <Package className="size-4 text-indigo-400" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm text-white font-medium leading-snug">
                Một khách hàng vừa {isCart ? 'thêm' : 'đặt'}{' '}
                <span className={isCart ? 'text-emerald-300' : 'text-indigo-300'}>{current.productName}</span>
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {isCart ? 'vào giỏ hàng' : 'đơn hàng mới'}
                {current.city ? ` · ${current.city}` : ''}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
