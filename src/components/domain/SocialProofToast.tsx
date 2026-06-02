'use client'

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

export function SocialProofToast({ event }: { event: ActivityEvent | null }) {
  const reduce = useReducedMotion()
  const isCart = event?.type === 'ADD_TO_CART'

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          key={event.id}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.95 }}
          transition={reduce ? { duration: 0.3 } : { type: 'spring', stiffness: 200, damping: 20 }}
          className="fixed bottom-[80px] left-1/2 -translate-x-1/2 md:left-[24px] md:translate-x-0 z-30 w-full max-w-sm px-4 md:px-0 pointer-events-none"
        >
          <div className="bg-slate-900/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 shadow-2xl flex items-start gap-3 pointer-events-auto md:w-auto w-full max-w-sm mx-auto md:mx-0">
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
                <span className={isCart ? 'text-emerald-300' : 'text-indigo-300'}>{event.productName}</span>
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {isCart ? 'vào giỏ hàng' : 'đơn hàng mới'}
                {event.city ? ` · ${event.city}` : ''}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
