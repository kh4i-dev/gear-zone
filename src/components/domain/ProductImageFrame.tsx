'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ImageIcon } from 'lucide-react'
import { getSafeImageSrc } from '@/lib/product-images'

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
  aspectRatio = 'aspect-square',
  className = '',
  innerClassName = '',
  priority = false
}: ProductImageFrameProps) {
  const [hasError, setHasError] = useState(false)
  const safeSrc = getSafeImageSrc(src)

  if (hasError) {
    return (
      <div className={`relative ${aspectRatio} w-full flex flex-col items-center justify-center text-slate-500 bg-slate-900/30 rounded-xl border border-white/[0.04] p-6 text-center select-none ${className}`}>
        <div className="p-3 rounded-full bg-white/[0.02] border border-white/[0.04] mb-2">
          <ImageIcon className="size-6 text-slate-500/80" />
        </div>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Ảnh đang cập nhật</span>
      </div>
    )
  }

  return (
    <div className={`relative ${aspectRatio} w-full overflow-hidden bg-white rounded-xl border border-white/[0.06] shadow-[0_4px_16px_rgba(0,0,0,0.3)] ${className}`}>
      {/* Premium white stage background (Method 1) */}
      <div className="absolute inset-0 bg-[#ffffff]" />

      {/* Main Image Container with 12.5% safe breathing room padding to equalize visual weight */}
      <div className="absolute inset-3 sm:inset-4 flex items-center justify-center z-0">
        <Image
          src={safeSrc}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={priority}
          className={`object-contain transition-transform duration-500 ease-out-expo ${innerClassName}`}
          onError={() => setHasError(true)}
        />
      </div>
    </div>
  )
}
