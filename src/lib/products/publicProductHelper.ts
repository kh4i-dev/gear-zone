export const publicProductWhere = {
  isVisible: true,
  status: 'ACTIVE',
}

export const publicInStockProductWhere = {
  ...publicProductWhere,
  stock: { gt: 0 },
}

export const PUBLIC_PRODUCT_LIMIT = 12

export const PUBLIC_PRODUCT_TAKE = 100

export interface PublicProductInput {
  isVisible?: boolean
  status?: string
}

export function isPublicProduct(product: PublicProductInput): boolean {
  return product.isVisible !== false && product.status === 'ACTIVE'
}

export interface PurchaseProductInput {
  stock: number
  isVisible?: boolean
  status?: string
}

export function isPurchasableProduct(product: PurchaseProductInput): boolean {
  return isPublicProduct(product) && product.stock > 0
}

export const canPurchaseProduct = isPurchasableProduct
