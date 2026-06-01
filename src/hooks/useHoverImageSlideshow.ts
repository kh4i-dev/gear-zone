'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

const HOVER_SLIDESHOW_INTERVAL_MS = 1500

export function useHoverImageSlideshow(productId: string, images: string[]) {
  const [imageIndex, setImageIndex] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [isVisible, setIsVisible] = useState(true)
  const hasSlideshow = images.length > 1

  // Detect touch devices and prefers-reduced-motion
  useEffect(() => {
    const mqlTouch = window.matchMedia('(hover: none)')
    const mqlCoarse = window.matchMedia('(pointer: coarse)')
    const mqlReduced = window.matchMedia('(prefers-reduced-motion: reduce)')

    const updateDisabled = () => {
      const prefersReduced = mqlReduced.matches
      setDisabled(!hasSlideshow || prefersReduced)
    }

    updateDisabled()

    mqlReduced.addEventListener('change', updateDisabled)
    return () => {
      mqlReduced.removeEventListener('change', updateDisabled)
    }
  }, [hasSlideshow])

  // Track tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === 'visible')
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Slideshow interval — runs only when hovered, visible, and not disabled
  useEffect(() => {
    if (!isVisible || !hovered || disabled || !hasSlideshow) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    intervalRef.current = setInterval(() => {
      setImageIndex((current) => (current + 1) % images.length)
    }, HOVER_SLIDESHOW_INTERVAL_MS)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isVisible, hovered, disabled, hasSlideshow, images.length])

  const onMouseEnter = useCallback(() => {
    if (hasSlideshow) setHovered(true)
  }, [hasSlideshow])
  const onMouseLeave = useCallback(() => {
    setHovered(false)
    setImageIndex(0)
  }, [])
  const onFocus = useCallback(() => {
    if (hasSlideshow) setHovered(true)
  }, [hasSlideshow])
  const onBlur = useCallback(() => {
    setHovered(false)
    setImageIndex(0)
  }, [])
  const onTouchStart = useCallback(() => {
    if (hasSlideshow) setHovered(true)
  }, [hasSlideshow])
  const onTouchEnd = useCallback(() => {
    setHovered(false)
    setImageIndex(0)
  }, [])

  const safeImageIndex = images.length > 0 ? imageIndex % images.length : 0
  const activeImage = images[safeImageIndex] ?? images[0] ?? null

  return {
    activeImage,
    imageIndex: safeImageIndex,
    bind: {
      onMouseEnter,
      onMouseLeave,
      onFocus,
      onBlur,
      onTouchStart,
      onTouchEnd
    }
  }
}
