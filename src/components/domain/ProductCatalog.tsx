'use client'

import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { ImageIcon, Package, Search, SlidersHorizontal } from 'lucide-react'
import { ProductCard, type StoreProduct } from '@/components/domain/ProductCard'

type SortKey = 'featured' | 'name-asc' | 'price-asc' | 'price-desc' | 'stock-desc'

interface ProductCatalogProps {
  products: StoreProduct[]
  compact?: boolean
}

export function ProductCatalog({ products, compact = false }: ProductCatalogProps) {
  const searchParams = useSearchParams()
  const getParam = searchParams.get.bind(searchParams)
  const initialCategory = getParam('category') || 'all'

  const [filters, setFilters] = useState({
    searchQuery: '',
    category: initialCategory,
    minPrice: '',
    maxPrice: '',
    sortKey: 'featured' as SortKey,
    inStockOnly: false,
  })

  // Sync with URL category query parameter changes
  useEffect(() => {
    const urlCategory = getParam('category')
    if (urlCategory) {
      setFilters(prev => ({ ...prev, category: urlCategory }))
    }
  }, [searchParams])

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

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const min = minPrice === '' ? null : Number(minPrice)
    const max = maxPrice === '' ? null : Number(maxPrice)

    return products
      .filter((product) => {
        const matchesSearch =
          !query ||
          product.name.toLowerCase().includes(query) ||
          product.category?.name.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query)
        const matchesCategory = category === 'all' || product.category?.name === category
        const matchesMin = min === null || product.price >= min
        const matchesMax = max === null || product.price <= max
        const matchesStock = !inStockOnly || product.stock > 0

        return matchesSearch && matchesCategory && matchesMin && matchesMax && matchesStock
      })
      .sort((a, b) => {
        if (sortKey === 'name-asc') return a.name.localeCompare(b.name, 'vi')
        if (sortKey === 'price-asc') return a.price - b.price
        if (sortKey === 'price-desc') return b.price - a.price
        if (sortKey === 'stock-desc') return b.stock - a.stock
        return b.soldCount - a.soldCount
      })
  }, [products, searchQuery, category, minPrice, maxPrice, sortKey, inStockOnly])

  const accent = {
    primary: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25 text-white',
    glow: 'bg-emerald-500/10',
    text: 'text-emerald-400',
  }

  return (
    <div className="space-y-6">
      {/* Category Quick Chips */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategory('all')}
          className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all duration-500 ease-out border ${
            category === 'all'
              ? 'bg-emerald-600 border-emerald-500/50 text-white shadow-[0_0_20px_rgba(16,185,129,0.15)]'
              : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/20'
          }`}
        >
          Tất cả danh mục
        </button>
        {categories.map((item) => (
          <button
            type="button"
            key={item}
            onClick={() => setCategory(item)}
            className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all duration-500 ease-out border ${
              category === item
                ? 'bg-emerald-600 border-emerald-500/50 text-white shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/20'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Filter Options */}
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
              placeholder="Tìm tên hàng, hãng, mô tả..."
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

      {/* Grid List */}
      {filteredProducts.length > 0 ? (
        <div className={compact ? 'grid grid-cols-1 gap-5 lg:gap-6 sm:grid-cols-2 lg:grid-cols-4' : 'grid grid-cols-1 gap-5 lg:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}>
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} accent={accent} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/40 py-20 text-center shadow-lg">
          <Package className="mx-auto mb-4 size-14 text-slate-600 animate-glow-pulse opacity-30" />
          <h2 className="text-lg font-bold text-white">Không tìm thấy sản phẩm nào phù hợp</h2>
          <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">Vui lòng điều chỉnh lại bộ lọc, nhập từ khóa tìm kiếm khác hoặc thay đổi khoảng giá.</p>
        </div>
      )}
    </div>
  )
}
