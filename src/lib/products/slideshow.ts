import { parseLegacyImageUrls, PLACEHOLDER_IMAGE } from '../product-images'

export interface SlideShowProduct {
  imageUrl?: string | null
  images?: { url: string; sortOrder: number; isPrimary?: boolean | null }[]
}

export function getProductCardImages(product: SlideShowProduct): string[] {
  const images = product.images || []
  
  // 1. Filter out empty or invalid URLs
  const validImages = images.filter((img) => img.url && img.url.trim().length > 0)
  
  // 2. Sort: Primary first, then by sortOrder
  const sorted = [...validImages].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1
    if (!a.isPrimary && b.isPrimary) return 1
    return a.sortOrder - b.sortOrder
  })

  // 3. Map to sanitized URLs. Some legacy gallery rows can still contain
  // multiple URLs separated by pipes/newlines, same as product.imageUrl.
  const urls = sorted.flatMap((img) => parseLegacyImageUrls(img.url))

  // 4. Deduplicate URLs
  const uniqueUrls = Array.from(new Set(urls))

  // 5. Filter out placeholder URLs — never show placeholder as a slideshow frame
  const filteredUrls = uniqueUrls.filter((url) => url !== PLACEHOLDER_IMAGE)

  const hasRealImage = filteredUrls.some(
    (url) => !url.includes('unsplash.com') && url !== PLACEHOLDER_IMAGE
  )
  const finalUrls = hasRealImage
    ? filteredUrls.filter((url) => !url.includes('unsplash.com'))
    : filteredUrls

  // 6. Fallback if no images found
  if (finalUrls.length === 0) {
    return parseLegacyImageUrls(product.imageUrl).filter((url) => url !== PLACEHOLDER_IMAGE)
  }

  return finalUrls
}
