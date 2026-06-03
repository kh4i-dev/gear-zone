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
  galleryImages?: string[]
  activeIndex?: number
}

export function ProductImageFrame({
  src,
  alt,
  aspectRatio = 'aspect-square',
  className = '',
  innerClassName = '',
  priority = false,
  galleryImages,
  activeIndex = 0,
}: ProductImageFrameProps) {
  const safeSrc = getSafeImageSrc(src)
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const hasError = failedSrc === safeSrc

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

  const hasMultipleImages = galleryImages && galleryImages.length >= 2

  if (hasMultipleImages) {
    return (
      <div className={`relative ${aspectRatio} w-full overflow-hidden bg-[#060606] rounded-xl border border-white/[0.04] shadow-[0_4px_16px_rgba(0,0,0,0.3)] ${className}`}>
        {/* Sliding flex container */}
        <div 
          className="absolute inset-0 flex transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
          style={{ 
            transform: `translateX(-${activeIndex * (100 / galleryImages.length)}%)`, 
            width: `${galleryImages.length * 100}%` 
          }}
        >
          {galleryImages.map((imgSrc, idx) => {
            const safeImg = getSafeImageSrc(imgSrc)
            return (
              <div 
                key={`${imgSrc}-${idx}`} 
                style={{ width: `${100 / galleryImages.length}%` }} 
                className="relative h-full flex shrink-0 items-center justify-center z-0"
              >
                {/* Safe breathing room wrapper to prevent Next.js fill from ignoring padding */}
                <div className="absolute inset-5 sm:inset-6 flex items-center justify-center z-0">
                  <Image
                    src={safeImg}
                    alt={`${alt} image ${idx + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={priority && idx === 0}
                    className={`object-contain transition-transform duration-500 ease-out-expo ${innerClassName}`}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${aspectRatio} w-full overflow-hidden bg-[#060606] rounded-xl border border-white/[0.04] shadow-[0_4px_16px_rgba(0,0,0,0.3)] ${className}`}>
      {/* Main Image Container with 12.5% safe breathing room padding to equalize visual weight */}
      <div className="absolute inset-5 sm:inset-6 flex items-center justify-center z-0">
        <Image
          src={safeSrc}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={priority}
          className={`object-contain transition-transform duration-500 ease-out-expo ${innerClassName}`}
          onError={() => setFailedSrc(safeSrc)}
        />
      </div>
    </div>
  )
}
