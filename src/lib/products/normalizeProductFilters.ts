import { SPEC_KEY_TO_FILTER, rawValueToSlug, textMatchesFilterSlug, CATEGORY_NAME_TO_SLUG } from '@/config/productFilters'
import type { StoreProduct } from '@/components/domain/ProductCard'

interface NormalizedProductFilters {
  category?: string
  brand?: string
  resolution?: string
  refreshRate?: string
  size?: string
  panel?: string
  shape?: string
  connection?: string
  switch?: string
  layout?: string
  weight?: string
  sensor?: string
}

function parseRawSpecs(description: string): Record<string, string> {
  const specs: Record<string, string> = {}
  if (!description?.includes('$$$SPECS$$$')) return specs

  const specsPart = description.split('$$$SPECS$$$')[1]
  for (const line of specsPart.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue
    const colonIdx = trimmed.indexOf(':')
    if (colonIdx < 1) continue
    const key = trimmed.slice(0, colonIdx).trim().toLowerCase()
    const val = trimmed.slice(colonIdx + 1).trim()
    if (key && val) specs[key] = val
  }
  return specs
}

export function normalizeProductFilters(product: StoreProduct): NormalizedProductFilters {
  const normalized: NormalizedProductFilters = {}

  if (product.category?.name) {
    const categorySlug = CATEGORY_NAME_TO_SLUG[product.category.name]
    if (categorySlug) {
      normalized.category = categorySlug
    }
  }

  const rawSpecs = parseRawSpecs(product.description ?? '')
  
  for (const [specKey, rawValue] of Object.entries(rawSpecs)) {
    const filterKey = SPEC_KEY_TO_FILTER[specKey]
    if (!filterKey) continue

    if (filterKey === 'brand') {
      normalized.brand = rawValue.trim().toLowerCase()
    } else {
      const slug = rawValueToSlug(filterKey, rawValue)
      if (slug) {
        normalized[filterKey as keyof NormalizedProductFilters] = slug
      }
    }
  }

  if (!normalized.brand && product.name) {
    const brandSlugs = ['asus', 'lg', 'dell', 'msi', 'samsung', 'viewsonic', 'logitech', 'razer', 'corsair', 'steelseries', 'akko', 'keychron', 'hyperx', 'zowie', 'pulsar', 'lamzu']
    const nameLower = product.name.toLowerCase()
    for (const slug of brandSlugs) {
      if (nameLower.includes(slug)) {
        normalized.brand = slug
        break
      }
    }
  }

  return normalized
}

export function getProductCategorySlug(product: StoreProduct): string | null {
  if (!product.category?.name) return null
  return CATEGORY_NAME_TO_SLUG[product.category.name] ?? null
}

export function productMatchesFilter(product: StoreProduct, key: string, slug: string): boolean {
  if (key === 'category') {
    const productCategory = getProductCategorySlug(product)
    return productCategory === slug
  }

  const normalized = normalizeProductFilters(product)
  const normalizedValue = normalized[key as keyof NormalizedProductFilters]
  
  if (normalizedValue) {
    return normalizedValue === slug
  }

  if (key === 'brand') {
    return product.name.toLowerCase().includes(slug.toLowerCase())
  }

  const textToCheck = [
    product.name,
    product.description,
    product.category?.name,
  ].filter(Boolean).join(' ')

  return textMatchesFilterSlug(textToCheck, key, slug)
}

export function productMatchesCategory(product: StoreProduct, categorySlug: string): boolean {
  if (categorySlug === 'all') return true
  
  const productCategory = getProductCategorySlug(product)
  return productCategory === categorySlug
}

export function normalizeOldQueryParam(key: string, value: string): string {
  const categoryMapping: Record<string, string> = {
    'màn hình': 'monitor',
    'bàn phím': 'keyboard',
    'chuột': 'mouse',
    'tai nghe': 'headset',
    'phụ kiện': 'accessory',
    'ghế': 'chair',
  }

  if (key === 'category') {
    return categoryMapping[value.toLowerCase()] ?? value
  }

  if (key === 'resolution') {
    const resolutionMapping: Record<string, string> = {
      'fhd': 'full-hd',
      'full hd': 'full-hd',
      '2k': '2k',
      '4k': '4k',
      '6k': '6k',
    }
    return resolutionMapping[value.toLowerCase()] ?? value
  }

  if (key === 'brand') {
    return value.toLowerCase()
  }

  if (key === 'refreshRate') {
    return value.toLowerCase().replace(/\s+/g, '')
  }

  return value
}