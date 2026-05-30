'use client'

import { useMemo, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Package } from 'lucide-react'
import type { StoreProduct } from './ProductCard'
import { categoryMegaMenu } from '@/config/categoryMegaMenu'
import { CATEGORY_NAME_TO_SLUG } from '@/config/productFilters'

interface CategoryFilterRailProps {
  products: StoreProduct[]
}

function CategoryFilterRailInner({ products }: CategoryFilterRailProps) {
  const searchParams = useSearchParams()
  const { push } = useRouter()
  const currentCategory = searchParams.get('category') || 'all'

  const tabs = useMemo(() => {
    return [
      { id: 'all', label: 'Tất cả', slug: null, Icon: Package },
      ...categoryMegaMenu.map((cat) => ({
        id: cat.id,
        label: cat.label,
        slug: cat.slug,
        Icon: cat.icon,
      })),
    ]
  }, [])

  const getCount = (slug: string | null) => {
    if (!slug) return products.length
    return products.filter((p) => {
      const productSlug = p.category?.name ? CATEGORY_NAME_TO_SLUG[p.category.name] : null
      return productSlug === slug
    }).length
  }

  const handleClick = (slug: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    ;['brand', 'resolution', 'refreshRate', 'connection', 'switch', 'size', 'shape', 'panel',
      'minPrice', 'maxPrice', 'search'].forEach((k) => params.delete(k))

    if (!slug) {
      params.delete('category')
    } else {
      params.set('category', slug)
    }
    push(`/products?${params.toString()}`)
  }

  const normalizedCurrentCategory = currentCategory === 'all' ? 'all' : currentCategory

  return (
    <div className="mb-6">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide items-center h-14">
        {tabs.map(({ id, label, slug, Icon }) => {
          const isActive =
            (slug === null && normalizedCurrentCategory === 'all') ||
            (slug !== null && normalizedCurrentCategory === slug)

          const count = getCount(slug)

          return (
            <button
              key={id}
              type="button"
              onClick={() => handleClick(slug)}
              className={`
                group flex items-center gap-2 px-4 h-10 rounded-full border transition-all duration-200 whitespace-nowrap outline-none
                ${isActive
                  ? 'bg-[#070b17] border-emerald-500/50 text-white'
                  : 'bg-[#070b17] border-white/[0.06] text-slate-300 hover:border-white/[0.12] hover:bg-[#0a0f1e] hover:-translate-y-[1px]'
                }
              `}
            >
              <Icon
                className={`size-4 transition-colors ${
                  isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-300'
                }`}
              />
              <span className="text-sm font-medium">{label}</span>
              {count > 0 && (
                <span className={`text-xs ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                  ({count})
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function CategoryFilterRail(props: CategoryFilterRailProps) {
  return (
    <Suspense fallback={<div className="h-14 animate-pulse bg-slate-900/50 rounded-full w-full mb-6" />}>
      <CategoryFilterRailInner {...props} />
    </Suspense>
  )
}