'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowUpRight, Minus, Package, Plus, ShieldCheck, ShoppingCart, Tag, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { ProductGallery } from './ProductGallery'
import { useCart } from '@/components/providers/CartProvider'
import { formatPrice } from '@/lib/utils'
import {
  getAvailableOptionValues,
  getOrderedGalleryImages,
  getPrimaryProductImage,
  getSelectedVariant,
  getVariantGalleryImages,
  getVariantPrice,
  type SelectedOptions,
} from '@/lib/products/productVariants'

interface ProductPurchaseExperienceProps {
  product: any
  settingsMap: Record<string, string>
}

export function ProductPurchaseExperience({ product, settingsMap }: ProductPurchaseExperienceProps) {
  const { push } = useRouter()
  const { addToCart } = useCart()
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>(() => {
    const initial: SelectedOptions = {}
    product.options?.forEach((option: any) => {
      const firstAvailable = option.values?.find((value: any) =>
        product.variants?.some((variant: any) =>
          variant.isActive && variant.stock > 0 && variant.optionValues?.some((item: any) => item.optionValue.id === value.id)
        )
      ) ?? option.values?.[0]
      if (firstAvailable) initial[option.id] = firstAvailable.id
    })
    return initial
  })
  const [quantity, setQuantity] = useState(1)

  const selectedVariant = useMemo(
    () => getSelectedVariant(selectedOptions, product.variants ?? []),
    [selectedOptions, product.variants]
  )
  const price = getVariantPrice(product, selectedVariant)
  const persistedGallery = getOrderedGalleryImages(product, product.images ?? [])
  const primaryImage = getPrimaryProductImage(product, selectedVariant, product.images ?? [])
  const galleryImages = selectedVariant
    ? getVariantGalleryImages(selectedVariant, persistedGallery)
    : (primaryImage
        ? [primaryImage, ...persistedGallery.filter((url) => url !== primaryImage)]
        : persistedGallery)
  const hasVariants = (product.variants?.length ?? 0) > 0
  const currentStock = hasVariants ? selectedVariant?.stock ?? 0 : product.stock
  const isDiscontinued = product.status === 'DISCONTINUED'
  const canAdd = !isDiscontinued && currentStock > 0 && (!hasVariants || Boolean(selectedVariant))
  const discount = price.oldPrice && price.oldPrice > price.price
    ? Math.round(((price.oldPrice - price.price) / price.oldPrice) * 100)
    : null

  const updateOption = (optionId: string, valueId: string) => {
    setSelectedOptions((current) => ({ ...current, [optionId]: valueId }))
    setQuantity(1)
  }

  const addSelectedToCart = () => {
    if (!canAdd) return
    const variantLabel = product.options
      ?.map((option: any) => option.values?.find((value: any) => value.id === selectedOptions[option.id])?.label)
      .filter(Boolean)
      .join(' / ')

    addToCart({
      productId: product.id,
      variantId: selectedVariant?.id ?? null,
      name: variantLabel ? `${product.name} - ${variantLabel}` : product.name,
      price: price.price,
      imageUrl: primaryImage,
      maxStock: currentStock,
      quantity,
      sku: selectedVariant?.sku ?? null,
    })
    toast.success(`Đã thêm ${product.name} vào giỏ hàng`)
  }
 
  const handleBuyNow = () => {
    if (!canAdd) return
    const variantLabel = product.options
      ?.map((option: any) => option.values?.find((value: any) => value.id === selectedOptions[option.id])?.label)
      .filter(Boolean)
      .join(' / ')
 
    addToCart({
      productId: product.id,
      variantId: selectedVariant?.id ?? null,
      name: variantLabel ? `${product.name} - ${variantLabel}` : product.name,
      price: price.price,
      imageUrl: primaryImage,
      maxStock: currentStock,
      quantity,
      sku: selectedVariant?.sku ?? null,
    })
    push('/cart?step=checkout')
  }

  return (
    <div className="p-2 rounded-[2rem] bg-white/[0.02] ring-1 ring-white/[0.06]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 bg-[#0a0a0a] rounded-[calc(2rem-8px)] p-6 lg:p-10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
        <ProductGallery imageUrls={galleryImages} name={product.name} />

        <div className="flex flex-col">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 w-fit px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.15em] mb-5 ring-1 ring-emerald-500/20">
            <Tag className="size-3" />
            {product.category?.name || 'Chưa phân loại'}
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight leading-tight mb-3 break-words">{product.name}</h1>
          <div className="flex flex-wrap items-center gap-3 mb-7 text-xs text-slate-500">
            {selectedVariant?.sku && <span>SKU: <span className="text-slate-300 font-mono">{selectedVariant.sku}</span></span>}
            <span>Đã bán {product.soldCount}</span>
          </div>

          <div className="p-1.5 rounded-[1.25rem] bg-white/[0.02] ring-1 ring-white/[0.05] mb-7">
            <div className="rounded-[calc(1.25rem-6px)] bg-[#111] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]">
              <div className="flex flex-wrap items-end gap-3">
                <span className="text-3xl sm:text-4xl font-bold tracking-tight text-white">{formatPrice(price.price)}</span>
                {price.oldPrice && (
                  <span className="text-lg text-slate-600 font-medium line-through mb-1">{formatPrice(price.oldPrice)}</span>
                )}
                {discount && (
                  <span className="mb-1 rounded-full bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                    -{discount}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {hasVariants && product.options?.length > 0 && (
            <div className="mb-7 space-y-5">
              {product.options.map((option: any) => {
                const selectedLabel = option.values?.find(
                  (value: any) => value.id === selectedOptions[option.id]
                )?.label
                return (
                  <div key={option.id} className="grid gap-3 sm:grid-cols-[120px_1fr] sm:items-start">
                    <div className="pt-1">
                      <p className="text-[15px] font-extrabold text-slate-100">{option.name}:</p>
                      {selectedLabel && (
                        <p className="mt-1 text-[13px] font-bold text-emerald-300">
                          {selectedLabel}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {option.values?.map((value: any) => {
                        const isSelected = selectedOptions[option.id] === value.id
                        const selectionWithoutCurrentOption = Object.fromEntries(
                          Object.entries(selectedOptions).filter(([optionId]) => optionId !== option.id)
                        )
                        const availableForOption = getAvailableOptionValues(selectionWithoutCurrentOption, product.variants ?? [])
                        const isAvailable = availableForOption.has(value.id) || isSelected
                        return (
                          <button
                            key={value.id}
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => updateOption(option.id, value.id)}
                            className={`relative min-h-11 min-w-[88px] overflow-hidden rounded-md border px-4 text-sm font-extrabold transition-all duration-200 ease-out ${
                              isSelected
                                ? 'border-blue-400 bg-white text-blue-700 shadow-[0_0_0_1px_rgba(96,165,250,0.35),0_10px_26px_rgba(37,99,235,0.16)]'
                                : isAvailable
                                  ? 'border-white/[0.12] bg-white/[0.035] text-slate-100 hover:border-blue-400/60 hover:bg-white/[0.07] active:scale-[0.98] cursor-pointer'
                                  : 'cursor-not-allowed border-white/[0.06] bg-white/[0.02] text-slate-600 opacity-70'
                            }`}
                          >
                            <span className="relative z-10">{value.label}</span>
                            {isSelected && (
                              <span className="absolute right-0 top-0 size-0 border-l-[16px] border-t-[16px] border-l-transparent border-t-blue-600" />
                            )}
                            {!isAvailable && (
                              <span className="absolute inset-x-3 top-1/2 h-px -translate-y-1/2 rotate-[-17deg] bg-slate-500/80" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-7">
            <div className="p-1 rounded-[1rem] bg-white/[0.02] ring-1 ring-white/[0.05] shrink-0">
              <div className="bg-[#111] rounded-[calc(1rem-4px)] px-4 py-3 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]">
                <Package className={`size-4 mr-2 ${currentStock > 0 && !isDiscontinued ? 'text-emerald-400' : 'text-rose-500'}`} />
                <span className="font-semibold text-sm">
                  {isDiscontinued ? 'Ngừng kinh doanh' : currentStock > 0 ? `Còn ${currentStock}` : 'Hết hàng'}
                </span>
              </div>
            </div>

            <div className="inline-flex h-12 w-fit overflow-hidden rounded-full bg-white/[0.03] ring-1 ring-white/[0.08]">
              <button type="button" className="px-4 text-slate-400 disabled:opacity-30" disabled={quantity <= 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))}>
                <Minus className="size-4" />
              </button>
              <span className="grid w-12 place-items-center text-sm font-bold">{quantity}</span>
              <button type="button" className="px-4 text-slate-400 disabled:opacity-30" disabled={quantity >= currentStock} onClick={() => setQuantity((value) => Math.min(currentStock, value + 1))}>
                <Plus className="size-4" />
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={addSelectedToCart}
              disabled={!canAdd}
              className="group inline-flex items-center justify-center gap-3 rounded-full bg-white px-6 py-3 text-sm font-extrabold text-slate-950 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-white/30"
            >
              <ShoppingCart className="size-4" />
              Thêm vào giỏ
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={!canAdd}
              className="group inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-emerald-600 to-cyan-600 px-6 py-3 text-sm font-extrabold text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] disabled:cursor-not-allowed disabled:from-slate-800 disabled:to-slate-800 disabled:text-white/30"
            >
              Mua ngay
              <span className="grid size-7 place-items-center rounded-full bg-white/15 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-[1px]">
                <ArrowUpRight className="size-3.5" />
              </span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-8">
            <div className="p-1 rounded-[1rem] bg-white/[0.02] ring-1 ring-white/[0.05]">
              <div className="flex items-center gap-3 bg-[#111] rounded-[calc(1rem-4px)] p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]">
                <Truck className="size-5 text-emerald-400" />
                <div>
                  <p className="font-semibold text-sm tracking-tight">Giao hàng 2H</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Nội thành miễn phí</p>
                </div>
              </div>
            </div>
            <div className="p-1 rounded-[1rem] bg-white/[0.02] ring-1 ring-white/[0.05]">
              <div className="flex items-center gap-3 bg-[#111] rounded-[calc(1rem-4px)] p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]">
                <ShieldCheck className="size-5 text-amber-400" />
                <div>
                  <p className="font-semibold text-sm tracking-tight">Bảo hành VIP</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">12-24 tháng 1 đổi 1</p>
                </div>
              </div>
            </div>
          </div>

          {(settingsMap.contact_hotline || settingsMap.contact_zalo) && (
            <div className="mt-8 flex flex-wrap gap-2 text-xs">
              {settingsMap.contact_hotline && <Link href={`tel:${settingsMap.contact_hotline.replace(/\s+/g, '')}`} className="rounded-full bg-white/[0.04] px-4 py-2 text-slate-300 ring-1 ring-white/[0.06]">Gọi {settingsMap.contact_hotline}</Link>}
              {settingsMap.contact_zalo && <Link href={settingsMap.contact_zalo} target="_blank" className="rounded-full bg-emerald-500/10 px-4 py-2 text-emerald-400 ring-1 ring-emerald-500/20">Chat Zalo</Link>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
