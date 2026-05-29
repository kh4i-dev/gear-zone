'use client'

import Image from 'next/image'
import { ImageIcon } from 'lucide-react'

interface ProductImageFrameProps {
  src: string | null | undefined
  alt: string
  aspectRatio?: 'aspect-square' | 'aspect-[4/3]' | 'aspect-video'
  className?: string
  innerClassName?: string
  priority?: boolean
}

export function ProductImageFrame({
  src,
  alt,
  aspectRatio = 'aspect-[4/3]',
  className = '',
  innerClassName = '',
  priority = false
}: ProductImageFrameProps) {
  if (!src) {
    return (
      <div className={`relative ${aspectRatio} flex size-full items-center justify-center text-white/20 bg-white/[0.02] rounded-xl border border-white/5 ${className}`}>
        <ImageIcon className="size-8 opacity-40 animate-pulse" />
      </div>
    )
  }

  return (
    <div className={`relative ${aspectRatio} w-full overflow-hidden bg-[#070707] rounded-xl border border-white/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.4)] ${className}`}>
      {/* Premium dark gradient stage background */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#0a0a0a] via-[#050505] to-[#121212]" />
      
      {/* Circular soft ambient glow in the center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-4/5 rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.06)_0%,transparent_70%)] pointer-events-none" />
      
      {/* Light blending overlay: dynamically softens white/bright backgrounds */}
      <div className="absolute inset-0 bg-black/10 mix-blend-multiply pointer-events-none z-10" />

      {/* Main Image Container */}
      <div className="absolute inset-4 flex items-center justify-center z-0">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={priority}
          className={`object-contain transition-transform duration-700 ease-out-expo ${innerClassName}`}
        />
      </div>
    </div>
  )
}
