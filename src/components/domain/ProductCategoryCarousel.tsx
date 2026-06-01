import { useMemo } from 'react'
import { ArrowRight, Truck } from 'lucide-react'
import { ProductCard, type StoreProduct } from './ProductCard'
import { ProductRowCarousel } from './ProductRowCarousel'

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

  if (products.length === 0) return null

  const header = (
    <>
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
    </>
  )

  return (
    <ProductRowCarousel
      header={header}
      autoSlideInterval={4000}
    >
      {products.map((product) => (
        <div 
          key={product.id} 
          className="w-full"
        >
          <ProductCard product={product} accent={accent} />
        </div>
      ))}
    </ProductRowCarousel>
  )
}
