'use client'

import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ArrowRight, Truck } from 'lucide-react'
import { ProductCard, type StoreProduct } from './ProductCard'

interface ProductCategoryCarouselProps {
  categoryName: string
  products: StoreProduct[]
  accent: {
    primary: string
    glow: string
    text: string
  }
  onViewAll: () => void
  onBrandClick: (brand: string) => void
  brands?: string[]
}

const COMMON_BRANDS = ['Logitech', 'Razer', 'Asus', 'Corsair', 'Akko', 'Keychron', 'AULA', 'HyperX', 'SteelSeries', 'Fuhlen']

export function ProductCategoryCarousel({
  categoryName,
  products,
  accent,
  onViewAll,
  onBrandClick,
  brands,
}: ProductCategoryCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  // Dynamically extract brands that are present in the products list for this category
  const categoryBrands = useMemo(() => {
    const brandsInProducts = new Set<string>()
    const brandsList = brands && brands.length > 0 ? brands : COMMON_BRANDS
    products.forEach((p) => {
      const match = brandsList.find((brand) => p.name.toLowerCase().includes(brand.toLowerCase()))
      if (match) brandsInProducts.add(match)
    })
    return Array.from(brandsInProducts).sort().slice(0, 5)
  }, [products, brands])

  const checkScrollLimits = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 5)
    // Add small buffer for sub-pixel rendering in browsers
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5)
  }, [])

  const checkScrollLimitsRef = useRef(checkScrollLimits)
  checkScrollLimitsRef.current = checkScrollLimits

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const handleScroll = () => {
      checkScrollLimitsRef.current()
    }

    el.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    window.addEventListener('resize', handleScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  // Auto-scroll every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const el = scrollRef.current
      if (!el) return

      const isAtEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 10
      if (isAtEnd) {
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        const scrollAmount = 300 // Roughly the width of one card + gap
        el.scrollBy({ left: scrollAmount, behavior: 'smooth' })
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const scrollAmount = el.clientWidth * 0.75
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  if (products.length === 0) return null

  return (
    <div className="p-1.5 rounded-[1.25rem] bg-white/[0.02] ring-1 ring-white/[0.04] mb-8">
      <div className="rounded-[calc(1.25rem-6px)] bg-[#070707] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)]">
        {/* Shelf Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-4 mb-5 gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <span className="inline-block size-2 rounded-full bg-emerald-500 animate-pulse" />
              {categoryName} bán chạy
            </h3>
            
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400">
              <Truck className="size-3" />
              Giao siêu tốc 2h
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap text-xs">
            {/* Quick Brands Links */}
            <div className="flex items-center gap-3 text-slate-400">
              {categoryBrands.map((brand) => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => onBrandClick(brand)}
                  className="hover:text-emerald-400 transition-colors font-medium cursor-pointer"
                >
                  {brand}
                </button>
              ))}
            </div>

            <span className="text-slate-700 hidden sm:inline">|</span>

            {/* View All Link */}
            <button
              type="button"
              onClick={onViewAll}
              className="inline-flex items-center gap-1 font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
            >
              Xem tất cả {categoryName}
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Slider Viewport Area */}
        <div className="relative group/slider">
          {/* Left Arrow Button */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => handleScroll('left')}
              aria-label="Cuộn sang trái"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-30 flex size-10 items-center justify-center rounded-full bg-slate-900/90 border border-white/10 text-white shadow-xl hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all cursor-pointer opacity-0 group-hover/slider:opacity-100 duration-300"
            >
              <ChevronLeft className="size-5" />
            </button>
          )}

          {/* Right Arrow Button */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => handleScroll('right')}
              aria-label="Cuộn sang phải"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-30 flex size-10 items-center justify-center rounded-full bg-slate-900/90 border border-white/10 text-white shadow-xl hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all cursor-pointer opacity-0 group-hover/slider:opacity-100 duration-300"
            >
              <ChevronRight className="size-5" />
            </button>
          )}

          {/* Viewport Container */}
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto pb-2 scroll-smooth scrollbar-hide select-none"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {products.map((product) => (
              <div 
                key={product.id} 
                className="w-[280px] shrink-0"
              >
                <ProductCard product={product} accent={accent} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
