'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ImageIcon } from 'lucide-react'
import { ProductImageFrame } from '@/components/domain/ProductImageFrame'

interface ProductGalleryProps {
  imageUrls: string[]
  name: string
  selectedOptionsKey?: string
  resolvedImage?: string | null
}

export function ProductGallery({ imageUrls, name, selectedOptionsKey, resolvedImage }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeImage = imageUrls[activeIndex] || imageUrls[0] || ''

  useEffect(() => {
    if (selectedOptionsKey !== undefined) {
      if (resolvedImage) {
        const idx = imageUrls.findIndex(url => url === resolvedImage)
        if (idx !== -1) {
          setActiveIndex(idx)
        } else {
          setActiveIndex(0)
        }
      } else {
        setActiveIndex(0)
      }
    }
  }, [selectedOptionsKey, resolvedImage, imageUrls])

  if (imageUrls.length === 0) {
    return (
      <div className="p-1.5 rounded-[1.5rem] bg-white/[0.03] ring-1 ring-white/[0.06]">
        <div className="rounded-[calc(1.5rem-6px)] bg-[#0a0a0a] overflow-hidden aspect-square relative flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
          <ImageIcon className="size-24 text-slate-700" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main Large Image */}
      <div className="p-1.5 rounded-[1.5rem] bg-white/[0.03] ring-1 ring-white/[0.06]">
        <ProductImageFrame
          src={activeImage}
          alt={name}
          aspectRatio="aspect-square"
          innerClassName="group-hover:scale-[1.04]"
          priority={true}
        />
      </div>

      {/* Thumbnails Row */}
      {imageUrls.length > 1 && (
        <div className="flex flex-wrap gap-2.5 mt-2 justify-center sm:justify-start">
          {imageUrls.map((url, idx) => {
            const isActive = activeImage === url
            return (
              <button type="button"
                key={url}
                onClick={() => setActiveIndex(idx)}
                onMouseEnter={() => setActiveIndex(idx)}
                className={`relative size-20 rounded-xl overflow-hidden border bg-[#0a0a0a] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  isActive
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 scale-102 shadow-lg shadow-emerald-500/10'
                    : 'border-white/5 opacity-60 hover:opacity-100 hover:border-white/20'
                }`}
              >
                <Image
                  src={url.trim()}
                  alt={`${name} thumbnail ${idx + 1}`}
                  width={80}
                  height={80}
                  className="size-full object-cover"
                />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

