import { describe, it, expect } from 'vitest'
import { 
  publicProductWhere, 
  publicInStockProductWhere,
  isPublicProduct, 
  canPurchaseProduct,
  isPurchasableProduct,
  PUBLIC_PRODUCT_LIMIT,
} from './publicProductHelper'

describe('Public Product Filter & Purchase Logic', () => {
  const activeProduct = { isVisible: true, status: 'ACTIVE', stock: 10 }
  const inactiveProduct = { isVisible: true, status: 'INACTIVE', stock: 5 }
  const hiddenProduct = { isVisible: false, status: 'ACTIVE', stock: 5 }
  const draftProduct = { isVisible: true, status: 'DRAFT', stock: 5 }
  const discontinuedProduct = { isVisible: true, status: 'DISCONTINUED', stock: 5 }
  const outOfStockProduct = { isVisible: true, status: 'ACTIVE', stock: 0 }

  it('1. public product query filters match active/visible state exactly', () => {
    expect(publicProductWhere.isVisible).toBe(true)
    expect(publicProductWhere.status).toBe('ACTIVE')
  })

  it('1b. public in-stock query excludes stock <= 0', () => {
    expect(publicInStockProductWhere).toEqual({
      isVisible: true,
      status: 'ACTIVE',
      stock: { gt: 0 },
    })
  })

  it('2. isPublicProduct helper validates allowed active public products', () => {
    expect(isPublicProduct(activeProduct)).toBe(true)
    expect(isPublicProduct(outOfStockProduct)).toBe(true) // Out of stock is allowed if active and visible
  })

  it('3. isPublicProduct helper excludes inactive products', () => {
    expect(isPublicProduct(inactiveProduct)).toBe(false)
  })

  it('4. isPublicProduct helper excludes hidden/draft/discontinued products', () => {
    expect(isPublicProduct(hiddenProduct)).toBe(false)
    expect(isPublicProduct(draftProduct)).toBe(false)
    expect(isPublicProduct(discontinuedProduct)).toBe(false)
  })

  it('5. canPurchaseProduct enables purchase when stock > 0 and status is ACTIVE', () => {
    expect(canPurchaseProduct(activeProduct)).toBe(true)
    expect(isPurchasableProduct(activeProduct)).toBe(true)
    expect(canPurchaseProduct(discontinuedProduct)).toBe(false)
    expect(canPurchaseProduct(inactiveProduct)).toBe(false)
    expect(canPurchaseProduct(draftProduct)).toBe(false)
    expect(canPurchaseProduct(hiddenProduct)).toBe(false)
  })

  it('6. canPurchaseProduct disables purchase when stock = 0', () => {
    expect(canPurchaseProduct(outOfStockProduct)).toBe(false)
  })

  it('7. category counting aggregates public products and excludes non-active', () => {
    const list = [
      { id: '1', name: 'Mouse A', category: { name: 'Chuột' }, ...activeProduct },
      { id: '2', name: 'Mouse B', category: { name: 'Chuột' }, ...hiddenProduct }, // hidden — excluded
      { id: '3', name: 'Keyboard A', category: { name: 'Bàn phím' }, ...discontinuedProduct }, // discontinued — excluded
      { id: '4', name: 'Keyboard B', category: { name: 'Bàn phím' }, ...activeProduct },
      { id: '5', name: 'Mouse C', category: { name: 'Chuột' }, ...inactiveProduct }, // inactive — excluded
      { id: '6', name: 'Keyboard C', category: { name: 'Bàn phím' }, ...draftProduct }, // draft — excluded
    ]

    const publicList = list.filter(isPublicProduct)
    const counts: Record<string, number> = {}
    
    publicList.forEach(p => {
      const cat = p.category?.name || 'Khác'
      counts[cat] = (counts[cat] || 0) + 1
    })

    // Only 2 active products out of 6
    expect(counts['Chuột']).toBe(1) // only Mouse A
    expect(counts['Bàn phím']).toBe(1) // only Keyboard B
    expect(publicList.length).toBe(2)
  })

  it('8. PUBLIC_PRODUCT_LIMIT caps featured sections to 12', () => {
    const originalList = Array.from({ length: 20 }, (_, i) => ({ id: `${i}`, ...activeProduct }))
    const limitedList = originalList.slice(0, PUBLIC_PRODUCT_LIMIT)
    expect(limitedList.length).toBe(12)
    expect(originalList.length).toBe(20)
    expect(PUBLIC_PRODUCT_LIMIT).toBe(12)
  })

  it('9. homepage featured section excludes non-active and out-of-stock products entirely', () => {
    const allProducts = [
      { id: '1', ...activeProduct },
      { id: '2', ...hiddenProduct },
      { id: '3', ...inactiveProduct },
      { id: '4', ...discontinuedProduct },
      { id: '5', ...draftProduct },
      { id: '6', ...outOfStockProduct },
    ]

    const publicOnly = allProducts.filter((product) => isPublicProduct(product) && product.stock > 0)
    const featured = publicOnly
      .toSorted((a: any, b: any) => b.soldCount - a.soldCount)
      .slice(0, PUBLIC_PRODUCT_LIMIT)

    // Only active in-stock (id=1) should pass
    expect(featured.length).toBe(1)
    const featuredIds = featured.map((p: any) => p.id)
    expect(featuredIds).toContain('1')
    expect(featuredIds).not.toContain('6')
    expect(featuredIds).not.toContain('2')
    expect(featuredIds).not.toContain('3')
    expect(featuredIds).not.toContain('4')
    expect(featuredIds).not.toContain('5')
  })

  it('10. related products exclude current product and non-active products', () => {
    const currentProductId = '1'
    const candidates = [
      { id: '1', ...activeProduct }, // current — excluded
      { id: '2', ...activeProduct }, // active — included
      { id: '3', ...hiddenProduct }, // hidden — excluded
      { id: '4', ...inactiveProduct }, // inactive — excluded
      { id: '5', ...activeProduct }, // active — included
    ]

    const related = candidates.filter(
      (p) => p.id !== currentProductId && isPublicProduct(p)
    )

    expect(related.length).toBe(2)
    expect(related.map((p) => p.id)).toEqual(['2', '5'])
  })

  it('11. section limits cap categories to 4 products each', () => {
    const products = Array.from({ length: 10 }, (_, i) => ({
      id: `${i}`,
      category: { name: i < 6 ? 'Chuột' : 'Bàn phím' },
      ...activeProduct,
    }))

    const groups: Record<string, any[]> = {}
    products.forEach(p => {
      const catName = p.category?.name || 'Khác'
      if (!groups[catName]) groups[catName] = []
      groups[catName].push(p)
    })

    const capped = Object.entries(groups).map(([name, list]) => ({
      name,
      products: list.slice(0, 4),
    }))

    expect(capped.find(g => g.name === 'Chuột')!.products.length).toBe(4)
    expect(capped.find(g => g.name === 'Bàn phím')!.products.length).toBe(4)
  })
})
