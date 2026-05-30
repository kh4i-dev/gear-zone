'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ImageIcon, ShoppingCart, Star, Tag } from 'lucide-react'
import { formatPrice, sanitizeProductExcerpt } from '@/lib/utils'
import { getPrimaryLegacyImageUrl } from '@/lib/product-images'
import { useCart } from '@/components/providers/CartProvider'
import { toast } from 'sonner'
import { ProductImageFrame } from './ProductImageFrame'

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
}

export function ProductCard({ product, accent, showBadge = false, badgeText }: ProductCardProps) {
  const { addToCart } = useCart()
  
  const discount = product.oldPrice && product.oldPrice > product.price
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null

  const excerpt = sanitizeProductExcerpt(product.description)
  const isDiscontinued = product.status === 'DISCONTINUED'

  return (
    <Link
      href={`/products/${product.id}`}
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
            src={getPrimaryLegacyImageUrl(product.imageUrl)} 
            alt={product.name}
            aspectRatio="aspect-square"
            innerClassName="group-hover:scale-105"
          />
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
          <div className="mt-2.5 flex items-center gap-1 text-amber-400">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} className="size-3 fill-current" />
            ))}
            <span className="ml-1.5 text-[11px] font-semibold text-slate-500">
              ({Math.max(product.soldCount * 7, 12)})
            </span>
          </div>

          {/* Description Excerpt */}
          <p className="mt-3 text-[13px] leading-relaxed text-slate-400 line-clamp-2 min-h-8">
            {excerpt}
          </p>

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
                  name: product.name,
                  price: product.price,
                  imageUrl: getPrimaryLegacyImageUrl(product.imageUrl),
                  maxStock: product.stock,
                })
                toast.success(`Đã thêm ${product.name} vào giỏ hàng`)
              }}
              disabled={product.stock <= 0 || isDiscontinued}
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
