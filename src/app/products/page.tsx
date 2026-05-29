'use client'

import { useSyncExternalStore } from 'react'
import { Loader2 } from 'lucide-react'
import { ProductCatalog } from '@/components/domain/ProductCatalog'
import { StoreNavbar } from '@/components/domain/StoreNavbar'
import { type StoreProduct } from '@/components/domain/ProductCard'

const productListeners = new Set<() => void>()
let productSnapshot: StoreProduct[] | undefined
let productRequest: Promise<void> | null = null

function loadProducts() {
  if (productRequest) return productRequest

  productRequest = window.fetch('/api/products')
    .then((res) => res.json())
    .then((result) => {
      productSnapshot = result.data || []
    })
    .catch(() => {
      productSnapshot = []
    })
    .finally(() => {
      productListeners.forEach((listener) => listener())
    })

  return productRequest
}

const productStore = {
  subscribe(listener: () => void) {
    productListeners.add(listener)
    if (productSnapshot === undefined) {
      loadProducts()
    }
    return () => {
      productListeners.delete(listener)
    }
  },
  getSnapshot: () => productSnapshot,
  getServerSnapshot: () => undefined,
}

export default function ProductsPage() {
  const products = useSyncExternalStore(
    productStore.subscribe,
    productStore.getSnapshot,
    productStore.getServerSnapshot
  )
  const isLoading = products === undefined

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
