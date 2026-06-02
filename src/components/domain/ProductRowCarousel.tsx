'use client'

import React, { useRef, useState, useEffect, useCallback, useMemo, ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  getClampedInterval,
  getInitialVirtualIndex,
  getNextVirtualIndex,
  getPreviousVirtualIndex,
  getSwipeAction,
  getTranslateAmount,
  getVirtualLoopReset,
  shouldAutoSlide,
  shouldRenderStaticRow,
} from '@/lib/products/carouselLogic'

interface ProductRowCarouselProps {
  children: ReactNode
  header?: ReactNode
  autoSlideInterval?: number
  pauseOnHover?: boolean
  respectReducedMotion?: boolean
}

export function ProductRowCarousel({
  children,
  header,
  autoSlideInterval = 4000,
  pauseOnHover = true,
  respectReducedMotion = false,
}: ProductRowCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const childArray = React.Children.toArray(children)
  const totalItems = childArray.length
  const clampedInterval = getClampedInterval(autoSlideInterval)
  const [visibleCount, setVisibleCount] = useState(4)
  const cloneCount = Math.min(visibleCount, totalItems)
  const hasEnoughItems = totalItems > visibleCount
  const initialVirtualIndex = getInitialVirtualIndex({ cloneCount, hasClones: hasEnoughItems })
  const [virtualIndex, setVirtualIndex] = useState(() => initialVirtualIndex)
  const [isCarouselHovered, setIsCarouselHovered] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [containerWidth, setContainerWidth] = useState(1200)
  const [isTabVisible, setIsTabVisible] = useState(true)
  const [isInViewport, setIsInViewport] = useState(false)
  const [isSwiping, setIsSwiping] = useState(false)
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(true)

  const isTransitioningRef = useRef(false)
  const virtualIndexRef = useRef(virtualIndex)
  const transitionFallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Keep refs in sync so interval closures always see latest values
  const hasEnoughItemsRef = useRef(hasEnoughItems)
  useEffect(() => { hasEnoughItemsRef.current = hasEnoughItems }, [hasEnoughItems])

  useEffect(() => {
    virtualIndexRef.current = virtualIndex
  }, [virtualIndex])

  const clearTransitionFallback = useCallback(() => {
    const timeoutId = transitionFallbackRef.current
    if (timeoutId) {
      clearTimeout(timeoutId)
      transitionFallbackRef.current = null
    }
  }, [])

  // Build cloned children list
  const renderedChildren = useMemo(() => {
    if (!hasEnoughItems) return childArray

    const prepend = childArray.slice(-cloneCount).map((child) => {
      if (React.isValidElement(child)) {
        const originalKey = child.key != null ? String(child.key) : 'item'
        return React.cloneElement(child, { key: `c-p-${originalKey}` } as any)
      }
      return child
    })

    const append = childArray.slice(0, cloneCount).map((child) => {
      if (React.isValidElement(child)) {
        const originalKey = child.key != null ? String(child.key) : 'item'
        return React.cloneElement(child, { key: `c-a-${originalKey}` } as any)
      }
      return child
    })

    return [...prepend, ...childArray, ...append]
  }, [childArray, cloneCount, hasEnoughItems])

  // Tab visibility
  useEffect(() => {
    const handler = () => setIsTabVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', handler)
    setIsTabVisible(document.visibilityState === 'visible')
    return () => document.removeEventListener('visibilitychange', handler)
  }, [])

  // Viewport intersection observer
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        setIsInViewport(entries[0].isIntersecting)
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Responsive dimensions and reduced motion
  useEffect(() => {
    const update = () => {
      const el = containerRef.current
      if (!el) return
      const w = el.clientWidth
      setContainerWidth(w)
      if (w >= 1024) setVisibleCount(4)
      else if (w >= 768) setVisibleCount(3)
      else if (w >= 640) setVisibleCount(2)
      else setVisibleCount(1)
    }

    update()
    window.addEventListener('resize', update)

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(mq.matches)
    sync()
    mq.addEventListener('change', sync)

    return () => {
      window.removeEventListener('resize', update)
      mq.removeEventListener('change', sync)
    }
  }, [])

  // Align the track to the first real item whenever the clone layout changes.
  useEffect(() => {
    isTransitioningRef.current = false
    setIsTransitionEnabled(false)
    setVirtualIndex(getInitialVirtualIndex({ cloneCount, hasClones: hasEnoughItems }))
  }, [cloneCount, hasEnoughItems, totalItems])

  // Re-enable transition on next frame after reset
  useEffect(() => {
    if (!isTransitionEnabled) {
      const id = requestAnimationFrame(() => setIsTransitionEnabled(true))
      return () => cancelAnimationFrame(id)
    }
  }, [isTransitionEnabled])

  useEffect(() => {
    return clearTransitionFallback
  }, [clearTransitionFallback])

  const armTransitionFallback = useCallback(() => {
    clearTransitionFallback()

    transitionFallbackRef.current = setTimeout(() => {
      isTransitioningRef.current = false
      transitionFallbackRef.current = null
    }, 700)
  }, [clearTransitionFallback])

  const slideNext = useCallback(() => {
    if (!hasEnoughItemsRef.current || isTransitioningRef.current) return
    isTransitioningRef.current = true
    setIsTransitionEnabled(true)
    setVirtualIndex(getNextVirtualIndex)
    armTransitionFallback()
  }, [armTransitionFallback])

  const slidePrev = useCallback(() => {
    if (!hasEnoughItemsRef.current || isTransitioningRef.current) return
    isTransitioningRef.current = true
    setIsTransitionEnabled(true)
    setVirtualIndex(getPreviousVirtualIndex)
    armTransitionFallback()
  }, [armTransitionFallback])

  const slideNextRef = useRef(slideNext)
  useEffect(() => { slideNextRef.current = slideNext }, [slideNext])

  const shouldAutoSlideNow = shouldAutoSlide({
    isVisible: isTabVisible && isInViewport,
    hovered: (pauseOnHover && isCarouselHovered) || isSwiping,
    reducedMotion: respectReducedMotion && reducedMotion,
    hasEnoughItems,
  })

  // Auto-slide effect
  useEffect(() => {
    if (!shouldAutoSlideNow || clampedInterval <= 0) return

    const interval = setInterval(() => slideNextRef.current(), clampedInterval)
    return () => clearInterval(interval)
  }, [shouldAutoSlideNow, clampedInterval])

  // Touch/swipe support
  const touchStartRef = useRef<number | null>(null)
  const touchEndRef = useRef<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.targetTouches[0].clientX
    setIsSwiping(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndRef.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = () => {
    setIsSwiping(false)
    const swipeAction = getSwipeAction({ touchStart: touchStartRef.current, touchEnd: touchEndRef.current })
    if (swipeAction === 'next') {
      slideNext()
    } else if (swipeAction === 'previous') {
      slidePrev()
    }
    touchStartRef.current = null
    touchEndRef.current = null
  }

  // Transition end - reset clone positions invisibly to the equivalent real item.
  // Must filter by propertyName and target to ignore bubbled transitionend events
  // from child elements (ProductCard has transition-all, transition-opacity, etc.)
  const handleTransitionEnd = useCallback((e: React.TransitionEvent) => {
    if (e.target !== e.currentTarget) return
    if (e.propertyName !== 'transform') return

    if (transitionFallbackRef.current) {
      clearTimeout(transitionFallbackRef.current)
      transitionFallbackRef.current = null
    }

    isTransitioningRef.current = false

    const reset = getVirtualLoopReset({
      virtualIndex: virtualIndexRef.current,
      totalItems,
      cloneCount,
    })

    if (reset.shouldReset) {
      setIsTransitionEnabled(false)
      setVirtualIndex(reset.virtualIndex)
    }
  }, [cloneCount, totalItems])

  const itemWidth = totalItems > 0 ? containerWidth / visibleCount : 0
  const translateAmount = getTranslateAmount(virtualIndex, itemWidth)

  const trackTransition = isTransitionEnabled && hasEnoughItems
    ? 'transform 500ms cubic-bezier(0.25, 1, 0.5, 1)'
    : 'none'

  const showArrows = hasEnoughItems
  const renderStaticRow = shouldRenderStaticRow({ totalItems, visibleCount })

  if (renderStaticRow) {
    return (
      <div
        className="p-1.5 rounded-[1.25rem] bg-white/[0.02] ring-1 ring-white/[0.04] mb-8 select-none relative"
        onPointerEnter={() => setIsCarouselHovered(true)}
        onPointerLeave={() => setIsCarouselHovered(false)}
      >
        <div className="rounded-[calc(1.25rem-6px)] bg-[#070707] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] overflow-hidden">
          {header && (
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-4 mb-5 gap-3">
              {header}
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {childArray.map((child, idx) => {
              const childKey = React.isValidElement(child) && child.key != null
                ? `static-${child.key}`
                : `static-${idx}`
              return (
                <div key={childKey} className="w-full min-w-0">
                  {child}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="p-1.5 rounded-[1.25rem] bg-white/[0.02] ring-1 ring-white/[0.04] mb-8 select-none relative"
      onPointerEnter={() => setIsCarouselHovered(true)}
      onPointerLeave={() => setIsCarouselHovered(false)}
    >
      <div className="rounded-[calc(1.25rem-6px)] bg-[#070707] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] overflow-hidden">
        {header && (
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-4 mb-5 gap-3">
            {header}
          </div>
        )}

        <div className="relative group/slider overflow-hidden" ref={containerRef}>
          {showArrows && (
            <button
              type="button"
              onClick={slidePrev}
              aria-label="Cuộn sang trái"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-30 flex size-10 items-center justify-center rounded-full bg-slate-900/90 border border-white/10 text-white shadow-xl hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all cursor-pointer opacity-0 group-hover/slider:opacity-100 duration-300"
            >
              <ChevronLeft className="size-5" />
            </button>
          )}

          {showArrows && (
            <button
              type="button"
              onClick={slideNext}
              aria-label="Cuộn sang phải"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-30 flex size-10 items-center justify-center rounded-full bg-slate-900/90 border border-white/10 text-white shadow-xl hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all cursor-pointer opacity-0 group-hover/slider:opacity-100 duration-300"
            >
              <ChevronRight className="size-5" />
            </button>
          )}

          <div
            className="overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
          >
            <div
              className="flex"
              onTransitionEnd={handleTransitionEnd}
              style={{
                transform: `translate3d(-${translateAmount}px, 0, 0)`,
                width: `${hasEnoughItems ? renderedChildren.length * itemWidth : (totalItems * itemWidth)}px`,
                transition: trackTransition,
              }}
            >
              {(hasEnoughItems ? renderedChildren : childArray).map((child, idx) => {
                const childKey = React.isValidElement(child) && child.key != null
                  ? `slot-${child.key}`
                  : `slot-${idx}`
                return (
                  <div
                    key={childKey}
                    style={{ width: `${itemWidth}px` }}
                    className="px-2.5 shrink-0 box-border"
                  >
                    {child}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
