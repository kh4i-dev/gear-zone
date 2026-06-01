import { parseLegacyImageUrls, getPrimaryLegacyImageUrl, PLACEHOLDER_IMAGE } from '../product-images'

export interface VariantOptionValue {
  id: string
  optionId: string
  value: string
  label: string
}

export interface ProductVariantLike {
  id: string
  sku: string | null
  price: number | null
  salePrice: number | null
  stock: number
  imageUrl: string | null
  isActive: boolean
  optionValues: { optionValue: VariantOptionValue }[]
}

export interface ProductImageLike {
  id?: string
  url: string
  sortOrder: number
  isPrimary?: boolean
}

export interface ProductPriceLike {
  price: number
  oldPrice: number | null
  imageUrl?: string | null
}

export type SelectedOptions = Record<string, string>

export function getSelectedVariant(
  selectedOptions: SelectedOptions,
  variants: ProductVariantLike[]
) {
  const selectedEntries = Object.entries(selectedOptions).filter(([, valueId]) => Boolean(valueId))
  if (selectedEntries.length === 0) return null

  return variants.find((variant) => {
    if (!variant.isActive) return false
    const valueIds = new Set(variant.optionValues.map((item) => item.optionValue.id))
    return selectedEntries.every(([, valueId]) => valueIds.has(valueId))
  }) ?? null
}

export function getAvailableOptionValues(
  selectedOptions: SelectedOptions,
  variants: ProductVariantLike[]
) {
  const available = new Set<string>()
  const activeVariants = variants.filter((variant) => variant.isActive && variant.stock > 0)

  for (const variant of activeVariants) {
    const valueIds = variant.optionValues.map((item) => item.optionValue.id)
    const matchesCurrentSelection = Object.entries(selectedOptions).every(([optionId, selectedValueId]) => {
      if (!selectedValueId) return true
      return variant.optionValues.some((item) =>
        item.optionValue.optionId === optionId && item.optionValue.id === selectedValueId
      )
    })

    if (matchesCurrentSelection) {
      valueIds.forEach((valueId) => available.add(valueId))
    }
  }

  return available
}

export function getVariantPrice(product: ProductPriceLike, variant: ProductVariantLike | null) {
  if (variant?.salePrice != null) {
    return {
      price: variant.salePrice,
      oldPrice: variant.price ?? product.price,
    }
  }

  const price = variant?.price ?? product.price
  const oldPrice = variant?.price != null ? product.oldPrice : product.oldPrice

  return { price, oldPrice }
}

export function getPrimaryProductImage(
  product: ProductPriceLike,
  selectedVariant: ProductVariantLike | null,
  images: ProductImageLike[]
) {
  if (selectedVariant?.imageUrl) return getPrimaryLegacyImageUrl(selectedVariant.imageUrl)
  const primary = images.find((image) => image.isPrimary) ?? images.reduce<ProductImageLike | undefined>(
    (earliest, image) => !earliest || image.sortOrder < earliest.sortOrder ? image : earliest,
    undefined,
  )
  return getPrimaryLegacyImageUrl(primary?.url ?? product.imageUrl ?? null)
}

export function getOrderedGalleryImages(
  product: ProductPriceLike,
  images: ProductImageLike[]
) {
  const ordered = images
    .filter((image) => image.url.trim())
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((image) => image.url)

  if (ordered.length > 0) {
    const urls = ordered.flatMap((url) => parseLegacyImageUrls(url))
    const hasRealImage = urls.some(
      (url) => !url.includes('unsplash.com') && url !== PLACEHOLDER_IMAGE
    )
    return hasRealImage ? urls.filter((url) => !url.includes('unsplash.com')) : urls
  }

  const rawUrls = product.imageUrl ? parseLegacyImageUrls(product.imageUrl) : []
  const hasRealImage = rawUrls.some(
    (url) => !url.includes('unsplash.com') && url !== PLACEHOLDER_IMAGE
  )
  return hasRealImage ? rawUrls.filter((url) => !url.includes('unsplash.com')) : rawUrls
}
