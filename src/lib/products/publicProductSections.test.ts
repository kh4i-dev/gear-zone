import { describe, expect, it } from 'vitest'
import {
  getStableRotatedProducts,
  selectCategoryBestSellingProducts,
  selectHomepageFeaturedProducts,
  selectRelatedProducts,
  sortInStockFirst,
  type PublicSectionProduct,
} from './publicProductSections'

const baseProduct = {
  isVisible: true,
  status: 'ACTIVE',
  stock: 5,
  soldCount: 0,
  updatedAt: '2026-06-01T00:00:00.000Z',
}

function product(overrides: Partial<PublicSectionProduct> & { id: string }): PublicSectionProduct {
  return { ...baseProduct, ...overrides }
}

describe('public product section selection', () => {
  it('homepage featured excludes out-of-stock and non-public products', () => {
    const selected = selectHomepageFeaturedProducts([
      product({ id: 'active-stock', stock: 3 }),
      product({ id: 'out-of-stock', stock: 0, soldCount: 999 }),
      product({ id: 'hidden', isVisible: false, stock: 10, soldCount: 998 }),
      product({ id: 'draft', status: 'DRAFT', stock: 10, soldCount: 997 }),
      product({ id: 'discontinued', status: 'DISCONTINUED', stock: 10, soldCount: 996 }),
    ], { date: '2026-06-01', poolLimit: 36 })

    expect(selected.map((item) => item.id)).toEqual(['active-stock'])
  })

  it('homepage featured caps output at 12 products', () => {
    const selected = selectHomepageFeaturedProducts(
      Array.from({ length: 20 }, (_, index) => product({ id: `p-${index}`, soldCount: 100 - index })),
      { date: '2026-06-01' },
    )

    expect(selected).toHaveLength(12)
  })

  it('stable rotation is deterministic for the same date and section key', () => {
    const products = Array.from({ length: 20 }, (_, index) => ({ id: `p-${index}` }))

    expect(getStableRotatedProducts(products, 'featured', 12, '2026-06-01').map((item) => item.id))
      .toEqual(getStableRotatedProducts(products, 'featured', 12, '2026-06-01').map((item) => item.id))
  })

  it('stable rotation changes ordering for different date or section key when possible', () => {
    const products = Array.from({ length: 20 }, (_, index) => ({ id: `p-${index}` }))
    const first = getStableRotatedProducts(products, 'featured', 12, '2026-06-01').map((item) => item.id)
    const second = getStableRotatedProducts(products, 'featured', 12, '2026-06-02').map((item) => item.id)
    const third = getStableRotatedProducts(products, 'category-keyboard', 12, '2026-06-01').map((item) => item.id)

    expect(first).not.toEqual(second)
    expect(first).not.toEqual(third)
  })

  it('homepage featured does not always rely on the raw first 12', () => {
    const products = Array.from({ length: 20 }, (_, index) => product({ id: `p-${index}`, soldCount: 100 - index }))
    const rawFirst12 = products.slice(0, 12).map((item) => item.id)
    const selected = selectHomepageFeaturedProducts(products, { date: '2026-06-01' }).map((item) => item.id)

    expect(selected).not.toEqual(rawFirst12)
  })

  it('category best-selling only returns active in-stock products ordered by sold count', () => {
    const selected = selectCategoryBestSellingProducts([
      product({ id: 'stock-low-sold', stock: 4, soldCount: 10 }),
      product({ id: 'stock-high-sold', stock: 4, soldCount: 30 }),
      product({ id: 'sold-out-top-sold', stock: 0, soldCount: 99 }),
      product({ id: 'stock-mid-sold', stock: 4, soldCount: 20 }),
    ])

    expect(selected.map((item) => item.id)).toEqual([
      'stock-high-sold',
      'stock-mid-sold',
      'stock-low-sold',
    ])
  })

  it('related products exclude current product and prioritize in-stock products', () => {
    const selected = selectRelatedProducts([
      product({ id: 'current', stock: 5, soldCount: 100 }),
      product({ id: 'sold-out', stock: 0, soldCount: 99 }),
      product({ id: 'in-stock', stock: 3, soldCount: 1 }),
      product({ id: 'hidden', isVisible: false, stock: 3, soldCount: 1000 }),
    ], 'current')

    expect(selected.map((item) => item.id)).toEqual(['in-stock', 'sold-out'])
  })

  it('sortInStockFirst keeps purchasable products before out-of-stock fallback', () => {
    const selected = sortInStockFirst([
      product({ id: 'sold-out', stock: 0, soldCount: 100 }),
      product({ id: 'in-stock', stock: 1, soldCount: 1 }),
    ])

    expect(selected.map((item) => item.id)).toEqual(['in-stock', 'sold-out'])
  })
})
