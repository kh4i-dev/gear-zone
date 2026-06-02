'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Package } from 'lucide-react'

export interface CategoryData {
  id: string
  name: string
  count: number
  imageUrl: string
}

interface CategoryCardProps {
  category: CategoryData
}

export function CategoryCard({ category }: CategoryCardProps) {
  const { name, count, imageUrl } = category

  return (
    <Link 
      href={`/products?category=${encodeURIComponent(name)}`}
      className="group block relative overflow-hidden rounded-[14px] p-[1.5px] bg-white/[0.06] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
    >
      {/* Animated RGB LED Border */}
      <div className="absolute inset-0 overflow-hidden rounded-[14px]">
        <div className="absolute -inset-[100%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_0deg,#ff0000,#ff8000,#ffff00,#00ff00,#00ffff,#0000ff,#8000ff,#ff00ff,#ff0000)] opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Inner Card Content */}
      <div className="relative h-full w-full rounded-[12.5px] bg-[#070b17] overflow-hidden flex flex-col">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.15),transparent_58%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-10" />

        <div className="relative h-[60px] sm:h-[68px] bg-[#050812]/50 border-b border-white/[0.02]">
          {imageUrl ? (
            <div className="absolute inset-0 flex items-center justify-center p-2">
              <Image
                src={imageUrl}
                alt={name}
                fill
                className="object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-out group-hover:scale-[1.12]"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 150px"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package className="size-5 text-slate-600" />
            </div>
          )}
        </div>

        <div className="relative px-2.5 py-2">
          <h3 className="text-[12px] font-semibold text-white mb-0.5 group-hover:text-white/90 transition-colors line-clamp-1 sm:text-[13px]">
            {name}
          </h3>
          <p className="text-[10px] text-slate-500/90 mb-1">
            {count} sản phẩm
          </p>
          
          <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-400 group-hover:text-emerald-300 transition-colors">
            <span>Xem ngay</span>
            <ArrowRight className="size-2.5 transition-transform duration-300 group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>
    </Link>
  )
}
