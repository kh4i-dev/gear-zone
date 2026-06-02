'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Minus, Package, Plus, ShieldCheck, ShoppingCart, Truck } from 'lucide-react'
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

  const getVariantLabel = () => product.options
    ?.map((option: any) => option.values?.find((value: any) => value.id === selectedOptions[option.id])?.label)
    .filter(Boolean)
    .join(' / ')

  const addSelectedToCart = () => {
    if (!canAdd) return
    const variantLabel = getVariantLabel()

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
    const variantLabel = getVariantLabel()

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
    <div className="overflow-hidden rounded-sm border border-slate-200 bg-white text-slate-950 shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative border-b border-slate-200 bg-white p-5 lg:border-b-0 lg:border-r lg:p-7">
          {discount && (
            <div className="absolute left-5 top-5 z-20 rounded-sm bg-red-600 px-3 py-2 text-center text-xs font-extrabold uppercase leading-tight text-white">
              -{discount}%<br />Off
            </div>
          )}
          <ProductGallery imageUrls={galleryImages} name={product.name} />
        </div>

        <div className="p-5 lg:p-7">
          <h1 className="text-2xl font-bold leading-tight text-slate-900 md:text-3xl">
            {product.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
            <span>Danh mục: <strong className="text-blue-700">{product.category?.name || 'Đang cập nhật'}</strong></span>
            {selectedVariant?.sku && <span>SKU: <strong className="font-mono text-slate-900">{selectedVariant.sku}</strong></span>}
            <span>Đã bán {product.soldCount}</span>
          </div>

          <div className="mt-5 flex items-center gap-5 rounded bg-slate-50 px-5 py-4">
            <span className="w-16 text-sm font-bold text-slate-800">Giá:</span>
            <div className="flex flex-wrap items-end gap-3">
              <span className="text-3xl font-extrabold tracking-tight text-red-600 md:text-4xl">
                {formatPrice(price.price)}
              </span>
              {price.oldPrice && (
                <span className="pb-1 text-lg font-semibold text-slate-400 line-through">
                  {formatPrice(price.oldPrice)}
                </span>
              )}
              {discount && (
                <span className="mb-1 rounded border border-red-400 px-2 py-1 text-xs font-bold text-red-600">
                  -{discount}%
                </span>
              )}
            </div>
          </div>

          {hasVariants && product.options?.length > 0 && (
            <div className="mt-5 space-y-4">
              {product.options.map((option: any) => {
                const selectedLabel = option.values?.find(
                  (value: any) => value.id === selectedOptions[option.id]
                )?.label
                return (
                  <div key={option.id} className="grid gap-2 sm:grid-cols-[110px_1fr] sm:items-start">
                    <div className="pt-2">
                      <p className="text-sm font-bold text-slate-800">{option.name}:</p>
                      {selectedLabel && (
                        <p className="mt-0.5 text-xs font-semibold text-blue-700">{selectedLabel}</p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
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
                            className={`relative min-w-[92px] rounded border px-4 py-2.5 text-sm font-semibold transition-colors ${
                              isSelected
                                ? 'border-blue-700 bg-white text-blue-800 shadow-[inset_0_0_0_1px_rgba(29,78,216,0.25)]'
                                : isAvailable
                                  ? 'border-slate-300 bg-white text-slate-700 hover:border-blue-500 hover:text-blue-700'
                                  : 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300'
                            }`}
                          >
                            {value.label}
                            {isSelected && (
                              <span className="absolute right-0 top-0 size-0 border-l-[14px] border-t-[14px] border-l-transparent border-t-blue-700" />
                            )}
                            {!isAvailable && (
                              <span className="absolute inset-x-2 top-1/2 h-px -translate-y-1/2 rotate-[-18deg] bg-slate-300" />
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

          <div className="mt-6 grid gap-3 sm:grid-cols-[110px_1fr] sm:items-center">
            <p className="text-sm font-bold text-slate-800">Số lượng:</p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="inline-flex h-11 overflow-hidden border border-slate-200 bg-white">
                <button type="button" className="grid w-12 place-items-center text-slate-400 disabled:opacity-30" disabled={quantity <= 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))}>
                  <Minus className="size-4" />
                </button>
                <span className="grid w-14 place-items-center border-x border-slate-200 text-sm font-bold">{quantity}</span>
                <button type="button" className="grid w-12 place-items-center text-slate-500 disabled:opacity-30" disabled={quantity >= currentStock} onClick={() => setQuantity((value) => Math.min(currentStock, value + 1))}>
                  <Plus className="size-4" />
                </button>
              </div>

              <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-700">
                <Package className={`size-4 ${currentStock > 0 && !isDiscontinued ? 'text-emerald-600' : 'text-red-600'}`} />
                {isDiscontinued ? 'Ngừng kinh doanh' : currentStock > 0 ? `Còn ${currentStock}` : 'Hết hàng'}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={addSelectedToCart}
              disabled={!canAdd}
              className="inline-flex h-12 items-center justify-center gap-2 rounded border border-red-600 bg-white px-6 text-sm font-extrabold uppercase tracking-wide text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
            >
              <ShoppingCart className="size-4" />
              Thêm vào giỏ
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={!canAdd}
              className="inline-flex h-12 items-center justify-center rounded bg-red-600 px-6 text-sm font-extrabold uppercase tracking-wide text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Mua ngay
            </button>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-4 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2"><ShieldCheck className="size-4 text-blue-700" /> Bảo hành chính hãng</span>
            <span className="inline-flex items-center gap-2"><Truck className="size-4 text-emerald-600" /> Giao hàng nhanh</span>
          </div>

          {(settingsMap.contact_hotline || settingsMap.contact_zalo) && (
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              {settingsMap.contact_hotline && <Link href={`tel:${settingsMap.contact_hotline.replace(/\s+/g, '')}`} className="rounded border border-slate-200 px-3 py-2 font-semibold text-slate-700 hover:border-red-300 hover:text-red-600">Gọi {settingsMap.contact_hotline}</Link>}
              {settingsMap.contact_zalo && <Link href={settingsMap.contact_zalo} target="_blank" className="rounded border border-slate-200 px-3 py-2 font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700">Chat Zalo</Link>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
