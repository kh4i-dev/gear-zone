'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { ShoppingCart, Star } from 'lucide-react'
import { formatPrice, sanitizeProductExcerpt } from '@/lib/utils'
import { getProductCardImages } from '@/lib/products/slideshow'
import { isPurchasableProduct } from '@/lib/products/publicProductHelper'
import { useCart } from '@/components/providers/CartProvider'
import { toast } from 'sonner'
import { ProductImageFrame } from './ProductImageFrame'
import { useHoverImageSlideshow } from '@/hooks/useHoverImageSlideshow'

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
  isVisible?: boolean
  status?: string
  images?: { url: string; sortOrder: number; isPrimary?: boolean | null }[]
  reviewCount?: number
  averageRating?: number
  specs?: unknown
}

interface ProductSpecSummary {
  id?: string
  name?: string | null
  value: string
}

function getSummarySpecs(specs: unknown): ProductSpecSummary[] {
  if (!Array.isArray(specs)) return []

  return specs
    .filter((spec): spec is ProductSpecSummary => (
      typeof spec === 'object' &&
      spec !== null &&
      'value' in spec &&
      typeof spec.value === 'string' &&
      spec.value.trim().length > 0
    ))
    .slice(0, 3)
}

interface ProductCardProps {
  product: StoreProduct
  accent: {
    primary: string
    glow: string
    text: string
  }
  showBadge?: boolean
  badgeText?: string
  priority?: boolean
}

