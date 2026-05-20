'use client'

import { useState, useEffect } from 'react'
import { ImageIcon } from 'lucide-react'

interface ProductGalleryProps {
  imageUrls: string[]
  name: string
}

export function ProductGallery({ imageUrls, name }: ProductGalleryProps) {
  const [activeImage, setActiveImage] = useState(imageUrls[0] || '')

  useEffect(() => {
    if (imageUrls.length > 0) {
      setActiveImage(imageUrls[0])
    }
  }, [imageUrls])

  if (imageUrls.length === 0) {
    return (
      <div className="bg-slate-950 rounded-2xl overflow-hidden aspect-square border border-white/5 relative flex items-center justify-center">
        <ImageIcon className="w-24 h-24 text-slate-700" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main Large Image */}
      <div className="bg-slate-950 rounded-2xl overflow-hidden aspect-square border border-white/5 relative flex items-center justify-center group shadow-xl">
        <img
          src={activeImage}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
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
              <button
                key={idx}
                onClick={() => setActiveImage(url)}
                onMouseEnter={() => setActiveImage(url)}
                className={`relative w-20 h-20 rounded-xl overflow-hidden border bg-slate-950 transition-all duration-300 ${
                  isActive
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 scale-102 shadow-lg shadow-indigo-500/10'
                    : 'border-white/5 opacity-60 hover:opacity-100 hover:border-white/20'
                }`}
              >
                <img
                  src={url}
                  alt={`${name} thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
