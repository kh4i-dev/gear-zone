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
      className="group block relative overflow-hidden rounded-xl bg-[#070b17]/90 border border-white/[0.06] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-emerald-400/20 hover:shadow-[0_0_0_1px_rgba(16,185,129,0.08),0_12px_30px_rgba(0,0,0,0.28)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.10),transparent_58%)] opacity-70 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative h-24 overflow-hidden bg-[#050812] sm:h-[104px] md:h-28">
        {imageUrl ? (
          <div className="absolute inset-0 flex items-center justify-center p-3">
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-contain drop-shadow-[0_16px_24px_rgba(0,0,0,0.35)] transition-transform duration-300 ease-out group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 180px"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package className="size-7 text-slate-600" />
          </div>
        )}
      </div>

      <div className="relative p-3">
        <h3 className="text-sm font-semibold text-white mb-0.5 group-hover:text-white/90 transition-colors line-clamp-1 md:text-base">
          {name}
        </h3>
        <p className="text-xs text-slate-500 mb-2">
          {count} sản phẩm
        </p>
        
        <div className="flex items-center gap-1.5 text-xs font-medium text-indigo-400 group-hover:text-indigo-300 transition-colors">
          <span>Xem ngay</span>
          <ArrowRight className="size-3 transition-transform duration-300 group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  )
}
