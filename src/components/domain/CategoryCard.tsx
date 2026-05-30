'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export interface CategoryData {
  id: string
  name: string
  count: number
  imageUrl: string
  badge?: 'HOT' | 'NEW' | 'TRENDING'
}

interface CategoryCardProps {
  category: CategoryData
}

const BADGE_COLORS = {
  HOT: 'from-purple-600 to-pink-600',
  NEW: 'from-blue-600 to-cyan-600', 
  TRENDING: 'from-emerald-600 to-teal-600',
} as const

export function CategoryCard({ category }: CategoryCardProps) {
  const { name, count, imageUrl, badge } = category

  return (
    <Link 
      href={`/products?category=${encodeURIComponent(name)}`}
      className="group block relative overflow-hidden rounded-[20px] bg-[#070b17] border border-white/[0.05] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-white/[0.12] hover:shadow-[0_0_0_1px_rgba(124,92,255,0.3),0_0_30px_rgba(124,92,255,0.15)]"
    >
      {/* Badge */}
      {badge && (
        <div className="absolute top-4 right-4 z-10">
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold text-white bg-gradient-to-r ${BADGE_COLORS[badge]}`}>
            {badge}
          </span>
        </div>
      )}

      {/* Image Container */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-b from-white/[0.02] to-transparent">
        {imageUrl ? (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-contain transition-transform duration-300 ease-out group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="size-16 rounded-full bg-white/[0.05]" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-white/90 transition-colors">
          {name}
        </h3>
        <p className="text-sm text-slate-400 mb-3">
          {count} sản phẩm
        </p>
        
        <div className="flex items-center gap-2 text-sm font-medium text-indigo-400 group-hover:text-indigo-300 transition-colors">
          <span>Xem ngay</span>
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>

      {/* Subtle RGB accent on hover */}
      <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-purple-600/5 via-transparent to-cyan-600/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
    </Link>
  )
}