export function ProductCard({ product, accent, showBadge = false, badgeText, priority = false }: ProductCardProps) {
  const { addToCart } = useCart()
  
  const discount = product.oldPrice && product.oldPrice > product.price
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null

  const excerpt = sanitizeProductExcerpt(product.description)
  const isDiscontinued = product.status === 'DISCONTINUED'
  const isPurchasable = isPurchasableProduct(product)
  
  const galleryImages = useMemo(() => getProductCardImages(product), [product])
  const hasSlideshow = galleryImages.length >= 2
  const { activeImage, imageIndex, bind } = useHoverImageSlideshow(product.id, galleryImages)
  const displayImage = hasSlideshow ? activeImage : (galleryImages[0] ?? product.imageUrl ?? null)
  const summarySpecs = useMemo(() => getSummarySpecs(product.specs), [product.specs])

  return (
    <Link
      href={`/products/${product.id}`}
      {...bind}
      className="group relative p-1.5 rounded-[1.25rem] bg-white/[0.03] ring-1 ring-white/[0.06] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-2 hover:ring-white/[0.12] block h-full cursor-pointer select-none"
    >
      {/* Ambient glow — emerald radial gradient on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-[1.25rem] bg-[radial-gradient(ellipse_at_50%_0%,rgba(16,185,129,0.10)_0%,transparent_70%)] opacity-0 transition-opacity duration-700 ease-out-expo group-hover:opacity-100" />

      {/* Inner Core */}
      <article
        className="relative rounded-[calc(1.25rem-6px)] bg-[#0a0a0a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] overflow-hidden flex flex-col h-full"
      >
        {/* Image Area — Dark gradient stage */}
        <div 
          className="relative block rounded-t-[calc(1.25rem-6px)] overflow-hidden p-3 bg-gradient-to-b from-[#111] to-[#080808]"
        >
          {discount && (
            <span className="absolute right-4 top-4 z-20 rounded-full bg-rose-500 px-2.5 py-1 text-[9px] md:text-[10px] font-extrabold text-white shadow-lg tracking-wider backdrop-blur-sm">
              -{discount}%
            </span>
          )}
          {isDiscontinued ? (
            <span className="absolute left-4 top-4 z-20 rounded-full bg-rose-500 px-2.5 py-1 text-[9px] md:text-[10px] font-extrabold text-white shadow-lg tracking-wider backdrop-blur-sm">
              Ngừng kinh doanh
            </span>
          ) : showBadge && badgeText ? (
            <span className="absolute left-4 top-4 z-20 rounded-full bg-indigo-600 px-2.5 py-1 text-[9px] md:text-[10px] font-extrabold text-white shadow-lg tracking-wider backdrop-blur-sm">
              {badgeText}
            </span>
          ) : null}
          
          <ProductImageFrame 
            src={displayImage}
            alt={product.name}
            aspectRatio="aspect-square"
            innerClassName="group-hover:scale-105"
            priority={priority}
            galleryImages={galleryImages}
            activeIndex={imageIndex}
          />

          {hasSlideshow && (
            <div className="pointer-events-none absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/45 px-2 py-1 opacity-0 backdrop-blur-md transition-opacity duration-300 group-hover:opacity-100">
              {galleryImages.map((image, index) => (
                <span
                  key={`${image}-${index}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === imageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Body Content */}
        <div className="p-5 flex flex-col flex-grow">
          {/* Category Badge — Eyebrow pill */}
          <div className={`mb-3 inline-flex items-center rounded-full ${accent.glow} px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] ${accent.text} w-fit`}>
            {product.category?.name || 'Khác'}
          </div>

          {/* Product Title */}
          <div className="group/title block">
            <h3 className="h-10 text-[15px] font-semibold tracking-tight leading-5 text-white group-hover/title:text-emerald-400 transition-colors line-clamp-2 overflow-hidden">
              {product.name}
            </h3>
          </div>

          {/* Star ratings */}
          {product.reviewCount !== undefined && product.reviewCount > 0 ? (
            <div className="mt-2.5 flex items-center gap-1 text-amber-400">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className={`size-3 ${index < Math.round(product.averageRating || 0) ? 'fill-current' : 'text-slate-700'}`} />
              ))}
              <span className="ml-1.5 text-[11px] font-semibold text-slate-500">
                ({product.reviewCount})
              </span>
            </div>
          ) : (
            <div className="mt-2.5 flex items-center gap-1 text-slate-700">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className="size-3" />
              ))}
              <span className="ml-1.5 text-[11px] font-semibold text-slate-600">
                Chưa có đánh giá
              </span>
            </div>
          )}

          {/* Description Excerpt */}
          <p className="mt-3 text-[13px] leading-relaxed text-slate-400 line-clamp-2 min-h-8">
            {excerpt}
          </p>

          {/* Summary Specs Pills */}
          {summarySpecs.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {summarySpecs.map((spec) => (
                <span key={spec.id ?? `${spec.name ?? 'spec'}-${spec.value}`} className="inline-flex items-center rounded-md bg-slate-800/50 px-2 py-0.5 text-[10px] font-medium text-slate-300 border border-white/[0.05]">
                  {spec.value}
                </span>
              ))}
            </div>
          )}

          {/* Stock / Sold Info */}
          <div className="mt-4 flex items-center justify-between text-[11px] font-semibold text-slate-500 border-t border-white/[0.04] pt-3">
            <span className={isDiscontinued ? 'text-rose-500/90 font-bold' : product.stock > 0 ? 'text-emerald-500/90' : 'text-rose-500/90'}>
              {isDiscontinued ? 'Ngừng kinh doanh' : product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
            </span>
            <span>Đã bán {product.soldCount}</span>
          </div>

          {/* Price & Buy Section — locked to bottom */}
          <div className="mt-auto pt-4 border-t border-white/[0.04] flex items-center justify-between gap-2">
            <div className="flex flex-col">
              <span className="text-base md:text-lg font-bold text-white">
                {formatPrice(product.price)}
              </span>
              {product.oldPrice && (
                <span className="text-[10px] md:text-xs font-semibold text-slate-500 line-through">
                  {formatPrice(product.oldPrice)}
                </span>
              )}
            </div>

            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (isDiscontinued) return
                addToCart({
                  productId: product.id,
                  variantId: null,
                  name: product.name,
                  price: product.price,
                  imageUrl: displayImage,
                  maxStock: product.stock,
                })
                toast.success(`Đã thêm ${product.name} vào giỏ hàng`)
              }}
              disabled={!isPurchasable}
              className="h-9 px-2.5 md:px-3 rounded-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white disabled:cursor-not-allowed disabled:bg-slate-800 disabled:from-slate-800 disabled:to-slate-800 disabled:text-white/30 active:scale-[0.97] transition-all duration-300 ease-out-expo flex items-center justify-center gap-1.5"
              title={isDiscontinued ? 'Ngừng kinh doanh' : 'Thêm vào giỏ hàng'}
            >
              <ShoppingCart className="size-3.5" />
              <span className="text-[11px] font-extrabold">{isDiscontinued ? 'Ngừng bán' : 'Mua ngay'}</span>
            </button>
          </div>
        </div>
      </article>
    </Link>
  )
}
