'use client'

import { useMemo } from 'react'
import { LayoutGrid } from 'lucide-react'
import { CategoryCard, type CategoryData } from './CategoryCard'
import type { StoreProduct } from './ProductCard'
import { getPrimaryLegacyImageUrl } from '@/lib/product-images'

interface HomeCategorySectionProps {
  products: StoreProduct[]
}

export function HomeCategorySection({ products }: HomeCategorySectionProps) {
  const categories = useMemo(() => {
    if (!products) return []
    const groups: Record<string, { count: number; image: string; id: string }> = {}
    
    products.forEach(p => {
      const catName = p.category?.name || 'Phụ kiện / Khác'
      const catId = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      if (!groups[catName]) {
        groups[catName] = { 
          count: 0, 
          image: getPrimaryLegacyImageUrl(p.imageUrl) || '', 
          id: catId 
        }
      }
      groups[catName].count++
      if (!groups[catName].image && p.imageUrl) {
        groups[catName].image = getPrimaryLegacyImageUrl(p.imageUrl) || ''
      }
    })

    const badges: ('HOT' | 'NEW' | 'TRENDING' | undefined)[] = ['HOT', 'NEW', 'TRENDING', undefined, 'HOT', undefined]
    
    return Object.entries(groups).map(([name, data], index) => ({
      id: data.id,
      name,
      count: data.count,
      imageUrl: data.image,
      badge: badges[index % badges.length],
    }))
  }, [products])

  if (categories.length === 0) return null

  return (
    <section id="home-categories" className="mx-auto max-w-7xl px-4 py-16">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-white mb-4 flex items-center justify-center gap-3">
          <LayoutGrid className="size-8 text-emerald-400" />
          Khám phá danh mục
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Tìm nhanh thiết bị gaming phù hợp với nhu cầu của bạn.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {categories.map((category) => (
          <CategoryCard key={category.name} category={category} />
        ))}
      </div>
    </section>
  )
}
