'use client'

import { useMemo, useState, useEffect, Suspense, useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { ImageIcon, Package, Search, SlidersHorizontal, Filter, Check, X } from 'lucide-react'
import { ProductCard, type StoreProduct } from '@/components/domain/ProductCard'
import { CategoryFilterRail } from '@/components/domain/CategoryFilterRail'
import { ProductCategoryCarousel } from '@/components/domain/ProductCategoryCarousel'
import { 
  productMatchesFilter, 
  productMatchesCategory,
  normalizeOldQueryParam,
  getProductCategorySlug,
} from '@/lib/products/normalizeProductFilters'
import { getFilterLabel, parseFilterValue } from '@/config/productFilters'

type SortKey = 'featured' | 'name-asc' | 'price-asc' | 'price-desc' | 'stock-desc'

interface ProductCatalogProps {
  products: StoreProduct[]
  compact?: boolean
}

const FILTER_KEYS = ['brand', 'resolution', 'refreshRate', 'connection', 'switch', 'size', 'shape', 'panel', 'layout', 'weight', 'sensor']

function ProductCatalogInner({ products, compact = false }: ProductCatalogProps) {
  const searchParams = useSearchParams()
  const { push } = useRouter()
  const pathname = usePathname()
  const { get } = searchParams

  const [filters, setFilters] = useState({
    searchQuery: '',
    category: 'all',
    minPrice: '',
    maxPrice: '',
    sortKey: 'featured' as SortKey,
    inStockOnly: false,
  })

  const [brands, setBrands] = useState<string[] | undefined>(undefined)

  useEffect(() => {
    const urlCategory = get.call(searchParams, 'category') || 'all'
    const normalizedCategory = normalizeOldQueryParam('category', urlCategory)
    
    const urlSearch = get.call(searchParams, 'search') || ''
    const urlMinPrice = get.call(searchParams, 'minPrice') || ''
    const urlMaxPrice = get.call(searchParams, 'maxPrice') || ''
    const urlSort = get.call(searchParams, 'sort') || 'featured'
    const urlBrand = get.call(searchParams, 'brand') || ''
    
    const combinedSearchQuery = urlSearch || urlBrand

    setFilters(prev => ({
      ...prev,
      category: normalizedCategory,
      searchQuery: combinedSearchQuery,
      minPrice: urlMinPrice,
      maxPrice: urlMaxPrice,
      sortKey: urlSort as SortKey,
    }))
  }, [searchParams, get])

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings')
        const result = await res.json()
        if (res.ok && result.data && result.data.shop_brands) {
          setBrands(JSON.parse(result.data.shop_brands))
        }
      } catch {
      }
    }
    fetchSettings()
  }, [])

  const { searchQuery, category, minPrice, maxPrice, sortKey, inStockOnly } = filters

  const setSearchQuery = (val: string) => setFilters(prev => ({ ...prev, searchQuery: val }))
  const setCategory = (val: string) => setFilters(prev => ({ ...prev, category: val }))
  const setMinPrice = (val: string) => setFilters(prev => ({ ...prev, minPrice: val }))
  const setMaxPrice = (val: string) => setFilters(prev => ({ ...prev, maxPrice: val }))
  const setSortKey = (val: SortKey) => setFilters(prev => ({ ...prev, sortKey: val }))
  const setInStockOnly = (val: boolean) => setFilters(prev => ({ ...prev, inStockOnly: val }))

  const categories = useMemo(() => {
    return Array.from(new Set(products.flatMap((product) => product.category?.name ? [product.category.name] : []))).sort() as string[]
  }, [products])

  const activeFilters = useMemo(() => {
    const active: { key: string; value: string; label: string }[] = []
    
    if (category && category !== 'all') {
      active.push({ key: 'category', value: category, label: getFilterLabel('category', category) })
    }

    FILTER_KEYS.forEach((key) => {
      const paramValue = get.call(searchParams, key)
      if (paramValue) {
        const slugs = parseFilterValue(paramValue)
        slugs.forEach((slug) => {
          const normalizedSlug = normalizeOldQueryParam(key, slug)
          active.push({ key, value: normalizedSlug, label: getFilterLabel(key, normalizedSlug) })
        })
      }
    })

    return active
  }, [category, searchParams, get])

  const removeFilter = useCallback((filterKey: string, filterValue?: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (filterKey === 'category') {
      params.delete('category')
    } else if (filterValue) {
      const current = params.get(filterKey)
      if (current) {
        const slugs = parseFilterValue(current)
        const filtered = slugs.filter(s => s !== filterValue)
        if (filtered.length > 0) {
          params.set(filterKey, filtered.join(','))
        } else {
          params.delete(filterKey)
        }
      }
    } else {
      params.delete(filterKey)
    }

    push(`${pathname}?${params.toString()}`, { scroll: false })
  }, [searchParams, pathname, push])

  const clearAllFilters = useCallback(() => {
    const params = new URLSearchParams()
    params.set('sort', sortKey)
    push(`${pathname}?${params.toString()}`, { scroll: false })
  }, [pathname, push, sortKey])

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const min = minPrice === '' ? null : Number(minPrice)
    const max = maxPrice === '' ? null : Number(maxPrice)

    const customQueries: [string, string][] = []
    searchParams.forEach((val, key) => {
      if (!['category', 'search', 'minPrice', 'maxPrice', 'sort', 'brand'].includes(key) && val) {
        const slugs = parseFilterValue(val)
        slugs.forEach((slug) => {
          customQueries.push([key, normalizeOldQueryParam(key, slug)])
        })
      }
    })

    const brandParam = get.call(searchParams, 'brand')
    if (brandParam) {
      const brandSlugs = parseFilterValue(brandParam)
      brandSlugs.forEach((slug) => {
        customQueries.push(['brand', normalizeOldQueryParam('brand', slug)])
      })
    }

    return products
      .filter((product) => {
        const matchesSearch =
          !query ||
          product.name.toLowerCase().includes(query) ||
          product.category?.name.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query)
        
        const matchesCategory = productMatchesCategory(product, category)
        const matchesMin = min === null || product.price >= min
        const matchesMax = max === null || product.price <= max
        const matchesStock = !inStockOnly || product.stock > 0

        const matchesCustom = customQueries.every(([key, slug]) => {
          return productMatchesFilter(product, key, slug)
        })

        return matchesSearch && matchesCategory && matchesMin && matchesMax && matchesStock && matchesCustom
      })
      .sort((a, b) => {
        if (sortKey === 'name-asc') return a.name.localeCompare(b.name, 'vi')
        if (sortKey === 'price-asc') return a.price - b.price
        if (sortKey === 'price-desc') return b.price - a.price
        if (sortKey === 'stock-desc') return b.stock - a.stock
        return b.soldCount - a.soldCount
      })
  }, [products, searchQuery, category, minPrice, maxPrice, sortKey, inStockOnly, searchParams, get])

  const isDefaultView = useMemo(() => {
    return (
      category === 'all' &&
      searchQuery.trim() === '' &&
      minPrice === '' &&
      maxPrice === '' &&
      !inStockOnly &&
      activeFilters.length === 0
    )
  }, [category, searchQuery, minPrice, maxPrice, inStockOnly, activeFilters])

  const categoryGroups = useMemo(() => {
    const groups: Record<string, StoreProduct[]> = {}
    products.forEach((product) => {
      const catName = product.category?.name || 'Khác'
      if (!groups[catName]) groups[catName] = []
      groups[catName].push(product)
    })
    return groups
  }, [products])

  const accent = {
    primary: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25 text-white',
    glow: 'bg-emerald-500/10',
    text: 'text-emerald-400',
  }

  return (
    <div className="space-y-6">
      <CategoryFilterRail products={products} />

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-400">Bộ lọc:</span>
          {activeFilters.map((filter) => (
            <button
              key={`${filter.key}-${filter.value}`}
              onClick={() => removeFilter(filter.key, filter.value)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors"
            >
              {filter.label}
              <X className="size-3" />
            </button>
          ))}
          <button
            onClick={clearAllFilters}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-700/50 border border-slate-600 text-slate-300 text-xs font-medium hover:bg-slate-700 transition-colors"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}

      <div className="p-1.5 rounded-[1.25rem] bg-white/[0.03] ring-1 ring-white/[0.06]">
       <div className="rounded-[calc(1.25rem-6px)] bg-[#0a0a0a] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
        <div className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
          <SlidersHorizontal className="size-4 text-emerald-400" />
          Bộ lọc & Tìm kiếm nhanh
        </div>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="relative xl:col-span-2">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tìm tên hàng, hãng, mô tả…"
              aria-label="Tìm kiếm sản phẩm"
              className="h-11 w-full rounded-xl ring-1 ring-white/[0.08] border-0 bg-[#050505] pl-10 pr-3 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-500 ease-out"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 xl:col-span-2">
            <input
              type="number"
              min="0"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              placeholder="Giá từ (VND)"
              aria-label="Giá tối thiểu"
              className="h-11 w-full rounded-xl ring-1 ring-white/[0.08] border-0 bg-[#050505] px-3 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-500 ease-out"
            />
            <input
              type="number"
              min="0"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              placeholder="Giá đến (VND)"
              aria-label="Giá tối đa"
              className="h-11 w-full rounded-xl ring-1 ring-white/[0.08] border-0 bg-[#050505] px-3 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-500 ease-out"
            />
          </div>

          <select
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value as SortKey)}
            className="h-11 rounded-xl ring-1 ring-white/[0.08] border-0 bg-[#050505] px-3 text-sm font-bold text-white outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-500 ease-out cursor-pointer"
          >
            <option value="featured">Sắp xếp: Bán chạy nhất</option>
            <option value="name-asc">Sắp xếp: Tên A - Z</option>
            <option value="price-asc">Sắp xếp: Giá tăng dần</option>
            <option value="price-desc">Sắp xếp: Giá giảm dần</option>
            <option value="stock-desc">Sắp xếp: Tồn kho nhiều nhất</option>
          </select>
        </div>

        <p className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-slate-300 select-none cursor-pointer">
          <input
            type="checkbox"
            id="inStockOnlyCheckbox"
            checked={inStockOnly}
            onChange={(event) => setInStockOnly(event.target.checked)}
            className="size-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 bg-[#050505] ring-1 ring-white/[0.08] border-0"
          />
          <label htmlFor="inStockOnlyCheckbox" className="cursor-pointer">Chỉ hiện sản phẩm còn hàng tồn kho</label>
        </p>
       </div>
      </div>

      {isDefaultView ? (
        <div className="space-y-4">
          {Object.entries(categoryGroups).map(([name, catProducts]) => (
            <ProductCategoryCarousel
              key={name}
              categoryName={name}
              products={catProducts}
              accent={accent}
              onViewAll={() => setCategory(name)}
              onBrandClick={(brand) => {
                setCategory(name)
                setSearchQuery(brand)
              }}
              brands={brands}
            />
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className={compact ? 'grid grid-cols-1 gap-5 lg:gap-6 sm:grid-cols-2 lg:grid-cols-4' : 'grid grid-cols-1 gap-5 lg:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}>
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} accent={accent} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/40 py-20 text-center shadow-lg">
          <Package className="mx-auto mb-4 size-14 text-slate-600 animate-glow-pulse opacity-30" />
          <h2 className="text-lg font-bold text-white">Không tìm thấy sản phẩm nào phù hợp</h2>
          <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
            Vui lòng điều chỉnh lại bộ lọc, nhập từ khóa tìm kiếm khác hoặc thay đổi khoảng giá.
          </p>
          {activeFilters.length > 0 && (
            <button
              onClick={clearAllFilters}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
            >
              <Filter className="size-4" />
              Xóa bộ lọc
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export function ProductCatalog(props: ProductCatalogProps) {
  return (
    <Suspense fallback={<div className="text-white text-center py-10">Đang tải sản phẩm…</div>}>
      <ProductCatalogInner {...props} />
    </Suspense>
  )
}