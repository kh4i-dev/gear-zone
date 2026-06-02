import type { StoreProduct } from '@/components/domain/ProductCard'

export function toStoreProduct(product: any): StoreProduct {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    imageUrl: product.imageUrl,
    price: product.price,
    oldPrice: product.oldPrice,
    stock: product.stock,
    soldCount: product.soldCount,
    category: product.category,
    isVisible: product.isVisible,
    status: product.status,
    images: product.images, // By destructuring into a plain object, Next.js serialize it properly
    reviewCount: product.reviewCount,
    averageRating: product.averageRating,
    specs: product.specs,
  }
}
