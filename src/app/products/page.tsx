'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { ProductCatalog, type StoreProduct } from '@/components/domain/ProductCatalog'
import { StoreNavbar } from '@/components/domain/StoreNavbar'

export default function ProductsPage() {
  const [products, setProducts] = useState<StoreProduct[] | undefined>(undefined)
  const isLoading = products === undefined

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await window.fetch('/api/products')
        const result = await res.json()
        setProducts(result.data || [])
      } catch {
        setProducts([])
      }
    }

    fetchProducts()
  }, [])

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <StoreNavbar />

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight">Sản phẩm</h1>
          <p className="mt-2 text-sm text-slate-400">Tìm kiếm, lọc giá, lọc hãng/danh mục và sắp xếp theo nhu cầu mua hàng.</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-28">
            <Loader2 className="size-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <ProductCatalog products={products ?? []} />
        )}
      </section>
    </main>
  )
}
