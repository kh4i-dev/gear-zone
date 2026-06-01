import {
  isPublicProduct,
  isPurchasableProduct,
  PUBLIC_PRODUCT_LIMIT,
} from './publicProductHelper'

export interface PublicSectionProduct {
  id: string
  stock: number
  soldCount: number
  isVisible?: boolean
  status?: string
  categoryId?: string | null
  category?: { name: string } | null
  updatedAt?: Date | string | null
  createdAt?: Date | string | null
}

export function sortInStockFirst<T extends PublicSectionProduct>(products: T[]): T[] {
  return [...products].sort((a, b) => {
    const purchasableA = isPurchasableProduct(a)
    const purchasableB = isPurchasableProduct(b)
    if (purchasableA !== purchasableB) return purchasableA ? -1 : 1
    return sortBySalesAndFreshness(a, b)
  })
}

export function getStableRotatedProducts<T>(
  products: T[],
  sectionKey: string,
  limit = PUBLIC_PRODUCT_LIMIT,
  date: Date | string = new Date(),
): T[] {
  if (products.length <= limit) return products.slice(0, limit)

  const day = typeof date === 'string' ? date.slice(0, 10) : date.toISOString().slice(0, 10)
  const offset = stableHash(`${sectionKey}-${day}`) % products.length
  const rotated = [...products.slice(offset), ...products.slice(0, offset)]

  return rotated.slice(0, limit)
}

export function selectHomepageFeaturedProducts<T extends PublicSectionProduct>(
  products: T[],
  options: { sectionKey?: string; limit?: number; poolLimit?: number; date?: Date | string } = {},
): T[] {
  const sectionKey = options.sectionKey ?? 'homepage-featured'
  const limit = options.limit ?? PUBLIC_PRODUCT_LIMIT
  const poolLimit = options.poolLimit ?? 36

  const pool = products
    .filter((product) => isPublicProduct(product) && product.stock > 0)
    .sort(sortBySalesAndFreshness)
    .slice(0, poolLimit)

  return getStableRotatedProducts(pool, sectionKey, limit, options.date)
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function selectCategoryBestSellingProducts<T extends PublicSectionProduct>(
  products: T[],
  limit = PUBLIC_PRODUCT_LIMIT,
): T[] {
  const publicProducts = products
    .filter(isPublicProduct)
    .sort(sortBySalesAndFreshness)

  const inStock = publicProducts.filter(isPurchasableProduct)

  if (inStock.length > 8) {
    return shuffleArray(inStock).slice(0, 8)
  }

  return inStock.slice(0, limit)
}

export function selectRelatedProducts<T extends PublicSectionProduct>(
  products: T[],
  currentProductId: string,
  limit = PUBLIC_PRODUCT_LIMIT,
): T[] {
  return sortInStockFirst(
    products.filter((product) => product.id !== currentProductId && isPublicProduct(product))
  ).slice(0, limit)
}

function sortBySalesAndFreshness<T extends PublicSectionProduct>(a: T, b: T) {
  if (b.soldCount !== a.soldCount) return b.soldCount - a.soldCount

  const bDate = getTime(b.updatedAt ?? b.createdAt)
  const aDate = getTime(a.updatedAt ?? a.createdAt)
  if (bDate !== aDate) return bDate - aDate

  return a.id.localeCompare(b.id)
}

function getTime(value: Date | string | null | undefined) {
  if (!value) return 0
  return value instanceof Date ? value.getTime() : new Date(value).getTime()
}

function stableHash(value: string) {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}
