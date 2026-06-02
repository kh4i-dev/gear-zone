import { ProductImageFrame } from '@/components/domain/ProductImageFrame'
import { getPrimaryLegacyImageUrl } from '@/lib/product-images'
import { formatPrice, sanitizeProductExcerpt } from '@/lib/utils'

interface AdminProductPreviewProps {
  name: string
  categoryName: string
  description: string
  imageUrl: string
  previewVariant: any // For simplicity, accepting any matching variant structure
  previewPrice: number | string | null
  previewOldPrice: number | null
  previewStock: number | string
}

export function AdminProductPreview({
  name,
  categoryName,
  description,
  imageUrl,
  previewVariant,
  previewPrice,
  previewOldPrice,
  previewStock
}: AdminProductPreviewProps) {
  return (
    <div className="lg:sticky lg:top-5 rounded-xl border border-white/[0.06] bg-[#070707] p-3 shadow-xl">
      <div className="relative overflow-hidden">
        {/* Image Area - Premium white stage in a dark gradient frame */}
        <div className="relative float-left mr-3 w-24 rounded-lg border border-white/[0.06] bg-[#0a0a0a] p-1">
          <ProductImageFrame
            src={getPrimaryLegacyImageUrl(previewVariant?.imageUrl || imageUrl)}
            alt={name || 'Preview'}
            aspectRatio="aspect-square"
            galleryImages={imageUrl.split(/\r?\n/).filter(Boolean)}
          />
        </div>

        {/* Body Content */}
        <div className="min-w-0">
          {/* Category Badge — Eyebrow pill */}
          <div className="mb-3 inline-flex items-center rounded-full bg-blue-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-blue-400 w-fit">
            {categoryName || 'Khác'}
          </div>

          {/* Product Title */}
          <h3 className="h-10 text-[15px] font-semibold tracking-tight leading-5 text-white line-clamp-2 overflow-hidden">
            {name || 'Tên sản phẩm'}
          </h3>

          {/* Description Excerpt */}
          <p className="mt-3 text-[13px] leading-relaxed text-slate-400 line-clamp-2 min-h-8">
            {sanitizeProductExcerpt(description) || 'Mô tả ngắn hoặc bài viết giới thiệu sản phẩm...'}
          </p>

          {/* Price & Stock Section */}
          <div className="mt-auto pt-4 border-t border-white/[0.04] flex items-center justify-between gap-2">
            <div className="flex flex-col">
              <span className="text-base md:text-lg font-bold text-white">
                {formatPrice(Number(previewPrice) || 0)}
              </span>
              {previewOldPrice && previewOldPrice > Number(previewPrice || 0) ? (
                <span className="text-[10px] md:text-xs font-semibold text-slate-500 line-through">
                  {formatPrice(Number(previewOldPrice))}
                </span>
              ) : null}
            </div>

            <div className="text-[11px] font-semibold text-slate-500">
              Tồn kho: {previewStock}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
