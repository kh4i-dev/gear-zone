import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/utils'
import { getPrimaryLegacyImageUrl } from '@/lib/product-images'
import { ArrowLeft, ArrowRight, Star } from 'lucide-react'
import Link from 'next/link'
import { ProductSpecsAndDesc } from './ProductSpecsAndDesc'
import { ProductImageFrame } from '@/components/domain/ProductImageFrame'
import { ProductPurchaseExperience } from './ProductPurchaseExperience'
import { ProductRowCarousel } from '@/components/domain/ProductRowCarousel'
import { ProductCard } from '@/components/domain/ProductCard'
import { publicProductWhere } from '@/lib/products/publicProductHelper'
import { selectRelatedProducts } from '@/lib/products/publicProductSections'

export const dynamic = 'force-dynamic'


export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await prisma.product.findUnique({ where: { id } })

  if (!product) {
    return { title: 'Không tìm thấy sản phẩm' }
  }

  return {
    title: product.name,
    description: product.description?.substring(0, 160) || 'Chi tiết sản phẩm',
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      images: { orderBy: { sortOrder: 'asc' } },
      options: {
        orderBy: { sortOrder: 'asc' },
        include: {
          values: { orderBy: { sortOrder: 'asc' } },
        },
      },
      variants: {
        orderBy: { createdAt: 'asc' },
        include: {
          optionValues: {
            include: {
              optionValue: true,
            },
          },
        },
      },
      reviews: {
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true } }
        }
      }
    },
  })

  if (!product || !product.isVisible || product.status !== 'ACTIVE') {
    notFound()
  }

  const [initialRelatedProducts, settings] = await Promise.all([
    prisma.product.findMany({
      where: {
        ...publicProductWhere,
        categoryId: product.categoryId,
        id: { not: product.id },
      },
      orderBy: [
        { soldCount: 'desc' },
        { updatedAt: 'desc' },
      ],
      take: 16,
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: 'asc' },
          select: { url: true, sortOrder: true, isPrimary: true },
        },
      },
    }),
    prisma.setting.findMany(),
  ])

  const relatedProducts = selectRelatedProducts(initialRelatedProducts, product.id)
  const settingsMap = settings.reduce((acc, setting) => ({ ...acc, [setting.key]: setting.value }), {} as Record<string, string>)
  
  const reviews = product.reviews || []
  const totalReviews = reviews.length
  const averageRating = totalReviews > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1) : '0'
  
  const ratingCounts = [0, 0, 0, 0, 0, 0] // index 1-5
  reviews.forEach(r => ratingCounts[r.rating]++)
  const pct5 = totalReviews > 0 ? Math.round((ratingCounts[5] / totalReviews) * 100) : 0
  const pct4 = totalReviews > 0 ? Math.round((ratingCounts[4] / totalReviews) * 100) : 0
  const pct3 = totalReviews > 0 ? Math.round((ratingCounts[3] / totalReviews) * 100) : 0
  const pct2 = totalReviews > 0 ? Math.round((ratingCounts[2] / totalReviews) * 100) : 0
  const pct1 = totalReviews > 0 ? Math.round((ratingCounts[1] / totalReviews) * 100) : 0

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <Link
          href="/products"
          className="group mb-8 inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500 transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-emerald-400"
        >
          <ArrowLeft className="size-3.5 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-x-1" />
          Quay lại danh sách sản phẩm
        </Link>

        <ProductPurchaseExperience product={product} settingsMap={settingsMap} />

        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <ProductRowCarousel 
              header={
                <>
                  <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                    <span className="inline-block size-2 rounded-full bg-emerald-500 animate-pulse" />
                    Sản phẩm tương tự
                  </h2>
                  <Link href={`/category/${product.categoryId}`} className="inline-flex items-center gap-1 font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer text-sm">
                    Xem tất cả
                    <ArrowRight className="size-4" />
                  </Link>
                </>
              }
              autoSlideInterval={4000}
            >
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct.id} className="w-full">
                  <ProductCard product={relatedProduct} accent={{ primary: '#10b981', glow: 'rgba(16, 185, 129, 0.15)', text: '#10b981' }} />
                </div>
              ))}
            </ProductRowCarousel>
          </section>
        )}

        <ProductSpecsAndDesc product={product} shopName={settingsMap.shop_name || 'GearZone'} />

        <section className="mt-16 rounded-[2rem] bg-white/[0.02] p-2 ring-1 ring-white/[0.06]">
          <div className="rounded-[calc(2rem-8px)] bg-[#0a0a0a] p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] lg:p-10">
            <div className="mb-8 flex items-baseline gap-2 border-b border-white/[0.04] pb-5">
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-400/70">Đánh giá</span>
              <span className="text-xs text-slate-600 font-medium">/</span>
              <h2 className="text-sm font-semibold tracking-tight text-slate-300">{product.name}</h2>
            </div>

            {totalReviews > 0 ? (
              <>
                <div className="rounded-[1.5rem] bg-white/[0.02] p-1.5 ring-1 ring-white/[0.05]">
                  <div className="flex flex-col items-center justify-between gap-8 rounded-[calc(1.5rem-6px)] bg-[#060606] p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)] md:flex-row">
                    <div className="text-center md:border-r md:border-white/[0.04] md:pr-12">
                      <p className="text-5xl font-bold tracking-tight text-white">
                        {averageRating}<span className="text-2xl font-medium text-slate-600">/5</span>
                      </p>
                      <div className="my-3 flex items-center justify-center gap-0.5 text-amber-400">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star key={index} className={`size-4 ${index < Math.round(Number(averageRating)) ? 'fill-current' : 'text-slate-700'}`} />
                        ))}
                      </div>
                      <p className="text-[11px] font-medium text-slate-500">{totalReviews} đánh giá</p>
                    </div>
                    <div className="w-full max-w-md flex-1 space-y-2.5">
                      {[
                        ['5 sao', pct5],
                        ['4 sao', pct4],
                        ['3 sao', pct3],
                        ['2 sao', pct2],
                        ['1 sao', pct1],
                      ].map(([label, percent]) => (
                        <div key={label as string} className="flex items-center gap-4 text-xs">
                          <span className="w-8 font-medium text-slate-500">{label}</span>
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.04]">
                            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500" style={{ width: `${percent}%` }} />
                          </div>
                          <span className="w-8 text-right font-medium text-slate-500">{percent}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="rounded-[1.25rem] bg-white/[0.01] p-1 ring-1 ring-white/[0.04] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:ring-white/[0.08]">
                      <div className="rounded-[calc(1.25rem-4px)] bg-[#060606] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                        <div className="mb-4 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="grid size-10 place-items-center rounded-full bg-emerald-500/10 text-sm font-semibold text-emerald-400 ring-1 ring-emerald-500/20">
                              {review.user.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-white">{review.user.name}</h4>
                              <p className="mt-0.5 text-[11px] text-slate-600">{review.createdAt.toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5 text-amber-400">
                            {Array.from({ length: 5 }).map((_, index) => (
                              <Star key={index} className={`size-3.5 ${index < review.rating ? 'fill-current' : 'text-slate-800'}`} />
                            ))}
                          </div>
                        </div>
                        {review.comment && <p className="text-[13px] leading-relaxed text-slate-400">{review.comment}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center text-slate-500 py-8 border border-dashed border-white/10 rounded-2xl">
                Chưa có đánh giá nào cho sản phẩm này.
              </div>
            )}

          </div>
        </section>
      </main>
    </div>
  )
}
