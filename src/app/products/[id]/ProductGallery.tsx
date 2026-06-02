'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ImageIcon } from 'lucide-react'
import { ProductImageFrame } from '@/components/domain/ProductImageFrame'

interface ProductGalleryProps {
  imageUrls: string[]
  name: string
}

export function ProductGallery({ imageUrls, name }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeImage = imageUrls[activeIndex] || imageUrls[0] || ''

  if (imageUrls.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="aspect-square relative flex items-center justify-center">
          <ImageIcon className="size-20 text-slate-300" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <ProductImageFrame
          src={activeImage}
          alt={name}
          aspectRatio="aspect-square"
          innerClassName="group-hover:scale-[1.02]"
          priority={true}
        />
      </div>

      {imageUrls.length > 1 && (
        <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
          {imageUrls.map((url, idx) => {
            const isActive = activeImage === url
            return (
              <button type="button"
                key={url}
                onClick={() => setActiveIndex(idx)}
                onMouseEnter={() => setActiveIndex(idx)}
                className={`relative size-20 overflow-hidden rounded-md border bg-white transition-all duration-200 ${
                  isActive
                    ? 'border-blue-600 ring-1 ring-blue-600/30'
                    : 'border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-400'
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

