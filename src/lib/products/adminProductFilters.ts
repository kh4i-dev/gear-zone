export type AdminProductStatusFilter = 'all' | 'active' | 'hidden' | 'out_of_stock' | 'discontinued' | 'draft'
export type AdminProductCategoryFilter = 'all' | string
export type AdminProductBrandFilter = 'all' | string

export interface AdminFilterProduct {
  id: string
  name: string
  stock: number
  isVisible: boolean
  status: string
  category: { id?: string | null; name: string } | null
  variants?: { sku: string | null }[]
}

export interface AdminFilterCategory {
  id: string
  name: string
}

export interface AdminProductFilters {
  categoryId: AdminProductCategoryFilter
  brand: AdminProductBrandFilter
  status: AdminProductStatusFilter
  search: string
}

export function getProductBrand(name: string | null | undefined, brandsList: string[]): string {
  if (!name || !name.trim()) return 'Khác'
  const match = brandsList.find((brand) => brand && name.toLowerCase().includes(brand.toLowerCase()))
  return match || 'Khác'
}

export function getSalesStatus(product: AdminFilterProduct): Exclude<AdminProductStatusFilter, 'all' | 'out_of_stock'> | 'active' {
  if (product.status === 'DISCONTINUED') return 'discontinued'
  if (!product.isVisible) return 'hidden'
  return 'active'
}

export function matchesCategory(product: AdminFilterProduct, categoryId: AdminProductCategoryFilter) {
  if (categoryId === 'all') return true
  return product.category?.id === categoryId || product.category?.name === categoryId
}

export function buildCategoryCounts(products: AdminFilterProduct[], categories: AdminFilterCategory[]) {
  const counts = new Map<string, number>()
  for (const product of products) {
    const key = product.category?.id ?? product.category?.name
    if (key) counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  const result = categories.map((category) => ({
    id: category.id,
    name: category.name,
    count: counts.get(category.id) ?? counts.get(category.name) ?? 0,
  }))

  return result
}

export function buildBrandCounts(
  products: AdminFilterProduct[],
  brandsList: string[],
  categoryId: AdminProductCategoryFilter = 'all'
) {
  const stats: Record<string, number> = {}

  for (const product of products) {
    if (!matchesCategory(product, categoryId)) continue
    const brand = getProductBrand(product.name, brandsList)
    stats[brand] = (stats[brand] ?? 0) + 1
  }

  return Object.fromEntries(Object.entries(stats).sort(([a], [b]) => a.localeCompare(b)))
}

export function filterAdminProducts<TProduct extends AdminFilterProduct>(
  products: TProduct[],
  brandsList: string[],
  filters: AdminProductFilters
) {
  const query = filters.search.trim().toLowerCase()

  return products.filter((product) => {
    if (!matchesCategory(product, filters.categoryId)) return false

    if (filters.brand !== 'all' && getProductBrand(product.name, brandsList) !== filters.brand) {
      return false
    }

    if (filters.status === 'active' && getSalesStatus(product) !== 'active') return false
    if (filters.status === 'hidden' && getSalesStatus(product) !== 'hidden') return false
    if (filters.status === 'discontinued' && getSalesStatus(product) !== 'discontinued') return false
    if (filters.status === 'draft') return false
    if (filters.status === 'out_of_stock' && product.stock > 0) return false

    if (!query) return true

    return product.name.toLowerCase().includes(query) ||
      product.category?.name.toLowerCase().includes(query) ||
      product.id.toLowerCase().includes(query) ||
      Boolean(product.variants?.some((variant) => variant.sku?.toLowerCase().includes(query)))
  })
}
