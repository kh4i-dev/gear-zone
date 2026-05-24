'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ImageIcon } from 'lucide-react'

interface ProductGalleryProps {
  imageUrls: string[]
  name: string
}

export function ProductGallery({ imageUrls, name }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeImage = imageUrls[activeIndex] || imageUrls[0] || ''

  if (imageUrls.length === 0) {
    return (
      <div className="bg-slate-950 rounded-2xl overflow-hidden aspect-square border border-white/5 relative flex items-center justify-center">
        <ImageIcon className="size-24 text-slate-700" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main Large Image */}
      <div className="bg-slate-950 rounded-2xl overflow-hidden aspect-square border border-white/5 relative flex items-center justify-center group shadow-xl">
        <Image
          src={activeImage}
          alt={name}
          width={500}
          height={500}
          className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Glow ambient light behind main image */}
        <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
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
                className={`relative size-20 rounded-xl overflow-hidden border bg-slate-950 transition-all duration-300 ${
                  isActive
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 scale-102 shadow-lg shadow-indigo-500/10'
                    : 'border-white/5 opacity-60 hover:opacity-100 hover:border-white/20'
                }`}
              >
                <Image
                  src={url}
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

