import { Metadata } from 'next'
import { Suspense } from 'react'
import { ProductCatalog } from '@/components/domain/ProductCatalog'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

import { getSiteSettings } from '@/lib/settings'

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
  }) as any // Cast as any because ProductCatalog expects StoreProduct which might have different types (like Dates serialized as strings from API vs Date objects from Prisma)

  return (
    <main className="min-h-screen bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Sản phẩm</h1>
          <p className="text-slate-400">Tìm kiếm và khám phá các sản phẩm gaming gear phù hợp với bạn.</p>
        </div>
        <Suspense fallback={<div className="text-white text-center py-10">Đang tải sản phẩm…</div>}>
          <ProductCatalog products={products} />
        </Suspense>
      </div>
    </main>
  )
}
