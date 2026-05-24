'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ImageIcon, Package, Search, ShoppingCart, SlidersHorizontal, Star, Tag } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/components/providers/CartProvider'
import { toast } from 'sonner'

export interface StoreProduct {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  price: number
  oldPrice: number | null
  stock: number
  soldCount: number
  category: { name: string } | null
}

type SortKey = 'featured' | 'name-asc' | 'price-asc' | 'price-desc' | 'stock-desc'

interface ProductCatalogProps {
  products: StoreProduct[]
  compact?: boolean
}

export function ProductCatalog({ products, compact = false }: ProductCatalogProps) {
  const [filters, setFilters] = useState({
    searchQuery: '',
    category: 'all',
    minPrice: '',
    maxPrice: '',
    sortKey: 'featured' as SortKey,
    inStockOnly: false,
  })

  const { searchQuery, category, minPrice, maxPrice, sortKey, inStockOnly } = filters

  const setSearchQuery = (val: string) => setFilters(prev => ({ ...prev, searchQuery: val }))
  const setCategory = (val: string) => setFilters(prev => ({ ...prev, category: val }))
  const setMinPrice = (val: string) => setFilters(prev => ({ ...prev, minPrice: val }))
  const setMaxPrice = (val: string) => setFilters(prev => ({ ...prev, maxPrice: val }))
  const setSortKey = (val: SortKey) => setFilters(prev => ({ ...prev, sortKey: val }))
  const setInStockOnly = (val: boolean) => setFilters(prev => ({ ...prev, inStockOnly: val }))

  const { addToCart } = useCart()

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

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4 shadow-sm backdrop-blur-md">
        <div className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
          <SlidersHorizontal className="size-4 text-indigo-600" />
          Bộ lọc sản phẩm
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
          <div className="relative xl:col-span-2">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tìm tên hàng, hãng, mô tả..."
              aria-label="Tìm kiếm sản phẩm"
              className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 pl-10 pr-3 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-11 rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm font-medium text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">Tất cả hãng/danh mục</option>
            {categories.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <input
            type="number"
            min="0"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
            placeholder="Giá từ"
            aria-label="Giá tối thiểu"
            className="h-11 rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
          <input
            type="number"
            min="0"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            placeholder="Giá đến"
            aria-label="Giá tối đa"
            className="h-11 rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
          <select
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value as SortKey)}
            className="h-11 rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm font-medium text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="featured">Bán chạy</option>
            <option value="name-asc">Tên A-Z</option>
            <option value="price-asc">Giá thấp đến cao</option>
            <option value="price-desc">Giá cao đến thấp</option>
            <option value="stock-desc">Tồn kho nhiều</option>
          </select>
        </div>
        <p className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-slate-300">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(event) => setInStockOnly(event.target.checked)}
            aria-label="Chỉ hiện hàng còn tồn"
            className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          Chỉ hiện hàng còn tồn
        </p>
      </div>

      {filteredProducts.length > 0 ? (
        <div className={compact ? 'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4' : 'grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4'}>
          {filteredProducts.map((product) => {
            const discount = product.oldPrice && product.oldPrice > product.price
              ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
              : null

            return (
              <article key={product.id} className="overflow-hidden rounded-2xl border border-white/5 bg-slate-900/40 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-500/50 hover:shadow-indigo-500/10 flex flex-col">
                <Link href={`/products/${product.id}`} className="relative aspect-[4/3] bg-slate-950 block overflow-hidden group">
                  {discount && (
                    <span className="absolute right-3 top-3 z-10 rounded-full bg-rose-500 px-2.5 py-1 text-xs font-extrabold text-white">
                      -{discount}%
                    </span>
                  )}
                  {product.imageUrl ? (
                    <Image src={product.imageUrl} alt={product.name} width={300} height={225} className="size-full object-cover transition duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="flex size-full items-center justify-center transition duration-300 group-hover:scale-105">
                      <ImageIcon className="size-10 text-slate-400" />
                    </div>
                  )}
                </Link>
                <div className="p-4 flex flex-1 flex-col">
                  <div className="mb-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/10 px-2.5 py-1 text-xs font-extrabold uppercase tracking-wide text-indigo-400">
                    <Tag className="size-3" />
                    {product.category?.name || 'Khác'}
                  </div>
                  <Link href={`/products/${product.id}`} className="group">
                    <h2 className="min-h-12 text-base font-semibold leading-6 text-white group-hover:text-indigo-400 transition-colors line-clamp-2">{product.name}</h2>
                  </Link>
                  <div className="mt-2 flex items-center gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className="size-3.5 fill-current" />
                    ))}
                    <span className="ml-1 text-xs font-semibold text-slate-500">({Math.max(product.soldCount * 7, 12)})</span>
                  </div>
                  <p className="mt-2 min-h-10 text-xs leading-5 text-slate-400 line-clamp-2">
                    {product.description || 'Sản phẩm gaming gear chính hãng tại GearZone.'}
                  </p>
                  <div className="mt-4 flex items-end gap-2">
                    <span className="text-lg font-extrabold text-white">{formatPrice(product.price)}</span>
                    {product.oldPrice && (
                      <span className="mb-0.5 text-sm font-semibold text-slate-500 line-through">{formatPrice(product.oldPrice)}</span>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs font-semibold">
                    <span className={product.stock > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                      {product.stock > 0 ? `Còn ${product.stock}` : 'Hết hàng'}
                    </span>
                    <span className="text-slate-500">Đã bán {product.soldCount}</span>
                  </div>
                  <div className="mt-auto pt-4">
                    <button type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      addToCart({
                        productId: product.id,
                        name: product.name,
                        price: product.price,
                        imageUrl: product.imageUrl,
                        maxStock: product.stock,
                      })
                      toast.success(`Đã thêm ${product.name} vào giỏ hàng`)
                    }}
                    disabled={product.stock <= 0}
                    className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 text-sm font-extrabold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-black/40"
                  >
                    <ShoppingCart className="size-4" />
                    Thêm vào giỏ
                  </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/40 py-20 text-center">
          <Package className="mx-auto mb-4 size-12 text-slate-600" />
          <h2 className="text-lg font-semibold text-white">Không tìm thấy sản phẩm</h2>
          <p className="mt-1 text-sm text-slate-400">Thử đổi từ khóa, khoảng giá hoặc bộ lọc tồn kho.</p>
        </div>
      )}
    </div>
  )
}
