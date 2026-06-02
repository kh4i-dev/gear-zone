import { describe, expect, it } from 'vitest'
import { generateVariants, type AdminOptionGroup, type AdminVariant } from '../../lib/products/adminVariantMatrix'

describe('generateVariants', () => {
  it('preserves existing variant commercial fields when regenerating the matrix', () => {
    const groups: AdminOptionGroup[] = [
      { name: 'Color', values: ['White', 'Black'] },
      { name: 'Version', values: ['Mini'] },
    ]
    const existing: AdminVariant[] = [
      {
        sku: 'AKKO-WHITE-MINI',
        options: { Color: 'White', Version: 'Mini' },
        price: 1200000,
        salePrice: 990000,
        stock: 7,
        imageUrl: '/white-mini.png',
        isActive: true,
      },
    ]

    const variants = generateVariants(groups, existing)

    expect(variants).toEqual([
      {
        sku: 'AKKO-WHITE-MINI',
        options: { Color: 'White', Version: 'Mini' },
        price: 1200000,
        salePrice: 990000,
        stock: 7,
        imageUrl: '/white-mini.png',
        isActive: true,
      },
      {
        sku: '',
        options: { Color: 'Black', Version: 'Mini' },
        price: null,
        salePrice: null,
        stock: 0,
        imageUrl: '',
        isActive: true,
      },
    ])
  })
})
