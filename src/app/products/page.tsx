import { Suspense } from 'react'
import { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { ProductCatalog } from '@/components/domain/ProductCatalog'
import { getSiteSettings } from '@/lib/settings'
import { toStoreProduct } from '@/lib/products/mapper'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return {
    title: 'Sản phẩm',
    description: `Khám phá tất cả sản phẩm gaming gear, linh kiện máy tính chính hãng tại ${settings.shopName}.`,
  }
}

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    where: { isVisible: true, status: 'ACTIVE' },
    include: {
      category: { select: { name: true } },
      images: {
        orderBy: { sortOrder: 'asc' },
        select: { url: true, sortOrder: true, isPrimary: true },
      },
    },
    orderBy: [
      { soldCount: 'desc' },
      { updatedAt: 'desc' },
    ],
  })

  // Map to plain objects so Next.js RSC serialization preserves the images array
  const mappedProducts = products.map(toStoreProduct)

  return (
    <main className="min-h-screen bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Sản phẩm</h1>
          <p className="text-slate-400">Tìm kiếm và khám phá các sản phẩm gaming gear phù hợp với bạn.</p>
        </div>
        <Suspense fallback={<div className="text-white text-center py-10">Đang tải sản phẩm…</div>}>
          <ProductCatalog products={mappedProducts} />
        </Suspense>
      </div>
    </main>
  )
}
