'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { ShoppingCart, Package } from 'lucide-react'
import { ActivityEvent } from '@/components/providers/SocialProofProvider'

export function LiveFeedTicker({ events, accent }: { events: ActivityEvent[], accent: any }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const reduce = useReducedMotion()

  // Cycle through events every 4 seconds
  useEffect(() => {
    if (events.length <= 1) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [events.length])

  const event = events[currentIndex]
  if (!event) return null

  const isCart = event.type === 'ADD_TO_CART'
  const Icon = isCart ? ShoppingCart : Package

  return (
    <div className="relative flex justify-center items-center h-5 overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={event.id}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -15 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wide select-none ${accent.tickerText}`}
        >
          <div className="flex items-center gap-1.5 opacity-80">
             <span className="relative flex size-2.5 items-center justify-center">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full size-1.5 bg-emerald-500"></span>
             </span>
             <span>LIVE:</span>
          </div>
          <span className="text-white normal-case">
            Một khách hàng vừa {isCart ? 'thêm' : 'đặt'}{' '}
            <span className={isCart ? 'text-emerald-300 font-bold' : 'text-indigo-300 font-bold'}>{event.productName}</span>
            {' '}{isCart ? 'vào giỏ' : 'đơn hàng mới'}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
