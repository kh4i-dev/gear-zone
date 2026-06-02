'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

const HOVER_SLIDESHOW_INTERVAL_MS = 1000

export function useHoverImageSlideshow(productId: string, images: string[], productName: string = 'Unknown') {
  const [imageIndex, setImageIndex] = useState(0)
  const [hovered, setHovered] = useState(false)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const hasSlideshow = images.length > 1

  const onPointerEnter = useCallback(() => {
    if (hasSlideshow) setHovered(true)
  }, [hasSlideshow])

  const onPointerLeave = useCallback(() => {
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

  useEffect(() => {
    if (!hovered || !hasSlideshow) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    intervalRef.current = setInterval(() => {
      setImageIndex((current) => {
        return (current + 1) % images.length
      })
    }, HOVER_SLIDESHOW_INTERVAL_MS)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [hovered, hasSlideshow, images.length])

  const safeImageIndex = images.length > 0 ? imageIndex % images.length : 0
  const activeImage = images[safeImageIndex] ?? images[0] ?? null

  return {
    activeImage,
    imageIndex: safeImageIndex,
    bind: {
      onPointerEnter,
      onPointerLeave,
      onMouseEnter: onPointerEnter,
      onMouseLeave: onPointerLeave,
      onFocus,
      onBlur
    }
  }
}
